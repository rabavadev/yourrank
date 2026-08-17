export function evaluateConsumerHealth(
  heartbeat,
  now = Date.now(),
  stalenessWindowSeconds = 600
) {
  const processedAny = Number(heartbeat.processed_count) > 0 || Number(heartbeat.failed_count) > 0;
  const failureAt = heartbeat.last_failure_at ? new Date(heartbeat.last_failure_at).getTime() : 0;
  const successAt = heartbeat.last_success_at ? new Date(heartbeat.last_success_at).getTime() : 0;
  const failureRecent = failureAt > 0 && now - failureAt < stalenessWindowSeconds * 1000;
  const failureUnrecovered = failureRecent && successAt < failureAt;
  return {
    healthy: !processedAny || (!failureUnrecovered && heartbeat.seconds_ago < stalenessWindowSeconds),
    last_failure_at: heartbeat.last_failure_at ?? null,
    last_success_at: heartbeat.last_success_at ?? null,
  };
}
