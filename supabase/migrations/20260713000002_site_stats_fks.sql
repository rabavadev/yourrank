-- Add missing FKs to site_stats_hourly and site_referrers so they cascade on board deletion.
-- Clean up any orphaned rows first so the ALTER TABLE commands can validate.
DELETE FROM public.site_stats_hourly h WHERE NOT EXISTS (SELECT 1 FROM public.sites s WHERE s.id = h.site_id);
DELETE FROM public.site_referrers r WHERE NOT EXISTS (SELECT 1 FROM public.sites s WHERE s.id = r.site_id);

ALTER TABLE public.site_stats_hourly
  ADD CONSTRAINT site_stats_hourly_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;

ALTER TABLE public.site_referrers
  ADD CONSTRAINT site_referrers_site_id_fkey
  FOREIGN KEY (site_id) REFERENCES public.sites(id) ON DELETE CASCADE;
