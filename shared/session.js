// ============================================================================
//  YourRank — SHARED SESSION (JavaScript)
//
//  ONE session model used identically by BOTH Workers:
//    * Cookie name:      gm_session
//    * Cookie domain:    .yourrank.site (or SESSION_COOKIE_DOMAIN)
//                        every path on the same host — /bot, /hook, /r, ...)
//    * KV namespace:     SESSIONS  (BOTH Workers bind the SAME namespace id)
//    * KV key:           sess:<token>
//    * KV value:         the user's UUID from the unified `users` table
//    * TTL:              30 days
//
//  The token is 32 random bytes (hex). The KV value is the bare UUID — no JSON,
//  no signature, no shape. Whichever Worker reads the cookie resolves the same
//  userId, so a password login on the leaderboard tab is a valid session on the
//  bot tab and vice-versa.
//
//  This is the JavaScript version compiled from shared/session.ts
//  Used by the leaderboard Worker
// ============================================================================

// ---- constants (MUST match session.ts) ----
export const COOKIE_NAME = "gm_session";
// Cookie domain is env-driven so the same code serves any zone. Default to the
// production domain; override with SESSION_COOKIE_DOMAIN for staging/preview.
// MUST be a host-wide domain (leading dot) so BOTH Workers (bot + leaderboard)
// see the cookie — they share one KV session namespace across the zone.
export const COOKIE_DOMAIN =
  (typeof process !== "undefined" && process.env && process.env.SESSION_COOKIE_DOMAIN) || ".yourrank.site";
export const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
export const KV_PREFIX = "sess:";

// ---- token helpers ----
const bytesToHex = (b) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export const newToken = () =>
  bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

// ---- cookie serialization ----
function cookieAttrs() {
  return `Path=/; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`;
}
export const cookieSet = (token) =>
  `${COOKIE_NAME}=${token}; ${cookieAttrs()}; Max-Age=${SESSION_TTL_S}`;
export const cookieClear = () =>
  `${COOKIE_NAME}=; ${cookieAttrs()}; Max-Age=0`;

// ---- read the token from a Request ----
export function readToken(req) {
  const c = req.headers.get("cookie") || "";
  const re = new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)");
  const m = c.match(re);
  return m ? m[1] : null;
}

// Convenience for Hono handlers that already hold the raw Cookie header string.
export function readTokenFromHeader(cookieHeader) {
  const c = cookieHeader || "";
  const re = new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)");
  const m = c.match(re);
  return m ? m[1] : null;
}

// ---- create / destroy a session in shared KV ----
// Mirror of session.ts: maintain a per-user token index so reset/suspend can
// revoke all of a user's sessions. Index maintenance is best-effort.
const USER_SESSIONS_PREFIX = "userSessions:";
async function addUserSession(env, userId, token) {
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    const list = cur ? JSON.parse(cur) : [];
    if (!list.includes(token)) list.push(token);
    await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: SESSION_TTL_S });
  } catch { /* best-effort index */ }
}
async function removeUserSession(env, userId, token) {
  if (!userId || !token) return;
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    if (!cur) return;
    const list = JSON.parse(cur).filter((t) => t !== token);
    await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: SESSION_TTL_S });
  } catch { /* best-effort index */ }
}

export async function createSession(env, userId) {
  const token = newToken();
  await env.SESSIONS.put(KV_PREFIX + token, userId, { expirationTtl: SESSION_TTL_S });
  await addUserSession(env, userId, token);
  return token;
}

export async function destroySession(env, token) {
  if (token) {
    const uid = await env.SESSIONS.get(KV_PREFIX + token);
    await env.SESSIONS.delete(KV_PREFIX + token);
    if (uid) await removeUserSession(env, uid, token);
  }
}

/** Revoke every live session for a user (password reset, admin suspend). */
export async function destroyAllUserSessions(env, userId) {
  if (!userId) return;
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    if (cur) {
      for (const t of JSON.parse(cur)) {
        try { await env.SESSIONS.delete(KV_PREFIX + t); } catch { /* one bad token doesn't stop the rest */ }
      }
    }
    await env.SESSIONS.delete(key);
  } catch { /* best-effort */ }
}

// ---- resolve the current user's UUID (no DB read) ----
// SEC-107: Sliding-window TTL refresh. Each time a session token is resolved,
// the KV TTL is extended (best-effort, fire-and-forget) so actively used
// sessions stay alive. A stolen token that goes unused will expire.
export async function currentUserId(req, env) {
  const token = readToken(req);
  if (!token) return null;
  const uid = await env.SESSIONS.get(KV_PREFIX + token);
  if (uid) {
    // Best-effort TTL extension — fire-and-forget, never blocks the request.
    try {
      env.SESSIONS.put(KV_PREFIX + token, uid, { expirationTtl: SESSION_TTL_S }).catch(() => {});
      const idxKey = "userSessions:" + uid;
      env.SESSIONS.get(idxKey).then((cur) => {
        if (cur) env.SESSIONS.put(idxKey, cur, { expirationTtl: SESSION_TTL_S }).catch(() => {});
      }).catch(() => {});
    } catch { /* best-effort rotation */ }
  }
  return uid || null;
}

export async function currentUserIdFromHeader(cookieHeader, env) {
  const token = readTokenFromHeader(cookieHeader);
  if (!token) return null;
  const uid = await env.SESSIONS.get(KV_PREFIX + token);
  return uid || null;
}

// ---- resolve the full user row via an injected loader ----
// loadUser keeps this module free of the bot Worker's pg/Hyperdrive layer, so it
// is identical to the JS version. Bot loader example:
//   (env, uid) => one(`SELECT id, email, display_name, telegram_user_id, plan,
//                             plan_expires_at, status, is_admin
//                        FROM users WHERE id = $1`, [uid])
export async function currentUser(req, env, loadUser) {
  const uid = await currentUserId(req, env);
  if (!uid) return null;
  return loadUser(env, uid);
}

// SEC-104: Legacy rk_session cookie support removed. The migration grace
// period is over. Only gm_session is accepted.
