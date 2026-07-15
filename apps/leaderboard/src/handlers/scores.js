// Score postback handler (authenticated via X-Postback-Key + HMAC-SHA256 signature)
import { json, bad, rateLimit, rateLimitHeaders } from "../auth.js";
import { saveSite } from "../site.js";
import { effectivePlan, PLAN_LIMITS } from "../billing.js";
import { one } from "../../../../shared/db.js";
import { verifyHmacSha256Hex } from "../../../../shared/crypto.js";

// POST /api/scores — authenticated by X-Postback-Key header + X-Postback-Signature HMAC.
// Validates key against sites table, checks Pro plan gate, replaces player list.
export async function handleScores(request, env) {
  try {
    const postbackKey = request.headers.get("x-postback-key");
    if (!postbackKey) return bad("Missing X-Postback-Key header.", 401);
    const signature = request.headers.get("x-postback-signature");
    if (!signature) return bad("Missing X-Postback-Signature header.", 401);
    // Rate limit: 10/min per key
    const rl = await rateLimit(env, `scores:${postbackKey}`, 10, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
    // DB-004-v8: Single site lookup instead of two (was: SELECT id,user_id,postback_key, then SELECT full row by id)
    // BUG-DB-007: postback_key lives on users table, not sites. JOIN to resolve.
    const site = await one("SELECT s.id, s.user_id, s.slug, s.name, s.tagline, s.casino, s.code, s.cta_url, s.prize_pool, s.period, s.ends_at, s.reset_note, s.blurb, s.extra_json, s.published, s.theme_json, s.updated_at FROM sites s JOIN users u ON u.id = s.user_id WHERE u.postback_key=$1", [postbackKey]);
    if (!site) return bad("Invalid postback key.", 401);
    // Verify HMAC-SHA256 signature of the raw request body
    const rawBody = await request.text();
    const valid = await verifyHmacSha256Hex(postbackKey, rawBody, signature);
    if (!valid) return bad("Invalid postback signature.", 401);
    // Gate behind Pro plan
    const owner = await one("SELECT id, plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [site.user_id]);
    const plan = effectivePlan(owner);
    if (plan !== "pro" && plan !== "agency") return bad("Score API is a Pro feature. Upgrade to unlock.", 403);
    let body;
    try { body = JSON.parse(rawBody); } catch { return bad("Invalid JSON body."); }
    const players = body.players;
    if (!Array.isArray(players)) return bad("players must be an array.");
    // Plan gate: player count
    const validPlayers = players.filter(p => p && p.name);
    if (validPlayers.length > PLAN_LIMITS[plan]) return bad(`Your plan allows up to ${PLAN_LIMITS[plan]} players.`, 400);
    // Reuse saveSite with just the players update — pass minimal payload
    const user = owner;
    const savePayload = {
      brand: { name: site.name, tagline: site.tagline, casino: site.casino, code: site.code, ctaUrl: site.cta_url, prizePool: site.prize_pool, period: site.period, resetNote: site.reset_note },
      partner: { blurb: site.blurb },
      players: validPlayers.map(p => ({ name: String(p.name).slice(0, 40), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 })),
    };
    const r = await saveSite(env, user, savePayload, site.id, request);
    return r.error ? bad(r.error, 400) : json({ ok: true, players: validPlayers.length }, 200, rateLimitHeaders(rl));
  } catch (e) {
    console.error("scores API failed:", String(e?.message || e));
    return bad("Internal error.", 500);
  }
}
