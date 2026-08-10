-- ============================================================================
--  YourRank Originals — provably-fair games on non-cashable loyalty credits.
--
--  Design notes
--  ------------
--  * Master switch lives on `sites.games_enabled` (a column, not a row in
--    site_game_settings). Rationale: it is a property of the site, exactly like
--    the existing `viewer_kick_auth_enabled` / `viewer_public_redeem_enabled`
--    toggles, and the public config endpoint already loads the site row, so the
--    master check costs no extra join and cannot be defeated by a missing
--    settings row (absent row = game disabled by default).
--  * A round's outcome is fully determined at bet time by
--    (server_seed, client_seed, nonce), all of which are committed atomically
--    inside `place_bet`. The Worker computes the HMAC outcome immediately after
--    and stores it via `set_round_outcome` before responding, so the client can
--    never see anything the server has not already committed to.
--  * `credit_ledger` stays append-only: these functions only ever INSERT.
-- ============================================================================

-- Master per-site switch for the Originals section.
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS games_enabled boolean NOT NULL DEFAULT false;

-- Per-site, per-game configuration. Absent row = disabled.
CREATE TABLE IF NOT EXISTS public.site_game_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    game text NOT NULL CHECK (game IN ('mines','plinko','dice','limbo')),
    enabled boolean NOT NULL DEFAULT false,
    min_bet integer NOT NULL DEFAULT 1 CHECK (min_bet > 0),
    max_bet integer NOT NULL DEFAULT 1000 CHECK (max_bet > 0),
    house_edge_bps integer NOT NULL DEFAULT 100 CHECK (house_edge_bps >= 0 AND house_edge_bps <= 1000),
    daily_loss_cap integer CHECK (daily_loss_cap IS NULL OR daily_loss_cap > 0),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_game_settings_bet_range CHECK (max_bet >= min_bet),
    UNIQUE (site_id, game)
);

