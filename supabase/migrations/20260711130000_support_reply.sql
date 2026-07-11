-- Add support message reply columns for the admin inbox.
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_support_messages_replied_at ON public.support_messages(replied_at);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_messages(created_at);
