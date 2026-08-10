// Account-level API: postback keys, conversion log, profile data.
import { json, bad, requireUser, rateLimit } from "../auth.js";
import { one, query } from "../../../../shared/db.js";
import { effectivePlan } from "../../../../shared/plans.js";
import { handlePostback } from "./attribution.js";
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

async function loadActivePostbackStatus(ownerId) {
  return one(
    `SELECT id, created_at, last_used_at
       FROM postback_keys
      WHERE user_id = $1
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY created_at DESC
      LIMIT 1`,
    [ownerId]
  );
}

async function signQueryString(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
  const statusRow = key ? await loadActivePostbackStatus(user.id) : null;
  const conversions = await loadConversions(user.id);

  let status = "not_configured";
  if (key) {
    status = statusRow?.last_used_at ? "active" : "pending";
  }

  return json({
    ok: true,
    postback: key ? { ...postbackObject(url, key), createdAt: statusRow?.created_at, lastUsedAt: statusRow?.last_used_at } : null,
    status,
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

// POST /api/account/postbacks/test
export async function handleAccountPostbacksTest(request, env) {
  const { user, res } = await requireUser(request, env);
  if (!user) return res;
  if (effectivePlan(user) === "free") return bad("Postbacks require a paid plan.", 402);
  if (!(await rateLimit(env, `postback-test:${user.id}`, 10, 60)).ok) {
    return bad("Too many test conversions. Try again later.", 429);
  }

  const key = await getActivePostbackKey(user.id);
  if (!key) return bad("No active postback key. Generate one first.", 400);

  const url = new URL(request.url);
  const testUrl = new URL("/api/postback", url.origin);
  const testId = crypto.randomUUID();
  testUrl.searchParams.set("event", "test");
  testUrl.searchParams.set("amount", "0.00");
  testUrl.searchParams.set("currency", "TEST");
  testUrl.searchParams.set("test_id", testId);
  const queryString = testUrl.search.slice(1);
  const signature = await signQueryString(key, queryString);
  const body = JSON.stringify({ event: "test", amount: "0.00", currency: "TEST", test_id: testId });

  const testReq = new Request(testUrl.toString(), {
    method: "POST",
    headers: {
      "x-postback-key": key,
      "x-postback-signature": signature,
      "content-type": "application/json",
    },
    body,
  });

  const result = await handlePostback(testReq, env);
  if (result.status !== 200) {
    const text = await result.text().catch(() => "unknown");
    return bad(`Test postback failed: ${text}`, 502);
  }
  return json({ ok: true, message: "Test conversion sent and accepted. It will appear in Recent conversions as event 'test'." });
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
