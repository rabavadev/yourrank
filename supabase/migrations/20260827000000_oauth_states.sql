-- Short-lived, single-use OAuth state for PKCE flows.
CREATE TABLE IF NOT EXISTS public.oauth_states (
  state       TEXT PRIMARY KEY,
  provider    TEXT NOT NULL,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at
  ON public.oauth_states (expires_at);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.oauth_states FROM anon, authenticated;
GRANT ALL ON TABLE public.oauth_states TO service_role;
