-- H-05 — Database Security Hardening
-- Revoke unsafe default privileges on public schema from anon and authenticated.
-- Explicitly enable RLS and add service_role-only policies for recently created tables.
-- Remove the orphaned rls_auto_enable helper function.

-- 1. Revoke unsafe default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- 2. Drop the orphaned auto-RLS trigger function
DROP FUNCTION IF EXISTS public.rls_auto_enable() CASCADE;

-- 3. Explicitly enable RLS on exposed tables
ALTER TABLE IF EXISTS public.admin_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.postback_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.postback_replay_guard ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_onboarding_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_scroll_depth ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_clicks ENABLE ROW LEVEL SECURITY;

-- 4. Create service_role-only policies for these tables
-- So they are accessible to the Workers/backend but fully locked down from anon/authenticated clients

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'admin_recovery_codes',
            'postback_keys',
            'postback_replay_guard',
            'user_onboarding_emails',
            'referral_rewards',
            'site_visitors',
            'site_scroll_depth',
            'site_clicks'
        ])
    LOOP
        EXECUTE format('
            CREATE POLICY "service_role_all_%I" ON public.%I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        ', tbl, tbl);
    END LOOP;
END $$;
