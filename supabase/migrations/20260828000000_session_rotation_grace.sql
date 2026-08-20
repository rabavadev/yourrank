-- Session rotation grace window.
--
-- Rotation swapped the token in place, so every request that was already
-- carrying the pre-rotation cookie resolved to no session at all: page loads
-- bounced to /login and API calls answered 401 until the browser picked up the
-- new cookie. Keeping the previous token accepted for a short window after a
-- rotation removes that gap.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS previous_token text,
  ADD COLUMN IF NOT EXISTS rotated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_sessions_previous_token
  ON public.sessions (previous_token)
  WHERE previous_token IS NOT NULL;

ALTER TABLE public.viewer_sessions
  ADD COLUMN IF NOT EXISTS previous_token text,
  ADD COLUMN IF NOT EXISTS rotated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_viewer_sessions_previous_token
  ON public.viewer_sessions (previous_token)
  WHERE previous_token IS NOT NULL;
