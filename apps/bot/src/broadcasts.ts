import { one, query } from "../../../shared/db.js";
import { decryptToken } from "../../../shared/crypto.js";

/** Escape user content for Telegram HTML parse_mode */
const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? "")
  );

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
  media_url: string | null;
  buttons: unknown;
  cursor_tg_user_id: number; // Changed from string to number for numeric comparison
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
      RETURNING id, bot_id, body, media_url, buttons, cursor_tg_user_id, sent_count, fail_count`
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
  if (bc.cursor_tg_user_id === 0) {
    await query(
      `UPDATE broadcasts SET total_count = (
         SELECT count(*) FROM bot_subscribers
          WHERE bot_id = $1 AND NOT is_blocked
       ) WHERE id = $2`,
      [bc.bot_id, bc.id]
    );
  }

  // Subscriber segmentation (Phase 7.2)
  // segment can be: 'all' (default), 'clicked', 'deposited', 'inactive'
  const segment = (bc as any).segment || 'all';
  let segmentJoin = '';
  let segmentWhere = '';
  if (segment === 'clicked') {
    segmentJoin = 'JOIN clicks c ON c.tg_user_id = bs.tg_user_id';
    segmentWhere = `AND c.created_at > now() - interval '30 days'`;
  } else if (segment === 'deposited') {
    segmentJoin = 'JOIN conversions cv ON cv.click_ref IN (SELECT click_ref FROM clicks WHERE tg_user_id = bs.tg_user_id)';
    segmentWhere = `AND cv.status IN ('confirmed', 'finished')`;
  } else if (segment === 'inactive') {
    segmentWhere = `AND bs.last_active_at < now() - interval '7 days'`;
  }

  const subs = await query<{ tg_user_id: number; first_name: string | null; tg_username: string | null }>(
    `SELECT DISTINCT bs.tg_user_id, bs.first_name, bs.tg_username FROM bot_subscribers bs
      ${segmentJoin}
      WHERE bs.bot_id = $1 AND NOT bs.is_blocked AND bs.tg_user_id > $2
      ${segmentWhere}
      ORDER BY bs.tg_user_id
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
  let lastProcessedId = subs[0].tg_user_id; // Track last actually processed sub
  for (const sub of subs) {
    const firstName = sub.first_name || sub.tg_username || "there";
    const personalized = esc(bc.body).replace(/\{name\}/g, esc(firstName));
    const hasMedia = !!bc.media_url;
    const payload: Record<string, unknown> = hasMedia
      ? {
          chat_id: sub.tg_user_id, // Already numeric, no need for Number()
          photo: bc.media_url,
          caption: personalized,
          parse_mode: "HTML",
        }
      : {
          chat_id: sub.tg_user_id, // Already numeric, no need for Number()
          text: personalized,
          parse_mode: "HTML",
        };
    if (bc.buttons) payload.reply_markup = { inline_keyboard: bc.buttons };

    const method = hasMedia ? "sendPhoto" : "sendMessage";
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
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
        // DON'T advance cursor past unprocessed subscribers.
        const retry = Number((await res.json().catch(() => ({})) as any)?.parameters?.retry_after ?? 3);
        await sleep(Math.min(retry, 30) * 1000);
        break;
      } else {
        failed++;
      }
    } catch (err) {
      failed++; console.error("[broadcast]: sendMessage failed", err);
    }
    lastProcessedId = sub.tg_user_id; // Advance only after processing
    await sleep(MSG_INTERVAL_MS);
  }

  // Advance cursor to the last subscriber we actually processed (sent or failed),
  // NOT to the last fetched subscriber. On 429, unprocessed subs will be retried
  // in the next batch.
  const cursorId = lastProcessedId;
  await query(
    `UPDATE broadcasts
        SET cursor_tg_user_id = $1,
            sent_count = sent_count + $2,
            fail_count = fail_count + $3
      WHERE id = $4`,
    [cursorId, sent, failed, bc.id]
  );
  return true;
}