-- 010_custom_domain.sql
-- Add custom_domain column to sites table for Pro users who want to serve
-- their leaderboard on their own domain (e.g., board.mystream.com).
-- CNAME target: yourrank.site
ALTER TABLE sites ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;
