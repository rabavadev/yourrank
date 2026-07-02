import { query } from "./db.js";
import { hashIp } from "./crypto.js";

export async function logClick(
  shortLinkId: string,
  ip: string,
  userAgent: string | null,
  referer: string | null,
  country: string | null,
  tgUserId: number | null,
  clickRef: string | null = null
): Promise<void> {
  try {
    const ipH = await hashIp(ip);
    // Single query: uses a CTE to check uniqueness and INSERT in one round trip,
    // replacing the previous two-query pattern (PERF-105).
    await query(
      `WITH dup AS (
         SELECT EXISTS (
           SELECT 1 FROM clicks
            WHERE short_link_id = $1
              AND ip_hash = $2
              AND ts > now() - interval '24 hours'
         ) AS seen
       )
       INSERT INTO clicks (short_link_id, ip_hash, country, user_agent, referer, tg_user_id, is_unique, click_ref)
       SELECT $1, $2, $3, $4, $5, $6, NOT dup.seen, $7
         FROM dup`,
      [shortLinkId, ipH, country, userAgent, referer, tgUserId, clickRef]
    );
  } catch (err) {
    console.error("click log failed:", err);
  }
}
