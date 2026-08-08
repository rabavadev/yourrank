-- Anti-fraud / anti-alt columns for the credits system.
ALTER TABLE public.site_viewers
  ADD COLUMN blocked boolean DEFAULT false NOT NULL,
  ADD COLUMN block_reason text,
  ADD COLUMN fraud_score integer DEFAULT 0 NOT NULL,
  ADD COLUMN last_earned_at timestamp with time zone,
  ADD COLUMN last_redeemed_at timestamp with time zone;

CREATE INDEX idx_site_viewers_blocked ON public.site_viewers(site_id, blocked);
CREATE INDEX idx_site_viewers_fraud_score ON public.site_viewers(site_id, fraud_score DESC);

-- Table for historical usernames per viewer (anti-username-swap).
CREATE TABLE public.viewer_username_history (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  viewer_id uuid NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  username text NOT NULL,
  seen_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (viewer_id, username)
);

CREATE INDEX idx_viewer_username_history_username ON public.viewer_username_history(username);
