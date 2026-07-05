// ============================================================================
//  YourRank — SHARED SESSION (canonical TypeScript source)
//
//  ONE session model used identically by BOTH Workers:
//    * Cookie name:      gm_session
//    * Cookie domain:    .yourrank.site (or SESSION_COOKIE_DOMAIN)
//                        every path on the same host — /bot, /hook, /r, ...)
//    * KV namespace:     SESSIONS  (BOTH Workers bind the SAME namespace id)
//    * KV key:           sess:<token>
//    * KV value:         JSON { u: userId, c: createdAtMs } (bare UUID accepted for legacy)
//    * TTL:              30 days
//
//  The token is 32 random bytes (hex). The KV value is JSON { u: userId, c: createdAt }
//  (SEC-107). Legacy bare-UUID values are handled gracefully and rotated on first
//  read. Both Workers resolve the same userId, so a password login on the
//  leaderboard tab is a valid session on the bot tab and vice-versa.
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

// Cloudflare KV type (minimal — avoids depending on @cloudflare/workers-types).
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}
export interface SessionEnv {
  SESSIONS: KVNamespace;
}

// ---- constants (MUST match session.js) ----
export const COOKIE_NAME = "gm_session";
// SEC-104: Legacy cookie name from the old HMAC-signed session system.
// Browsers that still carry this cookie get it cleared on every response.
export const LEGACY_COOKIE_NAME = "sess";
// Cookie domain is env-driven so the same code serves any zone. Default to the
// production domain; override with SESSION_COOKIE_DOMAIN for staging/preview.
// MUST be a host-wide domain (leading dot) so BOTH Workers (bot + leaderboard)
// see the cookie — they share one KV session namespace across the zone.
export const COOKIE_DOMAIN =
  (typeof process !== "undefined" && process.env && process.env.SESSION_COOKIE_DOMAIN) || ".yourrank.site";
export const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
export const KV_PREFIX = "sess:";
// SEC-107: Rotate session tokens older than 24 hours. A stolen token is only
// usable until the next legitimate request triggers rotation.
export const SESSION_ROTATE_AFTER_S = 60 * 60 * 24; // 24 hours

// ---- token helpers ----
const bytesToHex = (b: ArrayBuffer | Uint8Array): string =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export const newToken = (): string =>
  bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

// ---- cookie serialization ----
function cookieAttrs(): string {
  return `Path=/; Domain=${COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`;
}
export const cookieSet = (token: string): string =>
  `${COOKIE_NAME}=${token}; ${cookieAttrs()}; Max-Age=${SESSION_TTL_S}`;
export const cookieClear = (): string =>
  `${COOKIE_NAME}=; ${cookieAttrs()}; Max-Age=0`;

// SEC-104: Clear the legacy 'sess' cookie that some browsers may still carry
// from the old HMAC-signed session system.
export const cookieClearLegacy = (): string =>
  `${LEGACY_COOKIE_NAME}=; ${cookieAttrs()}; Max-Age=0`;

// SEC-104: Check whether the request carries the old 'sess' cookie.
export function hasLegacyCookie(req: Request): boolean {
  const c = req.headers.get("cookie") || "";
  return new RegExp("(?:^|;\\s*)" + LEGACY_COOKIE_NAME + "=").test(c);
}

// ---- read the token from a Request ----
/** Extract the session token from the Cookie header of a Request. */
export function readToken(req: Request): string | null {
  const c = req.headers.get("cookie") || "";
  const re = new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)");
  const m = c.match(re);
  return m ? m[1] : null;
}

// Convenience for Hono handlers that already hold the raw Cookie header string.
export function readTokenFromHeader(cookieHeader: string | undefined): string | null {
  const c = cookieHeader || "";
  const re = new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)");
  const m = c.match(re);
  return m ? m[1] : null;
}

