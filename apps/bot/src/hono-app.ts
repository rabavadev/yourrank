import { Hono } from "hono";
import type { Update } from "grammy/types";
import { config } from "./config.js";
import { one, query } from "./db.js";
import { encryptToken, newClickRef, newLinkSlug, newWebhookSecret, verifyHmacSha256Hex } from "./crypto.js";
import { getBotBySecret, handleUpdateForBot } from "./botEngine.js";
import { getMe, setWebhook } from "./telegram.js";
import { buildDashboard } from "./dashboard.js";
import { logClick } from "./clicks.js";
import { billingEnabled, handleBillingUpdate, setupBillingWebhook } from "./billing.js";
import { withPlanLimit } from "./plans.js";
import { rateLimit, type RateLimitKV } from "./ratelimit.js";

// Constant-time string compare for secrets (webhook tokens, API keys). A plain
// !== short-circuits on the first differing byte, leaking how close a guess is
// via timing. safeEqual always compares the full expected length.
function safeEqual(a: string, b: string): boolean {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    diff |= (sa.charCodeAt(i) ?? 0) ^ (sb.charCodeAt(i) ?? 0);
  }
  return diff === 0;
}

/**
 * Insert a conversion row from a casino postback. Shared by the legacy
 * GET|POST /pb/:key path (key in the URL, no signature) and the new signed
 * POST /pb path (key in X-Postback-Key header + HMAC in X-Postback-Signature).
 * `ownerId` is resolved by the caller; `q` is the parsed query object.
 */
