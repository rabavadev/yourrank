-- Indexes required for bounded ownership predicates in the widened account
-- export. Both predicates are otherwise shared-table scans.
CREATE INDEX IF NOT EXISTS idx_viewer_username_history_viewer_id
  ON public.viewer_username_history(viewer_id);

CREATE INDEX IF NOT EXISTS idx_stream_channels_owner_id
  ON public.stream_channels(owner_id);

ALTER TABLE public.account_export_jobs
  ALTER COLUMN export_version SET DEFAULT 'account-export-v2';
