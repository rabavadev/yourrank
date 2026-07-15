-- C-07: Stable player identity and optimistic concurrency.
-- C-02: Conversion-to-player projection.
--
-- Adds normalized_name + updated_at + version to players, deduplicates legacy
-- rows, and enforces a per-site unique identity. Also adds player_name /
-- player_normalized to conversions so postbacks can be projected onto the
-- matching player row(s).

-- 1. Add player identity columns.
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS normalized_name text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL,
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1 NOT NULL;

-- 2. Normalization helper (immutable, null-safe).
CREATE OR REPLACE FUNCTION normalize_player_name(input text)
RETURNS text AS $$
  SELECT lower(regexp_replace(regexp_replace(coalesce(input, ''), '\s+', ' ', 'g'), '^\s+|\s+$', '', 'g'));
$$ LANGUAGE SQL IMMUTABLE STRICT;

-- 3. Backfill normalized_name for existing rows.
UPDATE players SET normalized_name = normalize_player_name(name) WHERE normalized_name IS NULL;

-- 4. Drop rows with no usable normalized identity (empty/whitespace-only names).
--    saveSite and handleScores already filter these out, so they are invalid.
DELETE FROM players WHERE normalized_name = '';

-- 5. Deduplicate legacy players that share a site + normalized name.
--    The earliest row (by id) survives; wagered/prize are summed, sort keeps min.
WITH keepers AS (
  SELECT (array_agg(id ORDER BY id))[1] AS keep_id,
         site_id,
         normalized_name,
         sum(wagered) AS sum_wagered,
         sum(prize) AS sum_prize,
         min(sort) AS min_sort
    FROM players
   GROUP BY site_id, normalized_name
  HAVING count(*) > 1
)
UPDATE players p
   SET wagered = k.sum_wagered,
       prize = k.sum_prize,
       sort = k.min_sort,
       updated_at = now()
  FROM keepers k
 WHERE p.id = k.keep_id;

DELETE FROM players
 WHERE id IN (
   SELECT p.id
     FROM players p
     JOIN keepers k ON p.site_id = k.site_id AND p.normalized_name = k.normalized_name
    WHERE p.id <> k.keep_id
 );

-- 6. Enforce unique, stable identity per site and index it.
ALTER TABLE players ALTER COLUMN normalized_name SET NOT NULL;
ALTER TABLE players ADD CONSTRAINT players_site_id_normalized_name_key UNIQUE (site_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_players_site_normalized ON players (site_id, normalized_name);

-- 7. Add player mapping columns to conversions and backfill from raw JSONB.
ALTER TABLE conversions
  ADD COLUMN IF NOT EXISTS player_name text,
  ADD COLUMN IF NOT EXISTS player_normalized text;

UPDATE conversions
   SET player_name = COALESCE(raw->>'username', raw->>'user', raw->>'player', raw->>'player_name')
 WHERE player_name IS NULL;

UPDATE conversions
   SET player_normalized = normalize_player_name(player_name)
 WHERE player_normalized IS NULL AND player_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversions_player_normalized ON conversions (owner_id, player_normalized) WHERE player_normalized IS NOT NULL;

-- 8. Add an explicit comment documenting the stable identity contract.
COMMENT ON COLUMN public.players.normalized_name IS 'Lowercased, whitespace-collapsed name used as the stable per-site identity for upserts and conversion projection.';
COMMENT ON COLUMN public.conversions.player_normalized IS 'Normalized player name used to project this conversion onto players by the same owner.';
