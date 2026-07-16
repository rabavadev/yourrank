-- Normalize free-text period values to the supported enum and enforce it.
-- The dashboard now uses a <select> with Weekly/Monthly/Season, but older rows
-- may contain lower-case or variant strings.

UPDATE public.sites
   SET period = CASE
     WHEN lower(trim(period)) IN ('weekly', 'week', '7d', '7 days', '1w') THEN 'Weekly'
     WHEN lower(trim(period)) IN ('monthly', 'month', '30d', '30 days', '1m') THEN 'Monthly'
     WHEN lower(trim(period)) IN ('season', 'seasonal') THEN 'Season'
     ELSE 'Monthly'
   END
 WHERE period IS NULL
    OR lower(trim(period)) NOT IN ('weekly', 'monthly', 'season');

-- Existing default already is 'Monthly'; make the allowed values explicit for
-- downstream query planning and dashboard filters.
ALTER TABLE public.sites ADD CONSTRAINT sites_period_check CHECK (period IN ('Weekly', 'Monthly', 'Season'));
