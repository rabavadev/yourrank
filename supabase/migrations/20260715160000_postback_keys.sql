-- H-04 — Postback key rotation, revocation, and replay controls.
-- Moves postback credentials out of the public URL and users table into a
-- dedicated lifecycle table with revocation, expiry, last-used tracking, and a
-- per-user replay-guard.

CREATE TABLE IF NOT EXISTS postback_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  -- key_plaintext is only for the migration of legacy unhashed keys. New keys
  -- are encrypted with AES-256-GCM using the TOKEN_ENC_KEY and stored in key_enc.
  key_plaintext TEXT,
  key_enc TEXT,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_postback_keys_hash ON postback_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_postback_keys_user_active ON postback_keys(user_id, revoked_at, expires_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS postback_replay_guard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  replay_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_postback_replay_guard_user_hash ON postback_replay_guard(user_id, replay_hash);
CREATE INDEX IF NOT EXISTS idx_postback_replay_guard_expires ON postback_replay_guard(expires_at);

-- Migrate existing plaintext postback keys from users.postback_key.
-- The hash is computed with sha-256 (same as hashToken in the app). The
-- plaintext is preserved in key_plaintext so the dashboard can continue to show
-- the URL until the user rotates to a fully-encrypted key.
INSERT INTO postback_keys (user_id, key_hash, key_plaintext, created_at)
SELECT
  id,
  encode(digest(postback_key, 'sha256'), 'hex'),
  postback_key,
  now()
FROM users
WHERE postback_key IS NOT NULL AND length(postback_key) > 0
ON CONFLICT (key_hash) DO NOTHING;
