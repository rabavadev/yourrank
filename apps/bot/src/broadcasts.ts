import { one, query } from "./db.js";
import { decryptToken } from "./crypto.js";

// ------------------------------------------------------------------
// Broadcast worker — rate-limited mass sender.
//
// Designed for Cloudflare Cron Triggers: each tick processes ONE
// batch (default 300 messages at ~28 msg/s ≈ 11s of work) and saves
// a cursor, so a broadcast of any size finishes across ticks without
// ever exceeding Workers CPU limits. On Node you can just loop it.
// ------------------------------------------------------------------

const MSG_INTERVAL_MS = 36; // ~28 msg/s, under Telegram's 30/s cap

interface ActiveBroadcast {
  id: string;
  bot_id: string;
  body: string;
  buttons: unknown;
  cursor_tg_user_id: string;
  sent_count: number;
  fail_count: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Process one batch of the oldest due broadcast.
 * Returns true if there is (possibly) more work to do.
 */
export async function processBroadcastBatch(batchSize = 300): Promise<boolean> {
  // Claim one due broadcast (SKIP LOCKED = safe with concurrent ticks).
  const bc = await one<ActiveBroadcast>(
    `UPDATE broadcasts SET status = 'sending'
      WHERE id = (
        SELECT id FROM broadcasts
         WHERE status IN ('scheduled', 'sending')
           AND (scheduled_at IS NULL OR scheduled_at <= now())
         ORDER BY created_at
         LIMIT 1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING id, bot_id, body, buttons, cursor_tg_user_id, sent_count, fail_count`
  );
  if (!bc) return false;

  const bot = await one<{ token_encrypted: Buffer; status: string }>(
    `SELECT token_encrypted, status FROM bots WHERE id = $1`,
    [bc.bot_id]
  );
  if (!bot || bot.status !== "active") {
    await query(`UPDATE broadcasts SET status = 'failed' WHERE id = $1`, [bc.id]);
    return true;
  }
  const token = await decryptToken(Buffer.from(bot.token_encrypted));

  // Set total on first batch.
  if (Number(bc.cursor_tg_user_id) === 0) {
    await query(
      `UPDATE broadcasts SET total_count = (
         SELECT count(*) FROM bot_subscribers
          WHERE bot_id = $1 AND NOT is_blocked
       ) WHERE id = $2`,
      [bc.bot_id, bc.id]
    );
  }

  const subs = await query<{ tg_user_id: string }>(
    `SELECT tg_user_id FROM bot_subscribers
      WHERE bot_id = $1 AND NOT is_blocked AND tg_user_id > $2
      ORDER BY tg_user_id
      LIMIT $3`,
    [bc.bot_id, bc.cursor_tg_user_id, batchSize]
  );

  if (subs.length === 0) {
    await query(
      `UPDATE broadcasts SET status = 'sent', sent_at = now() WHERE id = $1`,
      [bc.id]
    );
    return true;
  }

  let sent = 0;
  let failed = 0;
  for (const sub of subs) {
    const payload: Record<string, unknown> = {
      chat_id: Number(sub.tg_user_id),
      text: bc.body,
      parse_mode: "Markdown",
    };
    if (bc.buttons) payload.reply_markup = { inline_keyboard: bc.buttons };

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        sent++;
      } else if (res.status === 403) {
        // User blocked the bot — remember it, never retry.
        failed++;
        await query(
          `UPDATE bot_subscribers SET is_blocked = true
            WHERE bot_id = $1 AND tg_user_id = $2`,
          [bc.bot_id, sub.tg_user_id]
        );
      } else if (res.status === 429) {
        // Rate limited — back off and stop this batch early.
        const retry = Number((await res.json().catch(() => ({})) as any)?.parameters?.retry_after ?? 3);
        await sleep(Math.min(retry, 10) * 1000);
        break;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
    await sleep(MSG_INTERVAL_MS);
  }

  // Always advance the cursor past the last row we fetched, even if sent+failed
  // is 0 (e.g. a 429 on the first message stops the loop early). Without this
  // the cursor stays put and the same batch loops forever.
  const lastId = subs[subs.length - 1].tg_user_id;
  await query(
    `UPDATE broadcasts
        SET cursor_tg_user_id = $1,
            sent_count = sent_count + $2,
            fail_count = fail_count + $3
      WHERE id = $4`,
    [lastId, sent, failed, bc.id]
  );
  return true;
  } catch (err) {
    console.error('[broadcasts] processBroadcastBatch failed:', err);
    return false;
  }
}