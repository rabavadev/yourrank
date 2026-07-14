// withHandler — standardised async error boundary for route handlers.
//
// Usage:
//   import { withHandler } from "./middleware/handler.js";
//   export const handleFoo = withHandler(async (request, env, ctx, meta) => {
//     ...
//   });
//
// All handlers already wrap their bodies in try/catch and emit `bad(…, 500)`.
// This wrapper adds a safety net for unexpected throws that slip through,
// and keeps the error shape consistent (always JSON, never an uncaught
// exception that kills the Worker invocation).
//
// `meta` is the object passed by withWorkerFetch: { sentry, log, reqId }.

import { bad } from "../auth.js";

/**
 * @template {(request: Request, env: object, ctx?: object, meta?: object) => Promise<Response>} T
 * @param {T} fn  The actual handler function
 * @returns {T}
 */
export function withHandler(fn) {
  return async function handlerWrapper(request, env, ctx, meta) {
    try {
      return await fn(request, env, ctx, meta);
    } catch (err) {
      // Log with enough context to locate the failure without leaking internals.
      const label = fn.name || "anonymous";
      const log = meta?.log;
      const logContext = { handler: label, req_id: meta?.reqId };
      if (log && typeof log.error === "function") {
        log.error("unhandled_error", { error: String(err?.message || err), stack: err?.stack, ...logContext });
      } else {
        console.error(`[handler:${label}] unhandled error:`, String(err?.message || err), logContext);
      }
      if (err?.stack) console.error(err.stack);
      return bad("Internal server error. Please try again.", 500);
    }
  };
}
