-- ============================================================
--  Migration 002 — click_daily covering index for /offers query
--
--  The dashboard /offers query (apps/bot/src/dashboard.ts) joins
--  click_daily ON short_link_id = sl.id. click_daily's PK leads with
--  `day`, so that join can't probe it and seq-scans the whole rollup,
--  which grows unbounded (the nightly cron never deletes old rows).
--  This short_link_id-leading index turns the join into index lookups.
--
--  Run once against the existing 'groupsmix'/'yourrank' database.
--  CONCURRENTLY so it does not take a write lock in production. NOTE:
--  CREATE INDEX CONCURRENTLY cannot run inside a transaction block, so
--  run this file on its own (not wrapped in BEGIN/COMMIT):
--    psql "$DATABASE_URL" -f db/migrations/002_click_daily_index.sql
-- ============================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_click_daily_link
    ON click_daily (short_link_id, day);
