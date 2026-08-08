-- Remove the legacy plaintext postback_key column from users.
-- Postback keys now live in the postback_keys table, where active keys are
-- encrypted at rest (key_enc) and legacy rows are tracked and revocable.
ALTER TABLE public.users DROP COLUMN IF EXISTS postback_key;
DROP INDEX IF EXISTS public.idx_users_postback_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_postback_key_key;
