import { one, query } from "@yourrank/shared/db";
import { decryptToken } from "@yourrank/shared/crypto";
import { parseSegment, buildSegmentWhere } from "./broadcast-segment.js";

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
  segment: string | null;
  cursor_tg_user_id: number | string;
  sent_count: number;
  fail_count: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function broadcastAtStart(cursor: number | string | null | undefined): boolean {
  return Number(cursor) === 0;
}

export function buildBroadcastTotalCountUpdate(
  segment: ReturnType<typeof parseSegment>,
  botId: string,
  broadcastId: string,
): { text: string; params: unknown[] } {
  const { clause, values } = buildSegmentWhere(segment, 1);
  const broadcastIdParam = values.length + 2;
  return {
    text: `UPDATE broadcasts SET total_count = (
         SELECT count(*) FROM bot_subscribers bs
          WHERE bs.bot_id = $1 AND NOT bs.is_blocked${clause ? ` AND ${clause}` : ""}
       ) WHERE id = $${broadcastIdParam}`,
    params: [botId, ...values, broadcastId],
  };
}

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
      RETURNING id, bot_id, body, media_url, buttons, segment, cursor_tg_user_id, sent_count, fail_count`
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
  const segment = parseSegment(bc.segment);

  // Set total on first batch.
  if (broadcastAtStart(bc.cursor_tg_user_id)) {
    const totalCountUpdate = buildBroadcastTotalCountUpdate(segment, bc.bot_id, bc.id);
    await query(totalCountUpdate.text, totalCountUpdate.params);
  }

  // Broadcasts respect the segment filter (language, last_seen window, etc.).
  const { clause: subClause, values: subValues } = buildSegmentWhere(segment, 3);
  const subs = await query<{ tg_user_id: number; first_name: string | null; tg_username: string | null }>(
    `SELECT bs.tg_user_id, bs.first_name, bs.tg_username FROM bot_subscribers bs
      WHERE bs.bot_id = $1 AND NOT bs.is_blocked AND bs.tg_user_id > $2
           ${subClause ? `AND ${subClause}` : ""}
      ORDER BY bs.tg_user_id
      LIMIT $3`,
    [bc.bot_id, bc.cursor_tg_user_id, batchSize, ...subValues]
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
          chat_id: sub.tg_user_id,
          photo: bc.media_url,
          caption: personalized,
          parse_mode: "HTML",
        }
      : {
          chat_id: sub.tg_user_id,
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