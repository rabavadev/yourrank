-- Backup verification ledger.
-- Each row records the result of a practice restore or backup validation.
-- The monitor checks the most recent successful row to alert if backups go
-- unverified for too long.
CREATE TABLE IF NOT EXISTS public.backup_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,           -- e.g. "Supabase PITR", "AWS S3"
  target TEXT NOT NULL,             -- restore target identifier / temporary DB name
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL,
  rto_seconds INT,                -- Recovery Time Objective achieved (seconds)
  rpo_seconds INT,                  -- Recovery Point Objective achieved (seconds)
  success BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_verifications_success_completed
  ON public.backup_verifications(success, completed_at DESC);

-- Row Level Security: only service_role can write; readable by authenticated
-- (the /api/health/backup endpoint uses service_role anyway).
ALTER TABLE public.backup_verifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'backup_verifications'
      AND policyname = 'service_role_all_backup_verifications'
  ) THEN
    CREATE POLICY service_role_all_backup_verifications
      ON public.backup_verifications
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
