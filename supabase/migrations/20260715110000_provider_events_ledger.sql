-- Immutable append-only ledger for provider callbacks (NOWPayments IPNs,
-- Telegram Stars successful_payment, etc.). Each callback is recorded once;
-- the unique key prevents duplicate/reordered events from being reprocessed.
CREATE TABLE IF NOT EXISTS provider_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_reference TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  status TEXT,
  tx_ref TEXT,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_provider_events_reference
  ON provider_events (provider, provider_reference, event_kind, status);

CREATE INDEX IF NOT EXISTS idx_provider_events_tx_ref
  ON provider_events (tx_ref);

CREATE INDEX IF NOT EXISTS idx_provider_events_received_at
  ON provider_events (received_at DESC);

ALTER TABLE provider_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'provider_events'
      AND policyname = 'service_role_all_provider_events'
  ) THEN
    CREATE POLICY service_role_all_provider_events
      ON provider_events
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMENT ON TABLE provider_events IS 'Immutable append-only ledger of provider callbacks used for idempotency and reconciliation.';
