-- Per-site visibility toggles for the new public viewer site sections.
-- Home and Leaderboard are always visible; Shop, Games and My Credits are
-- optional and enforced server-side. games_enabled already exists from the
-- Originals migration; shop_enabled and credits_enabled are added here.
--
-- Viewer-side contract (used by the site shell):
--   siteSections.home        = true
--   siteSections.leaderboard   = true
--   siteSections.shop          = !!site.shop_enabled
--   siteSections.games         = !!site.games_enabled
--   siteSections.me            = !!site.credits_enabled
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS shop_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS credits_enabled boolean NOT NULL DEFAULT true;

-- Existing sites should keep their credits/shop page live; games stays off
-- until explicitly enabled.
UPDATE public.sites
   SET shop_enabled = COALESCE(shop_enabled, true),
       credits_enabled = COALESCE(credits_enabled, true);
