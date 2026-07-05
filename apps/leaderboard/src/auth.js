// Auth helpers for the Worker.
import { one, exec } from "../../../shared/db.js";
import { rateLimit as kvRateLimit } from "../../../shared/ratelimit.js";
// SHARED cross-Worker session: same cookie (gm_session) + same SESSIONS KV as
// the bot Worker, so one login works across both. See ../../../shared/session.ts
// (compiled to session.js for the leaderboard Worker).
import {
  createSession as _createSession,
  destroySession as _destroySession,
  destroyAllUserSessions as _destroyAllUserSessions,
  cookieSet as _cookieSet,
  cookieClear as _cookieClear,
  // SEC-104: readTokenWithLegacy removed (grace period over)
  KV_PREFIX,
  // SEC-104: legacy cookie helpers
  hasLegacyCookie,
  cookieClearLegacy,
  // SEC-107: session rotation
  rotateSession as _rotateSession,
  parseSessionValue,
  SESSION_ROTATE_AFTER_S,
} from "../../../shared/session.js";
// Why 100,000 and not OWASP's 600,000:
//   Cloudflare Workers runtime rejects PBKDF2 iteration counts above 100,000
//   with: "iteration counts above 100000 are not supported". This is a hard
//   runtime limit, not a CPU-time issue. 100k is the maximum the Workers
//   WebCrypto implementation accepts for PBKDF2.
//
//   OWASP's >=600k guidance targets long-lived Node servers, not edge
//   functions with constrained WebCrypto implementations.
//
//   Lazy rehash: verifyPassword() returns needsRehash=true when the stored hash
//   used fewer iterations than PBKDF2_ITERATIONS. Callers re-hash and persist
//   on successful login — existing users upgrade automatically, no forced reset.
//
//   Migration path if the Workers limit ever lifts:
//   1. Bump PBKDF2_ITERATIONS — lazy rehash handles the rest.
//   2. Or switch to argon2id if Workers adds native support.
const PBKDF2_ITERATIONS = 100000;
const LEGACY_ITERATIONS = 100000;  // same as current — kept for future-proofing if iterations change
// CODE-007: bytesToHex and hexToBytes duplicate helpers in shared/crypto.ts.
// safeEqual also duplicates the constant-time comparison pattern used by
// verifyHmacSha256Hex in shared/crypto.ts. Do NOT refactor now (too risky for
// a hot-fix wave), but the next cleanup pass should import these from the shared
// module instead of maintaining two copies.
const enc = new TextEncoder();
const bytesToHex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const hexToBytes = (h) => {
  const o = new Uint8Array(h.length / 2);
  for (let i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16);
  return o;
};

// Parse a stored hash: "iters$hex" (versioned) or bare "hex" (legacy 100k).
function parseStored(stored) {
  const s = String(stored ?? "");
  const i = s.indexOf("$");
  if (i > 0 && /^\d+$/.test(s.slice(0, i))) return { iterations: Number(s.slice(0, i)), hash: s.slice(i + 1) };
  return { iterations: LEGACY_ITERATIONS, hash: s };
}

export async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const km = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, km, 256);
  // Versioned so a future count bump re-upgrades lazily the same way.
  return { salt: bytesToHex(salt), hash: `${PBKDF2_ITERATIONS}$${bytesToHex(new Uint8Array(bits))}` };
}

export function safeEqual(a, b) {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    diff |= (sa.charCodeAt(i) ?? 0) ^ (sb.charCodeAt(i) ?? 0);
  }
  return diff === 0;
}

// Returns { ok, needsRehash } — needsRehash is true when the stored hash used
// fewer iterations than the current target, so the caller can re-hash+persist.
export async function verifyPassword(password, saltHex, expected) {
  const { iterations, hash: expectedHex } = parseStored(expected);
  const km = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: hexToBytes(saltHex), iterations, hash: "SHA-256" }, km, 256);
  const computed = bytesToHex(new Uint8Array(bits));
  return { ok: safeEqual(computed, expectedHex), needsRehash: iterations < PBKDF2_ITERATIONS };
}

export const uuid = () => crypto.randomUUID();
export const newToken = () => bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

// Session mechanics delegate to the SHARED module (gm_session + shared KV).
// These thin wrappers keep the existing call sites in index.js unchanged.
export const createSession = (env, userId) => _createSession(env, userId);
export const destroySession = (env, token) => _destroySession(env, token);
export const destroyAllUserSessions = (env, userId) => _destroyAllUserSessions(env, userId);
export const cookieSet = (token) => _cookieSet(token);
export const cookieClear = () => _cookieClear();
// readToken is used locally by currentUser(). Re-exported for other modules.
import { readToken } from "../../../shared/session.js";
export { readToken };

