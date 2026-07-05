-- ============================================================
--  Migration 002 — click_daily covering index for /offers query
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_click_daily_link
    ON click_daily (short_link_id, day);
