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

// Cache the Hono app instance so it's built once per isolate, not per request.
let cachedApp: any = null;

/**
 * POST a Discord webhook embed on cron failure.
 * Falls back to console.error only if the webhook URL is not configured.
 */
async function notifyCronFailure(env: Record<string, any>, cron: string, task: string, err: unknown): Promise<void> {
  const webhookUrl = env.DISCORD_MONITORING_WEBHOOK;
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[cron ${cron}] ${task} failed:`, err);

  if (!webhookUrl) return; // No webhook configured — console.error is enough.

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "⚠️ Cron Failure Alert",
          description: `**Task:** \`${task}\`\n**Cron:** \`${cron}\`\n**Error:**\n\`\`\`\n${msg.slice(0, 1800)}\n\`\`\``,
          color: 0xff4444,
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch {
    // Swallow — we must never crash on alerting failure.
    console.error("[cron] Failed to send Discord webhook notification");
  }
}

export default {
  async fetch(req: Request, env: Record<string, any>): Promise<Response> {
    try {
      populateEnv(env);
      if (!cachedApp) {
        const { buildHonoApp } = await import("./hono-app.js");
        cachedApp = buildHonoApp();
      }
      return await cachedApp.fetch(req, env as any);
    } catch (err: unknown) {
      const errPath = (() => { try { return new URL(req.url).pathname; } catch { return "unknown"; } })();
      console.error(`[bot] unhandled error on ${errPath}:`, String((err as any)?.message || err));
      if (env.DISCORD_MONITORING_WEBHOOK) {
        await sendErrorToDiscord({
          webhookUrl: env.DISCORD_MONITORING_WEBHOOK,
          title: "YourRank Error",
          message: String((err as any)?.stack || (err as any)?.message || err),
          path: errPath,
          worker: "bot",
        }).catch(() => {});
      }
      return new Response("Internal Server Error", { status: 500 });
    }
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
              const downgraded = await downgradeExpired();
              console.log(`[cron 0 3 * * *] downgradeExpired: ${downgraded} user(s) downgraded to free`);
              // Alert via monitoring webhook if any users were downgraded
              if (downgraded > 0 && env.DISCORD_MONITORING_WEBHOOK) {
                await sendCronSummaryToDiscord({
                  webhookUrl: env.DISCORD_MONITORING_WEBHOOK,
                  title: "🌙 Nightly Plan Downgrade Report",
                  fields: [
                    { name: "Users Downgraded", value: String(downgraded), inline: true },
                    { name: "Action", value: "Expired plans reset to Free", inline: true },
                    { name: "Cron", value: "`0 3 * * *`", inline: true },
                  ],
                });
              }
              return downgraded;
            } catch (err) {
              console.error("[cron 0 3 * * *] downgradeExpired failed:", err);
              throw err;
            }
          })(),
        ]);

        // Log any rejections and alert via Discord — allSettled never throws
        const failures = results.filter(r => r.status === "rejected");
        if (failures.length > 0) {
          const failedTasks = ["rollupClicks", "ensureNextMonthPartition", "downgradeExpired"]
            .filter((_, i) => results[i].status === "rejected");
          const reasons = failures.map(f => String((f as PromiseRejectedResult).reason?.message || f.reason)).join("; ");
          console.error(`[cron 0 3 * * *] ${failures.length} task(s) failed: ${failedTasks.join(", ")} — ${reasons}`);
          await notifyCronFailure(env, event.cron, failedTasks.join(", "), reasons);
        } else {
          console.log(`[cron 0 3 * * *] All tasks completed successfully at ${new Date().toISOString()}`);
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
      await notifyCronFailure(env, event.cron, "scheduled-handler", err);
    }
  },
};
