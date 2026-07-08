// Shared request ID generation and structured logging for YourRank Workers.
// Both Workers import this for consistent, grep-able log lines.

/**
 * Generate a short, unique request ID.
 * Uses crypto.randomUUID if available, falls back to Math.random.
 */
export function generateRequestId(): string {
  try {
    // crypto.randomUUID is available in Workers runtime
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  } catch {
    return Math.random().toString(36).slice(2, 18);
  }
}

/**
 * Structured log line. Always JSON, always has these fields.
 */
interface LogFields {
  level: "info" | "warn" | "error";
  worker: string;
  req_id?: string;
  route?: string;
  msg: string;
  [key: string]: unknown;
}

export function log(fields: LogFields): void {
  const line = { ...fields, ts: new Date().toISOString() };
  if (fields.level === "error") {
    console.error(JSON.stringify(line));
  } else if (fields.level === "warn") {
    console.warn(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

/**
 * Create a request-scoped logger with worker + req_id pre-filled.
 */
export function createLogger(worker: string, reqId: string) {
  return {
    info: (msg: string, extra?: Record<string, unknown>) =>
      log({ level: "info", worker, req_id: reqId, msg, ...extra }),
    warn: (msg: string, extra?: Record<string, unknown>) =>
      log({ level: "warn", worker, req_id: reqId, msg, ...extra }),
    error: (msg: string, extra?: Record<string, unknown>) =>
      log({ level: "error", worker, req_id: reqId, msg, ...extra }),
  };
}
