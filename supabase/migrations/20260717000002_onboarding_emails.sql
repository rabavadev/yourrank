-- Ledger for onboarding email sequence (Day 0, 3, 7)
CREATE TABLE IF NOT EXISTS public.user_onboarding_emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day integer NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user_id, day)
);

ALTER TABLE public.user_onboarding_emails OWNER TO postgres;
