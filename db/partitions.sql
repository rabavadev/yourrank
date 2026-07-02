-- Run once to create the current + next 2 monthly click partitions.
-- The bot Worker's nightly cron (rollup.ts -> ensureNextMonthPartition)
-- keeps creating future ones, but seed a few so inserts never hit only
-- the DEFAULT partition on day one.
DO $$
DECLARE
  m date := date_trunc('month', now())::date;
  i int;
  nm date;
  pname text;
BEGIN
  FOR i IN 0..2 LOOP
    nm := (m + (i || ' month')::interval)::date;
    pname := format('clicks_%s', to_char(nm, 'YYYY_MM'));
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = pname) THEN
      EXECUTE format(
        'CREATE TABLE %I PARTITION OF clicks FOR VALUES FROM (%L) TO (%L)',
        pname, nm, (nm + interval '1 month')::date
      );
    END IF;
  END LOOP;
END $$;
