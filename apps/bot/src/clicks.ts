import { withTransaction } from "../../../shared/db.js";
import { hashIp } from "../../../shared/crypto.js";

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
    // Use advisory lock to prevent TOCTOU race in uniqueness check.
    // The lock serializes inserts for the same (short_link_id, ip_hash) pair.
    //
    // PERF-105: Consolidated the uniqueness check + INSERT into a single
    // INSERT ... SELECT NOT EXISTS(...) query, reducing the happy path from
    // 3 round-trips (lock → SELECT EXISTS → INSERT) to 2 (lock → INSERT).
    await withTransaction(async (tx) => {
      // Acquire advisory lock for this (short_link_id, ip_hash) pair
      const lockResult = await tx.one<{ lock_acquired: boolean }>(
        `SELECT acquire_click_uniqueness_lock($1, $2) AS lock_acquired`,
        [shortLinkId, ipH]
      );

      if (!lockResult?.lock_acquired) {
        // Lock not acquired (another transaction has it), insert as non-unique
        await tx.query(
          `INSERT INTO clicks (short_link_id, ip_hash, country, user_agent, referer, tg_user_id, is_unique, click_ref)
           VALUES ($1, $2, $3, $4, $5, $6, false, $7)`,
          [shortLinkId, ipH, country, userAgent, referer, tgUserId, clickRef]
        );
        return;
      }

      // Lock acquired — determine uniqueness and insert in a single query.
      // NOT EXISTS subquery checks the same 24-hour window as before.
      await tx.query(
        `INSERT INTO clicks (short_link_id, ip_hash, country, user_agent, referer, tg_user_id, is_unique, click_ref)
         SELECT $1, $2, $3, $4, $5, $6,
                NOT EXISTS (
                  SELECT 1 FROM clicks
                   WHERE short_link_id = $1
                     AND ip_hash = $2
                     AND ts > now() - interval '24 hours'
                ),
                $7`,
        [shortLinkId, ipH, country, userAgent, referer, tgUserId, clickRef]
      );
    });
  } catch (err) {
    console.error("click log failed:", err);
  }
}
