-- Predictions, Lucky Wheel, and Seasonal Battle Pass Schema

-- 1. Live Predictions & Betting
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'locked', 'settled', 'cancelled')),
  winning_option_id TEXT,
  total_pool INTEGER NOT NULL DEFAULT 0,
  min_bet INTEGER NOT NULL DEFAULT 10 CHECK (min_bet >= 1),
  max_bet INTEGER NOT NULL DEFAULT 1000 CHECK (max_bet >= min_bet),
  lock_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictions_site_status ON public.predictions(site_id, status);

CREATE TABLE IF NOT EXISTS public.prediction_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payout INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prediction_bets_pred ON public.prediction_bets(prediction_id);
CREATE INDEX IF NOT EXISTS idx_prediction_bets_viewer ON public.prediction_bets(viewer_id);

-- 2. Lucky Wheel
CREATE TABLE IF NOT EXISTS public.wheel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE UNIQUE,
  spin_cost INTEGER NOT NULL DEFAULT 50 CHECK (spin_cost >= 0),
  enabled BOOLEAN NOT NULL DEFAULT true,
  segments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  segment_id TEXT NOT NULL,
  cost_paid INTEGER NOT NULL DEFAULT 0,
  reward_label TEXT NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'points',
  reward_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wheel_spins_site ON public.wheel_spins(site_id, created_at DESC);

-- 3. Seasonal Battle Pass & Progression
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Season 1',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  tiers_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seasons_site_status ON public.seasons(site_id, status);

CREATE TABLE IF NOT EXISTS public.viewer_season_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  claimed_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_viewer_season_progress_viewer ON public.viewer_season_progress(viewer_id);
