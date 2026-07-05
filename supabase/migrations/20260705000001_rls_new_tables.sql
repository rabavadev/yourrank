-- RLS for tables created after the initial RLS migration (20260625000002/005).
-- These tables were added by later migrations but never had RLS enabled,
-- leaving them accessible to the Supabase anon role via PostgREST.

-- Enable RLS
ALTER TABLE player_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats_hourly   ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_referrers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit         ENABLE ROW LEVEL SECURITY;

-- service_role-only policies (matches the pattern from 20260625000005)
CREATE POLICY service_role_all_player_subscriptions ON player_subscriptions
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_site_stats_hourly ON site_stats_hourly
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_site_referrers ON site_referrers
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_admin_audit ON admin_audit
  TO service_role USING (true) WITH CHECK (true);