// Loads the full user row from Postgres for a resolved user id.
// TIMESTAMPTZ columns come back as epoch-ms so downstream code (effectivePlan,
// the /api/auth/me payload, the admin/dashboard frontends) keeps treating them
// as numeric millisecond timestamps exactly like the old D1 INTEGER columns.
const loadUser = (env, uid) =>
    one(
      `SELECT id, email, plan,
              (EXTRACT(EPOCH FROM plan_expires_at) * 1000)::double precision AS plan_expires_at,
              status, is_admin,
              (EXTRACT(EPOCH FROM created_at) * 1000)::double precision AS created_at
         FROM users WHERE id=$1`,
      [uid]
    );

// SEC-104: Legacy cookie detection helper — re-exported for index.js
export { hasLegacyCookie, cookieClearLegacy };

// SEC-104: Resolves the current user from the shared session using the
// standard readToken (gm_session only; legacy rk_session support removed).
// SEC-107: Also handles session rotation. When a session is older than 24h
// (or is a legacy bare-UUID session), a new token is issued. The new
// Set-Cookie header is attached to req._sessionCookies for the main handler
// to include in the response.
export async function currentUser(req, env) {
    const token = readToken(req);
    if (!token) return null;
    const raw = await env.SESSIONS.get(KV_PREFIX + token);
    if (!raw) return null;

    // Parse session value — handles both JSON and legacy bare UUID
    const { userId, createdAt } = parseSessionValue(raw);

    // SEC-107: Rotate if legacy bare UUID or older than 24h
    let rotated = false;
    const age = Date.now() - createdAt;
    if (createdAt === 0 || age > SESSION_ROTATE_AFTER_S * 1000) {
      try {
        const fresh = await _rotateSession(env, token, userId);
        const newCookie = cookieSet(fresh);
        if (!req._sessionCookies) req._sessionCookies = [];
        req._sessionCookies.push(newCookie);
        rotated = true;
      } catch {
        // Rotation failed — still serve the request with the old session
      }
    }

    // Sliding-window TTL refresh (only if we didn't rotate — the old entry is deleted after rotation)
    if (!rotated) {
      try {
        env.SESSIONS.put(KV_PREFIX + token, raw, { expirationTtl: 60 * 60 * 24 * 30 }).catch(() => {});
      } catch { /* best-effort */ }
    }

    // SEC-104: If the request carries a legacy 'sess' cookie, schedule it for clearing
    if (hasLegacyCookie(req)) {
      if (!req._sessionCookies) req._sessionCookies = [];
      req._sessionCookies.push(cookieClearLegacy());
    }

    return loadUser(env, userId);
  }

// Rate limit wrapper — delegates to the shared KV-based rate limiter.
// Accepts `env` for backward compatibility with existing callers; extracts
// env.SESSIONS and forwards to the shared implementation.
// Returns { ok, remaining, limit, retryAfter } — callers should destructure { ok }.
export async function rateLimit(env, key, limit, ttlSeconds) {
  return kvRateLimit(env.SESSIONS, key, limit, ttlSeconds);
}
export const clientIp = (req) => req.headers.get("cf-connecting-ip") || "0.0.0.0";

export async function requireUser(req, env) {
  const u = await currentUser(req, env);
  if (!u) return { user: null, res: new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } }) };
  return { user: u, res: null };
}

export const isEmail = (s) => typeof s === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
export function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
export const RESERVED = new Set(["api", "assets", "login", "signup", "logout", "dashboard", "admin", "account", "billing", "favicon", "robots", "sitemap", "index", "forgot", "reset", "terms", "privacy", "responsible", "logo", "go", "stats", "bot", "hook", "r", "pb", "health"]);
export const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
export const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);
export const ok = (data = {}) => json({ ok: true, ...data });
export const readJson = async (req) => { try { return await req.json(); } catch { return null; } };


// POST /api/account/delete — GDPR account deletion (DB-102).
// Requires authentication + password confirmation. Deletes the user row;
// ON DELETE CASCADE handles cleanup of children (sites, players, offers,
// short_links, payments, subscriptions, etc.). Destroys all sessions.
export async function handleAccountDelete(request, env) {
    try {
      const user = await currentUser(request, env);
      if (!user) return bad("unauthorized", 401);
      const userPw = await one("SELECT password_hash, password_salt FROM users WHERE id=$1", [user.id]);
      if (userPw?.password_hash) {
        // User has a password — require it for deletion
        const body = await readJson(request);
        if (!body || !body.password) return bad("Password required to confirm deletion");
        const { ok: pwOk } = await verifyPassword(body.password, userPw.password_salt, userPw.password_hash);
        if (!pwOk) return bad("Incorrect password", 401);
      }
      // Telegram-only users (no password): session itself is proof of identity.
      // BIZ-005: GDPR-compliant self-delete for passwordless accounts.
      await exec("DELETE FROM users WHERE id=$1", [user.id]);
      await destroyAllUserSessions(env, user.id);
      return ok({ message: "Account deleted successfully." });
  } catch (e) {
    console.error("account delete failed:", String(e?.message || e));
    return bad("Account deletion failed. Please try again.", 500);
  }
}
