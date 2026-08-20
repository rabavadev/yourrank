-- Last time a viewer was seen on a board.
--
-- A viewer who has signed in but never earned credits has no ledger events and
-- no last_earned_at, so the streamer's viewer list had nothing to show about
-- them. Membership creation and board visits stamp this instead.

ALTER TABLE public.site_viewers
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
