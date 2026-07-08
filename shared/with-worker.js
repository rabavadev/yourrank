"use strict";
// Shared entry-point wrapper for YourRank Workers.
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWorkerFetch = withWorkerFetch;
const request_id_js_1 = require("./request-id.js");
const monitoring_js_1 = require("./monitoring.js");

function withWorkerFetch(workerName, handler) {
    return async function fetch(request, env, ctx) {
        const reqId = (0, request_id_js_1.generateRequestId)();
        const log = (0, request_id_js_1.createLogger)(workerName, reqId);

        // Initialize Sentry if DSN is available (dynamic import - toucan-js is an app-level dep)
        let sentry = null;
        try {
            if (env.SENTRY_DSN) {
                const { Toucan } = await import("toucan-js");
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
            log.warn("sentry_init_failed", { error: String(sentryErr) });
        }

        try {
            const response = await handler(request, env, ctx, { sentry, log, reqId });
            // Response.redirect() creates responses with immutable headers.
            // Clone to get mutable headers before setting X-Request-Id.
            const mutable = new Response(response.body, response);
            mutable.headers.set("X-Request-Id", reqId);
            return mutable;
        } catch (err) {
            const errMsg = String(err?.message || err);
            const errStack = err?.stack || "";
            sentry?.captureException(err);
            log.error("unhandled_error", { error: errMsg, stack: errStack });
            const errPath = (() => {
                try { return new URL(request.url).pathname; } catch { return "unknown"; }
            })();
            if (env.DISCORD_MONITORING_WEBHOOK) {
                ctx.waitUntil((0, monitoring_js_1.sendErrorToDiscord)({
                    webhookUrl: env.DISCORD_MONITORING_WEBHOOK,
                    title: `${workerName} Error`,
                    message: errStack || errMsg,
                    path: errPath,
                    worker: workerName,
                }));
            }
            return new Response("Internal Server Error", {
                status: 500,
                headers: { "X-Request-Id": reqId },
            });
        }
    };
}
