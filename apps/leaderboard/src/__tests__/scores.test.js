// Unit tests for the score postback handler.
// Uses bun:test + mock.module to isolate from DB / KV.
//
// Run: bun test src/__tests__/scores.test.js

import { mock, test, expect, describe, beforeEach, beforeAll, afterAll, jest } from "bun:test";

// ── resolve dep paths before any mock.module calls ────────────────────────
const _sessionUrl   = import.meta.resolve("../../../../shared/session.js");
const _dbUrl        = import.meta.resolve("../../../../shared/db.js");
const _cryptoUrl    = import.meta.resolve("../../../../shared/crypto.js");

// ── shared state that individual tests can override ────────────────────────
let _rateLimitCount = 0;
let _siteRow = null;
let _ownerRow = null;
let _existingSiteRow = null;
let _saveSiteResult = {};

mock.module(_dbUrl, () => ({
  one: (sql, _params) => {
    if (sql.includes("postback_key"))       return Promise.resolve(_siteRow);
    if (sql.includes("plan_expires_at"))    return Promise.resolve(_ownerRow);
    if (sql.includes("SELECT id, slug, name")) return Promise.resolve(_existingSiteRow);
    return Promise.resolve(null);
  },
  exec:  () => Promise.resolve(),
  query: () => Promise.resolve([]),
}));

