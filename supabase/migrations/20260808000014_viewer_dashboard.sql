-- Viewer dashboard: OAuth login for viewers (Kick + Discord) and per-site auth toggles.

-- Per-site controls for which login methods viewers can use.
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS viewer_kick_auth_enabled boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS viewer_discord_auth_enabled boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS viewer_public_redeem_enabled boolean DEFAULT true NOT NULL;

-- Viewer identity can be linked through either Kick or Discord (or both, later).
ALTER TABLE public.viewers
  ADD COLUMN IF NOT EXISTS kick_access_token_enc text,
  ADD COLUMN IF NOT EXISTS kick_refresh_token_enc text,
  ADD COLUMN IF NOT EXISTS kick_token_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS kick_linked_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS discord_user_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS discord_username text,
  ADD COLUMN IF NOT EXISTS discord_access_token_enc text,
  ADD COLUMN IF NOT EXISTS discord_refresh_token_enc text,
  ADD COLUMN IF NOT EXISTS discord_token_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS discord_linked_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE INDEX IF NOT EXISTS idx_viewers_discord_user_id ON public.viewers(discord_user_id);

-- Secure viewer sessions (separate from streamer sessions).
CREATE TABLE IF NOT EXISTS public.viewer_sessions (
    token text PRIMARY KEY,
    viewer_id uuid NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_viewer_sessions_viewer_id ON public.viewer_sessions(viewer_id);
CREATE INDEX IF NOT EXISTS idx_viewer_sessions_expires_at ON public.viewer_sessions(expires_at);

-- Lock down the new table behind RLS like the rest of the credits tables.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'viewer_sessions'
          AND policyname = 'service_role_all_viewer_sessions'
    ) THEN
        CREATE POLICY "service_role_all_viewer_sessions" ON public.viewer_sessions
         FOR ALL
         TO service_role
         USING (true)
         WITH CHECK (true);
    END IF;
END $$;

ALTER TABLE public.viewer_sessions ENABLE ROW LEVEL SECURITY;
