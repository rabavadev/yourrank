// Score postback handler (authenticated via X-Postback-Key + HMAC-SHA256 signature)
import { json, bad, rateLimit as defaultRateLimit, rateLimitHeaders } from "../auth.js";
import { saveSite as defaultSaveSite } from "../site.js";
import { effectivePlan, PLAN_LIMITS } from "@yourrank/shared/plans";
import { one as defaultOne } from "@yourrank/shared/db";
import { verifyHmacSha256Hex as defaultVerifyHmacSha256Hex } from "@yourrank/shared/crypto";
import {
  computeReplayHash as defaultComputeReplayHash,
  findPostbackOwner as defaultFindPostbackOwner,
  logPostbackIntake as defaultLogPostbackIntake,
  recordReplayHash as defaultRecordReplayHash,
} from "@yourrank/shared/postback";
import { z } from "@yourrank/shared/validation";

const scoreNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(0).max(1e15));

const signedNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(-1e15).max(1e15));

const intNumber = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value))
  .pipe(z.number().int().finite().min(-2147483648).max(2147483647));

const scoreBodySchema = z
  .object({
    slug: z.string().trim().min(1).max(80).optional(),
    siteId: z.string().uuid().optional(),
    players: z.array(z.object({
      name: z.string().trim().min(1).max(80),
      wagered: scoreNumber.optional(),
      prize: scoreNumber.optional(),
      score: scoreNumber.optional(),
      hands: intNumber.optional(),
      netProfit: signedNumber.optional(),
      winRate: signedNumber.optional(),
      change: intNumber.optional(),
    }).strict()).max(9999),
  })
  .strict()
  .superRefine((body, ctx) => {
    const seen = new Set();
    for (const [index, player] of body.players.entries()) {
      const normalized = player.name.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate player name: ${player.name}`,
          path: ["players", index, "name"],
        });
      }
      seen.add(normalized);
    }
  });
// POST /api/scores — authenticated by X-Postback-Key header + X-Postback-Signature HMAC.
// Validates key against sites table, checks Pro plan gate, replaces player list.
export async function handleScores(request, env, {
  saveSiteImpl = defaultSaveSite,
  rateLimit = defaultRateLimit,
  one = defaultOne,
  verifyHmacSha256Hex = defaultVerifyHmacSha256Hex,
  computeReplayHash = defaultComputeReplayHash,
  findPostbackOwner = defaultFindPostbackOwner,
  logPostbackIntake = defaultLogPostbackIntake,
  recordReplayHash = defaultRecordReplayHash,
} = {}) {
  try {
    const postbackKey = request.headers.get("x-postback-key");
    if (!postbackKey) return bad("Missing X-Postback-Key header.", 401);
    const signature = request.headers.get("x-postback-signature");
    if (!signature) return bad("Missing X-Postback-Signature header.", 401);
    // Rate limit: 10/min per key
    const rl = await rateLimit(env, `scores:${postbackKey}`, 10, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
    // Verify HMAC-SHA256 signature of the raw request body before parsing or lookup.
    const rawBody = await request.text();
    const valid = await verifyHmacSha256Hex(postbackKey, rawBody, signature);
    if (!valid) return bad("Invalid postback signature.", 401);

    // H-04: resolve the key owner from postback_keys, then block exact replays.
    const keyOwner = await findPostbackOwner(postbackKey, "signed");
    if (!keyOwner) return bad("Invalid postback key or board reference.", 401);
    logPostbackIntake("scores_signed", keyOwner, true);
    const replayHash = await computeReplayHash({ body: rawBody });
    if (!(await recordReplayHash(keyOwner.userId, replayHash))) {
      return bad("Duplicate postback.", 409);
    }

    let raw;
    try { raw = JSON.parse(rawBody); } catch { return bad("Invalid JSON body."); }
    const parsed = scoreBodySchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return bad(`${issue.path.join(".") || "request"}: ${issue.message}`);
    }
    const body = parsed.data;
    // H-03: A user-level postback key can own many boards. Require an explicit
    // board reference (slug or siteId, in body or X-Postback-Site header).
    const boardRef = body.slug || body.siteId || request.headers.get("x-postback-site");
    if (!boardRef || typeof boardRef !== "string") return bad("Missing board slug or siteId. Use body.slug, body.siteId, or X-Postback-Site header.", 400);
    const site = await one("SELECT s.id, s.user_id, s.slug, s.name, s.tagline, s.casino, s.code, s.cta_url, s.prize_pool, s.period, s.ends_at, s.reset_note, s.blurb, s.extra_json, s.published, s.theme_json, s.updated_at FROM sites s WHERE s.user_id=$1 AND (s.slug=$2 OR s.id::text=$2)", [keyOwner.userId, boardRef]);
    if (!site) return bad("Invalid postback key or board reference.", 401);
    // Gate behind Pro plan
    const owner = await one("SELECT id, plan, (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at, status FROM users WHERE id=$1", [site.user_id]);
    const plan = effectivePlan(owner);
    if (plan !== "pro" && plan !== "agency") return bad("The signed score API requires a Pro or Agency plan.", 403);
    const players = body.players;
    // Plan gate: player count
    const validPlayers = players;
    if (validPlayers.length > PLAN_LIMITS[plan]) return bad(`Your plan allows up to ${PLAN_LIMITS[plan]} players.`, 400);
    // Reuse saveSite with just the players update — pass minimal payload
    const user = owner;
    const savePayload = {
      brand: { name: site.name, tagline: site.tagline, casino: site.casino, code: site.code, ctaUrl: site.cta_url, prizePool: site.prize_pool, period: site.period, resetNote: site.reset_note },
      partner: { blurb: site.blurb },
      players: validPlayers.map(p => ({
        name: String(p.name).slice(0, 40),
        wagered: Number(p.wagered) || 0,
        prize: Number(p.prize) || 0,
        score: p.score !== undefined ? Number(p.score) : undefined,
        hands: p.hands !== undefined ? Number(p.hands) : undefined,
        netProfit: p.netProfit !== undefined ? Number(p.netProfit) : undefined,
        winRate: p.winRate !== undefined ? Number(p.winRate) : undefined,
        change: p.change !== undefined ? Number(p.change) : undefined,
      })),
    };
    const r = await saveSiteImpl(env, user, savePayload, site.id, request);
    return r.error ? bad(r.error, 400) : json({ ok: true, players: validPlayers.length }, 200, rateLimitHeaders(rl));
  } catch (e) {
    console.error("scores API failed:", String(e?.message || e));
    return bad("Internal error.", 500);
  }
}
