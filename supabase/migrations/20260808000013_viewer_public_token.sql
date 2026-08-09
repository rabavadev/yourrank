-- Per-viewer public token for signing public credits/shop requests.
-- Prevents someone from redeeming a viewer's credits just by guessing their Kick username.
ALTER TABLE public.site_viewers
  ADD COLUMN IF NOT EXISTS public_token uuid DEFAULT gen_random_uuid() UNIQUE;
