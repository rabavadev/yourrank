-- Link support messages to users and track ticket status for the support UI.
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'open' NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);

-- Backfill existing rows: when we can match by email, attach to the user.
UPDATE public.support_messages sm
   SET user_id = u.id
  FROM public.users u
 WHERE sm.user_id IS NULL
   AND lower(sm.email) = lower(u.email);
