-- Migration: Overlays, Daily Quests & Streaks, Viewer 1v1 Duels, and Tournaments

-- 1. Daily Quests & Streaks
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  quest_key TEXT NOT NULL,
  title TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  reward_xp INTEGER NOT NULL DEFAULT 50,
  reward_points INTEGER NOT NULL DEFAULT 20,
  active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, quest_key, active_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_quests_site_date ON public.daily_quests(site_id, active_date);

CREATE TABLE IF NOT EXISTS public.viewer_daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(quest_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_viewer_daily_quests_viewer ON public.viewer_daily_quests(viewer_id);

CREATE TABLE IF NOT EXISTS public.viewer_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_viewer_streaks_viewer ON public.viewer_streaks(viewer_id);

-- 2. Viewer 1v1 Duels
CREATE TABLE IF NOT EXISTS public.viewer_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  challenger_viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  challenger_site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  target_viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  target_site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  wager_amount INTEGER NOT NULL CHECK (wager_amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
  winner_viewer_id UUID REFERENCES public.viewers(id) ON DELETE SET NULL,
  roll_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 minutes')
);

CREATE INDEX IF NOT EXISTS idx_viewer_duels_site_status ON public.viewer_duels(site_id, status);

-- 3. Tournaments & Elimination Brackets
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  game_name TEXT NOT NULL DEFAULT 'Game',
  bracket_size INTEGER NOT NULL DEFAULT 8 CHECK (bracket_size IN (4, 8, 16, 32)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  participants_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  winner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_site ON public.tournaments(site_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  match_index INTEGER NOT NULL DEFAULT 0,
  player1_name TEXT,
  player2_name TEXT,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  winner_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round_number, match_index)
);

CREATE INDEX IF NOT EXISTS idx_tournament_matches_tourn ON public.tournament_matches(tournament_id, round_number);
