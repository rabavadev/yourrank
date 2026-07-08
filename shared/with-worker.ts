// Shared entry-point wrapper for YourRank Workers.
// Wraps fetch/scheduled handlers to guarantee:
//   1. Request ID generated and echoed as X-Request-Id
//   2. Sentry (Toucan) initialized if DSN present
//   3. All errors caught, reported to Sentry + Discord, and returned as 500
//   4. Structured JSON logging on every error
//
// Usage in Worker entry point:
//
//   import { withWorkerFetch } from "../../shared/with-worker.js";
//
//   export default {
//     fetch: withWorkerFetch("leaderboard", async (request, env, ctx, { sentry, log }) => {
//       // ... your handler code ...
//       return response;
//     }),
//   };

import { Toucan } from "toucan-js";
import { generateRequestId, createLogger } from "./request-id.js";
import { sendErrorToDiscord } from "./monitoring.js";

interface WorkerContext {
  sentry: Toucan | null;
  log: ReturnType<typeof createLogger>;
  reqId: string;
}

type FetchHandler = (
  request: Request,
  env: Record<string, any>,
  ctx: ExecutionContext,
  extras: WorkerContext
) => Promise<Response>;

/**
 * Wraps a fetch handler with request ID, Sentry, and error handling.
 * Returns a standard fetch handler compatible with Cloudflare Workers.
 */
export function withWorkerFetch(workerName: string, handler: FetchHandler) {
  return async function fetch(
    request: Request,
    env: Record<string, any>,
    ctx: ExecutionContext
  ): Promise<Response> {
    const reqId = generateRequestId();
    const log = createLogger(workerName, reqId);

    // Initialize Sentry if DSN is available
    let sentry: Toucan | null = null;
    try {
      if (env.SENTRY_DSN) {
        sentry = new Toucan({
          dsn: env.SENTRY_DSN,
          request,
          context: ctx,
          environment: env.ENVIRONMENT || "production",
          release: `yourrank@${(typeof process !== "undefined" && process.env?.npm_package_version) || "dev"}`,
          tags: { worker: workerName, req_id: reqId },
        });
      }
    } catch (sentryErr) {
      // Sentry init failure should never crash the request
      log.warn("sentry_init_failed", { error: String(sentryErr) });
    }

    try {
      const response = await handler(request, env, ctx, { sentry, log, reqId });
      response.headers.set("X-Request-Id", reqId);
      return response;
    } catch (err: unknown) {
      const errMsg = String((err as any)?.message || err);
      const errStack = (err as any)?.stack || "";

      // Report to Sentry
      sentry?.captureException(err);

      // Structured log
      log.error("unhandled_error", { error: errMsg, stack: errStack });

      // Discord webhook (fire-and-forget)
      const errPath = (() => {
        try { return new URL(request.url).pathname; } catch { return "unknown"; }
      })();
      if (env.DISCORD_MONITORING_WEBHOOK) {
        ctx.waitUntil(
          sendErrorToDiscord({
            webhookUrl: env.DISCORD_MONITORING_WEBHOOK,
            title: `${workerName} Error`,
            message: errStack || errMsg,
            path: errPath,
            worker: workerName,
          })
        );
      }

      return new Response("Internal Server Error", {
        status: 500,
        headers: { "X-Request-Id": reqId },
      });
    }
  };
}
