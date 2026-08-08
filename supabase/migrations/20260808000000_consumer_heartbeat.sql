-- Track the last time the analytics consumer processed events, so the monitor
-- can detect a silent consumer outage instead of waiting for stale dashboard data.
CREATE TABLE IF NOT EXISTS consumer_heartbeat (
  name TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_count BIGINT NOT NULL DEFAULT 0,
  failed_count BIGINT NOT NULL DEFAULT 0
);

-- Only one row is needed for the single consumer deployment.
INSERT INTO consumer_heartbeat (name, last_seen, processed_count, failed_count)
VALUES ('consumer', now(), 0, 0)
ON CONFLICT (name) DO NOTHING;
