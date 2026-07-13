-- Add active_site_id to users so the dashboard can remember which board a user is editing.
-- On board deletion the FK is set to NULL so the user doesn't get stuck with a ghost active board.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS active_site_id uuid REFERENCES public.sites(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_active_site_id ON public.users(active_site_id);
