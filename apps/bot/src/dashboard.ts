// ------------------------------------------------------------------
// Streamer dashboard: Telegram Login auth + self-serve UI.
//
// Refactored to separate concerns:
//   - Auth logic in dashboard-auth.ts
//   - API handlers in dashboard-api.ts  
//   - HTML templates in dashboard-views.ts
//   - This file handles routing and middleware setup
//
// Routes:
//   GET  /dashboard            HTML app (login screen or dashboard)
//   POST /auth/telegram        Telegram Login widget callback
//   POST /auth/dev             Dev-only login (ALLOW_DEV_LOGIN=1)
//   POST /auth/logout
//   GET  /dash/api/me
//   GET  /dash/api/offers      list own offers (+ tracked links, clicks)
//   POST /dash/api/offers      create offer
//   PATCH /dash/api/offers/:id toggle active
//   GET  /dash/api/stats/daily clicks per day (14d) for the chart
//   GET  /dash/api/bots        list own bots
//   POST /dash/api/bots        connect a bot (paste BotFather token)
//
// Session: SHARED KV-backed session (see ../../../shared/session.ts). The token
// is a random opaque id; DB sessions table maps token -> user UUID in
// namespace, which is bound to the SAME id as the leaderboard Worker so one
// login works across both Workers. Cookie name yr_session, Domain=.yourrank.site.
// (Replaces the old HMAC-signed stateless `sess` cookie, which could not be
// verified cross-Worker and gave no real server-side logout.)
// ------------------------------------------------------------------
import { Hono } from "hono";
import { config } from "./config.js";
import { one } from "../../../shared/db.js";
import {
  createSession,
  destroySession,
  cookieSet,
  cookieClear,
  resolveSession,
  readToken,
  hasLegacyCookie,
  cookieClearLegacy,
  type SessionEnv,
} from "../../../shared/session.js";
import { sameOrigin, verifyTelegramLogin } from "./dashboard-auth.js";
import { buildDashboardApi } from "./dashboard-api.js";
import { loginHtml, appHtml } from "./dashboard-views.js";
import { rateLimit, type RateLimitKV } from "./ratelimit.js";
import { errMessage } from "./errors.js";

// ---------------- app ----------------

// The Workers env is passed straight through as Hono's `c.env` (see worker.ts:
// `app.fetch(req, env as any)`), so the env bindings declared in
// wrangler.toml are reachable as `c.env`.
type DashBindings = SessionEnv & {
  SESSIONS?: RateLimitKV;
  RATE_LIMITER_DO?: any;
  RL_BACKEND?: string;
  [key: string]: unknown;
};
type DashEnv = { Bindings: DashBindings; Variables: { cspNonce: string } };

