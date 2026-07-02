-- 009_multi_board.sql
-- Enable multi-board: remove UNIQUE constraint on sites.user_id so a user
-- can own more than one leaderboard. Keep the FK intact.

-- Drop the unique index (created by CREATE UNIQUE INDEX or inherited from UNIQUE constraint)
DROP INDEX IF EXISTS sites_user_id_key;

-- Also try dropping as a named constraint (PostgreSQL may store it either way)
ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_user_id_key;

-- board_count is a convenience counter (not strictly enforced via trigger, but
-- checked at the application layer). Default 1 for existing rows.
ALTER TABLE sites ADD COLUMN IF NOT EXISTS board_order INTEGER DEFAULT 0;

-- Index for fast "list all boards for a user" queries.
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
