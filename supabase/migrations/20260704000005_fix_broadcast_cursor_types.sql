-- ============================================================
--  Migration: Fix broadcast cursor type consistency
--
--  BUG FIX: cursor_tg_user_id is TEXT but compared numerically, causing
--  lexicographic ordering issues (e.g., "1000" < "9" string comparison).
--  The cursor should use numeric type (BIGINT) to match tg_user_id type.
-- ============================================================

-- Change cursor_tg_user_id from TEXT to BIGINT in broadcasts table
-- First set default to 0 (numeric) for existing NULL values
ALTER TABLE broadcasts ALTER COLUMN cursor_tg_user_id SET DEFAULT 0;
UPDATE broadcasts SET cursor_tg_user_id = 0 WHERE cursor_tg_user_id IS NULL;

-- Now change the type
ALTER TABLE broadcasts ALTER COLUMN cursor_tg_user_id TYPE BIGINT USING cursor_tg_user_id::BIGINT;

-- Ensure tg_user_id in bot_subscribers is BIGINT (it should already be, but verify)
-- This is a no-op if already correct, but ensures consistency
DO $$
BEGIN
  -- Check if tg_user_id is TEXT and needs conversion
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bot_subscribers'
      AND column_name = 'tg_user_id'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE bot_subscribers ALTER COLUMN tg_user_id TYPE BIGINT USING tg_user_id::BIGINT;
  END IF;
END $$;
