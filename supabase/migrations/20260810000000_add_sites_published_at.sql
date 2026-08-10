-- Add published_at to sites so we can show "last published" separately from "last saved".
ALTER TABLE sites ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill: any published board keeps its current updated_at as first published_at if missing.
UPDATE sites SET published_at = updated_at WHERE published = true AND published_at IS NULL;
