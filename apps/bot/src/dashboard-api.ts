// API handlers module for the bot dashboard.
// Extracted from dashboard.ts to separate API handlers from routing logic.

import { Hono } from "hono";
import { config } from "./config.js";
import { one, query } from "../../../shared/db.js";
import { encryptToken, newLinkSlug, newPostbackKey, newWebhookSecret } from "../../../shared/crypto.js";
import { getMe, setWebhook } from "./telegram.js";
import { withPlanLimit, getUserPlan, type PlanTier } from "./plans.js";
import { billingEnabled, createStarsInvoice } from "./billing.js";
import { checkFeature, PLANS } from "./plans.js";
import { rateLimit } from "./ratelimit.js";
import { sameOrigin } from "./dashboard-auth.js";
import { resolveSession, type SessionEnv } from "../../../shared/session.js";

interface TgLogin {
  id: number; first_name?: string; last_name?: string; username?: string;
  photo_url?: string; auth_date: number; hash: string;
}

export function buildDashboardApi(): Hono<{ Variables: { uid: string } }> {
  const api = new Hono<{ Variables: { uid: string } }>();

  // Resolve session FIRST — every subsequent middleware reads c.get("uid").
  // SEC-107: Use resolveSession for rotation; propagate new cookie if rotated.
  api.use("*", async (c, next) => {
    const session = await resolveSession(c.req.raw, c.env as SessionEnv);
    if (session) {
      c.set("uid", session.uid);
      if (session.rotatedCookie) c.header("Set-Cookie", session.rotatedCookie);
    }
    await next();
  });

  // Rate-limit all API requests (120 req/min per IP).
  api.use("*", async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") || "0.0.0.0";
    const rlResult = await rateLimit((c.env as SessionEnv).SESSIONS, `dash:${ip}`, 120, 60);
    if (!rlResult.ok) return c.json({ error: "rate limit exceeded", retryAfter: rlResult.retryAfter }, 429);
    await next();
  });

  api.use("*", async (c, next) => {
    // CSRF: block cross-site state-changing calls that ride the session cookie.
    // GET/HEAD are safe (read-only) and skipped.
    if (c.req.method !== "GET" && c.req.method !== "HEAD" && !sameOrigin(c.req.raw, config.publicBaseUrl)) {
      return c.json({ error: "cross-origin request rejected" }, 403);
    }
    const uid = c.get("uid");
    if (!uid) return c.json({ error: "not logged in" }, 401);
    // Re-check suspended status on EVERY request, not just at login. The shared
    // KV session lives up to 30 days and currentUserId() only resolves the token
    // -> UUID; without this, an admin-suspended streamer's existing session keeps
    // working (managing bots/offers/broadcasts) until the TTL expires.
    const u = await one<{ status: string }>(`SELECT status FROM users WHERE id = $1`, [uid]);
    if (!u) return c.json({ error: "not logged in" }, 401);
    if (u.status === "suspended") return c.json({ error: "account suspended" }, 403);
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
           LEFT JOIN click_daily cd ON cd.short_link_id = sl.id AND cd.day < current_date
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
    // encryptToken requires TOKEN_ENC_KEY to be a valid 32-byte hex secret.
    // Wrap so a misconfigured key returns a clear 500 rather than an opaque
    // Hono-default {"message":"Internal Server Error"} that the client can't
    // distinguish from a plan-limit 402 or a Telegram error 400.
    let encToken: Buffer;
    try { encToken = await encryptToken(token); }
    catch (err) {
      console.error("[POST /bots] encryptToken failed:", String((err as any)?.message ?? err));
      return c.json({ error: "Server configuration error — could not encrypt bot token. Contact support." }, 500);
    }
    // count-check + INSERT run atomically under a per-user advisory lock so two
    // concurrent connect-bot requests can't both pass the count and both insert.
    let out: { error: string } | { result: { bot_id: string; username: string; secret: string } };
    try {
      out = await withPlanLimit(uid, "bots", async (tx) => {
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
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      console.error("[POST /bots] DB error:", msg);
      return c.json({ error: "Database error — please try again in a moment" }, 500);
    }
    if ("error" in out) return c.json({ error: out.error }, 402);
    // setWebhook AFTER the transaction commits — don't hold the lock across HTTP.
    // The bot row is already committed at this point, so a webhook failure is
    // non-fatal: the bot is connected and will work once the webhook is fixed
    // (e.g. re-submitting the token re-registers it). Return a warning rather
    // than a 500 that would make the dashboard show "@undefined connected".
    let webhookWarning: string | null = null;
    try {
      await setWebhook(token, `${config.publicBaseUrl}/hook/${out.result.secret}`, out.result.secret, {
        dropPendingUpdates: true, // Onboarding: drop queued updates for clean start
        allowedUpdates: ["message", "callback_query"],
      });
    } catch (err) {
      console.error("[POST /bots] setWebhook failed:", String((err as any)?.message ?? err));
      webhookWarning = "Bot saved — but webhook registration failed. Re-submit the token to retry, or check PUBLIC_BASE_URL config.";
    }
    return c.json({
      bot_id: out.result.bot_id,
      username: out.result.username,
      try_it: `https://t.me/${out.result.username}`,
      ...(webhookWarning ? { warning: webhookWarning } : {}),
    });
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

  return api;
}
