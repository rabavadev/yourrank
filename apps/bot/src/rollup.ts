import { query } from "./db.js";

// ------------------------------------------------------------------
// Nightly maintenance (Cron Trigger, once a day):
//  1. Roll raw clicks into click_daily (dashboard never scans raw).
//  2. Pre-create next month's clicks partition.
// ------------------------------------------------------------------

/** Upsert click_daily for the last 2 days (covers late-arriving rows). */
export async function rollupClicks(): Promise<void> {
  await query(
    `INSERT INTO click_daily (day, short_link_id, clicks, unique_clicks)
     SELECT ts::date, short_link_id,
            count(*)::int,
            count(*) FILTER (WHERE is_unique)::int
       FROM clicks
      WHERE ts >= current_date - 1
      GROUP BY 1, 2
     ON CONFLICT (day, short_link_id) DO UPDATE
        SET clicks = EXCLUDED.clicks,
            unique_clicks = EXCLUDED.unique_clicks`
  );
}

/** Ensure the partition for next month exists so inserts never hit the default table. */
export async function ensureNextMonthPartition(): Promise<void> {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const name = `clicks_${from.getUTCFullYear()}_${String(from.getUTCMonth() + 1).padStart(2, "0")}`;
  await query(
    `CREATE TABLE IF NOT EXISTS ${name} PARTITION OF clicks
       FOR VALUES FROM ('${iso(from)}') TO ('${iso(to)}')`
  );
}
