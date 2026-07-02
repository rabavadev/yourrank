// Auth helpers for the Worker.
import { one } from "./db.js";
// SHARED cross-Worker session: same cookie (gm_session) + same SESSIONS KV as
// the bot Worker, so one login works across both. See ../../../shared/session.js.
import {
  createSession as _createSession,
  destroySession as _destroySession,
  destroyAllUserSessions as _destroyAllUserSessions,
  cookieSet as _cookieSet,
  cookieClear as _cookieClear,
  // SEC-104: readTokenWithLegacy removed (grace period over)
  KV_PREFIX,
} from "../../../shared/session.js";
// PBKDF2-SHA256 iteration count.
//
// IMPORTANT — why this is NOT 600,000: Cloudflare Workers cap CPU time per
// invocation. deriveBits is native but counted as CPU. 600k PBKDF2-SHA256
// in a SINGLE deriveBits call takes well over the budget and threw `error
// code: 1101` (uncaught exception) on /api/auth/signup — account creation
// was completely broken. 100k is the proven-working value (the project
// shipped with it; existing users signed up on it).
//
// OWASP's >=600k guidance is for a normal long-lived Node server, not a
// CPU-capped edge function. Keeping 100k here is the honest tradeoff: a
// working app beats an idealised number that takes the auth flow down.
//
// The versioned-hash + lazy-rehash infra below stays in place: if auth ever
// moves off Workers (or Workers raises the limit), bump PBKDF2_ITERATIONS
// and existing hashes upgrade automatically on next login. Until then the
// target equals the legacy count so no rehash runs.
const PBKDF2_ITERATIONS = 100000;
const LEGACY_ITERATIONS = 100000;
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
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
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
// readToken honors a legacy rk_session cookie during the cutover grace period.
// SEC-104: use shared readToken directly (legacy shim removed)
export { readToken } from "../../../shared/session.js";
import { readToken } from "../../../shared/session.js";

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

// SEC-104: Resolves the current user from the shared session using the
// standard readToken (gm_session only; legacy rk_session support removed).
export async function currentUser(req, env) {
  const token = readToken(req);
  if (!token) return null;
  const uid = await env.SESSIONS.get(KV_PREFIX + token);
  if (!uid) return null;
  return loadUser(env, uid);
}

// Cheap KV counter rate limit. Returns true while under the limit.
export async function rateLimit(env, key, limit, ttlSeconds) {
  const k = `rl:${key}`;
  const cur = parseInt((await env.SESSIONS.get(k)) || "0", 10);
  if (cur >= limit) return false;
  await env.SESSIONS.put(k, String(cur + 1), { expirationTtl: ttlSeconds });
  return true;
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
    if (!user.password_hash) return bad("Account deletion requires a password. Contact support.", 400);
    const body = await readJson(request);
    if (!body || !body.password) return bad("Password required to confirm deletion");
    const { ok: pwOk } = await verifyPassword(body.password, user.password_salt, user.password_hash);
    if (!pwOk) return bad("Incorrect password", 401);
    // Delete the user row — ON DELETE CASCADE removes all child rows.
    await exec("DELETE FROM users WHERE id=$1", [user.id]);
    // Destroy all sessions for this user.
    await destroyAllUserSessions(env, user.id);
    return ok({ message: "Account deleted successfully." });
  } catch (e) {
    console.error("account delete failed:", String(e?.message || e));
    return bad("Account deletion failed. Please try again.", 500);
  }
}
