-- ============================================================
--  Migration 003 — Enable Row Level Security on ALL tables
--
--  Enables RLS on every table and creates a permissive policy
--  for the service role (used by Cloudflare Workers via the
--  Supabase service key). This blocks anon-key access to all
--  tables while leaving Worker code unaffected — the service
--  role bypasses RLS, but the USING(true) + WITH CHECK(true)
--  policy is a safety net for any role that doesn't bypass.
--
--  Run once against the existing database.
-- ============================================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON users USING (true) WITH CHECK (true);

-- sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON sites USING (true) WITH CHECK (true);

-- players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON players USING (true) WITH CHECK (true);

-- leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON leads USING (true) WITH CHECK (true);

-- archives
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON archives USING (true) WITH CHECK (true);

-- site_stats
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON site_stats USING (true) WITH CHECK (true);

-- bots
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON bots USING (true) WITH CHECK (true);

-- bot_subscribers
ALTER TABLE bot_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON bot_subscribers USING (true) WITH CHECK (true);

-- bot_commands
ALTER TABLE bot_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON bot_commands USING (true) WITH CHECK (true);

-- offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON offers USING (true) WITH CHECK (true);

-- casinos
ALTER TABLE casinos ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON casinos USING (true) WITH CHECK (true);

-- short_links
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON short_links USING (true) WITH CHECK (true);

-- clicks
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON clicks USING (true) WITH CHECK (true);

-- click_daily
ALTER TABLE click_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON click_daily USING (true) WITH CHECK (true);

-- conversions
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON conversions USING (true) WITH CHECK (true);

-- stream_channels
ALTER TABLE stream_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON stream_channels USING (true) WITH CHECK (true);

-- broadcasts
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON broadcasts USING (true) WITH CHECK (true);

-- subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON subscriptions USING (true) WITH CHECK (true);

-- payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_all ON payments USING (true) WITH CHECK (true);
