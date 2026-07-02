// ------------------------------------------------------------------
// Streamer dashboard: Telegram Login auth + self-serve UI.
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
// is a random opaque id; KV maps sess:<token> -> user UUID in the SESSIONS
// namespace, which is bound to the SAME id as the leaderboard Worker so one
// login works across both Workers. Cookie name gm_session, Domain=.yourrank.site.
// (Replaces the old HMAC-signed stateless `sess` cookie, which could not be
// verified cross-Worker and gave no real server-side logout.)
// ------------------------------------------------------------------
import { Hono } from "hono";
import { config } from "./config.js";
import { one, query } from "./db.js";
import { encryptToken, newLinkSlug, newPostbackKey, newWebhookSecret } from "./crypto.js";
import { getMe, setWebhook } from "./telegram.js";
import { PLANS, checkFeature, withPlanLimit, getUserPlan, type PlanTier } from "./plans.js";
import { billingEnabled, createStarsInvoice } from "./billing.js";
import {
  createSession,
  destroySession,
  cookieSet,
  cookieClear,
  currentUserId,
  readToken,
  type SessionEnv,
} from "../../../shared/session.js";
import { shellNavHtml, SHELL_NAV_CSS } from "../../../shared/shell-nav.js";

// ---------------- telegram login verification ----------------

interface TgLogin {
  id: number; first_name?: string; last_name?: string; username?: string;
  photo_url?: string; auth_date: number; hash: string;
}

// ---------------- CSRF defense (same-origin check) ----------------
// The session cookie is HttpOnly; Secure; SameSite=Lax, which already blocks
// the cookie from riding along on cross-site POST/PATCH. This is a second,
// tokenless layer: reject state-changing requests whose Origin isn't us.
// Browsers always send Origin on cross-origin (and same-origin non-GET)
// requests; a missing Origin is allowed (native clients, curl) since those
// aren't the CSRF threat model (no ambient cookie from a victim's browser).
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // no browser Origin -> not a cross-site form/fetch
  try {
    return new URL(origin).host === new URL(config.publicBaseUrl).host;
  } catch {
    return false;
  }
}

// Telegram Login widget payloads are a one-shot signed snapshot. There's no
// server nonce, so the only replay defense is freshness: reject any payload
// whose auth_date is older than this. 5 minutes is generous for a user
// clicking the widget then our POST firing; 24h (the previous value) let a
// captured payload be replayed for a full day.
const AUTH_MAX_AGE_S = 5 * 60;

async function verifyTelegramLogin(data: TgLogin, botToken: string): Promise<boolean> {
  const { hash, ...fields } = data;
  const checkString = Object.keys(fields).sort()
    .filter((k) => (fields as any)[k] !== undefined)
    .map((k) => `${k}=${(fields as any)[k]}`).join("\n");
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(checkString));
  const expected = Buffer.from(sig).toString("hex");
  // Constant-time compare so a guessed hash can't be distinguished from a real
  // one by response timing. (Web Crypto doesn't ship subtle timing in JS, but
  // a plain === short-circuits on length difference, which leaks the length.)
  const ok = expected.length === hash.length;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ (ok ? hash.charCodeAt(i) : 0);
  const sigMatch = diff === 0;
  // Reject stale login attempts: a captured widget payload is only good briefly.
  const fresh = Date.now() / 1000 - Number(data.auth_date) < AUTH_MAX_AGE_S;
  return sigMatch && fresh;
}

// ---------------- app ----------------

// The Workers env is passed straight through as Hono's `c.env` (see worker.ts:
// `app.fetch(req, env as any)`), so the shared SESSIONS KV binding declared in
// wrangler.toml is reachable as `c.env.SESSIONS`.
type DashBindings = SessionEnv & Record<string, unknown>;

