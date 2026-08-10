-- Store the admin-provided reason when an account is suspended.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

COMMENT ON COLUMN public.users.suspension_reason IS 'Reason entered by an admin when suspending the account.';
