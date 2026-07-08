-- ============================================================
-- Migration: Add broadcast segmentation (Phase 7.2)
-- Adds segment column to broadcasts table for targeted sending.
-- ============================================================

ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'all';

-- Comment for documentation
COMMENT ON COLUMN broadcasts.segment IS 'Target segment: all, clicked, deposited, inactive';
