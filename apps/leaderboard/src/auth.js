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
  readTokenWithLegacy,
  KV_PREFIX,
} from "../../../shared/session.js";
// PBKDF2-SHA256. OWASP 2023+ guidance is >=600,000 iterations for SHA-256; the
// old 100,000 was below that. We version the stored hash as "<iters>$<hex>" so
// legacy bare-hex hashes (implicitly 100k, from before this change) still
// verify, and verifyPassword reports whether a rehash to the current count is
// needed so login can lazily upgrade old hashes without a password reset.
const PBKDF2_ITERATIONS = 600000;
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
export const readToken = (req) => readTokenWithLegacy(req);

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

// Resolves the current user from the shared session. Uses readTokenWithLegacy
// (not the shared currentUserId, which only reads gm_session) so that during
// the cutover grace period an old rk_session cookie still authenticates. The KV
// prefix is identical (sess:) for both cookie names, so the same token resolves
// the same userId regardless of which cookie carried it.
export async function currentUser(req, env) {
  const token = readTokenWithLegacy(req);
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
