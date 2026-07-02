-- ============================================================
--  GroupsMix — UNIFIED schema (Supabase / PostgreSQL)
--  Merges rankup-saas (leaderboards) + casino-bot-platform (bots)
--  into ONE database with ONE users table.
--
--  One account = a streamer's leaderboard  AND  their Telegram bot.
--  Run once against the Supabase 'groupsmix' project (SQL editor).
--  Safe-ish to re-run: uses IF NOT EXISTS / DO $$ guards where possible.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email

-- ---------- ENUM TYPES (from the bot platform, kept) ----------
DO $$ BEGIN CREATE TYPE plan_tier        AS ENUM ('free', 'pro', 'agency'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE sub_status       AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bot_status       AS ENUM ('pending', 'active', 'paused', 'revoked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE pay_provider     AS ENUM ('crypto', 'telegram_stars', 'manual', 'nowpayments'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE pay_status       AS ENUM ('created','waiting','confirming','confirmed','partially_paid','finished','failed','refunded','expired','manual','pending'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE stream_platform  AS ENUM ('twitch', 'kick', 'youtube'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE broadcast_status AS ENUM ('draft','scheduled','sending','sent','failed','canceled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE acct_status      AS ENUM ('active','past_due','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
--  1. USERS — the single merged account.
--     Carries BOTH auth methods:
--       * password_hash/salt  -> leaderboard-style email+password login
--       * telegram_user_id     -> Telegram-login (bot dashboard)
--     A user may have either or both. Same email = same person.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             CITEXT UNIQUE,
    -- password auth (nullable: telegram-only users have no password)
    password_hash     TEXT,
    password_salt     TEXT,
    -- telegram auth
    telegram_user_id  BIGINT UNIQUE,
    display_name      TEXT,
    -- plan / billing (superset of both systems)
    plan              plan_tier   NOT NULL DEFAULT 'free',
    plan_expires_at   TIMESTAMPTZ,                 -- NULL = no expiry (free/lifetime)
    status            acct_status NOT NULL DEFAULT 'active',
    is_admin          BOOLEAN     NOT NULL DEFAULT false,
    postback_key      TEXT UNIQUE,                 -- casino postback secret (bot side)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  ============  LEADERBOARD SIDE (from rankup-saas)  =========
--  D1 TEXT ids -> we keep them as UUID going forward, but the
--  data layer generates ids in app code (crypto.randomUUID()).
-- ============================================================

-- One user owns one site (1:1). Public page lives at /<slug>.
CREATE TABLE IF NOT EXISTS sites (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    slug         TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL DEFAULT '',
    tagline      TEXT NOT NULL DEFAULT '',
    casino       TEXT NOT NULL DEFAULT 'Stake',
    code         TEXT NOT NULL DEFAULT '',
    cta_url      TEXT NOT NULL DEFAULT '',
    prize_pool   TEXT NOT NULL DEFAULT '$0',
    period       TEXT NOT NULL DEFAULT 'Monthly',
    ends_at      TEXT NOT NULL DEFAULT '',
    reset_note   TEXT NOT NULL DEFAULT '',
    blurb        TEXT NOT NULL DEFAULT '',
    published    BOOLEAN NOT NULL DEFAULT true,
    extra_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
    logo_data    TEXT NOT NULL DEFAULT '',
    theme_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sites_slug ON sites(slug);

CREATE TABLE IF NOT EXISTS players (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id  UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name     TEXT NOT NULL,
    wagered  NUMERIC(15,2) NOT NULL DEFAULT 0,
    prize    NUMERIC(15,2) NOT NULL DEFAULT 0,
    sort     INT NOT NULL DEFAULT 0,
    CONSTRAINT positive_wagered CHECK (wagered >= 0),
    CONSTRAINT positive_prize   CHECK (prize   >= 0)
);
CREATE INDEX IF NOT EXISTS idx_players_site ON players(site_id);

CREATE TABLE IF NOT EXISTS leads (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle     TEXT NOT NULL DEFAULT '',
    casino     TEXT NOT NULL DEFAULT '',
    contact    TEXT NOT NULL DEFAULT '',
    note       TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS archives (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id       UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    label         TEXT NOT NULL DEFAULT '',
    snapshot_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_archives_site ON archives(site_id);

-- Per-site daily analytics (leaderboard page views / copies / join clicks)
CREATE TABLE IF NOT EXISTS site_stats (
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    day     DATE NOT NULL,
    views   INT NOT NULL DEFAULT 0,
    copies  INT NOT NULL DEFAULT 0,
    clicks  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (site_id, day)
);
CREATE INDEX IF NOT EXISTS idx_site_stats ON site_stats (site_id, day DESC);

-- ============================================================
--  ============  BOT SIDE (from casino-bot-platform)  =========
-- ============================================================
CREATE TABLE IF NOT EXISTS bots (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tg_bot_id        BIGINT UNIQUE,
    username         TEXT,
    token_encrypted  BYTEA NOT NULL,
    token_hint       TEXT,
    webhook_secret   TEXT NOT NULL UNIQUE,
    status           bot_status NOT NULL DEFAULT 'pending',
    welcome_message  TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bots_owner ON bots (owner_id);

CREATE TABLE IF NOT EXISTS casinos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         TEXT UNIQUE NOT NULL,
    name         TEXT NOT NULL,
    logo_url     TEXT,
    website_url  TEXT,
    is_global    BOOLEAN NOT NULL DEFAULT true,
    created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    casino_id     UUID NOT NULL REFERENCES casinos(id) ON DELETE RESTRICT,
    label         TEXT NOT NULL,
    referral_url  TEXT NOT NULL,
    promo_code    TEXT,
    bonus_text    TEXT,
    priority      INT  NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_offers_owner ON offers (owner_id, is_active);

CREATE TABLE IF NOT EXISTS short_links (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id    UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    slug        TEXT UNIQUE NOT NULL,
    source      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_short_links_offer ON short_links (offer_id);

-- High-volume click log, partitioned by month.
CREATE TABLE IF NOT EXISTS clicks (
    id             BIGINT GENERATED ALWAYS AS IDENTITY,
    short_link_id  UUID NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
    ts             TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_hash        BYTEA,
    country        TEXT,
    user_agent     TEXT,
    referer        TEXT,
    tg_user_id     BIGINT,
    click_ref      TEXT,
    is_unique      BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (id, ts)
) PARTITION BY RANGE (ts);
CREATE INDEX IF NOT EXISTS idx_clicks_link ON clicks (short_link_id, ts);
CREATE INDEX IF NOT EXISTS idx_clicks_ref  ON clicks (click_ref);
-- current + next month partitions (nightly cron rolls new ones)
CREATE TABLE IF NOT EXISTS clicks_default PARTITION OF clicks DEFAULT;

CREATE TABLE IF NOT EXISTS click_daily (
    day            DATE NOT NULL,
    short_link_id  UUID NOT NULL REFERENCES short_links(id) ON DELETE CASCADE,
    clicks         INT  NOT NULL DEFAULT 0,
    unique_clicks  INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (day, short_link_id)
);
-- The PK leads with `day`, but the dashboard /offers query joins on
-- short_link_id alone (LEFT JOIN click_daily cd ON cd.short_link_id = sl.id),
-- so it can't probe the PK and would seq-scan as the rollup grows unbounded
-- (the nightly cron never deletes old rows). A short_link_id-leading index
-- turns that join into index lookups.
CREATE INDEX IF NOT EXISTS idx_click_daily_link ON click_daily (short_link_id, day);

CREATE TABLE IF NOT EXISTS conversions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_id    UUID REFERENCES offers(id) ON DELETE SET NULL,
    click_ref   TEXT,
    event       TEXT NOT NULL,
    amount      NUMERIC(20,8),
    currency    TEXT,
    raw         JSONB,
    ts          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_conversions_owner ON conversions (owner_id, ts);

CREATE TABLE IF NOT EXISTS bot_subscribers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id       UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    tg_user_id   BIGINT NOT NULL,
    tg_username  TEXT,
    first_name   TEXT,
    language     TEXT,
    is_blocked   BOOLEAN NOT NULL DEFAULT false,
    first_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (bot_id, tg_user_id)
);
CREATE INDEX IF NOT EXISTS idx_subs_bot ON bot_subscribers (bot_id) WHERE is_blocked = false;

CREATE TABLE IF NOT EXISTS bot_commands (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id       UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    command      TEXT NOT NULL,
    response     TEXT,
    offer_id     UUID REFERENCES offers(id) ON DELETE SET NULL,
    is_enabled   BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (bot_id, command)
);

CREATE TABLE IF NOT EXISTS stream_channels (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform         stream_platform NOT NULL,
    channel_name     TEXT NOT NULL,
    external_id      TEXT,
    is_live          BOOLEAN NOT NULL DEFAULT false,
    last_live_at     TIMESTAMPTZ,
    auto_post_bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
    live_template    TEXT,
    UNIQUE (platform, channel_name)
);

CREATE TABLE IF NOT EXISTS broadcasts (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id             UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    body               TEXT NOT NULL,
    media_url          TEXT,
    buttons            JSONB,
    status             broadcast_status NOT NULL DEFAULT 'draft',
    scheduled_at       TIMESTAMPTZ,
    sent_at            TIMESTAMPTZ,
    total_count        INT DEFAULT 0,
    sent_count         INT DEFAULT 0,
    fail_count         INT DEFAULT 0,
    cursor_tg_user_id  BIGINT NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  ============  SHARED BILLING  ==============================
--  One ledger for BOTH leaderboard (NOWPayments) and bot
--  (Telegram Stars / crypto). Superset of both original tables.
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                plan_tier NOT NULL,
    status              sub_status NOT NULL DEFAULT 'trialing',
    provider            pay_provider NOT NULL,
    current_period_end  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions (user_id);

CREATE TABLE IF NOT EXISTS payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id  UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    provider         pay_provider NOT NULL DEFAULT 'nowpayments',
    invoice_id       TEXT NOT NULL DEFAULT '',      -- NOWPayments invoice id
    amount           NUMERIC(20,8) NOT NULL DEFAULT 0,
    currency         TEXT NOT NULL DEFAULT 'USD',
    tx_ref           TEXT,
    status           pay_status NOT NULL DEFAULT 'created',
    payload_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments (user_id);
-- Idempotency guard for Telegram Stars: the payment charge id is unique, so a
-- retried billing webhook can never insert a second row (and thus never
-- double-credit a plan). Partial so it never constrains NOWPayments rows,
-- whose tx_ref is our own order id and follows different rules.
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_stars_txref
    ON payments (tx_ref) WHERE provider = 'telegram_stars';
