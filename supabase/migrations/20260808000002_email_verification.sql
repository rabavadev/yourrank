-- Add email verification columns and mark existing users as verified.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS email_verification_token_hash text,
  ADD COLUMN IF NOT EXISTS email_verification_sent_at timestamptz;

-- Backfill: existing active accounts before this migration are considered verified.
UPDATE public.users SET email_verified = true WHERE email_verified = false;

-- Index for token lookup.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_verification_token_hash
  ON public.users(email_verification_token_hash)
  WHERE email_verification_token_hash IS NOT NULL;
