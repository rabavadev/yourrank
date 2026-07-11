-- Fix ends_at column type from TEXT to TIMESTAMPTZ
-- This migration converts existing text dates to proper timestamps.
-- Must drop default first, handle NOT NULL, then convert type.

-- Drop the existing text default
ALTER TABLE sites ALTER COLUMN ends_at DROP DEFAULT;

-- Allow NULLs temporarily (column may have NOT NULL constraint)
ALTER TABLE sites ALTER COLUMN ends_at DROP NOT NULL;

-- Convert column type
ALTER TABLE sites 
  ALTER COLUMN ends_at TYPE timestamptz 
  USING CASE 
    WHEN ends_at::text ~ '^\d{4}-\d{2}-\d{2}' THEN ends_at::text::timestamptz
    ELSE NULL
  END;
