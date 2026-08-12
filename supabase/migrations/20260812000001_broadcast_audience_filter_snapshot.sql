-- Preserve the audience filters used when a broadcast was created.
ALTER TABLE public.broadcasts
  ADD COLUMN IF NOT EXISTS audience_filter_snapshot jsonb;

COMMENT ON COLUMN public.broadcasts.audience_filter_snapshot IS
  'Audience filter definition captured when the broadcast was created; NULL for legacy rows.';
