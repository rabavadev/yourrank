import { query, exec } from "../../../shared/db.js";

// ------------------------------------------------------------------
// Nightly maintenance (Cron Trigger, once a day):
//  1. Roll raw clicks into click_daily (dashboard never scans raw).
//  2. Pre-create next month's clicks partition.
// ------------------------------------------------------------------

/** Upsert click_daily for the last 7 days (idempotent lookback window).
 *  If the nightly cron fails for a day, subsequent runs will catch up.
 *  Excludes today to avoid double-counting when dashboard sums click_daily + today's raw clicks. */
export async function rollupClicks(): Promise<void> {
  try {
    // Lookback window: last 7 days (excluding today)
    // This makes the rollup idempotent - if it fails one night, it will catch up on the next run
    await query(
      `INSERT INTO click_daily (day, short_link_id, clicks, unique_clicks)
       SELECT ts::date, short_link_id,
              count(*)::int,
              count(*) FILTER (WHERE is_unique)::int
         FROM clicks
        WHERE ts >= current_date - 7 AND ts < current_date
        GROUP BY 1, 2
       ON CONFLICT (day, short_link_id) DO UPDATE
          SET clicks = EXCLUDED.clicks,
              unique_clicks = EXCLUDED.unique_clicks`
    );

    // DB-101: Prune old click_daily rows beyond 90 days to prevent unbounded growth.
    // Aligned with cleanup_old_clicks() migration function — keep in sync.
    await query(
      `DELETE FROM click_daily WHERE day < current_date - 90`
    );

    // DB-101: Prune raw click partitions beyond 90 days.  These rows have
    // already been rolled into click_daily and the dashboard never scans raw.
    await query(
      `DELETE FROM clicks WHERE ts < now() - interval '90 days'`
    );

    await pruneOldClickPartitions();
  } catch (err) {
    console.error("[rollup] rollupClicks failed:", err);
    throw err;
  }
}

async function pruneOldClickPartitions(): Promise<void> {
  // Click partitions older than the 90-day retention window can be detached as
  // tables; raw rows in those months have already been removed above and the
  // dashboard queries click_daily, not the raw partition.
  const rows = await query<{ name: string }>(
    `SELECT inhrelid::regclass::text AS name
       FROM pg_inherits
      WHERE inhparent = 'clicks'::regclass
        AND inhrelid::regclass::text ~ '^clicks_\\d{4}_\\d{2}$'
        AND to_date(split_part(inhrelid::regclass::text, '_', 2) || '-' ||
                    split_part(inhrelid::regclass::text, '_', 3) || '-01',
                    'YYYY-MM-DD') + interval '1 month' < current_date - interval '90 days'`
  );
  for (const { name } of rows) {
    if (!/^clicks_\d{4}_\d{2}$/.test(name)) continue;
    await exec(`DROP TABLE IF EXISTS ${name}`);
    console.log(`[rollup] dropped old click partition ${name}`);
  }
}

/** Ensure the partition for next month exists so inserts never hit the default table. */
export async function ensureNextMonthPartition(): Promise<void> {
  try {
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
  } catch (err) {
    console.error("[rollup] ensureNextMonthPartition failed:", err);
    throw err;
  }
}

/** Ensure the partition for the current month exists. Call this on Worker startup/deploy. */
export async function ensureCurrentMonthPartition(): Promise<void> {
  try {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const name = `clicks_${from.getUTCFullYear()}_${String(from.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!/^clicks_\d{4}_\d{2}$/.test(name)) {
      throw new Error(`refusing to create partition with unexpected name: ${name}`);
    }
    await query(
      `CREATE TABLE IF NOT EXISTS ${name} PARTITION OF clicks
         FOR VALUES FROM ('${iso(from)}') TO ('${iso(to)}')`
    );
  } catch (err) {
    console.error("[rollup] ensureCurrentMonthPartition failed:", err);
    throw err;
  }
}
