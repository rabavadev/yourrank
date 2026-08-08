-- Kick OAuth token storage for streamers.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS kick_user_id text,
  ADD COLUMN IF NOT EXISTS kick_username text,
  ADD COLUMN IF NOT EXISTS kick_access_token_enc text,
  ADD COLUMN IF NOT EXISTS kick_refresh_token_enc text,
  ADD COLUMN IF NOT EXISTS kick_token_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS kick_linked_at timestamp with time zone;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_kick_user_id ON public.users(kick_user_id) WHERE kick_user_id IS NOT NULL;