export function buildDashboard(): Hono<DashEnv> {
  const app = new Hono<DashEnv>();

  // Global error handler — same reason as buildHonoApp: Hono's default
  // text/plain 500 breaks the dashboard's api() JSON parse.
  app.onError((err, c) => {
    const msg = errMessage(err);
    const stack = err instanceof Error ? err.stack ?? "" : "";
    console.error("[dashboard unhandled error]", msg, stack);
    return c.json({ error: msg, stack: stack.split("\n").slice(0, 5).join("\n") }, 500);
  });

  // CSP header on all dashboard responses (SEC-102, SEC-703)
  // SEC-104: Also clear legacy 'sess' cookie on every response.
  // SEC-107: Propagate rotated session cookies.
  app.use("*", async (c, next) => {
    const nonce = crypto.randomUUID().replace(/-/g, "");
    c.set("cspNonce", nonce);
    await next();
    if (!c.res.headers.has("Content-Security-Policy")) {
      // M-02: nonce-only script-src and style-src. No 'unsafe-eval' or 'unsafe-inline'.
      c.header("Content-Security-Policy", `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://telegram.org; style-src 'self' 'nonce-${nonce}'; img-src 'self' data: https:; connect-src 'self' https://telegram.org; frame-src https://telegram.org https://oauth.telegram.org;`);
    }
    c.res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    // SEC-104: Clear legacy 'sess' cookie
    if (hasLegacyCookie(c.req.raw)) {
      c.res.headers.append("Set-Cookie", cookieClearLegacy());
    }
  });

  // ---- auth ----
  // BE-005: Rate-limit the Telegram login endpoint to prevent brute-force
  // signature forgery attempts (60 req/min per IP).
  app.post("/auth/telegram", async (c) => {
    const ip = c.req.header("cf-connecting-ip") || "0.0.0.0";
    const rlResult = await rateLimit(c.env, `bot-dash:${ip}`, 20, 60);
    if (!rlResult.ok) return c.json({ error: "rate limit exceeded", retryAfter: rlResult.retryAfter }, 429);
    if (!sameOrigin(c.req.raw, config.publicBaseUrl)) return c.json({ error: "cross-origin request rejected" }, 403);
    const loginBotToken = process.env.LOGIN_BOT_TOKEN;
    if (!loginBotToken) return c.json({ error: "telegram login not configured" }, 501);
    const data = await c.req.json();
    if (!(await verifyTelegramLogin(data, loginBotToken)))
      return c.json({ error: "bad telegram signature" }, 401);

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || String(data.id);
    const row = (await one<{ id: string; status: string }>(
      `INSERT INTO users (telegram_user_id, display_name)
       VALUES ($1, $2)
       ON CONFLICT (telegram_user_id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()
       RETURNING id, status`,
      [data.id, name]
    ))!;
    if (row.status === "suspended") return c.json({ error: "account suspended" }, 403);
    const token = await createSession(c.env, row.id);
    c.header("Set-Cookie", cookieSet(token, c.env));
    return c.json({ ok: true });
  });

  app.post("/auth/dev", async (c) => {
    if (process.env.ALLOW_DEV_LOGIN !== "1") return c.json({ error: "disabled" }, 403);
    // Dev login blindly trusts a telegram_user_id and hands back that user's
    // session, so it is an ATO primitive if reachable. Restrict HARD:
    //  - REQUIRE an Origin header and require it to be localhost (curl/local
    //    dev only). sameOrigin()'s missing-Origin bypass is deliberately NOT
    //    applied here, since that bypass is exactly how a remote attacker would
    //    reach dev login with curl-equivalent tooling.
    //  - Never enable ALLOW_DEV_LOGIN in production.
    const origin = c.req.raw.headers.get("origin") ?? "";
    const isLocal =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (!isLocal) return c.json({ error: "dev login is local-only" }, 403);
    const { telegram_user_id, display_name } = await c.req.json<{ telegram_user_id: number; display_name?: string }>();
    const row = (await one<{ id: string }>(
      `INSERT INTO users (telegram_user_id, display_name) VALUES ($1, $2)
       ON CONFLICT (telegram_user_id) DO UPDATE SET updated_at = now() RETURNING id`,
      [telegram_user_id, display_name ?? `dev-${telegram_user_id}`]
    ))!;
    const token = await createSession(c.env, row.id);
    c.header("Set-Cookie", cookieSet(token, c.env));
    return c.json({ ok: true });
  });

  app.post("/auth/logout", async (c) => {
    await destroySession(c.env, readToken(c.req.raw));
    c.header("Set-Cookie", cookieClear(c.env));
    // JSON for the dashboard JS client; HTML redirect for the shared nav form.
    const accept = c.req.header("accept") || "";
    if (accept.includes("application/json")) return c.json({ ok: true });
    return c.redirect("/bot/dashboard");
  });

  // ---- session-scoped API ----
  const api = buildDashboardApi();
  app.route("/dash/api", api);

  // ---- HTML ----
  const dashboardPage = async (c: any, page: string) => {
    const session = await resolveSession(c.req.raw, c.env as any);
    const uid = session?.uid ?? null;
    if (session?.rotatedCookie) c.header("Set-Cookie", session.rotatedCookie);
    const loginBotUsername = process.env.LOGIN_BOT_USERNAME ?? "";
    const devLogin = process.env.ALLOW_DEV_LOGIN === "1";
    if (!uid) return c.html(loginHtml(loginBotUsername, devLogin, c.get("cspNonce")));
    const user = await one<{ display_name: string; email: string; plan: string }>(
      `SELECT display_name, email, plan FROM users WHERE id=$1`,
      [uid]
    );
    return c.html(appHtml(user ?? { display_name: "", email: "", plan: "free" }, config.publicBaseUrl, c.get("cspNonce"), page));
  };

  app.get("/dashboard", (c) => dashboardPage(c, "overview"));
  app.get("/bots", (c) => dashboardPage(c, "bots"));
  app.get("/offers", (c) => dashboardPage(c, "offers"));
  app.get("/commands", (c) => dashboardPage(c, "commands"));
  app.get("/broadcasts", (c) => dashboardPage(c, "broadcasts"));
  app.get("/settings", (c) => dashboardPage(c, "settings"));

  return app;
}
