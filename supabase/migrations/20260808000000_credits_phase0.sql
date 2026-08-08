-- Phase 0 schema for Kick channel-point credits / shop MVP.
-- Non-cashable, non-transferable loyalty credits tied to a leaderboard site.

-- Link a Kick channel to a leaderboard site so webhook redemptions know where to credit.
ALTER TABLE public.sites
  ADD COLUMN kick_channel_external_id text,
  ADD COLUMN kick_channel_name text;
CREATE UNIQUE INDEX idx_sites_kick_channel_external_id ON public.sites(kick_channel_external_id) WHERE kick_channel_external_id IS NOT NULL;

-- Viewers are cross-platform identities. A single person can be linked across Kick/Telegram/etc.
CREATE TABLE public.viewers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    kick_user_id text UNIQUE,
    kick_username text,
    kick_avatar_url text,
    telegram_user_id bigint UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Joins a viewer to a streamer's site; holds the per-site credit balance.
CREATE TABLE public.site_viewers (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    viewer_id uuid NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
    balance integer DEFAULT 0 NOT NULL,
    total_earned integer DEFAULT 0 NOT NULL,
    total_spent integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (site_id, viewer_id)
);

-- Maps a Kick channel-point reward to a credit grant on a given site.
CREATE TABLE public.credit_reward_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    kick_reward_id text NOT NULL,
    kick_reward_title text DEFAULT ''::text NOT NULL,
    kick_reward_cost integer NOT NULL,
    credits integer NOT NULL CHECK (credits > 0),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (site_id, kick_reward_id)
);

-- Idempotency log for every Kick event we process.
CREATE TABLE public.kick_reward_events (
    event_id text NOT NULL PRIMARY KEY,
    event_type text NOT NULL,
    site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL,
    reward_id text,
    redeemer_kick_user_id text,
    reward_cost integer,
    status text,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    processed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Immutable credit ledger (earn / spend / redeem / revoke).
CREATE TABLE public.credit_ledger (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_viewer_id uuid NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('earn','spend','redeem','revoke')),
    amount integer NOT NULL CHECK (amount > 0),
    description text DEFAULT ''::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    kick_event_id text REFERENCES public.kick_reward_events(event_id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Shop items a streamer can list for viewers to redeem with credits.
CREATE TABLE public.shop_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    cost integer NOT NULL CHECK (cost > 0),
    stock integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Redemption requests from viewers. Streamer fulfills off-platform and marks complete.
CREATE TABLE public.redemptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_viewer_id uuid NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
    shop_item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
    cost integer NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','fulfilled','cancelled')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for common lookups.
CREATE INDEX idx_viewers_kick_user_id ON public.viewers(kick_user_id);
CREATE INDEX idx_site_viewers_site_id ON public.site_viewers(site_id);
CREATE INDEX idx_credit_reward_mappings_site_id ON public.credit_reward_mappings(site_id);
CREATE INDEX idx_kick_reward_events_site_id ON public.kick_reward_events(site_id);
CREATE INDEX idx_credit_ledger_site_viewer_id ON public.credit_ledger(site_viewer_id);
CREATE INDEX idx_credit_ledger_kick_event_id ON public.credit_ledger(kick_event_id);
CREATE INDEX idx_shop_items_site_id ON public.shop_items(site_id);
CREATE INDEX idx_redemptions_site_viewer_id ON public.redemptions(site_viewer_id);

-- Updated-at trigger helper, re-using the repo's existing trigger if it exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_credits_viewers'
  ) THEN
    CREATE OR REPLACE FUNCTION set_updated_at_credits()
    RETURNS trigger AS $func$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER set_updated_at_credits_viewers
      BEFORE UPDATE ON public.viewers
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();

    CREATE TRIGGER set_updated_at_credits_site_viewers
      BEFORE UPDATE ON public.site_viewers
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();

    CREATE TRIGGER set_updated_at_credits_credit_reward_mappings
      BEFORE UPDATE ON public.credit_reward_mappings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();

    CREATE TRIGGER set_updated_at_credits_shop_items
      BEFORE UPDATE ON public.shop_items
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();

    CREATE TRIGGER set_updated_at_credits_redemptions
      BEFORE UPDATE ON public.redemptions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();
  END IF;
END
$$;