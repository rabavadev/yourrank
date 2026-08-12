-- Viewer-owned data export jobs are deliberately separate from account exports.
CREATE TABLE IF NOT EXISTS public.viewer_export_jobs (
  id UUID PRIMARY KEY,
  viewer_id UUID NOT NULL REFERENCES public.viewers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  artifact_key TEXT,
  export_version TEXT NOT NULL DEFAULT 'viewer-export-v1',
  manifest JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_viewer_export_jobs_viewer_created
  ON public.viewer_export_jobs(viewer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_viewer_export_jobs_expiry
  ON public.viewer_export_jobs(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_viewer_export_jobs_pending_viewer
  ON public.viewer_export_jobs(viewer_id)
  WHERE status IN ('pending', 'processing');

-- The viewer export starts from viewer_id rather than site_id.
CREATE INDEX IF NOT EXISTS idx_site_viewers_viewer_id
  ON public.site_viewers(viewer_id);