// ---- create / destroy a session in shared KV ----
// Mirror of session.js: maintain a per-user token index so reset/suspend can
// revoke all of a user's sessions. Index maintenance is best-effort.
const USER_SESSIONS_PREFIX = "userSessions:";
async function addUserSession(env: SessionEnv, userId: string, token: string): Promise<void> {
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    const list: string[] = cur ? JSON.parse(cur) : [];
    if (!list.includes(token)) list.push(token);
    await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: SESSION_TTL_S });
  } catch { /* best-effort index */ }
}
async function removeUserSession(env: SessionEnv, userId: string, token: string): Promise<void> {
  if (!userId || !token) return;
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    if (!cur) return;
    const list: string[] = (JSON.parse(cur) as string[]).filter((t) => t !== token);
    await env.SESSIONS.put(key, JSON.stringify(list), { expirationTtl: SESSION_TTL_S });
  } catch { /* best-effort index */ }
}

/** Create a new session in KV and return the token.
 *  SEC-107: Stores JSON { u: userId, c: createdAt } so we can detect stale
 *  sessions and rotate them. Old sessions (bare UUID) are handled gracefully. */
export async function createSession(env: SessionEnv, userId: string): Promise<string> {
  const token = newToken();
  const value = JSON.stringify({ u: userId, c: Date.now() });
  await env.SESSIONS.put(KV_PREFIX + token, value, { expirationTtl: SESSION_TTL_S });
  await addUserSession(env, userId, token);
  return token;
}

/** Delete a single session token from KV and remove it from the user index. */
export async function destroySession(env: SessionEnv, token: string | null): Promise<void> {
  if (token) {
    const raw = await env.SESSIONS.get(KV_PREFIX + token);
    await env.SESSIONS.delete(KV_PREFIX + token);
    if (raw) {
      // SEC-107: Parse JSON value to extract userId (or use bare UUID for legacy)
      const { userId } = parseSessionValue(raw);
      await removeUserSession(env, userId, token);
    }
  }
}

/** Revoke every live session for a user (password reset, admin suspend). */
export async function destroyAllUserSessions(env: SessionEnv, userId: string): Promise<void> {
  if (!userId) return;
  try {
    const key = USER_SESSIONS_PREFIX + userId;
    const cur = await env.SESSIONS.get(key);
    if (cur) {
      for (const t of JSON.parse(cur) as string[]) {
        try { await env.SESSIONS.delete(KV_PREFIX + t); } catch { /* one bad token doesn't stop the rest */ }
      }
    }
    await env.SESSIONS.delete(key);
  } catch { /* best-effort */ }
}

// ---- SEC-107: session rotation ----
// Parse a session KV value — handles both legacy bare UUID and new JSON format.
// Returns { userId, createdAt }. Bare UUID → createdAt=0 (forces rotation).
export function parseSessionValue(raw: string): { userId: string; createdAt: number } {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.u === "string") {
      return { userId: parsed.u, createdAt: typeof parsed.c === "number" ? parsed.c : 0 };
    }
  } catch { /* not JSON — legacy bare UUID */ }
  return { userId: raw, createdAt: 0 };
}

/** Rotate a session: create a fresh token, transfer 2FA flags, delete the old
 *  session, and return the new token. */
export async function rotateSession(
  env: SessionEnv,
  oldToken: string,
  userId: string
): Promise<string> {
  const fresh = newToken();
  const value = JSON.stringify({ u: userId, c: Date.now() });
  await env.SESSIONS.put(KV_PREFIX + fresh, value, { expirationTtl: SESSION_TTL_S });
  await addUserSession(env, userId, fresh);

  // Transfer 2FA verification flag if present (admin dashboard uses 2fa:<token>)
  try {
    const tfaKey = `2fa:${oldToken}`;
    const tfaValue = await env.SESSIONS.get(tfaKey);
    if (tfaValue) {
      await env.SESSIONS.put(`2fa:${fresh}`, tfaValue, { expirationTtl: 3600 });
      await env.SESSIONS.delete(tfaKey);
    }
  } catch { /* best-effort 2FA transfer */ }

  // Delete old session from KV and user index
  await destroySession(env, oldToken);
  return fresh;
}

/** Like currentUserId but also detects and performs session rotation.
 *  Returns the userId and an optional Set-Cookie header if rotation happened. */