-- Active commit/reveal seed pair per viewer-on-a-site.
-- `server_seed` is never selected by any read path while the seed is active;
-- only `server_seed_hash` is public.
CREATE TABLE IF NOT EXISTS public.game_seeds (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_viewer_id uuid NOT NULL UNIQUE REFERENCES public.site_viewers(id) ON DELETE CASCADE,
    server_seed text NOT NULL,
    server_seed_hash text NOT NULL,
    client_seed text NOT NULL,
    nonce bigint NOT NULL DEFAULT 0 CHECK (nonce >= 0),
    rotated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Revealed (retired) seeds. Everything here is public: this is what makes the
-- rounds verifiable after the fact.
CREATE TABLE IF NOT EXISTS public.game_seed_reveals (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_viewer_id uuid NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
    server_seed text NOT NULL,
    server_seed_hash text NOT NULL,
    client_seed text NOT NULL,
    final_nonce bigint NOT NULL,
    revealed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Immutable audit row per round.
CREATE TABLE IF NOT EXISTS public.game_rounds (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    site_viewer_id uuid NOT NULL REFERENCES public.site_viewers(id) ON DELETE CASCADE,
    game text NOT NULL CHECK (game IN ('mines','plinko','dice','limbo')),
    bet integer NOT NULL CHECK (bet > 0),
    state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','settled','cancelled')),
    payout integer NOT NULL DEFAULT 0 CHECK (payout >= 0),
    multiplier numeric(14,2) NOT NULL DEFAULT 0 CHECK (multiplier >= 0),
    house_edge_bps integer NOT NULL,
    server_seed_hash text NOT NULL,
    client_seed text NOT NULL,
    nonce bigint NOT NULL,
    params jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- Server-computed outcome, written before the response leaves the Worker.
    outcome jsonb,
    -- Tiles the viewer has asked to reveal (Mines). Append-only in practice.
    revealed integer[] NOT NULL DEFAULT '{}'::integer[],
    idempotency_key text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    settled_at timestamp with time zone
);

-- Indexes for the queries this feature actually runs.
CREATE INDEX IF NOT EXISTS idx_site_game_settings_site_id ON public.site_game_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_viewer_created ON public.game_rounds(site_viewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_rounds_site_created ON public.game_rounds(site_id, created_at DESC);
-- One open round per viewer, enforced by the database rather than by a read
-- inside place_bet: two concurrent bets would both pass an EXISTS check, but
-- only one can win this index, and the loser's whole transaction (debit
-- included) rolls back. Doubles as the "has an open round" lookup index.
CREATE UNIQUE INDEX IF NOT EXISTS uq_game_rounds_viewer_open ON public.game_rounds(site_viewer_id) WHERE state = 'open';
CREATE INDEX IF NOT EXISTS idx_game_seed_reveals_viewer ON public.game_seed_reveals(site_viewer_id, revealed_at DESC);

-- updated_at triggers, reusing the credits helper created in
-- 20260808000008_credits_phase0.sql.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at_credits') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_site_game_settings') THEN
      CREATE TRIGGER set_updated_at_site_game_settings
        BEFORE UPDATE ON public.site_game_settings
        FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_game_seeds') THEN
      CREATE TRIGGER set_updated_at_game_seeds
        BEFORE UPDATE ON public.game_seeds
        FOR EACH ROW EXECUTE FUNCTION set_updated_at_credits();
    END IF;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- place_bet: one transaction — validate, debit, ledger, round, nonce bump.
-- ---------------------------------------------------------------------------
--
-- Returns jsonb:
--   { ok: true, replayed: bool, round_id, nonce, server_seed, server_seed_hash,
--     client_seed, balance, house_edge_bps }
--   { ok: false, error: text }
--
-- `server_seed` is returned so the caller can derive the outcome in the same
-- request. It is a server-side secret: the Worker must never put it in a
-- response body while the seed is active.
--
-- A retry with the same idempotency_key returns the existing round and never
-- debits twice.
CREATE OR REPLACE FUNCTION public.place_bet(
    p_site_id uuid,
    p_site_viewer_id uuid,
    p_game text,
    p_bet integer,
    p_params jsonb,
    p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_existing public.game_rounds%ROWTYPE;
    v_settings public.site_game_settings%ROWTYPE;
    v_seed public.game_seeds%ROWTYPE;
    v_games_enabled boolean;
    v_site_published boolean;
    v_blocked boolean;
    v_balance integer;
    v_net_loss_today integer;
    v_round_id uuid;
    v_nonce bigint;
BEGIN
    IF p_idempotency_key IS NULL OR length(p_idempotency_key) = 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'idempotency_key required');
    END IF;

    -- Idempotent replay: return the round created by the first attempt.
    SELECT * INTO v_existing FROM game_rounds WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
        IF v_existing.site_viewer_id <> p_site_viewer_id THEN
            RETURN jsonb_build_object('ok', false, 'error', 'idempotency key conflict');
        END IF;
        SELECT balance INTO v_balance FROM site_viewers WHERE id = p_site_viewer_id;
        SELECT * INTO v_seed FROM game_seeds WHERE site_viewer_id = p_site_viewer_id;
        RETURN jsonb_build_object(
            'ok', true,
            'replayed', true,
            'round_id', v_existing.id,
            'nonce', v_existing.nonce,
            -- Only handed back when the first attempt died before recording the
            -- outcome, so the retry can finish the job. Once an outcome exists
            -- there is no reason to move the secret again.
            'server_seed', CASE WHEN v_existing.outcome IS NULL
                                 AND v_seed.server_seed_hash = v_existing.server_seed_hash
                                THEN v_seed.server_seed ELSE NULL END,
            'server_seed_hash', v_existing.server_seed_hash,
            'client_seed', v_existing.client_seed,
            'state', v_existing.state,
            'outcome_recorded', v_existing.outcome IS NOT NULL,
            'balance', v_balance,
            'house_edge_bps', v_existing.house_edge_bps
        );
    END IF;

    IF p_bet IS NULL OR p_bet <= 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'bet must be positive');
    END IF;

    SELECT games_enabled, published INTO v_games_enabled, v_site_published
      FROM sites WHERE id = p_site_id;
    IF NOT FOUND OR NOT COALESCE(v_site_published, false) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'site unavailable');
    END IF;
    IF NOT COALESCE(v_games_enabled, false) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'games disabled');
    END IF;

    SELECT * INTO v_settings FROM site_game_settings WHERE site_id = p_site_id AND game = p_game;
    IF NOT FOUND OR NOT v_settings.enabled THEN
        RETURN jsonb_build_object('ok', false, 'error', 'game disabled');
    END IF;
    IF p_bet < v_settings.min_bet THEN
        RETURN jsonb_build_object('ok', false, 'error', 'bet below minimum', 'min_bet', v_settings.min_bet);
    END IF;
    IF p_bet > v_settings.max_bet THEN
        RETURN jsonb_build_object('ok', false, 'error', 'bet above maximum', 'max_bet', v_settings.max_bet);
    END IF;

    SELECT blocked INTO v_blocked
      FROM site_viewers WHERE id = p_site_viewer_id AND site_id = p_site_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'viewer not found on this site');
    END IF;
    IF COALESCE(v_blocked, false) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'viewer blocked');
    END IF;

    -- Fast path for the common case; the unique index above is what actually
    -- guarantees it under concurrency (see the unique_violation handler).
    IF EXISTS (
        SELECT 1 FROM game_rounds
         WHERE site_viewer_id = p_site_viewer_id AND state = 'open'
    ) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'finish your open round first');
    END IF;

    -- Daily loss cap: net credits lost today (bets minus payouts), UTC day.
    IF v_settings.daily_loss_cap IS NOT NULL THEN
        SELECT COALESCE(SUM(bet - payout), 0)::int INTO v_net_loss_today
          FROM game_rounds
         WHERE site_viewer_id = p_site_viewer_id
           AND state <> 'cancelled'
           AND created_at >= date_trunc('day', now());
        IF v_net_loss_today + p_bet > v_settings.daily_loss_cap THEN
            RETURN jsonb_build_object('ok', false, 'error', 'daily loss cap reached');
        END IF;
    END IF;

    -- Seed material: create on first play. The server seed never leaves the
    -- server while active; only its hash is published.
    SELECT * INTO v_seed FROM game_seeds WHERE site_viewer_id = p_site_viewer_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'no active seed');
    END IF;

    -- Conditional debit: cannot go negative even with concurrent bets, because
    -- the balance predicate is evaluated by the UPDATE itself.
    UPDATE site_viewers
       SET balance = balance - p_bet,
           total_spent = total_spent + p_bet,
           updated_at = now()
     WHERE id = p_site_viewer_id
       AND balance >= p_bet
    RETURNING balance INTO v_balance;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient balance');
    END IF;

    -- Atomic nonce allocation for this round.
    UPDATE game_seeds
       SET nonce = nonce + 1,
           updated_at = now()
     WHERE site_viewer_id = p_site_viewer_id
    RETURNING nonce INTO v_nonce;

    INSERT INTO game_rounds (
        site_id, site_viewer_id, game, bet, state, house_edge_bps,
        server_seed_hash, client_seed, nonce, params, idempotency_key
    ) VALUES (
        p_site_id, p_site_viewer_id, p_game, p_bet, 'open', v_settings.house_edge_bps,
        v_seed.server_seed_hash, v_seed.client_seed, v_nonce,
        COALESCE(p_params, '{}'::jsonb), p_idempotency_key
    )
    RETURNING id INTO v_round_id;

    INSERT INTO credit_ledger (site_viewer_id, type, amount, description, metadata)
    VALUES (
        p_site_viewer_id, 'spend', p_bet, 'Originals bet: ' || p_game,
        jsonb_build_object('game', p_game, 'game_round_id', v_round_id, 'nonce', v_nonce)
    );

    RETURN jsonb_build_object(
        'ok', true,
        'replayed', false,
        'round_id', v_round_id,
        'nonce', v_nonce,
        'server_seed', v_seed.server_seed,
        'server_seed_hash', v_seed.server_seed_hash,
        'client_seed', v_seed.client_seed,
        'state', 'open',
        'outcome_recorded', false,
        'balance', v_balance,
        'house_edge_bps', v_settings.house_edge_bps
    );