export function buildDashboard(): Hono<{ Bindings: DashBindings }> {
  const app = new Hono<{ Bindings: DashBindings }>();

  // ---- auth ----
  app.post("/auth/telegram", async (c) => {
    if (!sameOrigin(c.req.raw)) return c.json({ error: "cross-origin request rejected" }, 403);
    const loginBotToken = process.env.LOGIN_BOT_TOKEN;
    if (!loginBotToken) return c.json({ error: "telegram login not configured" }, 501);
    const data = await c.req.json<TgLogin>();
    if (!(await verifyTelegramLogin(data, loginBotToken)))
      return c.json({ error: "bad telegram signature" }, 401);

    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || String(data.id);
    const row = (await one<{ id: string }>(
      `INSERT INTO users (telegram_user_id, display_name)
       VALUES ($1, $2)
       ON CONFLICT (telegram_user_id) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()
       RETURNING id`,
      [data.id, name]
    ))!;
    const token = await createSession(c.env, row.id);
    c.header("Set-Cookie", cookieSet(token));
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
    c.header("Set-Cookie", cookieSet(token));
    return c.json({ ok: true });
  });

  app.post("/auth/logout", async (c) => {
    await destroySession(c.env, readToken(c.req.raw));
    c.header("Set-Cookie", cookieClear());
    return c.json({ ok: true });
  });

  // ---- session-scoped API ----
  const api = new Hono<{ Bindings: DashBindings; Variables: { uid: string } }>();
  api.use("*", async (c, next) => {
    // CSRF: block cross-site state-changing calls that ride the session cookie.
    // GET/HEAD are safe (read-only) and skipped.
    if (c.req.method !== "GET" && c.req.method !== "HEAD" && !sameOrigin(c.req.raw)) {
      return c.json({ error: "cross-origin request rejected" }, 403);
    }
    const uid = await currentUserId(c.req.raw, c.env);
    if (!uid) return c.json({ error: "not logged in" }, 401);
    // Re-check suspended status on EVERY request, not just at login. The shared
    // KV session lives up to 30 days and currentUserId() only resolves the token
    // -> UUID; without this, an admin-suspended streamer's existing session keeps
    // working (managing bots/offers/broadcasts) until the TTL expires.
    const u = await one<{ status: string }>(`SELECT status FROM users WHERE id = $1`, [uid]);
    if (!u) return c.json({ error: "not logged in" }, 401);
    if (u.status === "suspended") return c.json({ error: "account suspended" }, 403);
    c.set("uid", uid);
    await next();
  });

  api.get("/me", async (c) => {
    const me = await one(
      `SELECT id, display_name, telegram_user_id, plan, created_at FROM users WHERE id = $1`,
      [c.get("uid")]
    );
    return me ? c.json(me) : c.json({ error: "gone" }, 401);
  });

  api.get("/offers", async (c) => {
    // Click totals come from the pre-aggregated click_daily rollup (the nightly
    // cron rolls raw clicks into it), NOT a full scan of the raw partitioned
    // clicks table — which grows unbounded and made this query slow at scale.
    //
    // click_daily is complete up to yesterday; today's clicks aren't rolled
    // yet, so we add today's rows from the (small) current-day raw partition.
    // Per-short_link totals are summed first, then joined onto offers, so the
    // offer<->short_link fan-out never double-counts.
    return c.json(await query(
      `WITH link_clicks AS (
         SELECT sl.id AS short_link_id,
                coalesce(sum(cd.clicks), 0)::int        AS clicks,
                coalesce(sum(cd.unique_clicks), 0)::int AS unique_clicks
           FROM short_links sl
           LEFT JOIN click_daily cd ON cd.short_link_id = sl.id
          GROUP BY sl.id
       ),
       today_clicks AS (
         SELECT cl.short_link_id,
                count(*)::int                                AS clicks,
                count(*) FILTER (WHERE cl.is_unique)::int    AS unique_clicks
           FROM clicks cl
          WHERE cl.ts >= current_date
          GROUP BY cl.short_link_id
       )
       SELECT o.id, o.label, ca.name AS casino, o.promo_code, o.bonus_text,
              o.is_active, o.priority, sl.slug,
              (coalesce(lc.clicks, 0) + coalesce(tc.clicks, 0))::int               AS clicks,
              (coalesce(lc.unique_clicks, 0) + coalesce(tc.unique_clicks, 0))::int AS unique_clicks
         FROM offers o
         JOIN casinos ca ON ca.id = o.casino_id
         LEFT JOIN short_links sl ON sl.offer_id = o.id
         LEFT JOIN link_clicks  lc ON lc.short_link_id = sl.id
         LEFT JOIN today_clicks tc ON tc.short_link_id = sl.id
        WHERE o.owner_id = $1
        ORDER BY o.priority DESC, o.created_at DESC`,
      [c.get("uid")]
    ));
  });

  api.post("/offers", async (c) => {
    const b = await c.req.json<{
      casino: string; label: string; referral_url: string;
      promo_code?: string; bonus_text?: string;
    }>();
    if (!b.casino || !b.label || !b.referral_url)
      return c.json({ error: "casino, label, referral_url required" }, 400);
    try { new URL(b.referral_url); } catch { return c.json({ error: "referral_url must be a valid URL" }, 400); }
    const uid = c.get("uid");

    // count-check + the inserts run atomically under a per-user advisory lock
    // so two concurrent create-offer requests can't both pass the count and
    // both insert (TOCTOU plan-limit bypass).
    const out = await withPlanLimit(uid, "offers", async (tx) => {
      const slug = b.casino.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const casinoRow = (await tx.one<{ id: string }>(
        `INSERT INTO casinos (slug, name, is_global, created_by) VALUES ($1, $2, false, $3)
         ON CONFLICT (slug) DO UPDATE SET name = casinos.name RETURNING id`,
        [slug, b.casino, uid]
      ))!;
      const offer = (await tx.one<{ id: string }>(
        `INSERT INTO offers (owner_id, casino_id, label, referral_url, promo_code, bonus_text)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [uid, casinoRow.id, b.label, b.referral_url, b.promo_code ?? null, b.bonus_text ?? null]
      ))!;
      const linkSlug = newLinkSlug();
      await tx.query(`INSERT INTO short_links (offer_id, slug, source) VALUES ($1, $2, 'telegram')`, [offer.id, linkSlug]);
      return { offer_id: offer.id, tracked_link: `${config.publicBaseUrl}/r/${linkSlug}` };
    });
    if ("error" in out) return c.json({ error: out.error }, 402);
    return c.json(out.result);
  });

  api.patch("/offers/:id", async (c) => {
    const { is_active } = await c.req.json<{ is_active: boolean }>();
    const row = await one(
      `UPDATE offers SET is_active = $1, updated_at = now()
        WHERE id = $2 AND owner_id = $3 RETURNING id, is_active`,
      [is_active, c.req.param("id"), c.get("uid")]
    );
    return row ? c.json(row) : c.json({ error: "not found" }, 404);
  });

  api.get("/stats/daily", async (c) => {
    return c.json(await query(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
              coalesce(count(cl.*), 0)::int AS clicks,
              coalesce(count(cl.*) FILTER (WHERE cl.is_unique), 0)::int AS unique_clicks
         FROM generate_series(current_date - 13, current_date, '1 day') AS d(day)
         LEFT JOIN (
             SELECT cl.ts, cl.is_unique FROM clicks cl
               JOIN short_links sl ON sl.id = cl.short_link_id
               JOIN offers o ON o.id = sl.offer_id
              WHERE o.owner_id = $1 AND cl.ts > current_date - 14
         ) cl ON cl.ts::date = d.day
        GROUP BY d.day ORDER BY d.day`,
      [c.get("uid")]
    ));
  });

  api.get("/bots", async (c) => {
    return c.json(await query(
      `SELECT id, username, token_hint, status, created_at FROM bots WHERE owner_id = $1 ORDER BY created_at DESC`,
      [c.get("uid")]
    ));
  });

  api.post("/bots", async (c) => {
    const { token, welcome_message } = await c.req.json<{ token: string; welcome_message?: string }>();
    if (!token) return c.json({ error: "token required" }, 400);
    // Validate the token with Telegram BEFORE taking a DB lock/transaction —
    // don't hold a Postgres advisory lock across an external HTTP call.
    let me;
    try { me = await getMe(token); }
    catch { return c.json({ error: "Telegram rejected that token — double-check it in @BotFather" }, 400); }

    const uid = c.get("uid");
    const secret = newWebhookSecret();
    const encToken = await encryptToken(token);
    // count-check + INSERT run atomically under a per-user advisory lock so two
    // concurrent connect-bot requests can't both pass the count and both insert.
    const out = await withPlanLimit(uid, "bots", async (tx) => {
      const row = (await tx.one<{ id: string; username: string }>(
        `INSERT INTO bots (owner_id, tg_bot_id, username, token_encrypted, token_hint, webhook_secret, status, welcome_message)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
         ON CONFLICT (tg_bot_id) DO UPDATE
           SET token_encrypted = EXCLUDED.token_encrypted, token_hint = EXCLUDED.token_hint,
               webhook_secret = EXCLUDED.webhook_secret, status = 'active', updated_at = now()
         RETURNING id, username`,
        [uid, me.id, me.username, encToken, token.slice(-4), secret, welcome_message ?? null]
      ))!;
      return { bot_id: row.id, username: row.username, secret };
    });
    if ("error" in out) return c.json({ error: out.error }, 402);
    // setWebhook AFTER the transaction commits — don't hold the lock across HTTP.
    await setWebhook(token, `${config.publicBaseUrl}/hook/${out.result.secret}`, out.result.secret);
    return c.json({ bot_id: out.result.bot_id, username: out.result.username, try_it: `https://t.me/${out.result.username}` });
  });

  // ---- plan & billing ----
  api.get("/plan", async (c) => {
    const plan = await getUserPlan(c.get("uid"));
    return c.json({
      current: plan,
      billing_enabled: billingEnabled(),
      plans: Object.values(PLANS),
    });
  });

  api.post("/billing/checkout", async (c) => {
    if (!billingEnabled()) return c.json({ error: "billing not configured on this deployment" }, 400);
    const { plan } = await c.req.json<{ plan: PlanTier }>();
    if (!PLANS[plan] || PLANS[plan].starsPrice <= 0) return c.json({ error: "invalid plan" }, 400);
    const link = await createStarsInvoice(c.get("uid"), plan);
    return c.json({ invoice_link: link });
  });

  // ---- broadcasts ----
  api.get("/broadcasts", async (c) => {
    return c.json(await query(
      `SELECT b.id, b.body, b.status, b.scheduled_at, b.sent_at,
              b.total_count, b.sent_count, b.fail_count, bo.username AS bot_username
         FROM broadcasts b JOIN bots bo ON bo.id = b.bot_id
        WHERE bo.owner_id = $1
        ORDER BY b.created_at DESC LIMIT 20`,
      [c.get("uid")]
    ));
  });

  api.post("/broadcasts", async (c) => {
    const uid = c.get("uid");
    const gateErr = await checkFeature(uid, "broadcasts");
    if (gateErr) return c.json({ error: gateErr }, 402);

    const { bot_id, body, scheduled_at } = await c.req.json<{
      bot_id: string; body: string; scheduled_at?: string;
    }>();
    if (!bot_id || !body?.trim()) return c.json({ error: "bot_id and body required" }, 400);

    const bot = await one(`SELECT id FROM bots WHERE id = $1 AND owner_id = $2`, [bot_id, uid]);
    if (!bot) return c.json({ error: "bot not found" }, 404);

    const row = await one(
      `INSERT INTO broadcasts (bot_id, body, status, scheduled_at)
       VALUES ($1, $2, 'scheduled', $3)
       RETURNING id, status`,
      [bot_id, body.trim(), scheduled_at ?? null]
    );
    return c.json(row);
  });

  // ---- postbacks ----
  api.post("/postback-key", async (c) => {
    const uid = c.get("uid");
    const gateErr = await checkFeature(uid, "postbacks");
    if (gateErr) return c.json({ error: gateErr }, 402);
    const existing = await one<{ postback_key: string | null }>(
      `SELECT postback_key FROM users WHERE id = $1`, [uid]
    );
    let key = existing?.postback_key;
    if (!key) {
      key = newPostbackKey();
      await query(`UPDATE users SET postback_key = $1 WHERE id = $2`, [key, uid]);
    }
    return c.json({ postback_url: `${config.publicBaseUrl}/pb/${key}` });
  });

  api.get("/conversions", async (c) => {
    return c.json(await query(
      `SELECT cv.event, cv.amount, cv.currency, cv.click_ref,
              to_char(cv.ts, 'MM-DD HH24:MI') AS at, o.label AS offer
         FROM conversions cv LEFT JOIN offers o ON o.id = cv.offer_id
        WHERE cv.owner_id = $1
        ORDER BY cv.ts DESC LIMIT 25`,
      [c.get("uid")]
    ));
  });

  app.route("/dash/api", api);

  // ---- HTML ----
  app.get("/dashboard", async (c) => {
    const uid = await currentUserId(c.req.raw, c.env);
    const loginBotUsername = process.env.LOGIN_BOT_USERNAME ?? "";
    const devLogin = process.env.ALLOW_DEV_LOGIN === "1";
    if (!uid) return c.html(loginHtml(loginBotUsername, devLogin));
    // Fetch the user row for the shared nav (name + plan badge).
    const user = await one<{ display_name: string; email: string; plan: string }>(
      `SELECT display_name, email, plan FROM users WHERE id=$1`,
      [uid]
    );
    return c.html(appHtml(user ?? { display_name: "", email: "", plan: "free" }));
  });

  return app;
}

// ---------------- templates ----------------

const BASE_CSS = `
  :root { --bg:#0d1117; --panel:#161b22; --border:#30363d; --fg:#e6edf3; --dim:#8b949e;
          --accent:#f0b429; --green:#3fb950; --red:#f85149; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--fg); font:15px/1.5 -apple-system,'Segoe UI',Roboto,sans-serif; }
  .wrap { max-width:960px; margin:0 auto; padding:24px 16px; }
  .panel { background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:20px; margin-bottom:20px; }
  h1 { font-size:20px; } h2 { font-size:16px; margin-bottom:12px; color:var(--accent); }
  input, textarea { width:100%; background:var(--bg); color:var(--fg); border:1px solid var(--border);
          border-radius:6px; padding:8px 10px; margin-bottom:10px; font:inherit; }
  button { background:var(--accent); color:#000; border:0; border-radius:6px; padding:8px 16px;
           font:600 14px/1 inherit; cursor:pointer; }
  button.ghost { background:transparent; color:var(--dim); border:1px solid var(--border); }
  table { width:100%; border-collapse:collapse; font-size:14px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid var(--border); }
  th { color:var(--dim); font-weight:500; }
  .muted { color:var(--dim); } .ok { color:var(--green); } .off { color:var(--red); }
  .row { display:flex; gap:16px; flex-wrap:wrap; } .row > * { flex:1; min-width:220px; }
  .stat { font-size:28px; font-weight:700; } .copy { cursor:pointer; text-decoration:underline dotted; }
  #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--accent);
           color:#000; padding:10px 18px; border-radius:8px; font-weight:600; display:none; }
`;

function escHtml(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[ch]);
}

function loginHtml(botUsername: string, devLogin: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard — Login</title><style>${BASE_CSS}
  .center { min-height:90vh; display:flex; align-items:center; justify-content:center; }
  .card { text-align:center; max-width:380px; }
</style></head><body>
<div class="center"><div class="panel card">
  <h1 style="margin-bottom:8px">🎰 Streamer Dashboard</h1>
  <p class="muted" style="margin-bottom:20px">Manage your bot, offers and click stats.</p>
  ${botUsername
    ? `<script async src="https://telegram.org/js/telegram-widget.js?22"
         data-telegram-login="${escHtml(botUsername)}" data-size="large"
         data-onauth="onTgAuth(user)" data-request-access="write"></script>`
    : `<p class="muted">Telegram login isn't configured yet (set LOGIN_BOT_TOKEN + LOGIN_BOT_USERNAME).</p>`}
  ${devLogin ? `
  <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:16px">
    <p class="muted" style="margin-bottom:8px">Dev login</p>
    <input id="devid" type="number" placeholder="Telegram user id">
    <button onclick="devLogin()">Enter</button>
  </div>` : ""}
</div></div>
<script>
async function onTgAuth(user) {
  const r = await fetch('/bot/auth/telegram', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(user)});
  if (r.ok) location.reload(); else alert('Login failed: ' + (await r.json()).error);
}
async function devLogin() {
  const id = Number(document.getElementById('devid').value);
  if (!id) return;
  const r = await fetch('/bot/auth/dev', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({telegram_user_id:id})});
  if (r.ok) location.reload(); else alert('Failed');
}
</script></body></html>`;
}

function appHtml(user: { display_name: string; email: string; plan: string }): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Streamer Dashboard</title><style>${SHELL_NAV_CSS}${BASE_CSS}</style></head><body>
${shellNavHtml({ activePath: "/bot/dashboard", user })}
<div class="wrap">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
    <h1>🎰 Streamer Dashboard</h1>
    <div><span id="whoami" class="muted"></span>
    <button class="ghost" onclick="logout()" style="margin-left:10px">Log out</button></div>
  </div>

  <div class="row">
    <div class="panel"><h2>Clicks (14d)</h2><div class="stat" id="totClicks">–</div></div>
    <div class="panel"><h2>Unique (14d)</h2><div class="stat" id="totUnique">–</div></div>
    <div class="panel"><h2>Active offers</h2><div class="stat" id="totOffers">–</div></div>
  </div>

  <div class="panel"><h2>Daily clicks</h2><svg id="chart" width="100%" height="120" preserveAspectRatio="none"></svg>
    <div id="chartLabels" class="muted" style="display:flex;justify-content:space-between;font-size:11px"></div></div>

  <div class="panel"><h2>Your bot</h2>
    <div id="botList" class="muted">Loading…</div>
    <div style="margin-top:12px">
      <input id="botToken" placeholder="Paste bot token from @BotFather (123456:ABC-...)">
      <input id="botWelcome" placeholder="Welcome message (optional)">
      <button onclick="connectBot()">Connect bot</button>
    </div>
  </div>

  <div class="panel"><h2>New offer</h2>
    <div class="row">
      <input id="oCasino" placeholder="Casino (e.g. Stake)">
      <input id="oLabel" placeholder="Label (e.g. 200% deposit bonus)">
    </div>
    <input id="oUrl" placeholder="Your affiliate URL (https://...)">
    <div class="row">
      <input id="oCode" placeholder="Promo code (optional)">
      <input id="oBonus" placeholder="Bonus text shown in bot (optional)">
    </div>
    <button onclick="createOffer()">Create offer</button>
  </div>

  <div class="panel"><h2>Offers</h2>
    <table><thead><tr><th>Offer</th><th>Link</th><th>Clicks</th><th>Unique</th><th>Status</th><th></th></tr></thead>
    <tbody id="offers"></tbody></table>
  </div>

  <div class="panel"><h2>Broadcast to subscribers</h2>
    <div id="bcGate" class="muted" style="display:none;margin-bottom:10px"></div>
    <textarea id="bcBody" rows="3" placeholder="Message to all your bot's subscribers (Markdown supported)"></textarea>
    <button onclick="sendBroadcast()">Send broadcast</button>
    <table style="margin-top:14px"><thead><tr><th>Message</th><th>Status</th><th>Sent</th><th>Failed</th></tr></thead>
    <tbody id="bcList"></tbody></table>
  </div>

  <div class="panel"><h2>Conversions (postbacks)</h2>
    <p class="muted" style="margin-bottom:10px">Give your affiliate manager this postback URL and add
      <code>{click_ref}</code> anywhere in your affiliate URL to attribute deposits to clicks.</p>
    <p class="muted" style="margin-bottom:10px;font-size:12px">Your network supports request signing? Use <code>POST ${config.publicBaseUrl}/pb</code> with headers
      <code>X-Postback-Key</code> (your key, below) + <code>X-Postback-Signature</code> (hex HMAC-SHA256 of the query string, keyed by that same key). It's the secure option — the key never rides the URL and the signature blocks tampering.</p>
    <div style="margin-bottom:10px"><button class="ghost" onclick="revealPostback()">Show my postback URL</button>
      <span id="pbUrl" class="copy" style="margin-left:8px"></span></div>
    <table><thead><tr><th>When</th><th>Event</th><th>Amount</th><th>Offer</th></tr></thead>
    <tbody id="convList"></tbody></table>
  </div>

  <div class="panel"><h2>Plan</h2>
    <div id="planInfo" class="muted">Loading…</div>
    <div id="planButtons" style="margin-top:12px"></div>
  </div>
</div>
<div id="toast"></div>
<script>
const $ = (id) => document.getElementById(id);
function toast(msg) { const t=$('toast'); t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none',2500); }
async function api(path, opts) {
  const r = await fetch('/bot/dash/api'+path, opts);
  if (r.status === 401) { location.reload(); throw new Error('session expired'); }
  return r.json();
}
async function logout() { await fetch('/bot/auth/logout',{method:'POST'}); location.reload(); }

async function load() {
  const me = await api('/me');
  $('whoami').textContent = (me.display_name||'') + ' · ' + me.plan;
  const [offers, daily, bots] = await Promise.all([api('/offers'), api('/stats/daily'), api('/bots')]);

  $('totClicks').textContent = daily.reduce((s,d)=>s+d.clicks,0);
  $('totUnique').textContent = daily.reduce((s,d)=>s+d.unique_clicks,0);
  $('totOffers').textContent = offers.filter(o=>o.is_active).length;

  // chart
  const max = Math.max(1, ...daily.map(d=>d.clicks));
  const w = 100/daily.length;
  $('chart').setAttribute('viewBox','0 0 100 40');
  $('chart').innerHTML = daily.map((d,i)=>{
    const h = d.clicks/max*36;
    return '<rect x="'+(i*w+0.5)+'" y="'+(40-h)+'" width="'+(w-1)+'" height="'+h+'" rx="0.6" fill="#f0b429"><title>'+esc(d.day)+': '+esc(String(d.clicks))+'</title></rect>';
  }).join('');
  $('chartLabels').innerHTML = '<span>'+esc(daily[0].day.slice(5))+'</span><span>'+esc(daily[daily.length-1].day.slice(5))+'</span>';

  // bots
  $('botList').innerHTML = bots.length
    ? bots.map(b=>'<div>@'+esc(b.username)+' <span class="muted">(…'+esc(b.token_hint)+')</span> <span class="'+(b.status==='active'?'ok':'off')+'">'+esc(b.status)+'</span></div>').join('')
    : 'No bot connected yet — paste your token below.';

  // offers
  $('offers').innerHTML = offers.map(o=>'<tr>'+
    '<td><b>'+esc(o.casino)+'</b><br><span class="muted">'+esc(o.label)+'</span></td>'+
    '<td>'+(o.slug?'<span class="copy" onclick="copyLink(\\''+escJsAttr(o.slug)+'\\')">'+esc('/r/'+o.slug)+'</span>':'–')+'</td>'+
    '<td>'+esc(String(o.clicks))+'</td><td>'+esc(String(o.unique_clicks))+'</td>'+
    '<td class="'+(o.is_active?'ok':'off')+'">'+(o.is_active?'active':'off')+'</td>'+
    '<td><button class="ghost" onclick="toggleOffer(\\''+escJsAttr(o.id)+'\\','+(!o.is_active)+')">'+(o.is_active?'Disable':'Enable')+'</button></td>'+
  '</tr>').join('') || '<tr><td colspan="6" class="muted">No offers yet.</td></tr>';
}
function esc(s){ return (s??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch])); }
function escJsAttr(s){ return (s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'n').replace(/\r/g,'r'); }
function copyLink(slug){ navigator.clipboard.writeText(location.origin+'/r/'+slug); toast('Link copied'); }
async function toggleOffer(id, on){ await api('/offers/'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({is_active:on})}); load(); }
async function createOffer(){
  const body = { casino:$('oCasino').value.trim(), label:$('oLabel').value.trim(), referral_url:$('oUrl').value.trim(),
                 promo_code:$('oCode').value.trim()||undefined, bonus_text:$('oBonus').value.trim()||undefined };
  const r = await api('/offers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
  if (r.error) return toast(r.error);
  ['oCasino','oLabel','oUrl','oCode','oBonus'].forEach(id=>$(id).value='');
  toast('Offer created'); load();
}
async function connectBot(){
  const token = $('botToken').value.trim();
  if (!token) return toast('Paste a bot token first');
  const r = await api('/bots',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token, welcome_message:$('botWelcome').value.trim()||undefined})});
  if (r.error) return toast(r.error);
  $('botToken').value=''; toast('Bot @'+r.username+' connected'); load();
}

let firstBotId = null;
async function loadExtras(){
  const [plan, bcs, convs, bots] = await Promise.all([api('/plan'), api('/broadcasts'), api('/conversions'), api('/bots')]);
  firstBotId = bots[0]?.id ?? null;

  // plan panel (label comes from the server-side plan table, but escape it as
  // defense-in-depth; the numbers are rendered raw since they're ints).
  const cur = plan.current;
  $('planInfo').innerHTML = '<b style="color:var(--accent)">'+esc(cur.label)+'</b> — up to '+cur.maxBots+' bots, '
    +cur.maxOffers+' offers'+(cur.broadcasts?', broadcasts':'')+(cur.postbacks?', postbacks':'');
  $('planButtons').innerHTML = plan.plans.filter(p=>p.starsPrice>0 && p.tier!==cur.tier).map(p=>
    '<button onclick="upgrade(\\''+escJsAttr(p.tier)+'\\')" style="margin-right:8px">'
    +(plan.billing_enabled?'Upgrade to '+esc(p.label)+' — ⭐'+esc(String(p.starsPrice))+'/30d':esc(p.label)+' (billing not enabled)')+'</button>'
  ).join('');

  // broadcasts panel
  $('bcList').innerHTML = bcs.map(b=>'<tr><td>'+esc(b.body.slice(0,60))+'</td><td>'+esc(b.status)+'</td>'+
    '<td>'+esc(b.sent_count)+'/'+(b.total_count?esc(b.total_count):'?')+'</td><td>'+esc(b.fail_count)+'</td></tr>').join('')
    || '<tr><td colspan="4" class="muted">No broadcasts yet.</td></tr>';

  // conversions panel — amount/currency/at come from casino postbacks (external
  // input), so every field is escaped, not just the event name.
  $('convList').innerHTML = convs.map(v=>'<tr><td>'+esc(v.at)+'</td><td>'+esc(v.event)+'</td>'+
    '<td>'+(v.amount?esc(v.amount)+' '+esc(v.currency):'–')+'</td><td>'+esc(v.offer||'–')+'</td></tr>').join('')
    || '<tr><td colspan="4" class="muted">No conversions reported yet.</td></tr>';
}
async function sendBroadcast(){
  const body = $('bcBody').value.trim();
  if (!body) return toast('Write a message first');
  if (!firstBotId) return toast('Connect a bot first');
  const r = await api('/broadcasts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bot_id:firstBotId, body})});
  if (r.error) return toast(r.error);
  $('bcBody').value=''; toast('Broadcast queued'); loadExtras();
}
async function revealPostback(){
  const r = await api('/postback-key',{method:'POST'});
  if (r.error) return toast(r.error);
  $('pbUrl').textContent = r.postback_url + '?event=deposit&amount=50&click_ref=XXX';
  $('pbUrl').onclick = ()=>{ navigator.clipboard.writeText(r.postback_url); toast('Postback URL copied'); };
}
async function upgrade(tier){
  const r = await api('/billing/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:tier})});
  if (r.error) return toast(r.error);
  window.open(r.invoice_link, '_blank');
}
load(); loadExtras();
</script></body></html>`;
}
