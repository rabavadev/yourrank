-- ============================================================
-- Migration: Row-level security sweep for tables missing RLS
-- ============================================================
--
-- Earlier migrations enabled RLS on the core tables, but several later
-- tables were created without policies. Because YourRank Workers connect with
-- the Supabase service role and application users never access Postgres via
-- PostgREST, the safe default is: enable RLS, then grant the service role
-- full access through a per-table policy.
--
-- This migration is idempotent: it skips tables that do not exist (some may
-- have been dropped by later migrations or may not be present in all
-- environments) and only creates policies that are not already present.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'sessions',
    'password_resets',
    'support_messages',
    'referral_rewards'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    -- Skip tables that do not exist in this environment.
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE IF EXISTS %I ENABLE ROW LEVEL SECURITY', t);

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = t
        AND policyname = 'service_role_all_' || t
    ) THEN
      EXECUTE format(
        'CREATE POLICY service_role_all_%I ON %I TO service_role USING (true) WITH CHECK (true)',
        t, t
      );
    END IF;
  END LOOP;
END $$;
