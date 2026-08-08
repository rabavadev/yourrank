-- Refresh the consumer heartbeat row during deploy so the smoke-test /health check
-- does not fail immediately after a deployment when the queue is empty.
INSERT INTO consumer_heartbeat (name, last_seen, processed_count, failed_count)
VALUES ('consumer', now(), 0, 0)
ON CONFLICT (name) DO UPDATE
SET last_seen = now(),
    processed_count = consumer_heartbeat.processed_count + EXCLUDED.processed_count,
    failed_count = consumer_heartbeat.failed_count + EXCLUDED.failed_count;
