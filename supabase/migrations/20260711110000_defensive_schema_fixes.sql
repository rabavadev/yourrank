-- Defensive migration: ensure the schema assumptions used by the bot/leaderboard
-- code are in place in every deployment. The baseline migration already contains
-- these definitions, so this is a no-op for deployments created from that
-- baseline. It protects older/parallel deployments that may have been
-- initialized before the baseline was fully applied, or that were created from
-- a partial schema.

-- updated_at trigger function used by the tables below.
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- core tables with updated_at triggers
ALTER TABLE public.users
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN plan SET DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE public.bots
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE public.offers
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE public.sites
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE public.payments
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- other tables that receive INSERTs without an explicit id
ALTER TABLE public.casinos
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.bot_commands
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.bot_subscribers
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.broadcasts
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.conversions
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.short_links
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.subscriptions
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.archives
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.admin_audit
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- unique / primary key constraints that ON CONFLICT / SELECT lookups rely on.
-- PostgreSQL does not support `ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS`,
-- so we guard each addition with a DO block.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key' AND conrelid = 'public.users'::regclass) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_telegram_user_id_key' AND conrelid = 'public.users'::regclass) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_telegram_user_id_key UNIQUE (telegram_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_postback_key_key' AND conrelid = 'public.users'::regclass) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_postback_key_key UNIQUE (postback_key);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bots_tg_bot_id_key' AND conrelid = 'public.bots'::regclass) THEN
    ALTER TABLE public.bots ADD CONSTRAINT bots_tg_bot_id_key UNIQUE (tg_bot_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bots_webhook_secret_key' AND conrelid = 'public.bots'::regclass) THEN
    ALTER TABLE public.bots ADD CONSTRAINT bots_webhook_secret_key UNIQUE (webhook_secret);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'casinos_slug_key' AND conrelid = 'public.casinos'::regclass) THEN
    ALTER TABLE public.casinos ADD CONSTRAINT casinos_slug_key UNIQUE (slug);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bot_commands_bot_id_command_key' AND conrelid = 'public.bot_commands'::regclass) THEN
    ALTER TABLE public.bot_commands ADD CONSTRAINT bot_commands_bot_id_command_key UNIQUE (bot_id, command);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bot_subscribers_bot_id_tg_user_id_key' AND conrelid = 'public.bot_subscribers'::regclass) THEN
    ALTER TABLE public.bot_subscribers ADD CONSTRAINT bot_subscribers_bot_id_tg_user_id_key UNIQUE (bot_id, tg_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'short_links_slug_key' AND conrelid = 'public.short_links'::regclass) THEN
    ALTER TABLE public.short_links ADD CONSTRAINT short_links_slug_key UNIQUE (slug);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'password_resets_pkey' AND conrelid = 'public.password_resets'::regclass) THEN
    ALTER TABLE public.password_resets ADD CONSTRAINT password_resets_pkey PRIMARY KEY (token);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_stats_pkey' AND conrelid = 'public.site_stats'::regclass) THEN
    ALTER TABLE public.site_stats ADD CONSTRAINT site_stats_pkey PRIMARY KEY (site_id, day);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_stats_hourly_pkey' AND conrelid = 'public.site_stats_hourly'::regclass) THEN
    ALTER TABLE public.site_stats_hourly ADD CONSTRAINT site_stats_hourly_pkey PRIMARY KEY (site_id, day, hour);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_referrers_pkey' AND conrelid = 'public.site_referrers'::regclass) THEN
    ALTER TABLE public.site_referrers ADD CONSTRAINT site_referrers_pkey PRIMARY KEY (site_id, day, domain);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'click_daily_pkey' AND conrelid = 'public.click_daily'::regclass) THEN
    ALTER TABLE public.click_daily ADD CONSTRAINT click_daily_pkey PRIMARY KEY (day, short_link_id);
  END IF;
END $$;

-- updated_at triggers for the tables that are explicitly updated in code
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.bots;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.offers;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.sites;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.payments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
