// Account-level API: postback keys, conversion log, profile data.
import { json, bad, requireUser, rateLimit } from "../auth.js";
import { query } from "../../../../shared/db.js";
import { effectivePlan } from "../../../../shared/plans.js";
import {
  POSTBACK_SUNSET,
  createPostbackKey,
  getActivePostbackKey,
  revokePostbackKeys,
} from "../../../../shared/postback.js";

function postbackObject(url, key) {
  return {
    signedEndpoint: `${url.origin}/api/postback`,
    key,
    signature: "hex HMAC-SHA256 of the raw query string, keyed by key",
    legacyUrl: `${url.origin}/api/postback?key=${encodeURIComponent(key)}`,
    legacySunset: POSTBACK_SUNSET,
  };
}

async function loadConversions(ownerId) {
  return query(
    `SELECT cv.event, cv.amount, cv.currency, cv.click_ref,
            to_char(cv.ts, 'MM-DD HH24:MI') AS at, o.label AS offer
       FROM conversions cv LEFT JOIN offers o ON o.id = cv.offer_id
      WHERE cv.owner_id = $1
      ORDER BY cv.ts DESC LIMIT 25`,
    [ownerId]
  );
}

// GET /api/account/postbacks
export async function handleAccountPostbacks(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  if (!(await rateLimit(env, `account-postbacks:${user.id}`, 120, 60)).ok) {
    return bad("Too many requests. Try again later.", 429);
  }

  const url = new URL(request.url);
  const paid = effectivePlan(user) !== "free";
  if (!paid) {
    return json({ ok: true, postback: null, upgrade: true, canRotate: false, conversions: [] });
  }

  const key = await getActivePostbackKey(user.id);
  const conversions = await loadConversions(user.id);
  return json({
    ok: true,
    postback: key ? postbackObject(url, key) : null,
    upgrade: false,
    canRotate: true,
    conversions,
  });
}

// POST /api/account/postbacks/rotate
export async function handleAccountPostbacksRotate(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  if (effectivePlan(user) === "free") return bad("Postbacks require a paid plan.", 402);
  if (!(await rateLimit(env, `postback-rotate:${user.id}`, 10, 60)).ok) {
    return bad("Too many rotations. Try again later.", 429);
  }

  const key = await createPostbackKey(user.id, { label: "account", revokeOthers: true });
  const url = new URL(request.url);
  return json({ ok: true, postback: postbackObject(url, key) });
}

// DELETE /api/account/postbacks
export async function handleAccountPostbacksRevoke(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  await revokePostbackKeys(user.id);
  return json({ ok: true });
}

// GET /api/account/conversions
export async function handleAccountConversions(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  if (!(await rateLimit(env, `account-conversions:${user.id}`, 120, 60)).ok) {
    return bad("Too many requests. Try again later.", 429);
  }

  const rows = await loadConversions(user.id);
  return json({ ok: true, conversions: rows });
}