EXCEPTION
    WHEN unique_violation THEN
        -- Concurrent retry with the same idempotency key: the other
        -- transaction won, so report its round rather than charging twice.
        SELECT * INTO v_existing FROM game_rounds WHERE idempotency_key = p_idempotency_key;
        IF NOT FOUND THEN
            -- Otherwise it was the one-open-round index: another bet by this
            -- viewer committed first and this transaction (debit included) is
            -- being rolled back.
            IF EXISTS (
                SELECT 1 FROM game_rounds
                 WHERE site_viewer_id = p_site_viewer_id AND state = 'open'
            ) THEN
                RETURN jsonb_build_object('ok', false, 'error', 'finish your open round first');
            END IF;
            RAISE;
        END IF;
        SELECT balance INTO v_balance FROM site_viewers WHERE id = p_site_viewer_id;
        RETURN jsonb_build_object(
            'ok', true, 'replayed', true,
            'round_id', v_existing.id, 'nonce', v_existing.nonce,
            'server_seed', NULL,
            'server_seed_hash', v_existing.server_seed_hash,
            'client_seed', v_existing.client_seed,
            'state', v_existing.state,
            'outcome_recorded', v_existing.outcome IS NOT NULL,
            'balance', v_balance,
            'house_edge_bps', v_existing.house_edge_bps
        );
END;
$$;

-- ---------------------------------------------------------------------------
-- set_round_outcome: store the server-computed outcome of an open round.
-- ---------------------------------------------------------------------------
--
-- Split out from place_bet only because the outcome is an HMAC the Worker
-- computes from the seed material committed by place_bet. It is write-once:
-- a second call with a different outcome is rejected, so the outcome can never
-- be rewritten after the fact.
CREATE OR REPLACE FUNCTION public.set_round_outcome(
    p_round_id uuid,
    p_outcome jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_round public.game_rounds%ROWTYPE;
BEGIN
    SELECT * INTO v_round FROM game_rounds WHERE id = p_round_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'round not found');
    END IF;
    IF v_round.outcome IS NOT NULL THEN
        RETURN jsonb_build_object('ok', true, 'replayed', true);
    END IF;
    UPDATE game_rounds SET outcome = p_outcome WHERE id = p_round_id;
    RETURN jsonb_build_object('ok', true, 'replayed', false);
