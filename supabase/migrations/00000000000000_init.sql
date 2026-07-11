-- Roles used by Supabase RLS and grant statements
DO $$ BEGIN CREATE ROLE anon; EXCEPTION WHEN duplicate_object THEN NULL; END; $$;
DO $$ BEGIN CREATE ROLE authenticated; EXCEPTION WHEN duplicate_object THEN NULL; END; $$;
DO $$ BEGIN CREATE ROLE service_role; EXCEPTION WHEN duplicate_object THEN NULL; END; $$;

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: acct_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.acct_status AS ENUM (
    'active',
    'past_due',
    'suspended'
);


ALTER TYPE public.acct_status OWNER TO postgres;

--
-- Name: bot_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bot_status AS ENUM (
    'pending',
    'active',
    'paused',
    'revoked'
);


ALTER TYPE public.bot_status OWNER TO postgres;

--
-- Name: broadcast_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.broadcast_status AS ENUM (
    'draft',
    'scheduled',
    'sending',
    'sent',
    'failed',
    'canceled'
);


ALTER TYPE public.broadcast_status OWNER TO postgres;

--
-- Name: pay_provider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pay_provider AS ENUM (
    'crypto',
    'telegram_stars',
    'manual',
    'nowpayments',
    'trial',
    'nowpayments_lifetime'
);


ALTER TYPE public.pay_provider OWNER TO postgres;

--
-- Name: pay_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pay_status AS ENUM (
    'created',
    'waiting',
    'confirming',
    'confirmed',
    'partially_paid',
    'finished',
    'failed',
    'refunded',
    'expired',
    'manual',
    'pending'
);


ALTER TYPE public.pay_status OWNER TO postgres;

--
-- Name: plan_tier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.plan_tier AS ENUM (
    'free',
    'pro',
    'agency',
    'starter'
);


ALTER TYPE public.plan_tier OWNER TO postgres;

--
-- Name: stream_platform; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.stream_platform AS ENUM (
    'twitch',
    'kick',
    'youtube'
);


ALTER TYPE public.stream_platform OWNER TO postgres;

--
-- Name: sub_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sub_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'expired'
);


ALTER TYPE public.sub_status OWNER TO postgres;

--
-- Name: acquire_click_uniqueness_lock(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Try to acquire an advisory lock (non-blocking)
  -- Returns true if lock acquired, false if already held
  -- Lock is automatically released at transaction end
  RETURN pg_try_advisory_xact_lock(hashtext(p_short_link_id::text || p_ip_hash));
END;
$$;


ALTER FUNCTION public.acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text) OWNER TO postgres;

