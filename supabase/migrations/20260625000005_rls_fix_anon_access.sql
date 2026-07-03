-- ============================================================
--  Migration 006 — Fix RLS anon access (DB-001)
--
--  Migration 003 created policies with USING(true) WITH CHECK(true)
--  but WITHOUT restricting to a specific role. This meant the
--  Supabase anon role had FULL read/write access to every table.
--
--  This migration drops the overly-permissive policies and
--  recreates them with TO service_role so only the service role
--  (used by Workers via the Supabase service key) can access
--  the tables. Anon role is now blocked.
-- ============================================================

-- users
DROP POLICY IF EXISTS service_all ON public.users;
CREATE POLICY service_role_all_users ON public.users
  TO service_role
  USING (true)
  WITH CHECK (true);

-- sites
DROP POLICY IF EXISTS service_all ON public.sites;
CREATE POLICY service_role_all_sites ON public.sites
  TO service_role
  USING (true)
  WITH CHECK (true);

-- players
DROP POLICY IF EXISTS service_all ON public.players;
CREATE POLICY service_role_all_players ON public.players
  TO service_role
  USING (true)
  WITH CHECK (true);

-- leads
DROP POLICY IF EXISTS service_all ON public.leads;
CREATE POLICY service_role_all_leads ON public.leads
  TO service_role
  USING (true)
  WITH CHECK (true);

-- archives
DROP POLICY IF EXISTS service_all ON public.archives;
CREATE POLICY service_role_all_archives ON public.archives
  TO service_role
  USING (true)
  WITH CHECK (true);

-- site_stats
DROP POLICY IF EXISTS service_all ON public.site_stats;
CREATE POLICY service_role_all_site_stats ON public.site_stats
  TO service_role
  USING (true)
  WITH CHECK (true);

-- bots
DROP POLICY IF EXISTS service_all ON public.bots;
CREATE POLICY service_role_all_bots ON public.bots
  TO service_role
  USING (true)
  WITH CHECK (true);

-- bot_subscribers
DROP POLICY IF EXISTS service_all ON public.bot_subscribers;
CREATE POLICY service_role_all_bot_subscribers ON public.bot_subscribers
  TO service_role
  USING (true)
  WITH CHECK (true);

-- bot_commands
DROP POLICY IF EXISTS service_all ON public.bot_commands;
CREATE POLICY service_role_all_bot_commands ON public.bot_commands
  TO service_role
  USING (true)
  WITH CHECK (true);

-- offers
DROP POLICY IF EXISTS service_all ON public.offers;
CREATE POLICY service_role_all_offers ON public.offers
  TO service_role
  USING (true)
  WITH CHECK (true);

-- casinos
DROP POLICY IF EXISTS service_all ON public.casinos;
CREATE POLICY service_role_all_casinos ON public.casinos
  TO service_role
  USING (true)
  WITH CHECK (true);

-- short_links
DROP POLICY IF EXISTS service_all ON public.short_links;
CREATE POLICY service_role_all_short_links ON public.short_links
  TO service_role
  USING (true)
  WITH CHECK (true);

-- clicks
DROP POLICY IF EXISTS service_all ON public.clicks;
CREATE POLICY service_role_all_clicks ON public.clicks
  TO service_role
  USING (true)
  WITH CHECK (true);

-- click_daily
DROP POLICY IF EXISTS service_all ON public.click_daily;
CREATE POLICY service_role_all_click_daily ON public.click_daily
  TO service_role
  USING (true)
  WITH CHECK (true);

-- conversions
DROP POLICY IF EXISTS service_all ON public.conversions;
CREATE POLICY service_role_all_conversions ON public.conversions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- stream_channels
DROP POLICY IF EXISTS service_all ON public.stream_channels;
CREATE POLICY service_role_all_stream_channels ON public.stream_channels
  TO service_role
  USING (true)
  WITH CHECK (true);

-- broadcasts
DROP POLICY IF EXISTS service_all ON public.broadcasts;
CREATE POLICY service_role_all_broadcasts ON public.broadcasts
  TO service_role
  USING (true)
  WITH CHECK (true);

-- subscriptions
DROP POLICY IF EXISTS service_all ON public.subscriptions;
CREATE POLICY service_role_all_subscriptions ON public.subscriptions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- payments
DROP POLICY IF EXISTS service_all ON public.payments;
CREATE POLICY service_role_all_payments ON public.payments
  TO service_role
  USING (true)
  WITH CHECK (true);
