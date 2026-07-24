-- Add conversions and revenue to site_stats and backfill historical data.

ALTER TABLE public.site_stats
ADD COLUMN IF NOT EXISTS conversions integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS revenue numeric DEFAULT 0 NOT NULL;

-- Backfill existing conversions into site_stats
WITH daily_convs AS (
    SELECT
        COALESCE(site_id, (SELECT id FROM sites WHERE user_id = owner_id LIMIT 1)) AS resolved_site_id,
        (ts AT TIME ZONE 'UTC')::date AS day,
        COUNT(*)::integer AS conversions,
        COALESCE(SUM(amount), 0) AS revenue
    FROM conversions
    WHERE ts IS NOT NULL
    GROUP BY resolved_site_id, (ts AT TIME ZONE 'UTC')::date
)
INSERT INTO site_stats (site_id, day, conversions, revenue)
SELECT resolved_site_id, day, conversions, revenue
FROM daily_convs
WHERE resolved_site_id IS NOT NULL
ON CONFLICT (site_id, day) DO UPDATE SET
    conversions = site_stats.conversions + EXCLUDED.conversions,
    revenue = site_stats.revenue + EXCLUDED.revenue;
