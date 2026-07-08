// ------------------------------------------------------------------
// Cloudflare Workers entry point.
//
// Uses dynamic import so shared modules (config.ts, db.ts) pick up
// env vars from the Workers runtime before they evaluate.
// ------------------------------------------------------------------

// Copy every binding the app reads onto process.env so shared modules (which
// read process.env, not c.env) work unchanged. Called from BOTH fetch and
// scheduled — they MUST populate the same set, or a binding set in only one
import { sendErrorToDiscord, sendCronSummaryToDiscord } from "../../../shared/monitoring.js";
import { populateEnv } from "../../../shared/env.js";
import { exec as dbExec } from "../../../shared/db.js";
import { Toucan } from "toucan-js";

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
  async fetch(req: Request, env: Record<string, any>, ctx: { waitUntil: (p: Promise<unknown>) => void }): Promise<Response> {
    // Declared out here so the catch below can report to Sentry, but INITIALISED
    // inside the try: if Toucan construction itself throws, we must return a 500
    // rather than let the fetch promise reject into a Cloudflare 1101 page.
    let sentry: Toucan | null = null;
    try {
      sentry = env.SENTRY_DSN ? (() => { const s = new Toucan({
        dsn: env.SENTRY_DSN,
        request: req,
        context: ctx,
        environment: "production",
        release: `yourrank@${process.env.npm_package_version || "dev"}`,
      }); s.setTag("worker", "bot"); return s; })() : null;
      populateEnv(env);
      // Ensure current month partition exists on first request (idempotent)
      if (!cachedApp) {
        const { buildHonoApp } = await import("./hono-app.js");
        cachedApp = buildHonoApp();
        // Ensure current month partition exists on Worker startup
        ctx.waitUntil(
          (async () => {
            try {
              const { ensureCurrentMonthPartition } = await import("./rollup.js");
              await ensureCurrentMonthPartition();
              console.log("[startup] ensureCurrentMonthPartition completed");
            } catch (err) {
              console.error("[startup] ensureCurrentMonthPartition failed:", err);
            }
          })()
        );
      }
      return await cachedApp.fetch(req, env as any);
    } catch (err: unknown) {
      sentry?.captureException(err);
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
    const sentry = env.SENTRY_DSN ? (() => { const s = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx,
      environment: "production",
      release: `yourrank@${process.env.npm_package_version || "dev"}`,
    }); s.setTag("worker", "bot"); return s; })() : null;
    populateEnv(env);
    try {
      if (event.cron === "0 3 * * *") {
        const { rollupClicks, ensureNextMonthPartition, ensureCurrentMonthPartition } = await import("./rollup.js");
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
              await ensureCurrentMonthPartition();
            } catch (err) {
              console.error("[cron 0 3 * * *] ensureCurrentMonthPartition failed:", err);
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
          // DB-101: Data retention — delete click_daily rows older than 90 days
          (async () => {
            try {
              const result = await dbExec("SELECT cleanup_old_clicks()");
              const deleted = result?.[0]?.deleted_count ?? 0;
              console.log(`[cron 0 3 * * *] cleanup_old_clicks: deleted ${deleted} click_daily rows`);
            } catch (err) {
              console.error("[cron] click cleanup failed:", err);
              // Non-critical — don't fail the whole cron batch
            }
          })(),
        ]);

        // Log any rejections and alert via Discord — allSettled never throws
        const failures = results.filter(r => r.status === "rejected");
        if (failures.length > 0) {
          const failedTasks = ["rollupClicks", "ensureCurrentMonthPartition", "ensureNextMonthPartition", "downgradeExpired", "cleanupOldClicks"]
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
            notifyCronFailure(env, event.cron, "processBroadcastBatch", err).catch(() => {});
          }),
        );
      }
    } catch (err) {
      sentry?.captureException(err);
      await notifyCronFailure(env, event.cron, "scheduled-handler", err);
    }
  },
};
