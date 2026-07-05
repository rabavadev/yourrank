// Score postback handler (authenticated via X-Postback-Key + HMAC-SHA256 signature)
import { json, bad, readJson, rateLimit } from "../auth.js";
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
    if (!(await rateLimit(env, `scores:${postbackKey}`, 10, 60)).ok) return bad("Rate limit exceeded. Try again shortly.", 429);
    // Validate key against sites table (using postback_key_hash for lookup, falling back to plaintext)
    // SEC-006-v7: Currently uses plaintext `postback_key` column for lookup. The
    // postback_key_enc column exists (migration 20260705000005_encrypt_postback_key.sql)
    // but this query still reads plaintext. TODO: migrate to hash-based lookup
    // (store SHA-256(postback_key) in postback_key_hash column, lookup by hash,
    // then verify plaintext match) so plaintext key is never stored in DB.
    const site = await one("SELECT id, user_id, postback_key FROM sites WHERE postback_key=$1", [postbackKey]);
    if (!site) return bad("Invalid postback key.", 401);
    // Verify HMAC-SHA256 signature of the raw request body
    const rawBody = await request.text();
    const valid = await verifyHmacSha256Hex(postbackKey, rawBody, signature);
    if (!valid) return bad("Invalid postback signature.", 401);
    // Gate behind Pro plan
    const owner = await one("SELECT plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [site.user_id]);
    const plan = effectivePlan(owner);
    if (plan !== "pro" && plan !== "agency") return bad("Score API is a Pro feature. Upgrade to unlock.", 403);
    let body;
    try { body = JSON.parse(rawBody); } catch { return bad("Invalid JSON body."); }
    const slug = String(body.slug || "").trim();
    const players = body.players;
    if (!Array.isArray(players)) return bad("players must be an array.");
    // Plan gate: player count
    const validPlayers = players.filter(p => p && p.name);
    if (validPlayers.length > PLAN_LIMITS[plan]) return bad(`Your plan allows up to ${PLAN_LIMITS[plan]} players.`, 400);
    // Fetch existing site data to preserve brand settings
    const existingSite = await one("SELECT id, slug, name, tagline, casino, code, cta_url, prize_pool, period, ends_at, reset_note, blurb, extra_json, published, theme_json, updated_at FROM sites WHERE id=$1", [site.id]);
    if (!existingSite) return bad("Site not found.", 404);
    // Reuse saveSite with just the players update — pass minimal payload
    const user = owner;
    const savePayload = {
      brand: { name: existingSite.name, tagline: existingSite.tagline, casino: existingSite.casino, code: existingSite.code, ctaUrl: existingSite.cta_url, prizePool: existingSite.prize_pool, period: existingSite.period, resetNote: existingSite.reset_note },
      partner: { blurb: existingSite.blurb },
      players: validPlayers.map(p => ({ name: String(p.name).slice(0, 40), wagered: Number(p.wagered) || 0, prize: Number(p.prize) || 0 })),
    };
    const r = await saveSite(env, user, savePayload, site.id);
    return r.error ? bad(r.error, 400) : json({ ok: true, players: validPlayers.length });
  } catch (e) {
    console.error("scores API failed:", String(e?.message || e));
    return bad("Internal error.", 500);
  }
}
