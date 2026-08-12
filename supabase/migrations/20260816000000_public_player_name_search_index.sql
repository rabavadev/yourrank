-- Public leaderboard search uses substring matching across a site's players.
-- Keep that lookup bounded by the tenant and backed by PostgreSQL trigram search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_players_normalized_name_trgm
    ON public.players USING gin (normalized_name gin_trgm_ops);
