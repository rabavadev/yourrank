-- Support/contact form storage
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT 'Contact form',
  message text NOT NULL,
  ip_hash text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.support_messages;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
