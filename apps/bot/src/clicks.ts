import { query, withTransaction } from "../../../shared/db.js";
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
    // Use advisory lock to prevent TOCTOU race in uniqueness check
    // The lock serializes inserts for the same (short_link_id, ip_hash) pair
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

      // Lock acquired - check if this is truly unique
      const existing = await tx.one<{ exists: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM clicks
            WHERE short_link_id = $1
              AND ip_hash = $2
              AND ts > now() - interval '24 hours'
         ) AS exists`,
        [shortLinkId, ipH]
      );

      const isUnique = !existing?.exists;
      await tx.query(
        `INSERT INTO clicks (short_link_id, ip_hash, country, user_agent, referer, tg_user_id, is_unique, click_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [shortLinkId, ipH, country, userAgent, referer, tgUserId, isUnique, clickRef]
      );
    });
  } catch (err) {
    console.error("click log failed:", err);
  }
}
