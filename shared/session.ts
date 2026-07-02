// ============================================================================
//  GroupsMix — SHARED SESSION (bot Worker, TypeScript)
//
//  Byte-for-byte-behavioural port of shared/session.js. See that file's header
//  for the full model. Summary:
//    * Cookie name:   gm_session
//    * Cookie domain: .groupsmix.com
//    * KV namespace:  SESSIONS  (SAME namespace id as the leaderboard Worker)
//    * KV key:        sess:<token>   value: bare user UUID
//    * TTL:           30 days
//
//  IMPORTANT — this REPLACES the bot Worker's old HMAC-signed stateless `sess`
//  cookie (see dashboard.ts signSession/verifySession). Reasons:
//    1. The leaderboard Worker cannot verify the bot's HMAC signature and
//       vice-versa, so a stateless token is NOT cross-Worker shareable.
//    2. A KV-backed token gives real server-side logout (delete the key) and a
//       single shape both Workers already understand (bare UUID -> users.id).
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
export const COOKIE_DOMAIN = ".groupsmix.com";
export const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days
export const KV_PREFIX = "sess:";

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

// ---- read the token from a Request ----
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
export async function createSession(env: SessionEnv, userId: string): Promise<string> {
  const token = newToken();
  await env.SESSIONS.put(KV_PREFIX + token, userId, { expirationTtl: SESSION_TTL_S });
  return token;
}

export async function destroySession(env: SessionEnv, token: string | null): Promise<void> {
  if (token) await env.SESSIONS.delete(KV_PREFIX + token);
}

// ---- resolve the current user's UUID (no DB read) ----
export async function currentUserId(req: Request, env: SessionEnv): Promise<string | null> {
  const token = readToken(req);
  if (!token) return null;
  const uid = await env.SESSIONS.get(KV_PREFIX + token);
  return uid || null;
}

export async function currentUserIdFromHeader(
  cookieHeader: string | undefined,
  env: SessionEnv
): Promise<string | null> {
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
export async function currentUser<T>(
  req: Request,
  env: SessionEnv,
  loadUser: (env: SessionEnv, uid: string) => Promise<T | null>
): Promise<T | null> {
  const uid = await currentUserId(req, env);
  if (!uid) return null;
  return loadUser(env, uid);
}
