-- Track the last time the analytics consumer processed events, so the monitor
-- can detect a silent consumer outage instead of waiting for stale dashboard data.
CREATE TABLE IF NOT EXISTS consumer_heartbeat (
  name TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_count BIGINT NOT NULL DEFAULT 0,
  failed_count BIGINT NOT NULL DEFAULT 0
);

-- Only one row is needed for the single consumer deployment.
-- Refresh last_seen on conflict so re-runs do not leave a stale timestamp.
INSERT INTO consumer_heartbeat (name, last_seen, processed_count, failed_count)
VALUES ('consumer', now(), 0, 0)
ON CONFLICT (name) DO UPDATE
SET last_seen = now(),
    processed_count = consumer_heartbeat.processed_count + EXCLUDED.processed_count,
    failed_count = consumer_heartbeat.failed_count + EXCLUDED.failed_count;
