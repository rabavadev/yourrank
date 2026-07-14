import { Hono } from "hono";
import type { Update } from "grammy/types";
import { config } from "./config.js";
import { exec, one, query } from "../../../shared/db.js";
import { safeEqual, encryptToken, reencryptToken, isCurrentVersion, newClickRef, newLinkSlug, newWebhookSecret, verifyHmacSha256Hex } from "../../../shared/crypto.js";
import { getBotBySecret, handleUpdateForBot } from "./botEngine.js";
import { getMe, setWebhook } from "./telegram.js";
import { buildDashboard } from "./dashboard.js";
import { logClick } from "./clicks.js";
import { billingEnabled, handleBillingUpdate, setupBillingWebhook } from "./billing.js";
import { withPlanLimit } from "./plans.js";
import { rateLimit, type RateLimitKV } from "./ratelimit.js";
import { createQueueProducer, type QueueEvent } from "../../../shared/queue-producer.js";
import { recordConversion, type PostbackQuery } from "../../../shared/conversions.js";

type Bindings = {
  PUBLIC_BASE_URL: string;
  TOKEN_ENC_KEY: string;
  ADMIN_API_KEY: string;
  IP_HASH_SALT: string;
  DATABASE_URL: string;
  HYPERDRIVE?: { connectionString: string };
  SESSIONS?: RateLimitKV;
  RATE_LIMITER_DO?: any;
  RL_BACKEND?: string;
  EVENTS_QUEUE?: { send: (message: unknown) => Promise<void> };
  DISCORD_MONITORING_WEBHOOK?: string;
};

// Admin API abuse guard: cap attempts per IP so a leaked-endpoint brute force
// against ADMIN_API_KEY can't run unthrottled. Generous enough for real ops use.
const ADMIN_RL_LIMIT = 30; // requests
const ADMIN_RL_WINDOW = 60; // seconds

const HSTS_MAX_AGE = 31536000; // 1 year