--
-- Name: cleanup_old_clicks(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_clicks() RETURNS TABLE(deleted_count bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_count bigint;
BEGIN
  DELETE FROM click_daily WHERE day < current_date - 90;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  deleted_count := v_count;
  RETURN NEXT;

  -- Log to PostgreSQL server log for operational visibility
  RAISE NOTICE 'cleanup_old_clicks: deleted % click_daily rows older than 90 days', v_count;
END;
$$;


ALTER FUNCTION public.cleanup_old_clicks() OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: sync_site_suspended(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_site_suspended() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE sites SET suspended = (NEW.status = 'suspended') WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_site_suspended() OWNER TO postgres;

--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid NOT NULL,
    target_user_id uuid,
    action text NOT NULL,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_audit OWNER TO postgres;

--
-- Name: archives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.archives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    label text DEFAULT ''::text NOT NULL,
    snapshot_json jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.archives OWNER TO postgres;

--
-- Name: bot_commands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot_commands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bot_id uuid NOT NULL,
    command text NOT NULL,
    response text,
    offer_id uuid,
    is_enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.bot_commands OWNER TO postgres;

--
-- Name: bot_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bot_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bot_id uuid NOT NULL,
    tg_user_id bigint NOT NULL,
    tg_username text,
    first_name text,
    language text,
    is_blocked boolean DEFAULT false NOT NULL,
    first_seen timestamp with time zone DEFAULT now() NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bot_subscribers OWNER TO postgres;

--
-- Name: bots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    tg_bot_id bigint,
    username text,
    token_encrypted bytea NOT NULL,
    token_hint text,
    webhook_secret text NOT NULL,
    status public.bot_status DEFAULT 'pending'::public.bot_status NOT NULL,
    welcome_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bots OWNER TO postgres;

--
-- Name: broadcasts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broadcasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bot_id uuid NOT NULL,
    body text NOT NULL,
    media_url text,
    buttons jsonb,
    status public.broadcast_status DEFAULT 'draft'::public.broadcast_status NOT NULL,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    total_count integer DEFAULT 0,
    sent_count integer DEFAULT 0,
    fail_count integer DEFAULT 0,
    cursor_tg_user_id bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    segment text DEFAULT 'all'::text
);


ALTER TABLE public.broadcasts OWNER TO postgres;

--
-- Name: COLUMN broadcasts.segment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.broadcasts.segment IS 'Target segment: all, clicked, deposited, inactive';


--
-- Name: casinos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.casinos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    logo_url text,
    website_url text,
    is_global boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.casinos OWNER TO postgres;

--
-- Name: click_daily; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.click_daily (
    day date NOT NULL,
    short_link_id uuid NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    unique_clicks integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.click_daily OWNER TO postgres;

--
-- Name: clicks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks (
    id bigint NOT NULL,
    short_link_id uuid NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    ip_hash bytea,
    country text,
    user_agent text,
    referer text,
    tg_user_id bigint,
    click_ref text,
    is_unique boolean DEFAULT true NOT NULL
)
PARTITION BY RANGE (ts);


ALTER TABLE public.clicks OWNER TO postgres;

--
-- Name: clicks_2026_07; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks_2026_07 (
    id bigint NOT NULL,
    short_link_id uuid NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    ip_hash bytea,
    country text,
    user_agent text,
    referer text,
    tg_user_id bigint,
    click_ref text,
    is_unique boolean DEFAULT true NOT NULL
);


ALTER TABLE public.clicks_2026_07 OWNER TO postgres;

--
-- Name: clicks_2026_08; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks_2026_08 (
    id bigint NOT NULL,
    short_link_id uuid NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    ip_hash bytea,
    country text,
    user_agent text,
    referer text,
    tg_user_id bigint,
    click_ref text,
    is_unique boolean DEFAULT true NOT NULL
);


ALTER TABLE public.clicks_2026_08 OWNER TO postgres;

--
-- Name: clicks_2026_09; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks_2026_09 (
    id bigint NOT NULL,
    short_link_id uuid NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    ip_hash bytea,
    country text,
    user_agent text,
    referer text,
    tg_user_id bigint,
    click_ref text,
    is_unique boolean DEFAULT true NOT NULL
);


ALTER TABLE public.clicks_2026_09 OWNER TO postgres;

--
-- Name: clicks_default; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clicks_default (
    id bigint NOT NULL,
    short_link_id uuid NOT NULL,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    ip_hash bytea,
    country text,
    user_agent text,
    referer text,
    tg_user_id bigint,
    click_ref text,
    is_unique boolean DEFAULT true NOT NULL
);


ALTER TABLE public.clicks_default OWNER TO postgres;

--
-- Name: clicks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.clicks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conversions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    offer_id uuid,
    click_ref text,
    event text NOT NULL,
    amount numeric(20,8),
    currency text,
    raw jsonb,
    ts timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conversions OWNER TO postgres;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    handle text DEFAULT ''::text NOT NULL,
    casino text DEFAULT ''::text NOT NULL,
    contact text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    casino_id uuid NOT NULL,
    label text NOT NULL,
    referral_url text NOT NULL,
    promo_code text,
    bonus_text text,
    priority integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.offers OWNER TO postgres;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    token text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval) NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_id uuid,
    provider public.pay_provider DEFAULT 'nowpayments'::public.pay_provider NOT NULL,
    invoice_id text DEFAULT ''::text NOT NULL,
    amount numeric(20,8) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    tx_ref text,
    status public.pay_status DEFAULT 'created'::public.pay_status NOT NULL,
    payload_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    plan_tier public.plan_tier
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: player_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bot_id uuid NOT NULL,
    site_id uuid NOT NULL,
    tg_user_id bigint NOT NULL,
    player_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.player_subscriptions OWNER TO postgres;

--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    name text NOT NULL,
    wagered numeric(15,2) DEFAULT 0 NOT NULL,
    prize numeric(15,2) DEFAULT 0 NOT NULL,
    sort integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.players OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    token text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
    twofa_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: short_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.short_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    offer_id uuid NOT NULL,
    slug text NOT NULL,
    source text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.short_links OWNER TO postgres;

--
-- Name: site_referrers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_referrers (
    site_id uuid NOT NULL,
    day date NOT NULL,
    domain text NOT NULL,
    count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.site_referrers OWNER TO postgres;

--
-- Name: site_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_stats (
    site_id uuid NOT NULL,
    day date NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    copies integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.site_stats OWNER TO postgres;

--
-- Name: site_stats_hourly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_stats_hourly (
    site_id uuid NOT NULL,
    day date NOT NULL,
    hour smallint NOT NULL,
    day_of_week smallint NOT NULL,
    views integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.site_stats_hourly OWNER TO postgres;

--
-- Name: sites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    slug text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    tagline text DEFAULT ''::text NOT NULL,
    casino text DEFAULT 'Stake'::text NOT NULL,
    code text DEFAULT ''::text NOT NULL,
    cta_url text DEFAULT ''::text NOT NULL,
    prize_pool text DEFAULT '$0'::text NOT NULL,
    period text DEFAULT 'Monthly'::text NOT NULL,
    ends_at timestamp with time zone,
    reset_note text DEFAULT ''::text NOT NULL,
    blurb text DEFAULT ''::text NOT NULL,
    published boolean DEFAULT true NOT NULL,
    extra_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    logo_data text DEFAULT ''::text NOT NULL,
    theme_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    board_order integer DEFAULT 0,
    custom_domain character varying(255),
    custom_hostname_id text,
    domain_status text DEFAULT 'pending'::text,
    suspended boolean DEFAULT false NOT NULL,
    postback_key_enc bytea
);


ALTER TABLE public.sites OWNER TO postgres;

--
-- Name: COLUMN sites.postback_key_enc; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sites.postback_key_enc IS 'AES-256-GCM encrypted postback_key (SEC-003). Lazily migrated from plaintext postback_key.';


--
-- Name: stream_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stream_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    platform public.stream_platform NOT NULL,
    channel_name text NOT NULL,
    external_id text,
    is_live boolean DEFAULT false NOT NULL,
    last_live_at timestamp with time zone,
    auto_post_bot_id uuid,
    live_template text
);


ALTER TABLE public.stream_channels OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan public.plan_tier NOT NULL,
    status public.sub_status DEFAULT 'trialing'::public.sub_status NOT NULL,
    provider public.pay_provider NOT NULL,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext,
    password_hash text,
    password_salt text,
    telegram_user_id bigint,
    display_name text,
    plan public.plan_tier DEFAULT 'free'::public.plan_tier NOT NULL,
    plan_expires_at timestamp with time zone,
    status public.acct_status DEFAULT 'active'::public.acct_status NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    postback_key text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    has_trial boolean DEFAULT false,
    totp_secret text,
    failed_login_count integer DEFAULT 0,
    locked_until timestamp with time zone,
    telegram_id bigint,
    telegram_username text,
    telegram_linked_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.telegram_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telegram_id IS 'Telegram user ID from Login widget. Unique — one Telegram account per user.';


--
-- Name: COLUMN users.telegram_username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telegram_username IS 'Telegram @username at time of linking (display only, may change).';


--
-- Name: COLUMN users.telegram_linked_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telegram_linked_at IS 'When the Telegram identity was linked to this account.';


--
-- Name: clicks_2026_07; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks ATTACH PARTITION public.clicks_2026_07 FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-08-01 00:00:00+00');


--
-- Name: clicks_2026_08; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks ATTACH PARTITION public.clicks_2026_08 FOR VALUES FROM ('2026-08-01 00:00:00+00') TO ('2026-09-01 00:00:00+00');


--
-- Name: clicks_2026_09; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks ATTACH PARTITION public.clicks_2026_09 FOR VALUES FROM ('2026-09-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');


--
-- Name: clicks_default; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks ATTACH PARTITION public.clicks_default DEFAULT;


--
-- Name: admin_audit admin_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit
    ADD CONSTRAINT admin_audit_pkey PRIMARY KEY (id);


--
-- Name: archives archives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT archives_pkey PRIMARY KEY (id);


--
-- Name: bot_commands bot_commands_bot_id_command_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_commands
    ADD CONSTRAINT bot_commands_bot_id_command_key UNIQUE (bot_id, command);


--
-- Name: bot_commands bot_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_commands
    ADD CONSTRAINT bot_commands_pkey PRIMARY KEY (id);


--
-- Name: bot_subscribers bot_subscribers_bot_id_tg_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_subscribers
    ADD CONSTRAINT bot_subscribers_bot_id_tg_user_id_key UNIQUE (bot_id, tg_user_id);


--
-- Name: bot_subscribers bot_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_subscribers
    ADD CONSTRAINT bot_subscribers_pkey PRIMARY KEY (id);


--
-- Name: bots bots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bots
    ADD CONSTRAINT bots_pkey PRIMARY KEY (id);


--
-- Name: bots bots_tg_bot_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bots
    ADD CONSTRAINT bots_tg_bot_id_key UNIQUE (tg_bot_id);


--
-- Name: bots bots_webhook_secret_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bots
    ADD CONSTRAINT bots_webhook_secret_key UNIQUE (webhook_secret);


--
-- Name: broadcasts broadcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcasts
    ADD CONSTRAINT broadcasts_pkey PRIMARY KEY (id);


--
-- Name: casinos casinos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casinos
    ADD CONSTRAINT casinos_pkey PRIMARY KEY (id);


--
-- Name: casinos casinos_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casinos
    ADD CONSTRAINT casinos_slug_key UNIQUE (slug);


--
-- Name: click_daily click_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.click_daily
    ADD CONSTRAINT click_daily_pkey PRIMARY KEY (day, short_link_id);


--
-- Name: clicks clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks
    ADD CONSTRAINT clicks_pkey PRIMARY KEY (id, ts);


--
-- Name: clicks_2026_07 clicks_2026_07_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks_2026_07
    ADD CONSTRAINT clicks_2026_07_pkey PRIMARY KEY (id, ts);


--
-- Name: clicks_2026_08 clicks_2026_08_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks_2026_08
    ADD CONSTRAINT clicks_2026_08_pkey PRIMARY KEY (id, ts);


--
-- Name: clicks_2026_09 clicks_2026_09_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks_2026_09
    ADD CONSTRAINT clicks_2026_09_pkey PRIMARY KEY (id, ts);


--
-- Name: clicks_default clicks_default_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clicks_default
    ADD CONSTRAINT clicks_default_pkey PRIMARY KEY (id, ts);


--
-- Name: conversions conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: player_subscriptions player_subscriptions_bot_id_tg_user_id_site_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_subscriptions
    ADD CONSTRAINT player_subscriptions_bot_id_tg_user_id_site_id_key UNIQUE (bot_id, tg_user_id, site_id);


--
-- Name: player_subscriptions player_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_subscriptions
    ADD CONSTRAINT player_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- Name: short_links short_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.short_links
    ADD CONSTRAINT short_links_pkey PRIMARY KEY (id);


--
-- Name: short_links short_links_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.short_links
    ADD CONSTRAINT short_links_slug_key UNIQUE (slug);


--
-- Name: site_referrers site_referrers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_referrers
    ADD CONSTRAINT site_referrers_pkey PRIMARY KEY (site_id, day, domain);


--
-- Name: site_stats_hourly site_stats_hourly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_stats_hourly
    ADD CONSTRAINT site_stats_hourly_pkey PRIMARY KEY (site_id, day, hour);


--
-- Name: site_stats site_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_stats
    ADD CONSTRAINT site_stats_pkey PRIMARY KEY (site_id, day);


--
-- Name: sites sites_custom_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_custom_domain_key UNIQUE (custom_domain);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: sites sites_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_slug_key UNIQUE (slug);


--
-- Name: stream_channels stream_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_channels
    ADD CONSTRAINT stream_channels_pkey PRIMARY KEY (id);


--
-- Name: stream_channels stream_channels_platform_channel_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_channels
    ADD CONSTRAINT stream_channels_platform_channel_name_key UNIQUE (platform, channel_name);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_postback_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_postback_key_key UNIQUE (postback_key);


--
-- Name: users users_telegram_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telegram_id_key UNIQUE (telegram_id);


--
-- Name: users users_telegram_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telegram_user_id_key UNIQUE (telegram_user_id);


--
-- Name: idx_clicks_ref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clicks_ref ON ONLY public.clicks USING btree (click_ref);


--
-- Name: clicks_2026_07_click_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_07_click_ref_idx ON public.clicks_2026_07 USING btree (click_ref);


--
-- Name: idx_clicks_uniqueness_check; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clicks_uniqueness_check ON ONLY public.clicks USING btree (short_link_id, ip_hash, ts DESC);


--
-- Name: clicks_2026_07_short_link_id_ip_hash_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_07_short_link_id_ip_hash_ts_idx ON public.clicks_2026_07 USING btree (short_link_id, ip_hash, ts DESC);


--
-- Name: idx_clicks_link; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clicks_link ON ONLY public.clicks USING btree (short_link_id, ts);


--
-- Name: clicks_2026_07_short_link_id_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_07_short_link_id_ts_idx ON public.clicks_2026_07 USING btree (short_link_id, ts);


--
-- Name: clicks_2026_08_click_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_08_click_ref_idx ON public.clicks_2026_08 USING btree (click_ref);


--
-- Name: clicks_2026_08_short_link_id_ip_hash_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_08_short_link_id_ip_hash_ts_idx ON public.clicks_2026_08 USING btree (short_link_id, ip_hash, ts DESC);


--
-- Name: clicks_2026_08_short_link_id_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_08_short_link_id_ts_idx ON public.clicks_2026_08 USING btree (short_link_id, ts);


--
-- Name: clicks_2026_09_click_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_09_click_ref_idx ON public.clicks_2026_09 USING btree (click_ref);


--
-- Name: clicks_2026_09_short_link_id_ip_hash_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_09_short_link_id_ip_hash_ts_idx ON public.clicks_2026_09 USING btree (short_link_id, ip_hash, ts DESC);


--
-- Name: clicks_2026_09_short_link_id_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_2026_09_short_link_id_ts_idx ON public.clicks_2026_09 USING btree (short_link_id, ts);


--
-- Name: clicks_default_click_ref_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_default_click_ref_idx ON public.clicks_default USING btree (click_ref);


--
-- Name: clicks_default_short_link_id_ip_hash_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_default_short_link_id_ip_hash_ts_idx ON public.clicks_default USING btree (short_link_id, ip_hash, ts DESC);


--
-- Name: clicks_default_short_link_id_ts_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clicks_default_short_link_id_ts_idx ON public.clicks_default USING btree (short_link_id, ts);


--
-- Name: conversions_idempotency_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX conversions_idempotency_idx ON public.conversions USING btree (owner_id, click_ref, event, COALESCE(amount, ('-1'::integer)::numeric));


--
-- Name: idx_admin_audit_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_admin_id ON public.admin_audit USING btree (admin_id);


--
-- Name: idx_admin_audit_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_created_at ON public.admin_audit USING btree (created_at DESC);


--
-- Name: idx_admin_audit_target_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_audit_target_user_id ON public.admin_audit USING btree (target_user_id);


--
-- Name: idx_archives_site; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_archives_site ON public.archives USING btree (site_id);


--
-- Name: idx_bots_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bots_owner ON public.bots USING btree (owner_id);


--
-- Name: idx_click_daily_link; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_click_daily_link ON public.click_daily USING btree (short_link_id, day);


--
-- Name: idx_conversions_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_conversions_owner ON public.conversions USING btree (owner_id, ts);


--
-- Name: idx_offers_owner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_offers_owner ON public.offers USING btree (owner_id, is_active);


--
-- Name: idx_payments_plan_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_plan_tier ON public.payments USING btree (plan_tier) WHERE (plan_tier IS NOT NULL);


--
-- Name: idx_payments_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_user ON public.payments USING btree (user_id);


--
-- Name: idx_player_subs_bot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_subs_bot ON public.player_subscriptions USING btree (bot_id);


--
-- Name: idx_player_subs_site; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_player_subs_site ON public.player_subscriptions USING btree (site_id);


--
-- Name: idx_players_site; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_players_site ON public.players USING btree (site_id);


--
-- Name: idx_players_site_wagered; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_players_site_wagered ON public.players USING btree (site_id, wagered DESC);


--
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);


--
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);


--
-- Name: idx_short_links_offer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_short_links_offer ON public.short_links USING btree (offer_id);


--
-- Name: idx_site_stats; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_stats ON public.site_stats USING btree (site_id, day DESC);


--
-- Name: idx_sites_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sites_slug ON public.sites USING btree (slug);


--
-- Name: idx_sites_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sites_user_id ON public.sites USING btree (user_id);


--
-- Name: idx_subs_bot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subs_bot ON public.bot_subscribers USING btree (bot_id) WHERE (is_blocked = false);


--
-- Name: idx_subs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subs_user ON public.subscriptions USING btree (user_id);


--
-- Name: idx_users_postback_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_postback_key ON public.users USING btree (postback_key) WHERE (postback_key IS NOT NULL);


--
-- Name: idx_users_telegram_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_telegram_id ON public.users USING btree (telegram_id) WHERE (telegram_id IS NOT NULL);


--
-- Name: uq_payments_nowpayments_txref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_payments_nowpayments_txref ON public.payments USING btree (tx_ref) WHERE (provider = 'nowpayments'::public.pay_provider);


--
-- Name: uq_payments_stars_txref; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_payments_stars_txref ON public.payments USING btree (tx_ref) WHERE (provider = 'telegram_stars'::public.pay_provider);


--
-- Name: clicks_2026_07_click_ref_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_ref ATTACH PARTITION public.clicks_2026_07_click_ref_idx;


--
-- Name: clicks_2026_07_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.clicks_pkey ATTACH PARTITION public.clicks_2026_07_pkey;


--
-- Name: clicks_2026_07_short_link_id_ip_hash_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_uniqueness_check ATTACH PARTITION public.clicks_2026_07_short_link_id_ip_hash_ts_idx;


--
-- Name: clicks_2026_07_short_link_id_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_link ATTACH PARTITION public.clicks_2026_07_short_link_id_ts_idx;


--
-- Name: clicks_2026_08_click_ref_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_ref ATTACH PARTITION public.clicks_2026_08_click_ref_idx;


--
-- Name: clicks_2026_08_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.clicks_pkey ATTACH PARTITION public.clicks_2026_08_pkey;


--
-- Name: clicks_2026_08_short_link_id_ip_hash_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_uniqueness_check ATTACH PARTITION public.clicks_2026_08_short_link_id_ip_hash_ts_idx;


--
-- Name: clicks_2026_08_short_link_id_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_link ATTACH PARTITION public.clicks_2026_08_short_link_id_ts_idx;


--
-- Name: clicks_2026_09_click_ref_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_ref ATTACH PARTITION public.clicks_2026_09_click_ref_idx;


--
-- Name: clicks_2026_09_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.clicks_pkey ATTACH PARTITION public.clicks_2026_09_pkey;


--
-- Name: clicks_2026_09_short_link_id_ip_hash_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_uniqueness_check ATTACH PARTITION public.clicks_2026_09_short_link_id_ip_hash_ts_idx;


--
-- Name: clicks_2026_09_short_link_id_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_link ATTACH PARTITION public.clicks_2026_09_short_link_id_ts_idx;


--
-- Name: clicks_default_click_ref_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_ref ATTACH PARTITION public.clicks_default_click_ref_idx;


--
-- Name: clicks_default_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.clicks_pkey ATTACH PARTITION public.clicks_default_pkey;


--
-- Name: clicks_default_short_link_id_ip_hash_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_uniqueness_check ATTACH PARTITION public.clicks_default_short_link_id_ip_hash_ts_idx;


--
-- Name: clicks_default_short_link_id_ts_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_clicks_link ATTACH PARTITION public.clicks_default_short_link_id_ts_idx;


--
-- Name: bots set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: offers set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: payments set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: sites set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: users trg_sync_site_suspended; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_site_suspended AFTER UPDATE OF status ON public.users FOR EACH ROW EXECUTE FUNCTION public.sync_site_suspended();


--
-- Name: admin_audit admin_audit_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit
    ADD CONSTRAINT admin_audit_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admin_audit admin_audit_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_audit
    ADD CONSTRAINT admin_audit_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: archives archives_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.archives
    ADD CONSTRAINT archives_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: bot_commands bot_commands_bot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_commands
    ADD CONSTRAINT bot_commands_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bots(id) ON DELETE CASCADE;


--
-- Name: bot_commands bot_commands_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_commands
    ADD CONSTRAINT bot_commands_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- Name: bot_subscribers bot_subscribers_bot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bot_subscribers
    ADD CONSTRAINT bot_subscribers_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bots(id) ON DELETE CASCADE;


--
-- Name: bots bots_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bots
    ADD CONSTRAINT bots_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: broadcasts broadcasts_bot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcasts
    ADD CONSTRAINT broadcasts_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bots(id) ON DELETE CASCADE;


--
-- Name: casinos casinos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.casinos
    ADD CONSTRAINT casinos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: click_daily click_daily_short_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.click_daily
    ADD CONSTRAINT click_daily_short_link_id_fkey FOREIGN KEY (short_link_id) REFERENCES public.short_links(id) ON DELETE CASCADE;


--
-- Name: clicks clicks_short_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks
    ADD CONSTRAINT clicks_short_link_id_fkey FOREIGN KEY (short_link_id) REFERENCES public.short_links(id) ON DELETE CASCADE;


--
-- Name: conversions conversions_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- Name: conversions conversions_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversions
    ADD CONSTRAINT conversions_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: offers offers_casino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_casino_id_fkey FOREIGN KEY (casino_id) REFERENCES public.casinos(id) ON DELETE CASCADE;


--
-- Name: offers offers_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: player_subscriptions player_subscriptions_bot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_subscriptions
    ADD CONSTRAINT player_subscriptions_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bots(id) ON DELETE CASCADE;


--
-- Name: player_subscriptions player_subscriptions_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_subscriptions
    ADD CONSTRAINT player_subscriptions_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: players players_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: short_links short_links_offer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.short_links
    ADD CONSTRAINT short_links_offer_id_fkey FOREIGN KEY (offer_id) REFERENCES public.offers(id) ON DELETE CASCADE;


--
-- Name: site_stats site_stats_site_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_stats
    ADD CONSTRAINT site_stats_site_id_fkey FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;


--
-- Name: sites sites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sites
    ADD CONSTRAINT sites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stream_channels stream_channels_auto_post_bot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_channels
    ADD CONSTRAINT stream_channels_auto_post_bot_id_fkey FOREIGN KEY (auto_post_bot_id) REFERENCES public.bots(id) ON DELETE CASCADE;


--
-- Name: stream_channels stream_channels_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stream_channels
    ADD CONSTRAINT stream_channels_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: admin_audit; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: archives; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.archives ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_commands; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bot_commands ENABLE ROW LEVEL SECURITY;

--
-- Name: bot_subscribers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bot_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: bots; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

--
-- Name: broadcasts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

--
-- Name: casinos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.casinos ENABLE ROW LEVEL SECURITY;

--
-- Name: click_daily; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.click_daily ENABLE ROW LEVEL SECURITY;

--
-- Name: clicks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

--
-- Name: clicks_2026_07; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks_2026_07 ENABLE ROW LEVEL SECURITY;

--
-- Name: clicks_2026_08; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks_2026_08 ENABLE ROW LEVEL SECURITY;

--
-- Name: clicks_2026_09; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks_2026_09 ENABLE ROW LEVEL SECURITY;

--
-- Name: clicks_default; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clicks_default ENABLE ROW LEVEL SECURITY;

--
-- Name: conversions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: offers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

--
-- Name: password_resets; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: player_subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.player_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: players; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_audit service_role_all_admin_audit; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: archives service_role_all_archives; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: bot_commands service_role_all_bot_commands; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: bot_subscribers service_role_all_bot_subscribers; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: bots service_role_all_bots; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: broadcasts service_role_all_broadcasts; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: casinos service_role_all_casinos; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: click_daily service_role_all_click_daily; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: clicks service_role_all_clicks; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: conversions service_role_all_conversions; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: leads service_role_all_leads; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: offers service_role_all_offers; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: payments service_role_all_payments; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: player_subscriptions service_role_all_player_subscriptions; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: players service_role_all_players; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: short_links service_role_all_short_links; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: site_referrers service_role_all_site_referrers; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: site_stats service_role_all_site_stats; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: site_stats_hourly service_role_all_site_stats_hourly; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: sites service_role_all_sites; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: stream_channels service_role_all_stream_channels; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: subscriptions service_role_all_subscriptions; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: users service_role_all_users; Type: POLICY; Schema: public; Owner: postgres
--



--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: short_links; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

--
-- Name: site_referrers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.site_referrers ENABLE ROW LEVEL SECURITY;

--
-- Name: site_stats; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: site_stats_hourly; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.site_stats_hourly ENABLE ROW LEVEL SECURITY;

--
-- Name: sites; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

--
-- Name: stream_channels; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.stream_channels ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text) TO anon;
GRANT ALL ON FUNCTION public.acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text) TO authenticated;
GRANT ALL ON FUNCTION public.acquire_click_uniqueness_lock(p_short_link_id uuid, p_ip_hash text) TO service_role;


