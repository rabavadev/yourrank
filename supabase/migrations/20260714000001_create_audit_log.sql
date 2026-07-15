CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only the service role can read/write audit records directly; anon/authenticated
-- cannot access the audit table through PostgREST.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'audit_log'
      AND policyname = 'service_role_all_audit_log'
  ) THEN
    CREATE POLICY service_role_all_audit_log
      ON audit_log
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMENT ON TABLE audit_log IS 'Immutable append-only audit trail for board changes, admin actions, and payouts.';
COMMENT ON COLUMN audit_log.actor_id IS 'User who performed the action; nullable for anonymous/system-initiated events.';
COMMENT ON COLUMN audit_log.entity_type IS 'Type of object acted upon, e.g. board, site, payout, admin.';
COMMENT ON COLUMN audit_log.entity_id IS 'Identifier of the object acted upon, e.g. board UUID/slug or payout ID.';
COMMENT ON COLUMN audit_log.details IS 'Structured free-form metadata; sanitized to avoid storing secrets.';