export function buildHonoApp(): Hono<{ Bindings: Bindings }> {
  const app = new Hono<{ Bindings: Bindings }>();

  // Global error handler — Hono's default returns text/plain "Internal Server
  // Error" which the dashboard's api() client can't JSON-parse, producing a
  // silent "Server error (500)" toast with no actionable message.
  // This ensures ALL unhandled throws return {"error":"..."} JSON.
  app.onError((err, c) => {
    const msg = (err as any)?.message ?? String(err);
    const stack = (err as any)?.stack ?? "";
    console.error("[unhandled error]", msg, stack);
    return c.json({ error: msg, stack: stack.split("\n").slice(0, 5).join("\n") }, 500);
  });

  // BE-004: Reject oversized request bodies early, before any parsing.
  // 1 MB cap — generous for JSON payloads while blocking multi-MB abuse.
  // Body size guard — check content-length for bounded requests, and rely on
  // Cloudflare Workers' built-in body size limit (100MB) for chunked encoding.
  app.use('*', async (c, next) => {
    if (c.req.method === 'POST' || c.req.method === 'PUT') {
      const cl = c.req.header('content-length');
      if (cl && Number(cl) > 1_000_000) {
        return c.text('payload too large', 413);
      }
      // For chunked encoding (no content-length), we can't pre-check size.
      // Cloudflare Workers enforce a100MB body limit upstream.
    }
    await next();
  });

  // Security headers on ALL responses.
  app.use('*', async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', `max-age=${HSTS_MAX_AGE}; includeSubDomains`);
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  });

  // Health check — reachable at /bot/health (Cloudflare routes /bot/* to this Worker)
  app.get("/bot/health", async (c) => {
    try {
      await one('SELECT 1 AS ok');
      return c.json({ ok: true, db: true });
    } catch {
      return c.json({ ok: false, db: false }, 503);
    }
  });

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
    await handleUpdateForBot(row, update, c.env);
    return c.body(null, 200);
  });

  // =================================================================
  // 2) TRACKED REDIRECT
  // =================================================================
  app.get("/r/:slug", async (c) => {
      const ip = c.req.header("cf-connecting-ip") ?? "0.0.0.0";
      // BE-005: Rate limit redirects to prevent click fraud amplification
      const rl = await rateLimit(c.env, `redirect:${ip}`, 200, 60);
      if (!rl.ok) return c.json({ error: "rate limit exceeded" }, 429);

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

    // Click reference:
    // can echo it back via postback ({click_ref} or {click_id}).
    const ref = newClickRef();
    const destination = link.referral_url
      .replaceAll("{click_ref}", ref)
      .replaceAll("{click_id}", ref);

    // Enqueue click event to Cloudflare Queue (or fall back to direct write).
    const queueProducer = createQueueProducer(
      c.env.EVENTS_QUEUE,
      async (event: QueueEvent) => {
        if (event.type !== "click") return;
        await logClick(event.shortLinkId, event.ip, event.userAgent, event.referer, event.country, event.tgUserId, event.clickRef);
      }
    );
    let ctx: any = null;
    try { ctx = (c as any).executionCtx; } catch { /* not on Workers */ }
    const bg = ctx?.waitUntil
      ? (p: Promise<unknown>) => ctx.waitUntil(p)
      : (p: Promise<unknown>) => void p.catch((err) => { console.error("[clickLog]: background logging failed", err); });
    bg(queueProducer.send({
      type: "click",
      shortLinkId: link.id,
      ip,
      userAgent: c.req.header("user-agent") ?? null,
      referer: c.req.header("referer") ?? null,
      country,
      tgUserId,
      clickRef: ref,
      timestamp: Date.now(),
    }));
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
    const rl = await rateLimit(c.env, `pb:${key}`, 120, 60);
    if (!rl.ok) { c.header("Retry-After", String(rl.retryAfter)); return c.json({ error: "rate limited" }, 429); }

    const owner = await one<{ id: string; postback_key: string }>(
      `SELECT id, postback_key FROM users WHERE postback_key = $1`,
      [key]
    );
    if (!owner) return c.json({ error: "unknown key" }, 404);

    // HMAC is over the EXACT query string the casino sent. Hono exposes it via
    // c.req.url's search portion. This binds the signature to the params, so a
    // logged request can't be tampered with (e.g. bump amount/click_ref).
    const qs = new URL(c.req.url).search.slice(1); // without the leading '?'
    // Use the plaintext key for HMAC verification (same value, just also stored encrypted)
    const valid = await verifyHmacSha256Hex(owner.postback_key, qs, sig);
    if (!valid) return c.json({ error: "bad signature" }, 401);

    await recordConversion(owner.id, c.req.query() as PostbackQuery);
    return c.json({ ok: true });
  });

  // LEGACY path — key in the URL, unsigned. Kept for integrations already
  // calling GET /pb/:key. See the signed POST /pb above for the upgrade path.
  // DEPRECATED: migrate to POST /pb with X-Postback-Key + X-Postback-Signature.
  app.on(["GET", "POST"], "/pb/:key", async (c) => {
    const key = c.req.param("key");
    const rl = await rateLimit(c.env, `pb:${key}`, 30, 60);
    if (!rl.ok) { c.header("Retry-After", String(rl.retryAfter)); return c.json({ error: "rate limited" }, 429); }
    c.header("Deprecation", "true");
    c.header("Sunset", "2026-10-01");
    c.header("Link", '</pb>; rel="successor-version"');

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
    const rl = await rateLimit(c.env, `admin:${ip}`, ADMIN_RL_LIMIT, ADMIN_RL_WINDOW);
    c.header("X-RateLimit-Limit", String(rl.limit));
    c.header("X-RateLimit-Remaining", String(rl.remaining));
    if (!rl.ok) {
      c.header("Retry-After", String(rl.retryAfter));
      return c.json({ error: "rate limited" }, 429);
    }
    const adminKey = config.adminApiKey;
      const apiKeyHeader = c.req.header("x-api-key") ?? "";
      if (!adminKey || !apiKeyHeader || !safeEqual(apiKeyHeader, adminKey)) {
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
    let encToken: Buffer;
    try { encToken = await encryptToken(token); }
    catch (err) {
      console.error("[admin POST /bots] encryptToken failed:", String((err as any)?.message ?? err));
      return c.json({ error: "Server configuration error — TOKEN_ENC_KEY may be invalid" }, 500);
    }

    let out: { error: string } | { result: { bot_id: string; secret: string } };
    try {
      out = await withPlanLimit(owner_id, "bots", async (tx) => {
        const row = await tx.one<{ id: string }>(
          `INSERT INTO bots (owner_id, tg_bot_id, username, token_encrypted,
                             token_hint, webhook_secret, status, welcome_message)
           VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
           ON CONFLICT (tg_bot_id) DO UPDATE
             SET owner_id = EXCLUDED.owner_id,
                 username = EXCLUDED.username,
                 token_encrypted = EXCLUDED.token_encrypted,
                 token_hint = EXCLUDED.token_hint,
                 webhook_secret = EXCLUDED.webhook_secret,
                 status = 'active',
                 welcome_message = COALESCE(EXCLUDED.welcome_message, bots.welcome_message),
                 updated_at = now()
           RETURNING id`,
          [owner_id, me.id, me.username, encToken, token.slice(-4), secret, welcome_message ?? null]
        );
        return { bot_id: row!.id, secret };
      });
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      console.error("[admin POST /bots] DB error:", msg);
      return c.json({ error: "Database error — please try again in a moment" }, 500);
    }
    if ("error" in out) return c.json({ error: out.error }, 402);
    let webhookOk = true;
    try {
      await setWebhook(token, `${config.publicBaseUrl}/hook/${out.result.secret}`, out.result.secret, {
        dropPendingUpdates: true, // Onboarding: drop queued updates for clean start
        allowedUpdates: ["message", "callback_query"],
      });
    } catch (err) {
      console.error("[admin POST /bots] setWebhook failed:", String((err as any)?.message ?? err));
      webhookOk = false;
    }
    return c.json({ bot_id: out.result.bot_id, username: me.username, webhook: webhookOk ? "set" : "failed", try_it: `https://t.me/${me.username}` });
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

  // POST /api/reencrypt — re-encrypt all bot tokens with the current key.
  // Used after a TOKEN_ENC_KEY rotation: old tokens (legacy or old version
  // prefix) are decrypted with the old key and re-encrypted with the current
  // one (producing a fresh "v1:" prefix).
  api.post("/reencrypt", async (c) => {
    const rows = await query<{ id: string; token_encrypted: Buffer }>(
      `SELECT id, token_encrypted FROM bots`
    );
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    for (const row of rows) {
      const blob = Buffer.from(row.token_encrypted);
      try {
        // Skip tokens already on the current key version
        if (isCurrentVersion(blob)) {
          skipped++;
          continue;
        }
        const reencrypted = await reencryptToken(blob);
        await exec(`UPDATE bots SET token_encrypted = $1 WHERE id = $2`, [reencrypted, row.id]);
        migrated++;
      } catch (err) {
        console.error(`[reencrypt] bot ${row.id} failed:`, String((err as any)?.message || err));
        errors++;
      }
    }
    return c.json({ ok: true, total: rows.length, migrated, skipped, errors });
  });

  app.route("/api", api);
  // Also mount under /bot/api so routes are reachable via the /bot/* CF route
  // (CF sends /bot/api/* to this worker, but Hono only matches /api/* by default)
  app.route("/bot/api", api);

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
