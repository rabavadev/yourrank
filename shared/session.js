"use strict";
// ============================================================================
//  YourRank — SHARED SESSION (canonical TypeScript source)
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
//  This is the CANONICAL source. It is compiled to .js for the leaderboard Worker.
//  The bot Worker imports this .ts file directly.
//
//  NOTE: currentUser() only RESOLVES the userId to a token/uid here. It does NOT
//  read the DB, because the leaderboard Worker's DB layer is owned by another
//  agent and uses Supabase REST. Call currentUserId() to get the UUID, then
//  hydrate the user row with your own data layer. loadUser is an injectable hook.
//
//  Both Workers MUST bind the SAME KV namespace under the name `SESSIONS` in
//  their wrangler.toml (same `id`, different `binding` name is NOT enough — the
//  id must match). Example wrangler.toml for BOTH:
//      [[kv_namespaces]]
//      binding = "SESSIONS"
//      id      = "<the one shared namespace id>"
// ============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieClear = exports.cookieSet = exports.newToken = exports.KV_PREFIX = exports.SESSION_TTL_S = exports.COOKIE_DOMAIN = exports.COOKIE_NAME = void 0;
exports.readToken = readToken;
exports.readTokenFromHeader = readTokenFromHeader;
exports.createSession = createSession;
exports.destroySession = destroySession;
exports.destroyAllUserSessions = destroyAllUserSessions;
exports.currentUserId = currentUserId;
exports.currentUserIdFromHeader = currentUserIdFromHeader;
exports.currentUser = currentUser;
// ---- constants (MUST match session.js) ----
exports.COOKIE_NAME = "gm_session";
// Cookie domain is env-driven so the same code serves any zone. Default to the
// production domain; override with SESSION_COOKIE_DOMAIN for staging/preview.
// MUST be a host-wide domain (leading dot) so BOTH Workers (bot + leaderboard)
// see the cookie — they share one KV session namespace across the zone.
exports.COOKIE_DOMAIN = (typeof process !== "undefined" && process.env && process.env.SESSION_COOKIE_DOMAIN) || ".yourrank.site";
exports.SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
exports.KV_PREFIX = "sess:";
// ---- token helpers ----
const bytesToHex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const newToken = () => bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
exports.newToken = newToken;
// ---- cookie serialization ----
function cookieAttrs() {
    return `Path=/; Domain=${exports.COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`;
}
const cookieSet = (token) => `${exports.COOKIE_NAME}=${token}; ${cookieAttrs()}; Max-Age=${exports.SESSION_TTL_S}`;
exports.cookieSet = cookieSet;
const cookieClear = () => `${exports.COOKIE_NAME}=; ${cookieAttrs()}; Max-Age=0`;
exports.cookieClear = cookieClear;
// ---- read the token from a Request ----
/** Extract the session token from the Cookie header of a Request. */
function readToken(req) {
    const c = req.headers.get("cookie") || "";
    const re = new RegExp("(?:^|;\\s*)" + exports.COOKIE_NAME + "=([^;]+)");
    const m = c.match(re);
    return m ? m[1] : null;
}
// Convenience for Hono handlers that already hold the raw Cookie header string.
function readTokenFromHeader(cookieHeader) {
    const c = cookieHeader || "";
    const re = new RegExp("(?:^|;\\s*)" + exports.COOKIE_NAME + "=([^;]+)");
    const m = c.match(re);
    return m ? m[1] : null;
}
// ---- create / destroy a session in shared KV ----
// Mirror of session.js: maintain a per-user token index so reset/suspend can
// revoke all of a user's sessions. Index maintenance is best-effort.
const USER_SESSIONS_PREFIX = "userSessions:";
async function addUserSession(env, userId, token) {
    try {
        const key = USER_SESSIONS_PREFIX + userId;
        const cur = await env.SESSIONS.get(key);
        const list = cur ? JSON.parse(cur) : [];
        if (!list.includes(token))
            list.push(token);
        await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: exports.SESSION_TTL_S });
    }
    catch { /* best-effort index */ }
}
async function removeUserSession(env, userId, token) {
    if (!userId || !token)
        return;
    try {
        const key = USER_SESSIONS_PREFIX + userId;
        const cur = await env.SESSIONS.get(key);
        if (!cur)
            return;
        const list = JSON.parse(cur).filter((t) => t !== token);
        await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: exports.SESSION_TTL_S });
    }
    catch { /* best-effort index */ }
}
/** Create a new session in KV and return the token. */
async function createSession(env, userId) {
    const token = (0, exports.newToken)();
    await env.SESSIONS.put(exports.KV_PREFIX + token, userId, { expirationTtl: exports.SESSION_TTL_S });
    await addUserSession(env, userId, token);
    return token;
}
/** Delete a single session token from KV and remove it from the user index. */
async function destroySession(env, token) {
    if (token) {
        const uid = await env.SESSIONS.get(exports.KV_PREFIX + token);
        await env.SESSIONS.delete(exports.KV_PREFIX + token);
        if (uid)
            await removeUserSession(env, uid, token);
    }
}
/** Revoke every live session for a user (password reset, admin suspend). */
async function destroyAllUserSessions(env, userId) {
    if (!userId)
        return;
    try {
        const key = USER_SESSIONS_PREFIX + userId;
        const cur = await env.SESSIONS.get(key);
        if (cur) {
            for (const t of JSON.parse(cur)) {
                try {
                    await env.SESSIONS.delete(exports.KV_PREFIX + t);
                }
                catch { /* one bad token doesn't stop the rest */ }
            }
        }
        await env.SESSIONS.delete(key);
    }
    catch { /* best-effort */ }
}
// ---- resolve the current user's UUID (no DB read) ----
// SEC-107: Sliding-window TTL refresh. Each time a session token is resolved,
// the KV TTL is extended (best-effort, fire-and-forget) so actively used
// sessions stay alive. A stolen token that goes unused will expire.
async function currentUserId(req, env) {
    const token = readToken(req);
    if (!token)
        return null;
    const uid = await env.SESSIONS.get(exports.KV_PREFIX + token);
    if (uid) {
        // Best-effort TTL extension — fire-and-forget, never blocks the request.
        try {
            env.SESSIONS.put(exports.KV_PREFIX + token, uid, { expirationTtl: exports.SESSION_TTL_S }).catch(() => { });
            const idxKey = "userSessions:" + uid;
            env.SESSIONS.get(idxKey).then((cur) => {
                if (cur)
                    env.SESSIONS.put(idxKey, cur, { expirationTtl: exports.SESSION_TTL_S }).catch(() => { });
            }).catch(() => { });
        }
        catch { /* best-effort rotation */ }
    }
    return uid || null;
}
async function currentUserIdFromHeader(cookieHeader, env) {
    const token = readTokenFromHeader(cookieHeader);
    if (!token)
        return null;
    const uid = await env.SESSIONS.get(exports.KV_PREFIX + token);
    if (uid) {
        // ARCH-005: Sliding-window TTL refresh — same pattern as currentUserId().
        // Fire-and-forget, never blocks the request.
        try {
            env.SESSIONS.put(exports.KV_PREFIX + token, uid, { expirationTtl: exports.SESSION_TTL_S }).catch(() => { });
            const idxKey = "userSessions:" + uid;
            env.SESSIONS.get(idxKey).then((cur) => {
                if (cur)
                    env.SESSIONS.put(idxKey, cur, { expirationTtl: exports.SESSION_TTL_S }).catch(() => { });
            }).catch(() => { });
        }
        catch { /* best-effort rotation */ }
    }
    return uid || null;
}
// ---- resolve the full user row via an injected loader ----
// loadUser keeps this module free of the bot Worker's pg/Hyperdrive layer, so it
// is identical to the JS version. Bot loader example:
//   (env, uid) => one(`SELECT id, email, display_name, telegram_user_id, plan,
//                             plan_expires_at, status, is_admin
//                        FROM users WHERE id = $1`, [uid])
async function currentUser(req, env, loadUser) {
    const uid = await currentUserId(req, env);
    if (!uid)
        return null;
    return loadUser(env, uid);
}
// SEC-104: Legacy rk_session cookie support removed. The migration grace
// period is over. Only gm_session is accepted.
