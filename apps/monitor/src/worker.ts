// YourRank Uptime Monitor — Cloudflare Worker
// Runs on a cron schedule, checks golden paths, alerts Discord on failure.

interface Env {
  MONITOR_TARGET: string;       // e.g. "https://yourrank.site"
  DISCORD_MONITORING_WEBHOOK: string;  // Discord webhook for alerts
  MONITOR_SLUG?: string;        // known board slug for /r/ check
  MONITOR_PB_KEY?: string;      // known postback key for /pb check
  MONITOR_BACKUP_CHECK?: string; // "true" to also check /api/health/backup
  RESEND_API_KEY?: string;      // Optional email alert fallback
  ALERT_EMAIL?: string;         // Optional email alert recipient
  ALERT_FROM?: string;          // Optional email from address
  MONITOR_CHECK_SECRET?: string; // Optional secret to protect /check manual trigger
}

interface CheckResult {
  name: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  error?: string;
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkEndpoint(
  url: string,
  options: RequestInit,
  name: string,
  timeoutMs = 10_000,
  expectedStatuses?: number[]
): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const ok = expectedStatuses ? expectedStatuses.includes(res.status) : res.ok;
    return {
      name,
      ok,
      status: res.status,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      status: 0,
      latencyMs: Date.now() - start,
      error: String(err),
    };
  }
}

