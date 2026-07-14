// Shared entry-point wrapper for YourRank Workers.
// Wraps fetch/scheduled handlers to guarantee:
//   1. Request ID generated and echoed as X-Request-Id
//   2. Sentry (Toucan) initialized if DSN present
//   3. All errors caught, reported to Sentry + Discord, and returned as 500
//   4. Structured JSON logging on every error

import { generateRequestId, createLogger } from "./request-id.js";
import { sendErrorToDiscord } from "./monitoring.js";

interface ToucanClient {
  setTag(key: string, value: string): void;
  setTags(tags: Record<string, string>): void;
  captureException(err: unknown): void;
}

interface WorkerContext {
  sentry: ToucanClient | null;
  log: ReturnType<typeof createLogger>;
  reqId: string;
}

type FetchHandler = (
  request: Request,
  env: Record<string, any>,
  ctx: any,
  extras: WorkerContext
) => Promise<Response>;

export function withWorkerFetch(workerName: string, handler: FetchHandler) {
  return async function fetch(
    request: Request,
    env: Record<string, any>,
    ctx: any
  ): Promise<Response> {
    const incomingReqId = request.headers.get("x-request-id");
    const reqId = incomingReqId || generateRequestId();
    const log = createLogger(workerName, reqId);

    let sentry: ToucanClient | null = null;
    try {
      if (env.SENTRY_DSN) {
        const { Toucan } = await import("toucan-js");
        const s = new Toucan({
          dsn: env.SENTRY_DSN,
          request,
          context: ctx,
          environment: env.ENVIRONMENT || "production",
          release: `yourrank@${(typeof process !== "undefined" && process.env?.npm_package_version) || "dev"}`,
        });
        s.setTags({ worker: workerName, req_id: reqId });
        sentry = s;
      }
    } catch (sentryErr) {
      log.warn("sentry_init_failed", { error: String(sentryErr) });
    }

    try {
      const response = await handler(request, env, ctx, { sentry, log, reqId });
      // Response.redirect() creates responses with immutable headers.
      // Clone to get mutable headers before setting X-Request-Id.
      const mutable = new Response(response.body, response);
      mutable.headers.set("X-Request-Id", reqId);
      return mutable;
    } catch (err: unknown) {
      const errMsg = String((err as any)?.message || err);
      const errStack = (err as any)?.stack || "";

      sentry?.captureException(err);
      log.error("unhandled_error", { error: errMsg, stack: errStack });

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
