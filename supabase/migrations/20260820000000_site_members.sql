-- Migration: Add site_members and site_invites for team and moderator access
-- Enables streamers to delegate leaderboard and credit management to mods and managers

CREATE TABLE IF NOT EXISTS public.site_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'manager')),
    invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(site_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.site_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('moderator', 'manager')),
    token_hash TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_members_user_id ON public.site_members(user_id);
CREATE INDEX IF NOT EXISTS idx_site_members_site_id ON public.site_members(site_id);
CREATE INDEX IF NOT EXISTS idx_site_invites_token_hash ON public.site_invites(token_hash);
CREATE INDEX IF NOT EXISTS idx_site_invites_site_status ON public.site_invites(site_id, status);

-- Enable RLS
ALTER TABLE public.site_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_invites ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_members' AND policyname = 'service_role_all_site_members'
    ) THEN
        CREATE POLICY "service_role_all_site_members" ON public.site_members
        FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'site_invites' AND policyname = 'service_role_all_site_invites'
    ) THEN
        CREATE POLICY "service_role_all_site_invites" ON public.site_invites
        FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

GRANT ALL ON TABLE public.site_members TO service_role;
GRANT ALL ON TABLE public.site_invites TO service_role;