export async function resolveSession(
  req: Request,
  env: SessionEnv
): Promise<{ uid: string; rotatedCookie?: string } | null> {
  const token = readToken(req);
  if (!token) return null;
  const raw = await env.SESSIONS.get(KV_PREFIX + token);
  if (!raw) return null;

  const { userId, createdAt } = parseSessionValue(raw);

  // Check if rotation is needed: legacy bare UUID (createdAt=0) or older than 24h
  const needsRotation =
    createdAt === 0 || (Date.now() - createdAt) > SESSION_ROTATE_AFTER_S * 1000;

  if (needsRotation) {
    try {
      const fresh = await rotateSession(env, token, userId);
      return { uid: userId, rotatedCookie: cookieSet(fresh) };
    } catch {
      // Rotation failed — still serve the request with the old session
    }
  }

  // Sliding-window TTL refresh — fire-and-forget, never blocks the request.
  try {
    env.SESSIONS.put(KV_PREFIX + token, raw, { expirationTtl: SESSION_TTL_S }).catch(() => {});
    const idxKey = "userSessions:" + userId;
    env.SESSIONS.get(idxKey).then((cur) => {
      if (cur) env.SESSIONS.put(idxKey, cur, { expirationTtl: SESSION_TTL_S }).catch(() => {});
    }).catch(() => {});
  } catch { /* best-effort TTL refresh */ }

  return { uid: userId };
}

// ---- resolve the current user's UUID (no DB read) ----
// SEC-107: Delegates to resolveSession which handles rotation transparently.
// Backward-compatible: returns just the uid string. Callers that need the
// rotation cookie should use resolveSession() directly.
export async function currentUserId(req: Request, env: SessionEnv): Promise<string | null> {
  const result = await resolveSession(req, env);
  return result?.uid ?? null;
}

export async function currentUserIdFromHeader(
    cookieHeader: string | undefined,
    env: SessionEnv
  ): Promise<string | null> {
    const token = readTokenFromHeader(cookieHeader);
    if (!token) return null;
    const raw = await env.SESSIONS.get(KV_PREFIX + token);
    if (!raw) return null;

    const { userId, createdAt } = parseSessionValue(raw);

    // SEC-107: Rotate if stale
    const needsRotation =
      createdAt === 0 || (Date.now() - createdAt) > SESSION_ROTATE_AFTER_S * 1000;
    if (needsRotation) {
      try { await rotateSession(env, token, userId); } catch { /* best-effort */ }
    } else {
      // Sliding-window TTL refresh
      try {
        env.SESSIONS.put(KV_PREFIX + token, raw, { expirationTtl: SESSION_TTL_S }).catch(() => {});
        const idxKey = "userSessions:" + userId;
        env.SESSIONS.get(idxKey).then((cur) => {
          if (cur) env.SESSIONS.put(idxKey, cur, { expirationTtl: SESSION_TTL_S }).catch(() => {});
        }).catch(() => {});
      } catch { /* best-effort */ }
    }
    return userId;
  }

// ---- resolve the full user row via an injected loader ----
// loadUser keeps this module free of the bot Worker's pg/Hyperdrive layer, so it
// is identical to the JS version. Bot loader example:
//   (env, uid) => one(`SELECT id, email, display_name, telegram_user_id, plan,
//                             plan_expires_at, status, is_admin
//                        FROM users WHERE id = $1`, [uid])
export async function currentUser<T>(
  req: Request,
  env: SessionEnv,
  loadUser: (env: SessionEnv, uid: string) => Promise<T | null>
): Promise<T | null> {
  const uid = await currentUserId(req, env);
  if (!uid) return null;
  return loadUser(env, uid);
}

// SEC-104: Legacy rk_session cookie support removed. The migration grace
// period is over. Only gm_session is accepted. The old 'sess' cookie
// (HMAC-signed stateless) is detected and cleared on every response.
//
// SEC-107: Session tokens are rotated when older than 24 hours (or on first
// read of a legacy bare-UUID session). Use resolveSession() to get the
// rotation cookie, or currentUserId() for backward-compatible uid-only resolution.
