-- ============================================================
-- Create analytics tables for hourly stats and referrer tracking
-- 
-- These tables were previously created lazily at runtime in stats.js,
-- which caused DDL on the hot path and lock contention under cold starts.
-- Moving to migrations to ensure tables exist before request handling.
-- ============================================================

-- Hourly heatmap table for view counts by day/hour/day_of_week
CREATE TABLE IF NOT EXISTS site_stats_hourly (
  site_id UUID NOT NULL, 
  day DATE NOT NULL, 
  hour SMALLINT NOT NULL,
  day_of_week SMALLINT NOT NULL, 
  views INT NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, day, hour)
);

-- Referrer tracking table for top referring domains
CREATE TABLE IF NOT EXISTS site_referrers (
  site_id UUID NOT NULL, 
  day DATE NOT NULL, 
  domain TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (site_id, day, domain)
);
