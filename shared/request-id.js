"use strict";
// Shared request ID generation and structured logging for YourRank Workers.
// Both Workers import this for consistent, grep-able log lines.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = generateRequestId;
exports.log = log;
exports.createLogger = createLogger;
/**
 * Generate a short, unique request ID.
 * Uses crypto.randomUUID if available, falls back to Math.random.
 */
function generateRequestId() {
    try {
        // crypto.randomUUID is available in Workers runtime
        return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
    catch {
        return Math.random().toString(36).slice(2, 18);
    }
}
function log(fields) {
    const line = { ...fields, ts: new Date().toISOString() };
    if (fields.level === "error") {
        console.error(JSON.stringify(line));
    }
    else if (fields.level === "warn") {
        console.warn(JSON.stringify(line));
    }
    else {
        console.log(JSON.stringify(line));
    }
}
/**
 * Create a request-scoped logger with worker + req_id pre-filled.
 */
function createLogger(worker, reqId) {
    return {
        info: (msg, extra) => log({ level: "info", worker, req_id: reqId, msg, ...extra }),
        warn: (msg, extra) => log({ level: "warn", worker, req_id: reqId, msg, ...extra }),
        error: (msg, extra) => log({ level: "error", worker, req_id: reqId, msg, ...extra }),
    };
}