type PostbackQuery = Record<string, string | string[]>;
async function recordConversion(ownerId: string, q: PostbackQuery): Promise<void> {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const clickRef = first(q.click_ref) ?? first(q.clickid) ?? first(q.subid) ?? first(q.sub_id) ?? null;
  const event = (first(q.event) ?? first(q.goal) ?? "deposit").toLowerCase().slice(0, 32);
  // Clamp amount to a non-negative bounded number. Negatives / NaN / absurd
  // values feed revenue/conversion stats and could drive affiliate payouts.
  const rawAmt = first(q.amount) == null ? NaN : Number(first(q.amount));
  const amount = Number.isFinite(rawAmt) && rawAmt >= 0 && rawAmt <= 1e12 ? rawAmt : null;
  const currency = (first(q.currency) ?? "USD").toUpperCase().slice(0, 8);

  // Attribute to an offer via the click ref when possible.
  let offerId: string | null = null;
  if (clickRef) {
    const hit = await one<{ offer_id: string }>(
      `SELECT sl.offer_id FROM clicks cl
         JOIN short_links sl ON sl.id = cl.short_link_id
        WHERE cl.click_ref = $1 LIMIT 1`,
      [clickRef]
    );
    offerId = hit?.offer_id ?? null;
  }

  await query(
    `INSERT INTO conversions (owner_id, offer_id, click_ref, event, amount, currency, raw)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [ownerId, offerId, clickRef, event, amount, currency, JSON.stringify(q)]
  );
}

type Bindings = {
  PUBLIC_BASE_URL: string;
  TOKEN_ENC_KEY: string;
  ADMIN_API_KEY: string;
  IP_HASH_SALT: string;
  DATABASE_URL: string;
  HYPERDRIVE?: { connectionString: string };
  SESSIONS?: RateLimitKV; // shared KV (also used for rate limiting)
};

// Admin API abuse guard: cap attempts per IP so a leaked-endpoint brute force
// against ADMIN_API_KEY can't run unthrottled. Generous enough for real ops use.
const ADMIN_RL_LIMIT = 30; // requests
const ADMIN_RL_WINDOW = 60; // seconds

export function buildHonoApp(): Hono<{ Bindings: Bindings }> {
  const app = new Hono<{ Bindings: Bindings }>();

  // Security headers on ALL responses.
  app.use('*', async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  });

  app.get("/health", (c) => c.json({ ok: true }));

  // =================================================================
  // 1) TELEGRAM WEBHOOK — one endpoint for ALL bots
  // =================================================================
  app.post("/hook/:secret", async (c) => {
    const secret = c.req.param("secret");
    if (!safeEqual(c.req.header("x-telegram-bot-api-secret-token") ?? "", secret)) {
      return c.body(null, 401);
    }
    const row = await getBotBySecret(secret);
    if (!row || row.status === "revoked") return c.body(null, 404);
    const update = await c.req.json<Update>();
    await handleUpdateForBot(row, update);
    return c.body(null, 200);
  });

  // =================================================================
  // 2) TRACKED REDIRECT
  // =================================================================
  app.get("/r/:slug", async (c) => {
    const slug = c.req.param("slug");
    const link = await one<{ id: string; referral_url: string }>(
      `SELECT sl.id, o.referral_url
         FROM short_links sl JOIN offers o ON o.id = sl.offer_id
        WHERE sl.slug = $1 AND o.is_active`,
      [slug]
    );
    if (!link) return c.json({ error: "link not found" }, 404);

    const u = c.req.query("u");
    const tgUserId = u && /^\d+$/.test(u) ? Number(u) : null;
    const country = c.req.header("cf-ipcountry") ?? null;
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";

    // Click reference: substituted into the affiliate URL so casinos
    // can echo it back via postback ({click_ref} or {click_id}).
    const ref = newClickRef();
    const destination = link.referral_url
      .replaceAll("{click_ref}", ref)
      .replaceAll("{click_id}", ref);

    // On Workers, use waitUntil so the click log survives the response.
    // On Node (hono dev), fall back to fire-and-forget.
    let ctx: any = null;
    try { ctx = (c as any).executionCtx; } catch { /* not on Workers */ }
    const bg = ctx?.waitUntil
      ? (p: Promise<unknown>) => ctx.waitUntil(p)
      : (p: Promise<unknown>) => void p.catch(() => {});
    bg(logClick(
      link.id, ip,
      c.req.header("user-agent") ?? null,
      c.req.header("referer") ?? null,
      country, tgUserId, ref
    ));
    return c.redirect(destination);
  });

  // =================================================================
  // 2b) CASINO POSTBACKS
  //     Two equivalent paths to the same recordConversion():
  //       - SIGNED (preferred): POST /pb
  //           X-Postback-Key: <postback_key>
  //           X-Postback-Signature: <hex HMAC-SHA256 of the raw query string,
  //                                  keyed by the postback_key>
  //           ?event=deposit&amount=50&click_ref=x
  //         The key never rides the URL (no access-log/Referer leakage) and the
  //         HMAC means a logged/intercepted request can't be forged or replayed
  //         with new params. Use this once your affiliate networks support it.
  //       - LEGACY (still works, for casinos already configured): GET|POST
  //         /pb/:key?event=deposit&amount=50&click_ref=x — key in the URL path.
  //         Rate-limited per key + amount clamped; no signature. Safe to keep
  //         until every integration migrates, then deprecate.
  // =================================================================
  app.post("/pb", async (c) => {
    const key = c.req.header("x-postback-key");
    const sig = c.req.header("x-postback-signature");
    if (!key || !sig) return c.json({ error: "missing X-Postback-Key / X-Postback-Signature" }, 400);
    // Rate limit per key (same limiter as the legacy path).
    const rl = await rateLimit(c.env.SESSIONS, `pb:${key}`, 120, 60);
    if (!rl.ok) { c.header("Retry-After", String(rl.retryAfter)); return c.json({ error: "rate limited" }, 429); }

    const owner = await one<{ id: string; postback_key: string }>(
      `SELECT id, postback_key FROM users WHERE postback_key = $1`,
      [key]
    );
    if (!owner || !owner.postback_key) return c.json({ error: "unknown key" }, 404);

    // HMAC is over the EXACT query string the casino sent. Hono exposes it via
    // c.req.url's search portion. This binds the signature to the params, so a
    // logged request can't be tampered with (e.g. bump amount/click_ref).
    const qs = new URL(c.req.url).search.slice(1); // without the leading '?'
    const valid = await verifyHmacSha256Hex(owner.postback_key, qs, sig);
    if (!valid) return c.json({ error: "bad signature" }, 401);

    await recordConversion(owner.id, c.req.query() as PostbackQuery);
    return c.json({ ok: true });
  });

  // LEGACY path — key in the URL, unsigned. Kept for integrations already
  // calling GET /pb/:key. See the signed POST /pb above for the upgrade path.
  app.on(["GET", "POST"], "/pb/:key", async (c) => {
    const key = c.req.param("key");
    const rl = await rateLimit(c.env.SESSIONS, `pb:${key}`, 120, 60);
    if (!rl.ok) { c.header("Retry-After", String(rl.retryAfter)); return c.json({ error: "rate limited" }, 429); }

    const owner = await one<{ id: string }>(`SELECT id FROM users WHERE postback_key = $1`, [key]);
    if (!owner) return c.json({ error: "unknown key" }, 404);

    await recordConversion(owner.id, c.req.query() as PostbackQuery);
    return c.json({ ok: true });
  });

  // =================================================================
  // 2c) BILLING WEBHOOK — platform bot (Telegram Stars payments)
  // =================================================================
  app.post("/billing/hook/:secret", async (c) => {
    const secret = c.req.param("secret");
    if (
      !billingEnabled() ||
      !safeEqual(secret, process.env.PLATFORM_WEBHOOK_SECRET ?? "") ||
      !safeEqual(c.req.header("x-telegram-bot-api-secret-token") ?? "", secret)
    ) {
      return c.body(null, 401);
    }
    await handleBillingUpdate(await c.req.json<Update>());
    return c.body(null, 200);
  });

  // =================================================================
  // 3) ADMIN API
  // =================================================================
  const api = new Hono<{ Bindings: Bindings }>();
  api.use("*", async (c, next) => {
    // Rate-limit by client IP BEFORE the key check, so failed attempts count
    // too and a brute force can't fish for the key at full speed.
    const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
    const rl = await rateLimit(c.env.SESSIONS, `admin:${ip}`, ADMIN_RL_LIMIT, ADMIN_RL_WINDOW);
    c.header("X-RateLimit-Limit", String(rl.limit));
    c.header("X-RateLimit-Remaining", String(rl.remaining));
    if (!rl.ok) {
      c.header("Retry-After", String(rl.retryAfter));
      return c.json({ error: "rate limited" }, 429);
    }
    if (!safeEqual(c.req.header("x-api-key") ?? "", config.adminApiKey)) {
      return c.json({ error: "bad api key" }, 401);
    }
    await next();
  });

  api.post("/users", async (c) => {
    const body = await c.req.json<{ email?: string; display_name?: string }>();
    return c.json(await one(
      `INSERT INTO users (email, display_name) VALUES ($1, $2)
       RETURNING id, email, display_name`,
      [body.email ?? null, body.display_name ?? null]
    ));
  });

  api.post("/bots", async (c) => {
    const { owner_id, token, welcome_message } = await c.req.json<{
      owner_id: string; token: string; welcome_message?: string;
    }>();
    if (!owner_id || !token) return c.json({ error: "owner_id and token required" }, 400);
    // Validate the token with Telegram BEFORE taking the DB lock.
    let me;
    try { me = await getMe(token); }
    catch { return c.json({ error: "Telegram rejected that token" }, 400); }
    const secret = newWebhookSecret();
    const encToken = await encryptToken(token);

    const out = await withPlanLimit(owner_id, "bots", async (tx) => {
      const row = await tx.one<{ id: string }>(
        `INSERT INTO bots (owner_id, tg_bot_id, username, token_encrypted,
                           token_hint, webhook_secret, status, welcome_message)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
         ON CONFLICT (tg_bot_id) DO UPDATE
           SET token_encrypted = EXCLUDED.token_encrypted,
               token_hint = EXCLUDED.token_hint,
               webhook_secret = EXCLUDED.webhook_secret,
               status = 'active', updated_at = now()
         RETURNING id`,
        [owner_id, me.id, me.username, encToken, token.slice(-4), secret, welcome_message ?? null]
      );
      return { bot_id: row!.id, secret };
    });
    if ("error" in out) return c.json({ error: out.error }, 402);
    await setWebhook(token, `${config.publicBaseUrl}/hook/${out.result.secret}`, out.result.secret);
    return c.json({ bot_id: out.result.bot_id, username: me.username, webhook: "set", try_it: `https://t.me/${me.username}` });
  });

  api.post("/offers", async (c) => {
    const body = await c.req.json<{
      owner_id: string; casino: string; label: string; referral_url: string;
      promo_code?: string; bonus_text?: string; priority?: number;
    }>();
    if (!body.owner_id || !body.casino || !body.label || !body.referral_url)
      return c.json({ error: "owner_id, casino, label, referral_url required" }, 400);
    try { new URL(body.referral_url); } catch { return c.json({ error: "referral_url must be a valid URL" }, 400); }

    const out = await withPlanLimit(body.owner_id, "offers", async (tx) => {
      const slug = body.casino.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const casinoRow = (await tx.one<{ id: string }>(
        `INSERT INTO casinos (slug, name, is_global, created_by)
         VALUES ($1, $2, false, $3)
         ON CONFLICT (slug) DO UPDATE SET name = casinos.name RETURNING id`,
        [slug, body.casino, body.owner_id]
      ))!;
      const offer = (await tx.one<{ id: string }>(
        `INSERT INTO offers (owner_id, casino_id, label, referral_url, promo_code, bonus_text, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [body.owner_id, casinoRow.id, body.label, body.referral_url,
         body.promo_code ?? null, body.bonus_text ?? null, body.priority ?? 0]
      ))!;
      const linkSlug = newLinkSlug();
      await tx.query(
        `INSERT INTO short_links (offer_id, slug, source) VALUES ($1, $2, 'telegram')`,
        [offer.id, linkSlug]
      );
      return { offer_id: offer.id, tracked_link: `${config.publicBaseUrl}/r/${linkSlug}` };
    });
    if ("error" in out) return c.json({ error: out.error }, 402);
    return c.json(out.result);
  });

  api.get("/stats", async (c) => {
    const owner_id = c.req.query("owner_id");
    const rawDays = Number(c.req.query("days") ?? "7");
    const days = Number.isFinite(rawDays) && rawDays >= 1 && rawDays <= 365 ? rawDays : 7;
    if (!owner_id) return c.json({ error: "owner_id required" }, 400);
    return c.json(await query(
      `SELECT o.label, c.name AS casino,
              count(cl.*)::int AS clicks,
              count(cl.*) FILTER (WHERE cl.is_unique)::int AS unique_clicks
         FROM offers o JOIN casinos c ON c.id = o.casino_id
         LEFT JOIN short_links sl ON sl.offer_id = o.id
         LEFT JOIN clicks cl ON cl.short_link_id = sl.id AND cl.ts > now() - make_interval(days => $2::int)
        WHERE o.owner_id = $1
        GROUP BY o.id, o.label, c.name ORDER BY clicks DESC`,
      [owner_id, days]
    ));
  });

  // One-time setup: point the platform bot's webhook here (admin only).
  api.post("/billing/setup", async (c) => {
    if (!billingEnabled())
      return c.json({ error: "set PLATFORM_BOT_TOKEN and PLATFORM_WEBHOOK_SECRET first" }, 400);
    await setupBillingWebhook(config.publicBaseUrl);
    return c.json({ ok: true, webhook: `${config.publicBaseUrl}/billing/hook/***` });
  });

  app.route("/api", api);

  // =================================================================
  // 4) STREAMER DASHBOARD (Telegram Login + self-serve UI)
  //    Mounted under /bot so it never collides with the leaderboard
  //    Worker, which owns the root of yourrank.site. Cloudflare routes
  //    /bot/* to this Worker (see wrangler.toml).
  // =================================================================
  app.route("/bot", buildDashboard());
  app.get("/bot", (c) => c.redirect("/bot/dashboard"));

  return app;
}
