-- Fix ends_at column type from TEXT to TIMESTAMPTZ
-- This migration converts existing text dates to proper timestamps.
ALTER TABLE sites 
  ALTER COLUMN ends_at TYPE timestamptz 
  USING CASE 
    WHEN ends_at ~ '^\d{4}-\d{2}-\d{2}' THEN ends_at::timestamptz
    ELSE NULL
  END;
