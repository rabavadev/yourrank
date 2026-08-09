-- SEC-AUDIT-02: Enable RLS and lock down credits tables to the service role.
-- Anon/authenticated Supabase keys cannot read or mutate viewer credit data.

DO $$
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'viewers',
        'site_viewers',
        'credit_reward_mappings',
        'kick_reward_events',
        'credit_ledger',
        'shop_items',
        'redemptions',
        'viewer_username_history'
    ]
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl);

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = tbl
              AND policyname = 'service_role_all_' || tbl
        ) THEN
            EXECUTE format(
                'CREATE POLICY "service_role_all_%I" ON public.%I
                 FOR ALL
                 TO service_role
                 USING (true)
                 WITH CHECK (true)',
                tbl, tbl
            );
        END IF;
    END LOOP;
END $$;