async function alertEmail(env: Env, failures: CheckResult[]): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.ALERT_EMAIL) return false;

  const fromAddr = env.ALERT_FROM ?? "YourRank Monitor <alerts@yourrank.site>";
  const subject = `🔴 YourRank uptime alert: ${failures.length} check(s) failed`;
  const text = failures.map((f) => `❌ ${f.name}\nStatus: ${f.status} | Latency: ${f.latencyMs}ms${f.error ? `\nError: ${f.error}` : ""}`).join("\n\n");
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2>YourRank uptime alert</h2><pre style="white-space:pre-wrap;background:#f6f6f6;padding:14px;border-radius:6px">${text.replace(/</g, "&lt;")}</pre></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: fromAddr, to: [env.ALERT_EMAIL], subject, text, html }),
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function runChecks(env: Env): Promise<CheckResult[]> {
  const base = env.MONITOR_TARGET;
  const checks: Promise<CheckResult>[] = [
    // 1. GET /health (leaderboard + DB)
    checkEndpoint(`${base}/health`, { method: "GET" }, "GET /health"),
    // 2. GET / (landing page render)
    checkEndpoint(`${base}/`, { method: "GET" }, "GET / (landing)"),
    // 3. GET /bot/health (bot worker + DB)
    checkEndpoint(`${base}/bot/health`, { method: "GET" }, "GET /bot/health"),
    // 4. GET /bot/dashboard (bot dashboard + Telegram login widget)
    checkEndpoint(`${base}/bot/dashboard`, { method: "GET" }, "GET /bot/dashboard"),
  ];

  // 5. GET /r/<known-slug> — only if a slug is configured; 302/307 are expected
  if (env.MONITOR_SLUG) {
    checks.push(
      checkEndpoint(
        `${base}/r/${env.MONITOR_SLUG}`,
        { method: "GET", redirect: "manual" },
        `GET /r/${env.MONITOR_SLUG}`,
        10_000,
        [301, 302, 303, 307, 308]
      )
    );
  }

  // 6. POST /pb — postback endpoint canary (signed, if a key is configured).
  // The monitor sends a synthetic test conversion with a unique click_ref so
  // it does not collide with real conversions.
  if (env.MONITOR_PB_KEY) {
    const clickRef = `monitor-${Date.now()}`;
    const qs = `event=monitor&amount=0&click_ref=${encodeURIComponent(clickRef)}`;
    const signature = await hmacSha256Hex(env.MONITOR_PB_KEY, qs);
    checks.push(
      checkEndpoint(
        `${base}/pb?${qs}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-postback-key": env.MONITOR_PB_KEY,
            "x-postback-signature": signature,
          },
        },
        "POST /pb (canary)",
        10_000,
        [200]
      )
    );
  }

  // 7. Backup verification freshness — only if enabled. The leaderboard
  // endpoint returns 503 when no successful practice restore has been recorded
  // within the configured limit (default 7 days).
  if (env.MONITOR_BACKUP_CHECK === "true") {
    checks.push(
      checkEndpoint(
        `${base}/api/health/backup`,
        { method: "GET" },
        "GET /api/health/backup",
        10_000,
        [200]
      )
    );
  }

  // 8. Consumer health: ping the consumer Worker's /health route. This both
  // checks the consumer is reachable and updates its DB heartbeat row, which
  // the leaderboard /health check above also reads.
  checks.push(checkEndpoint(`${base}/consumer/health`, { method: "GET" }, "GET /consumer/health"));

  return Promise.all(checks);
}

async function alertDiscord(env: Env, failures: CheckResult[]): Promise<boolean> {
  if (!env.DISCORD_MONITORING_WEBHOOK) return false;

  const fields = failures.map((f) => ({
    name: `❌ ${f.name}`,
    value: `Status: ${f.status} | Latency: ${f.latencyMs}ms${f.error ? `\nError: ${f.error.slice(0, 200)}` : ""}`,
    inline: false,
  }));

  const embed = {
    title: "🔴 YourRank Uptime Alert",
    color: 0xff4444,
    fields,
    timestamp: new Date().toISOString(),
    footer: { text: "YourRank Monitor" },
  };

  try {
    const res = await fetch(env.DISCORD_MONITORING_WEBHOOK, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "YourRank Monitor",
        embeds: [embed],
      }),
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function alertAll(env: Env, failures: CheckResult[]): Promise<void> {
  // Send to Discord first, then to email. If Discord fails, email becomes the
  // fallback. If both are configured, both fire so you don't lose the alert.
  const discordOk = await alertDiscord(env, failures);
  const emailOk = await alertEmail(env, failures);

  if (!discordOk && !emailOk) {
    console.error(JSON.stringify({
      level: "error",
      msg: "monitor_alerts_failed",
      ts: new Date().toISOString(),
      failures: failures.map((f) => f.name),
    }));
  } else if (!discordOk) {
    console.warn(JSON.stringify({
      level: "warn",
      msg: "monitor_discord_alert_failed_email_sent",
      ts: new Date().toISOString(),
    }));
  }
}

export default {
  // Cron handler — runs every 5 minutes
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const results = await runChecks(env);
    const failures = results.filter((r) => !r.ok);

    if (failures.length > 0) {
      console.error(JSON.stringify({
        level: "error",
        msg: "uptime_check_failed",
        failures: failures.map((f) => f.name),
        ts: new Date().toISOString(),
      }));
      ctx.waitUntil(alertAll(env, failures));
    } else {
      console.log(JSON.stringify({
        level: "info",
        msg: "uptime_check_passed",
        checks: results.map((r) => ({ name: r.name, status: r.status, ms: r.latencyMs })),
        ts: new Date().toISOString(),
      }));
    }
  },

  // HTTP handler — returns monitor status
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, worker: "monitor" }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/check") {
      // Manual trigger for testing. Require a secret if one is configured,
      // so an attacker cannot use your monitor as a free load generator.
      const secret = env.MONITOR_CHECK_SECRET;
      if (secret) {
        const auth = request.headers.get("authorization") ?? "";
        const bearer = auth.replace(/^Bearer\s+/i, "").trim();
        const querySecret = url.searchParams.get("secret") ?? "";
        if (bearer !== secret && querySecret !== secret) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
        }
      }
      const results = await runChecks(env);
      return new Response(JSON.stringify(results, null, 2), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("YourRank Monitor", { status: 200 });
  },
};
