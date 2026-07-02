import { query } from "./db.js";

// ------------------------------------------------------------------
// Nightly maintenance (Cron Trigger, once a day):
//  1. Roll raw clicks into click_daily (dashboard never scans raw).
//  2. Pre-create next month's clicks partition.
// ------------------------------------------------------------------

/** Upsert click_daily for yesterday only (DB-002: exclude today to avoid
 *  double-counting when dashboard sums click_daily + today's raw clicks). */
export async function rollupClicks(): Promise<void> {
  await query(
    `INSERT INTO click_daily (day, short_link_id, clicks, unique_clicks)
     SELECT ts::date, short_link_id,
            count(*)::int,
            count(*) FILTER (WHERE is_unique)::int
       FROM clicks
      WHERE ts >= current_date - 1 AND ts < current_date
      GROUP BY 1, 2
     ON CONFLICT (day, short_link_id) DO UPDATE
        SET clicks = EXCLUDED.clicks,
            unique_clicks = EXCLUDED.unique_clicks`
  );

  // DB-101: Prune old click_daily rows beyond 30 days to prevent unbounded growth.
  await query(
    `DELETE FROM click_daily WHERE day < current_date - 30`
  );
}

/** Ensure the partition for next month exists so inserts never hit the default table. */
export async function ensureNextMonthPartition(): Promise<void> {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const name = `clicks_${from.getUTCFullYear()}_${String(from.getUTCMonth() + 1).padStart(2, "0")}`;
  // `name` is derived entirely from the server clock, so it can't be attacker-
  // controlled — but DDL can't be parameterized, so we assert the exact shape
  // before interpolating. This makes the identifier injection-proof by
  // construction even if the derivation above ever changes.
  if (!/^clicks_\d{4}_\d{2}$/.test(name)) {
    throw new Error(`refusing to create partition with unexpected name: ${name}`);
  }
  await query(
    `CREATE TABLE IF NOT EXISTS ${name} PARTITION OF clicks
       FOR VALUES FROM ('${iso(from)}') TO ('${iso(to)}')`
  );
}
