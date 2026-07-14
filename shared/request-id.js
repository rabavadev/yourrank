// Shared request ID generation and structured logging for YourRank Workers.
// Both Workers import this for consistent, grep-able log lines.
import { AsyncLocalStorage } from "node:async_hooks";
/**
 * Generate a short, unique request ID.
 * Uses crypto.randomUUID if available, falls back to Math.random.
 */
export function generateRequestId() {
    try {
        // crypto.randomUUID is available in Workers runtime
        return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    }
    catch {
        return Math.random().toString(36).slice(2, 18);
    }
}
const LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
// Capture the original console methods before anything monkey-patches them.
const CONSOLE = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};
function shouldLog(level, env) {
    const configured = (env?.LOG_LEVEL || "info").toLowerCase();
    const minLevel = LEVELS[configured] ?? LEVELS.info;
    if (LEVELS[level] < minLevel)
        return false;
    // Never sample warnings or errors — they are needed for alerting.
    if (level === "warn" || level === "error")
        return true;
    const rate = Number(env?.LOG_SAMPLE_RATE ?? "1");
    if (Number.isNaN(rate) || rate >= 1)
        return true;
    if (rate <= 0)
        return false;
    return Math.random() < rate;
}
export function log(fields, env) {
    if (!shouldLog(fields.level, env))
        return;
    const line = { ...fields, ts: new Date().toISOString() };
    if (fields.level === "error") {
        CONSOLE.error(JSON.stringify(line));
    }
    else if (fields.level === "warn") {
        CONSOLE.warn(JSON.stringify(line));
    }
    else {
        CONSOLE.log(JSON.stringify(line));
    }
}
/**
 * Create a request-scoped logger with worker + req_id pre-filled.
 * Pass `env` to honour LOG_LEVEL and LOG_SAMPLE_RATE.
 */
export function createLogger(worker, reqId, env) {
    const logger = {
        reqId,
        worker,
        info: (msg, extra) => log({ level: "info", worker, req_id: reqId, msg, ...extra }, env),
        warn: (msg, extra) => log({ level: "warn", worker, req_id: reqId, msg, ...extra }, env),
        error: (msg, extra) => log({ level: "error", worker, req_id: reqId, msg, ...extra }, env),
        debug: (msg, extra) => log({ level: "debug", worker, req_id: reqId, msg, ...extra }, env),
    };
    return logger;
}
// Per-request logger context so any helper can call getLogger() instead of
// passing a log object through every call stack.
const loggerStore = new AsyncLocalStorage();
export function runWithLogger(logger, fn) {
    return loggerStore.run({ logger }, fn);
}
export function getLogger() {
    return loggerStore.getStore()?.logger || createLogger("unknown", "no-ctx");
}
function formatConsoleArgs(args) {
    return args
        .map((a) => {
        if (typeof a === "string")
            return a;
        if (a instanceof Error)
            return a.message;
        try {
            return JSON.stringify(a);
        }
        catch {
            return String(a);
        }
    })
        .join(" ");
}
let consoleRedirectInstalled = false;
/**
 * Redirect raw console.* calls through the request-scoped logger.
 * Safe to call multiple times; installs the patch only once.
 */
export function installConsoleRedirect() {
    if (consoleRedirectInstalled)
        return;
    consoleRedirectInstalled = true;
    console.log = (...args) => getLogger().info(formatConsoleArgs(args));
    console.warn = (...args) => getLogger().warn(formatConsoleArgs(args));
    console.error = (...args) => getLogger().error(formatConsoleArgs(args));
}
