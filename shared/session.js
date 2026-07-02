// ============================================================================
//  GroupsMix — SHARED SESSION (leaderboard Worker, JavaScript)
//
//  ONE session model used identically by BOTH Workers:
//    * Cookie name:      gm_session
//    * Cookie domain:    .groupsmix.com  (so it is sent to groupsmix.com AND
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
//  This file is the SOURCE OF TRUTH. session.ts is a byte-for-byte-behavioural
//  port for the TypeScript bot Worker. If you change one, change the other.
//
//  NOTE: currentUser() only RESOLVES the userId to a token/uid here. It does NOT
//  read the DB, because the leaderboard Worker's DB layer is owned by another
//  agent and uses Supabase REST. Call currentUserId() to get the UUID, then
//  hydrate the user row with your own data layer. loadUser is an injectable hook.
// ============================================================================

// ---- constants (MUST match session.ts) ----
export const COOKIE_NAME = "gm_session";
export const COOKIE_DOMAIN = ".groupsmix.com";
export const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
export const KV_PREFIX = "sess:";

// ---- token helpers ----
const bytesToHex = (b) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export const newToken = () => bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

// ---- cookie serialization ----
// Domain=.groupsmix.com makes the cookie host-wide, so both Workers see it.
// SameSite=Lax is safe: navigation between tabs on the same site sends it.
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

// ---- create / destroy a session in shared KV ----
// value is the bare user UUID.
export async function createSession(env, userId) {
  const token = newToken();
  await env.SESSIONS.put(KV_PREFIX + token, userId, { expirationTtl: SESSION_TTL_S });
  return token;
}

export async function destroySession(env, token) {
  if (token) await env.SESSIONS.delete(KV_PREFIX + token);
}

// ---- resolve the current user's UUID (no DB read) ----
export async function currentUserId(req, env) {
  const token = readToken(req);
  if (!token) return null;
  const uid = await env.SESSIONS.get(KV_PREFIX + token);
  return uid || null;
}

// ---- resolve the full user row via an injected loader ----
// loadUser: (env, uid) => Promise<user|null>. Keeps this module free of any
// DB coupling so it drops into either Worker unchanged. Example loaders:
//   leaderboard: (env, uid) => sbSelectOne(env, `users?id=eq.${uid}`)
//   bot:         (env, uid) => one(`SELECT ... FROM users WHERE id=$1`, [uid])
export async function currentUser(req, env, loadUser) {
  const uid = await currentUserId(req, env);
  if (!uid) return null;
  return loadUser(env, uid);
}

// ---- migration shim: accept a legacy rk_session cookie once ----
// During the cutover, old leaderboard sessions live under the OLD cookie name
// (rk_session) and OLD KV prefix (sess:) written by the pre-merge auth.js.
// The KV prefix is identical (sess:), so the only difference is the cookie name.
// This reads either cookie; call it instead of readToken during the grace period.
export function readTokenWithLegacy(req) {
  const fresh = readToken(req);
  if (fresh) return fresh;
  const c = req.headers.get("cookie") || "";
  const m = c.match(/(?:^|;\s*)rk_session=([^;]+)/);
  return m ? m[1] : null;
}
