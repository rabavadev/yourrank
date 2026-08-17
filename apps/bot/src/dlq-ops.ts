import { exec, query } from "@yourrank/shared/db";
import { queueEventSchema } from "@yourrank/shared/queue-producer";

const DLQ_SUMMARY_SQL = `SELECT event_type,
       count(*)::int AS pending,
       min(received_at) AS oldest_received_at,
       max(replay_attempts)::int AS max_attempts
FROM queue_dlq_events
WHERE replayed_at IS NULL
GROUP BY event_type
ORDER BY pending DESC`;

const DLQ_PAGE_SQL = `SELECT message_id, queue_name, event_type, received_at, replay_attempts
FROM queue_dlq_events
WHERE replayed_at IS NULL
ORDER BY received_at ASC
LIMIT $1`;

const DLQ_PAGE_BODY_SQL = `SELECT message_id, body
FROM queue_dlq_events
WHERE message_id = ANY($1::text[])`;

const DLQ_REPLAY_BY_IDS_SQL = `SELECT message_id, queue_name, event_type, body, replay_attempts
FROM queue_dlq_events
WHERE replayed_at IS NULL
  AND replay_attempts < $2
  AND message_id = ANY($1::text[])
ORDER BY received_at ASC
LIMIT 100`;

const DLQ_REPLAY_OLDEST_SQL = `SELECT message_id, queue_name, event_type, body, replay_attempts
FROM queue_dlq_events
WHERE replayed_at IS NULL
  AND replay_attempts < $2
ORDER BY received_at ASC
LIMIT $1`;

const DLQ_CLAIM_SQL = `UPDATE queue_dlq_events
SET replay_attempts = replay_attempts + 1
WHERE message_id = $1 AND replayed_at IS NULL
RETURNING replay_attempts`;

const DLQ_MARK_REPLAYED_SQL = `UPDATE queue_dlq_events SET replayed_at = now() WHERE message_id = $1`;

type QueryImpl = (text: string, params?: unknown[]) => Promise<any[]>;
type ExecImpl = (text: string, params?: unknown[]) => Promise<any[]>;

export type DlqDb = {
  queryImpl?: QueryImpl;
  execImpl?: ExecImpl;
};

export type DlqReplayRow = {
  message_id: string;
  queue_name: string;
  event_type: string;
  body: unknown;
  replay_attempts: number;
};

export type DlqReplaySend = (body: unknown, row: DlqReplayRow) => Promise<void>;

function boundedLimit(value: unknown, fallback: number, cap: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.min(Math.floor(parsed), cap) : fallback;
}

export async function getDlqPage(
  limit = 50,
  includeBody = false,
  { queryImpl = query }: DlqDb = {},
): Promise<{ summary: unknown[]; rows: unknown[] }> {
  const pageLimit = boundedLimit(limit, 50, 200);
  const [summary, rows] = await Promise.all([
    queryImpl(DLQ_SUMMARY_SQL),
    queryImpl(DLQ_PAGE_SQL, [pageLimit]),
  ]);

  if (!includeBody || rows.length === 0) return { summary, rows };

  const bodies = await queryImpl(DLQ_PAGE_BODY_SQL, [rows.map((row) => row.message_id)]);
  const bodyById = new Map(bodies.map((row) => [row.message_id, row.body]));
  return {
    summary,
    rows: rows.map((row) => ({ ...row, body: bodyById.get(row.message_id) })),
  };
}

type DlqReplayIds = {
  replayed: string[];
  invalid: string[];
  skipped: string[];
  failed: string[];
};

export type DlqReplayResult = {
  replayed: { count: number; ids: string[] };
  invalid: { count: number; ids: string[] };
  skipped: { count: number; ids: string[] };
  failed: { count: number; ids: string[] };
};

function summarizeReplay(ids: DlqReplayIds): DlqReplayResult {
  return {
    replayed: { count: ids.replayed.length, ids: ids.replayed },
    invalid: { count: ids.invalid.length, ids: ids.invalid },
    skipped: { count: ids.skipped.length, ids: ids.skipped },
    failed: { count: ids.failed.length, ids: ids.failed },
  };
}

export async function replayDlq(
  options: {
    messageIds?: string[];
    limit?: number;
    maxAttempts?: number;
    sendImpl: DlqReplaySend;
  },
  { queryImpl = query, execImpl = exec }: DlqDb = {},
): Promise<DlqReplayResult> {
  const maxAttempts = boundedLimit(options.maxAttempts, 3, 1000);
  const limit = boundedLimit(options.limit, 10, 100);
  const ids = Array.isArray(options.messageIds)
    ? options.messageIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  const rows = ids.length > 0
    ? await queryImpl(DLQ_REPLAY_BY_IDS_SQL, [ids, maxAttempts])
    : await queryImpl(DLQ_REPLAY_OLDEST_SQL, [limit, maxAttempts]);
  const result: DlqReplayIds = { replayed: [], invalid: [], skipped: [], failed: [] };

  for (const row of rows as DlqReplayRow[]) {
    let parsedBody: unknown;
    let valid = true;
    try {
      parsedBody = queueEventSchema.parse(row.body);
    } catch {
      valid = false;
    }

    try {
      const claimed = await execImpl(DLQ_CLAIM_SQL, [row.message_id]);
      if (claimed.length === 0) {
        result.skipped.push(row.message_id);
        continue;
      }
      if (!valid) {
        result.invalid.push(row.message_id);
        continue;
      }

      await options.sendImpl(parsedBody, row);
      await execImpl(DLQ_MARK_REPLAYED_SQL, [row.message_id]);
      result.replayed.push(row.message_id);
    } catch {
      result.failed.push(row.message_id);
    }
  }

  return summarizeReplay(result);
}

export const dlqSql = {
  summary: DLQ_SUMMARY_SQL,
  page: DLQ_PAGE_SQL,
  replayByIds: DLQ_REPLAY_BY_IDS_SQL,
  replayOldest: DLQ_REPLAY_OLDEST_SQL,
  claim: DLQ_CLAIM_SQL,
  markReplayed: DLQ_MARK_REPLAYED_SQL,
};
