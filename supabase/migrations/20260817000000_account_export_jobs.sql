CREATE TABLE IF NOT EXISTS account_export_jobs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  artifact_key TEXT,
  export_version TEXT NOT NULL DEFAULT 'account-export-v1',
  manifest JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_account_export_jobs_user_created
  ON account_export_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_export_jobs_expiry
  ON account_export_jobs(expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_account_export_jobs_pending_user
  ON account_export_jobs(user_id)
  WHERE status IN ('pending', 'processing');
