import { one } from "@yourrank/shared/db";

const DLQ_HEALTH_LIMIT = 1000;

const DLQ_HEALTH_SQL = `SELECT count(*)::int AS pending,
       min(received_at) AS oldest_received_at
FROM (
  SELECT received_at FROM queue_dlq_events WHERE replayed_at IS NULL ORDER BY received_at ASC LIMIT $1
) t`;

export async function readDlqHealth(
  queryImpl = one,
  threshold = 100,
  limit = DLQ_HEALTH_LIMIT,
) {
  try {
    const row = await queryImpl(DLQ_HEALTH_SQL, [limit]);
    const pending = Number(row?.pending || 0);
    const oldestPendingAt = row?.oldest_received_at ?? null;
    const oldestPendingAgeSeconds = oldestPendingAt
      ? Math.max(0, Math.floor((Date.now() - Date.parse(oldestPendingAt)) / 1000))
      : null;
    return {
      pending,
      oldest_pending_at: oldestPendingAt,
      oldest_pending_age_seconds: oldestPendingAgeSeconds,
      pending_capped: pending >= limit,
      degraded: pending >= threshold,
      error: null,
    };
  } catch {
    return {
      pending: null,
      oldest_pending_at: null,
      oldest_pending_age_seconds: null,
      pending_capped: false,
      degraded: false,
      error: "probe_failed",
    };
  }
}

export { DLQ_HEALTH_LIMIT, DLQ_HEALTH_SQL };
