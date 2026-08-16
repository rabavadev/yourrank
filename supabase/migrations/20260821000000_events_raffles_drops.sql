-- Community Events Hub: Raffles (Ticket Draws) & Flash Code Drops
CREATE TABLE IF NOT EXISTS public.raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ticket_cost INTEGER NOT NULL DEFAULT 50 CHECK (ticket_cost >= 0),
  max_tickets_per_viewer INTEGER NOT NULL DEFAULT 10 CHECK (max_tickets_per_viewer >= 1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'drawn', 'cancelled')),
  winner_viewer_id UUID REFERENCES public.viewers(id) ON DELETE SET NULL,
  winner_name TEXT,
  winner_ticket_number INTEGER,
  total_tickets INTEGER NOT NULL DEFAULT 0,
  ends_at TIMESTAMPTZ,
  drawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raffles_site_id ON public.raffles(site_id, status);

CREATE TABLE IF NOT EXISTS public.raffle_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle ON public.raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_viewer ON public.raffle_tickets(raffle_id, viewer_id);

CREATE TABLE IF NOT EXISTS public.code_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 100 CHECK (points_reward > 0),
  max_claims INTEGER NOT NULL DEFAULT 50 CHECK (max_claims >= 1),
  claimed_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'expired')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_code_drops_site_code ON public.code_drops(site_id, lower(code));

CREATE TABLE IF NOT EXISTS public.code_drop_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_drop_id UUID NOT NULL REFERENCES public.code_drops(id) ON DELETE CASCADE,
  site_viewer_id UUID NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code_drop_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_code_drop_claims_viewer ON public.code_drop_claims(viewer_id);
