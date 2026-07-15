-- ============================================================
-- Migration: Row-level security sweep for tables missing RLS
-- ============================================================
--
-- Earlier migrations enabled RLS on the core tables, but several later
-- tables were created without policies. Because YourRank Workers connect with
-- the Supabase service role and application users never access Postgres via
-- PostgREST, the safe default is: enable RLS, then grant the service role
-- full access through a per-table policy.

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
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

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

COMMENT ON TABLE sessions IS 'Authenticated sessions; RLS enabled with service-role-only access.';
COMMENT ON TABLE password_resets IS 'Password reset tokens; RLS enabled with service-role-only access.';
COMMENT ON TABLE support_messages IS 'User support tickets; RLS enabled with service-role-only access.';
COMMENT ON TABLE referral_rewards IS 'Referral reward metadata; RLS enabled with service-role-only access.';
