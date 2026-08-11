-- Keep the public archive read path on compact, write-time derived values.
ALTER TABLE public.archives
  ADD COLUMN IF NOT EXISTS top3_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS winner_name text;

CREATE OR REPLACE FUNCTION public.derive_archive_values()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  source jsonb;
  elem jsonb;
  parsed jsonb := '[]'::jsonb;
  ranked jsonb;
  wagered numeric;
  prize numeric;
  ordinal integer := 0;
BEGIN
  source := CASE
    WHEN jsonb_typeof(NEW.snapshot_json) = 'array' THEN NEW.snapshot_json
    ELSE '[]'::jsonb
  END;

  FOR elem IN SELECT value FROM jsonb_array_elements(source) LOOP
    IF jsonb_typeof(elem) <> 'object' THEN
      CONTINUE;
    END IF;

    BEGIN
      IF COALESCE(elem->>'wagered', '') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN
        wagered := COALESCE(NULLIF(elem->>'wagered', '')::numeric, 0);
      ELSE
        wagered := 0;
      END IF;
    EXCEPTION WHEN others THEN
      wagered := 0;
    END;

    BEGIN
      IF COALESCE(elem->>'prize', '') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$' THEN
        prize := COALESCE(NULLIF(elem->>'prize', '')::numeric, 0);
      ELSE
        prize := 0;
      END IF;
    EXCEPTION WHEN others THEN
      prize := 0;
    END;

    ordinal := ordinal + 1;
    parsed := parsed || jsonb_build_array(jsonb_build_object(
      'name', COALESCE(elem->>'name', ''),
      'wagered', wagered,
      'prize', prize,
      '_ordinal', ordinal
    ));
  END LOOP;

  SELECT COALESCE(
    jsonb_agg(top_items.elem - '_ordinal' ORDER BY (top_items.elem->>'wagered')::numeric DESC, (top_items.elem->>'_ordinal')::integer),
    '[]'::jsonb
  )
  INTO ranked
  FROM (
    SELECT elements.elem AS elem_value
    FROM jsonb_array_elements(parsed) AS elements(elem)
    ORDER BY (elements.elem->>'wagered')::numeric DESC, (elements.elem->>'_ordinal')::integer
    LIMIT 3
  ) AS top_items(elem);

  NEW.top3_json := ranked;
  NEW.winner_name := ranked->0->>'name';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS derive_archive_values ON public.archives;
CREATE TRIGGER derive_archive_values
BEFORE INSERT OR UPDATE OF snapshot_json ON public.archives
FOR EACH ROW
EXECUTE FUNCTION public.derive_archive_values();

-- Re-run the same trigger logic for existing rows, including legacy malformed
-- or empty snapshots.
UPDATE public.archives
SET snapshot_json = snapshot_json;
