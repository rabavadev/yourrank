// ------------------------------------------------------------------
// Cloudflare Workers entry point.
//
// Uses dynamic import so shared modules (config.ts, db.ts) pick up
// env vars from the Workers runtime before they evaluate.
// ------------------------------------------------------------------

// Copy every binding the app reads onto process.env so shared modules (which
// read process.env, not c.env) work unchanged. Called from BOTH fetch and
// scheduled — they MUST populate the same set, or a binding set in only one
// handler is silently undefined in the other (this previously broke billing:
// PLATFORM_BOT_* were set in scheduled() but not fetch(), so the Stars
// webhook / invoice creation ran with an undefined token on every request).
function populateEnv(env: Record<string, any>): void {
  if (typeof (globalThis as any).process === "undefined") {
    (globalThis as any).process = { env: {} };
  }
  const pe = (globalThis as any).process.env;
  pe.DATABASE_URL = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
  pe.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
  pe.TOKEN_ENC_KEY = env.TOKEN_ENC_KEY;
  pe.ADMIN_API_KEY = env.ADMIN_API_KEY;
  pe.IP_HASH_SALT = env.IP_HASH_SALT;
  pe.LOGIN_BOT_TOKEN = env.LOGIN_BOT_TOKEN;
  pe.LOGIN_BOT_USERNAME = env.LOGIN_BOT_USERNAME;
  pe.ALLOW_DEV_LOGIN = env.ALLOW_DEV_LOGIN;
  pe.PLATFORM_BOT_TOKEN = env.PLATFORM_BOT_TOKEN;
  pe.PLATFORM_WEBHOOK_SECRET = env.PLATFORM_WEBHOOK_SECRET;
}

export default {
  async fetch(req: Request, env: Record<string, any>): Promise<Response> {
    populateEnv(env);
    const { buildHonoApp } = await import("./hono-app.js");
    const app = buildHonoApp();
    return app.fetch(req, env as any);
  },

  // Cron Triggers (see wrangler.toml):
  //   * * * * *  — broadcast worker: one rate-limited batch per tick
  //   0 3 * * *  — nightly: click rollup, partitions, expired plans
  async scheduled(event: { cron: string }, env: Record<string, any>, ctx: { waitUntil: (p: Promise<unknown>) => void }): Promise<void> {
    populateEnv(env);
    try {
      if (event.cron === "0 3 * * *") {
        const { rollupClicks, ensureNextMonthPartition } = await import("./rollup.js");
        const { downgradeExpired } = await import("./billing.js");

        const results = await Promise.allSettled([
          (async () => {
            try {
              await rollupClicks();
            } catch (err) {
              console.error("[cron 0 3 * * *] rollupClicks failed:", err);
              throw err;
            }
          })(),
          (async () => {
            try {
              await ensureNextMonthPartition();
            } catch (err) {
              console.error("[cron 0 3 * * *] ensureNextMonthPartition failed:", err);
              throw err;
            }
          })(),
          (async () => {
            try {
              await downgradeExpired();
            } catch (err) {
              console.error("[cron 0 3 * * *] downgradeExpired failed:", err);
              throw err;
            }
          })(),
        ]);

        // Log any rejections but don't throw — other tasks may have succeeded
        for (const r of results) {
          if (r.status === "rejected") {
            console.error("[cron 0 3 * * *] one task failed:", r.reason);
          }
        }
      } else {
        // Default: broadcast batch (every minute cron)
        const { processBroadcastBatch } = await import("./broadcasts.js");
        ctx.waitUntil(
          processBroadcastBatch().catch((err: unknown) => {
            console.error(`[cron ${event.cron}] processBroadcastBatch failed:`, err);
          }),
        );
      }
    } catch (err) {
      console.error(`[cron ${event.cron}] handler failed:`, err);
    }
  },
};