END;
$$;

-- ---------------------------------------------------------------------------
-- settle_round: pay out (if any) and close the round. Idempotent.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.settle_round(
    p_round_id uuid,
    p_multiplier numeric,
    p_payout integer,
    p_outcome jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_round public.game_rounds%ROWTYPE;
    v_balance integer;
BEGIN
    SELECT * INTO v_round FROM game_rounds WHERE id = p_round_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'round not found');
    END IF;

    IF v_round.state = 'settled' THEN
        SELECT balance INTO v_balance FROM site_viewers WHERE id = v_round.site_viewer_id;
        RETURN jsonb_build_object(
            'ok', true, 'replayed', true, 'round_id', v_round.id,
            'payout', v_round.payout, 'multiplier', v_round.multiplier, 'balance', v_balance
        );
    END IF;
    IF v_round.state <> 'open' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'round is not open');
    END IF;
    IF p_payout IS NULL OR p_payout < 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'invalid payout');
    END IF;

    UPDATE game_rounds
       SET state = 'settled',
           payout = p_payout,
           multiplier = COALESCE(p_multiplier, 0),
           outcome = COALESCE(outcome, p_outcome),
           settled_at = now()
     WHERE id = p_round_id;

    IF p_payout > 0 THEN
        UPDATE site_viewers
           SET balance = balance + p_payout,
               total_earned = total_earned + p_payout,
               updated_at = now()
         WHERE id = v_round.site_viewer_id
        RETURNING balance INTO v_balance;

        INSERT INTO credit_ledger (site_viewer_id, type, amount, description, metadata)
        VALUES (
            v_round.site_viewer_id, 'earn', p_payout, 'Originals payout: ' || v_round.game,
            jsonb_build_object('game', v_round.game, 'game_round_id', v_round.id,
                               'multiplier', COALESCE(p_multiplier, 0))
        );
    ELSE
        SELECT balance INTO v_balance FROM site_viewers WHERE id = v_round.site_viewer_id;
    END IF;

    RETURN jsonb_build_object(
        'ok', true, 'replayed', false, 'round_id', v_round.id,
        'payout', p_payout, 'multiplier', COALESCE(p_multiplier, 0), 'balance', v_balance
    );
END;
$$;

-- ---------------------------------------------------------------------------
-- RLS — same shape as 20260808000012_credits_rls.sql: only service_role.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'site_game_settings',
        'game_seeds',
        'game_seed_reveals',
        'game_rounds'
    ]
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl);

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = tbl
              AND policyname = 'service_role_all_' || tbl
        ) THEN
            EXECUTE format(
                'CREATE POLICY "service_role_all_%I" ON public.%I
                 FOR ALL
                 TO service_role
                 USING (true)
                 WITH CHECK (true)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Least-privilege grants for the application role (20260809000000_db_app_role).
-- The app never deletes a round, a ledger row, or a revealed seed.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'yourrank_app') THEN
        GRANT SELECT, INSERT, UPDATE ON public.site_game_settings TO yourrank_app;
        GRANT SELECT, INSERT, UPDATE ON public.game_seeds TO yourrank_app;
        GRANT SELECT, INSERT ON public.game_seed_reveals TO yourrank_app;
        GRANT SELECT, INSERT, UPDATE ON public.game_rounds TO yourrank_app;
        REVOKE DELETE ON public.game_rounds FROM yourrank_app;
        REVOKE DELETE ON public.game_seed_reveals FROM yourrank_app;
        GRANT EXECUTE ON FUNCTION public.place_bet(uuid, uuid, text, integer, jsonb, text) TO yourrank_app;
        GRANT EXECUTE ON FUNCTION public.set_round_outcome(uuid, jsonb) TO yourrank_app;
        GRANT EXECUTE ON FUNCTION public.settle_round(uuid, numeric, integer, jsonb) TO yourrank_app;
    END IF;
END $$;

COMMENT ON TABLE public.game_rounds IS
  'Immutable audit row per Originals round. Outcome is derived from (server_seed, client_seed, nonce) committed at bet time.';
COMMENT ON TABLE public.game_seeds IS
  'Active commit/reveal seed pair per site_viewer. server_seed is secret until rotation.';
COMMENT ON TABLE public.game_seed_reveals IS
  'Retired server seeds, published so past rounds can be verified.';
