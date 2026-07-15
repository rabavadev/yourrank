ALTER TABLE postback_keys
  ADD COLUMN IF NOT EXISTS last_signed_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_unsigned_used_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_postback_keys_unsigned_usage
  ON postback_keys(last_unsigned_used_at)
  WHERE revoked_at IS NULL;
