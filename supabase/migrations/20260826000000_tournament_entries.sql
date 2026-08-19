-- Tournament signups and persisted entry curation.

ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS signup_state TEXT NOT NULL DEFAULT 'closed',
  ADD COLUMN IF NOT EXISTS entry_cap INTEGER,
  ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'bracket',
  ADD COLUMN IF NOT EXISTS anti_alt_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS require_login BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_credits INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_keyword TEXT NOT NULL DEFAULT '!join';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_signup_state_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_signup_state_check
      CHECK (signup_state IN ('closed', 'open', 'locked'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_entry_cap_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_entry_cap_check
      CHECK (entry_cap IS NULL OR entry_cap > 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_format_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_format_check
      CHECK (format IN ('bracket', '1v1', '2v2'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_min_credits_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_min_credits_check
      CHECK (min_credits >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_entry_fee_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_entry_fee_check
      CHECK (entry_fee >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.tournaments'::regclass
      AND conname = 'tournaments_entry_keyword_check'
  ) THEN
    ALTER TABLE public.tournaments
      ADD CONSTRAINT tournaments_entry_keyword_check
      CHECK (length(trim(entry_keyword)) BETWEEN 1 AND 40);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  viewer_id UUID REFERENCES public.viewers(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  trust_score INTEGER,
  alt_flag BOOLEAN NOT NULL DEFAULT false,
  alt_reason TEXT,
  team_no INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tournament_entries_source_check
    CHECK (source IN ('chat', 'page', 'manual', 'leaderboard')),
  CONSTRAINT tournament_entries_status_check
    CHECK (status IN ('pending', 'confirmed', 'selected', 'waitlist', 'removed', 'blocked')),
  CONSTRAINT tournament_entries_trust_score_check
    CHECK (trust_score IS NULL OR trust_score BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_entries_name
  ON public.tournament_entries (tournament_id, lower(display_name));

CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_status
  ON public.tournament_entries (tournament_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_tournament_entries_tournament_trust
  ON public.tournament_entries (tournament_id, alt_flag DESC, trust_score ASC NULLS LAST, created_at);
