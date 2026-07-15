-- Feature flags for gating UI experiments and rollout toggles.
-- Supports a global default plus per-user overrides.

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_value BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

CREATE TABLE IF NOT EXISTS user_feature_overrides (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES public.feature_flags(key) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, feature_key)
);

ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Service role can manage all feature flags and user overrides.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flags'
      AND policyname = 'service_role_all_feature_flags'
  ) THEN
    CREATE POLICY service_role_all_feature_flags
      ON feature_flags
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_feature_overrides'
      AND policyname = 'service_role_all_user_feature_overrides'
  ) THEN
    CREATE POLICY service_role_all_user_feature_overrides
      ON user_feature_overrides
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMENT ON TABLE feature_flags IS 'Global feature flags used to gate UI experiments and staged rollouts.';
COMMENT ON TABLE user_feature_overrides IS 'Per-user overrides for feature flags (enabled=true forces on, enabled=false forces off regardless of default).';