mock.module(_sessionUrl, () => ({
    createSession:          () => Promise.resolve("mock-token"),
    destroySession:         () => Promise.resolve(),
    destroyAllUserSessions: () => Promise.resolve(),
    cookieSet:  (t) => `yr_session=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
    cookieClear: ()  => "yr_session=; Path=/; Max-Age=0",
    readToken:  () => null,
    resolveSession:       () => Promise.resolve({ userId: null, cookie: null }),
    loadUser:             () => Promise.resolve(null),
    hasLegacyCookie:  () => false,
    cookieClearLegacy: () => "sess=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    SESSION_ROTATE_AFTER_S: 86400,
    SESSION_TTL_S: 2592000, // 30 days
    }));

  // Mock crypto.js so HMAC verification always passes in tests
  // Include the full crypto API so later tests in the same process don't see
  // a partial crypto module (bun:test mock.module state can persist across files).
mock.module(_cryptoUrl, () => ({
  decryptToken: (enc) => enc,
  encryptToken: (s) => s,
  reencryptToken: (s) => s,
  encrypt: (s) => s,
  decrypt: (s) => s,
  verifyHmacSha256Hex: async () => true,
  safeEqual: (a, b) => a === b,
  isCurrentVersion: () => true,
  newClickRef: () => "ref",
  newLinkSlug: () => "slug",
  newWebhookSecret: () => "secret",
  hashIp: async (ip) => ip,
}));

mock.module("../site.js", () => ({
  saveSite: async () => _saveSiteResult,
}));

mock.module("../billing.js", () => ({
  effectivePlan: (user) => {
    if (!user || user.status === "suspended") return "free";
    const plan = String(user.plan || "free").toLowerCase();
    const expired = user.plan_expires_at == null || Number(user.plan_expires_at) <= Date.now();
    if (expired) return "free";
    return ["agency", "pro", "starter"].includes(plan) ? plan : "free";
  },
  PLAN_LIMITS: { free: 10, starter: 25, pro: 9999, agency: 9999 },
}));

const { handleScores } = await import("../handlers/scores.js");

// QA-006: Freeze the clock so Date.now()-based tests are deterministic
const FROZEN_TIME = new Date("2025-06-15T12:00:00Z").getTime();
beforeAll(() => { jest.setSystemTime(FROZEN_TIME); });
afterAll(() => { jest.useRealTimers(); });

// ── helpers ───────────────────────────────────────────────────────────────

function makeRequest(opts = {}) {
  const headers = new Headers(opts.headers || {});
  // Include HMAC signature by default when x-postback-key is present
  if (headers.has("x-postback-key") && !headers.has("x-postback-signature")) {
    headers.set("x-postback-signature", "test-hmac-signature");
  }
  return new Request("https://yourrank.site/api/scores", {
    method: "POST",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

const proOwner    = () => ({ plan: "pro", plan_expires_at: Date.now() + 86_400_000 * 30, status: "active" });
const agencyOwner = () => ({ plan: "agency", plan_expires_at: Date.now() + 86_400_000 * 30, status: "active" });
const site        = () => ({ id: "site-1", user_id: "user-1" });
const existingSite = () => ({
  id: "site-1", slug: "testslug", name: "Test", tagline: "", casino: "Stake",
  code: "CODE", cta_url: "", prize_pool: "", period: "Monthly", ends_at: null,
  reset_note: null, blurb: "", extra_json: null, published: true, theme_json: null,
  updated_at: new Date().toISOString(),
});

// Environment with a controllable SESSIONS KV so the real rate limiter can fail closed.
function makeEnv() {
  return {
    SESSIONS: {
      get: () => Promise.resolve(String(_rateLimitCount)),
      put: () => Promise.resolve(),
    },
  };
}

// ── tests ─────────────────────────────────────────────────────────────────

describe("handleScores — auth", () => {
  test("missing X-Postback-Key returns 401", async () => {
    const req = makeRequest({ body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("X-Postback-Key");
  });

  test("rate limit exceeded returns 429", async () => {
    _rateLimitCount = 10;
    const req = makeRequest({ headers: { "x-postback-key": "valid-key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(429);
    _rateLimitCount = 0;
  });

  test("unknown postback key returns 401", async () => {
    _siteRow = null;
    const req = makeRequest({ headers: { "x-postback-key": "unknown-key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(401);
  });

  test("missing board slug or siteId returns 400", async () => {
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("slug");
  });

  test("non-matching board slug returns 401", async () => {
    _siteRow = null;
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "wrong-slug", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(401);
  });
});

describe("handleScores — plan gate", () => {
  test("free-plan owner gets 403 with Pro hint", async () => {
    _siteRow = site();
    _ownerRow = { plan: "free", plan_expires_at: null, status: "active" };
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Pro");
  });

  test("starter-plan owner gets 403", async () => {
    _siteRow = site();
    _ownerRow = { plan: "starter", plan_expires_at: Date.now() + 86_400_000, status: "active" };
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(403);
  });

  test("suspended owner gets 403", async () => {
    _siteRow = site();
    _ownerRow = { plan: "pro", plan_expires_at: Date.now() + 86_400_000, status: "suspended" };
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(403);
  });

  test("expired pro plan gets 403", async () => {
    _siteRow = site();
    _ownerRow = { plan: "pro", plan_expires_at: Date.now() - 1000, status: "active" };
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: [] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(403);
  });
});

describe("handleScores — payload validation", () => {
  beforeEach(() => {
    _siteRow = site();
    _ownerRow = proOwner();
    _existingSiteRow = existingSite();
    _saveSiteResult = {};
  });

  test("missing JSON body returns 400", async () => {
    const req = new Request("https://yourrank.site/api/scores", {
      method: "POST",
      headers: { "x-postback-key": "key", "x-postback-signature": "test-sig", "content-type": "text/plain" },
      body: "not json",
    });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(400);
  });

  test("players not an array returns 400", async () => {
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: "notanarray" } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("array");
  });

  test("too many players for plan returns 400", async () => {
    _ownerRow = agencyOwner();
    const players = Array.from({ length: 10000 }, (_, i) => ({ name: `Player${i}`, wagered: 100 }));
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("players");
  });

  test("valid pro request returns 200 with player count", async () => {
    const players = [
      { name: "Alice", wagered: 5000, prize: 100 },
      { name: "Bob",   wagered: 3000, prize: 50  },
    ];
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.players).toBe(2);
  });

  test("players without a name are filtered out", async () => {
    const players = [
      { name: "Alice", wagered: 1000 },
      { wagered: 500 },           // no name — filtered
      { name: "", wagered: 200 }, // empty name — filtered
    ];
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.players).toBe(1); // only Alice
  });

  test("saveSite error is surfaced as 400", async () => {
    _saveSiteResult = { error: "slug already taken" };
    const req = makeRequest({ headers: { "x-postback-key": "key" }, body: { slug: "test", players: [{ name: "Alice", wagered: 100 }] } });
    const res = await handleScores(req, makeEnv());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("slug already taken");
  });
});