--
-- Name: FUNCTION cleanup_old_clicks(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.cleanup_old_clicks() FROM PUBLIC;
GRANT ALL ON FUNCTION public.cleanup_old_clicks() TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION sync_site_suspended(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_site_suspended() TO anon;
GRANT ALL ON FUNCTION public.sync_site_suspended() TO authenticated;
GRANT ALL ON FUNCTION public.sync_site_suspended() TO service_role;


--
-- Name: FUNCTION update_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at() TO service_role;


--
-- Name: TABLE admin_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_audit TO anon;
GRANT ALL ON TABLE public.admin_audit TO authenticated;
GRANT ALL ON TABLE public.admin_audit TO service_role;


--
-- Name: TABLE archives; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.archives TO anon;
GRANT ALL ON TABLE public.archives TO authenticated;
GRANT ALL ON TABLE public.archives TO service_role;


--
-- Name: TABLE bot_commands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bot_commands TO anon;
GRANT ALL ON TABLE public.bot_commands TO authenticated;
GRANT ALL ON TABLE public.bot_commands TO service_role;


--
-- Name: TABLE bot_subscribers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bot_subscribers TO anon;
GRANT ALL ON TABLE public.bot_subscribers TO authenticated;
GRANT ALL ON TABLE public.bot_subscribers TO service_role;


--
-- Name: TABLE bots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bots TO anon;
GRANT ALL ON TABLE public.bots TO authenticated;
GRANT ALL ON TABLE public.bots TO service_role;


--
-- Name: TABLE broadcasts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.broadcasts TO anon;
GRANT ALL ON TABLE public.broadcasts TO authenticated;
GRANT ALL ON TABLE public.broadcasts TO service_role;


--
-- Name: TABLE casinos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.casinos TO anon;
GRANT ALL ON TABLE public.casinos TO authenticated;
GRANT ALL ON TABLE public.casinos TO service_role;


--
-- Name: TABLE click_daily; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.click_daily TO anon;
GRANT ALL ON TABLE public.click_daily TO authenticated;
GRANT ALL ON TABLE public.click_daily TO service_role;


--
-- Name: TABLE clicks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clicks TO anon;
GRANT ALL ON TABLE public.clicks TO authenticated;
GRANT ALL ON TABLE public.clicks TO service_role;


--
-- Name: TABLE clicks_2026_07; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clicks_2026_07 TO anon;
GRANT ALL ON TABLE public.clicks_2026_07 TO authenticated;
GRANT ALL ON TABLE public.clicks_2026_07 TO service_role;


--
-- Name: TABLE clicks_2026_08; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clicks_2026_08 TO anon;
GRANT ALL ON TABLE public.clicks_2026_08 TO authenticated;
GRANT ALL ON TABLE public.clicks_2026_08 TO service_role;


--
-- Name: TABLE clicks_2026_09; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clicks_2026_09 TO anon;
GRANT ALL ON TABLE public.clicks_2026_09 TO authenticated;
GRANT ALL ON TABLE public.clicks_2026_09 TO service_role;


--
-- Name: TABLE clicks_default; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clicks_default TO anon;
GRANT ALL ON TABLE public.clicks_default TO authenticated;
GRANT ALL ON TABLE public.clicks_default TO service_role;


--
-- Name: SEQUENCE clicks_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.clicks_id_seq TO anon;
GRANT ALL ON SEQUENCE public.clicks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.clicks_id_seq TO service_role;


--
-- Name: TABLE conversions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversions TO anon;
GRANT ALL ON TABLE public.conversions TO authenticated;
GRANT ALL ON TABLE public.conversions TO service_role;


--
-- Name: TABLE leads; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.leads TO anon;
GRANT ALL ON TABLE public.leads TO authenticated;
GRANT ALL ON TABLE public.leads TO service_role;


--
-- Name: TABLE offers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.offers TO anon;
GRANT ALL ON TABLE public.offers TO authenticated;
GRANT ALL ON TABLE public.offers TO service_role;


--
-- Name: TABLE password_resets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_resets TO anon;
GRANT ALL ON TABLE public.password_resets TO authenticated;
GRANT ALL ON TABLE public.password_resets TO service_role;


--
-- Name: TABLE payments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payments TO anon;
GRANT ALL ON TABLE public.payments TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;


--
-- Name: TABLE player_subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.player_subscriptions TO anon;
GRANT ALL ON TABLE public.player_subscriptions TO authenticated;
GRANT ALL ON TABLE public.player_subscriptions TO service_role;


--
-- Name: TABLE players; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.players TO anon;
GRANT ALL ON TABLE public.players TO authenticated;
GRANT ALL ON TABLE public.players TO service_role;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sessions TO anon;
GRANT ALL ON TABLE public.sessions TO authenticated;
GRANT ALL ON TABLE public.sessions TO service_role;


--
-- Name: TABLE short_links; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.short_links TO anon;
GRANT ALL ON TABLE public.short_links TO authenticated;
GRANT ALL ON TABLE public.short_links TO service_role;


--
-- Name: TABLE site_referrers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.site_referrers TO anon;
GRANT ALL ON TABLE public.site_referrers TO authenticated;
GRANT ALL ON TABLE public.site_referrers TO service_role;


--
-- Name: TABLE site_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.site_stats TO anon;
GRANT ALL ON TABLE public.site_stats TO authenticated;
GRANT ALL ON TABLE public.site_stats TO service_role;


--
-- Name: TABLE site_stats_hourly; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.site_stats_hourly TO anon;
GRANT ALL ON TABLE public.site_stats_hourly TO authenticated;
GRANT ALL ON TABLE public.site_stats_hourly TO service_role;


--
-- Name: TABLE sites; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sites TO anon;
GRANT ALL ON TABLE public.sites TO authenticated;
GRANT ALL ON TABLE public.sites TO service_role;


--
-- Name: TABLE stream_channels; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.stream_channels TO anon;
GRANT ALL ON TABLE public.stream_channels TO authenticated;
GRANT ALL ON TABLE public.stream_channels TO service_role;


--
-- Name: TABLE subscriptions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.subscriptions TO anon;
GRANT ALL ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


