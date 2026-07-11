// Tests for public API handlers: /api/public/:slug/*
// Tests response shapes, error paths, and input validation.
// Uses bun:test with mocked DB and auth deps.
//
// Run: bun test src/__tests__/public-handlers.test.js
//   or: bun test   (from apps/leaderboard/)

import { describe, it, expect, mock, beforeEach } from "bun:test";

// ── Mock shared modules ────────────────────────────────────────────────
const dbUrl    = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs  = import.meta.resolve("../../../../shared/db.ts");
const sessUrl  = import.meta.resolve("../../../../shared/session.js");
const sessUrlTs = import.meta.resolve("../../../../shared/session.ts");

const mockSiteData = {
  brand: { name: "Test Casino", casino: "Stake", period: "Monthly", prizePool: "$10,000" },
  players: [
    { name: "Alice", wagered: 50000, prize: "$5,000" },
    { name: "Bob", wagered: 30000, prize: "$3,000" },
    { name: "Charlie", wagered: 10000, prize: "$1,000" },
  ],
  endsAt: new Date(Date.now() + 86400000).toISOString(),
};

const dbMock = () => ({
  one: mock(() => Promise.resolve(null)),
  exec: mock(() => Promise.resolve()),
  query: mock(() => Promise.resolve([])),
  getSql: () => null,
  withTransaction: async (fn) => fn({ one: () => Promise.resolve(null), exec: () => Promise.resolve(), query: () => Promise.resolve([]) }),
});
const sessMock = () => ({
  createSession: () => Promise.resolve("tok"),
  destroySession: () => Promise.resolve(),
  destroyAllUserSessions: () => Promise.resolve(),
  cookieSet: (t) => `yr_session=${t}`,
  cookieClear: () => "yr_session=",
  readToken: () => null,
  hasLegacyCookie: () => false,
  cookieClearLegacy: () => "sess=",
  // SEC-107: shared session module now resolves via resolveSession + loadUser
  resolveSession: (_req) => Promise.resolve({
    userId: null,
    uid: null,
    cookie: null,
    rotatedCookie: null,
  }),
  loadUser: (_env, userId) => Promise.resolve(null),
  SESSION_ROTATE_AFTER_S: 86400,
  SESSION_TTL_S: 2592000,
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);
mock.module(sessUrl, sessMock);
mock.module(sessUrlTs, sessMock);

// ── Import after mocks ─────────────────────────────────────────────────
import { handlePublicStandings, handlePublicPlayers, handlePublicRank, handlePublicData } from "../handlers/public.js";

// Helper: build a minimal Request
function req(url, method = "GET") {
  return new Request(url, { method });
}

// Mock env with KV for rate limiting
function mockEnv(siteData = mockSiteData) {
  const store = new Map();
  return {
    SESSIONS: {
      get: (key) => Promise.resolve(store.get(key) ?? null),
      put: (key, value) => { store.set(key, value); return Promise.resolve(); },
    },
    HYPERDRIVE: { connectionString: "postgresql://mock" },
    __siteData: siteData,
  };
}

// Patch getPublicSite to return mock data (we need to intercept at the site.js level)
// Since handlers import getPublicSite from "../site.js", we mock the site module
const siteUrl = import.meta.resolve("../site.js");
const siteUrlTs = import.meta.resolve("../site.ts");

mock.module(siteUrl, () => ({
  getPublicSite: (_env, slug) => {
    if (slug === "nonexistent") return null;
    if (slug === "suspended") return { suspended: true, data: {} };
    return { id: "site-1", data: mockSiteData, plan: "pro", suspended: false };
  },
}));
mock.module(siteUrlTs, () => ({
  getPublicSite: (_env, slug) => {
    if (slug === "nonexistent") return null;
    if (slug === "suspended") return { suspended: true, data: {} };
    return { id: "site-1", data: mockSiteData, plan: "pro", suspended: false };
  },
}));

// ── handlePublicStandings ──────────────────────────────────────────────
describe("handlePublicStandings", () => {
  it("returns JSON with correct shape", async () => {
    const env = mockEnv();
    const res = await handlePublicStandings(req("https://test.com/api/public/testboard/standings"), env, { slug: "testboard" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("slug", "testboard");
    expect(body).toHaveProperty("name", "Test Casino");
    expect(body).toHaveProperty("casino", "Stake");
    expect(body).toHaveProperty("period", "Monthly");
    expect(body).toHaveProperty("prizePool", "$10,000");
    expect(body).toHaveProperty("players");
    expect(Array.isArray(body.players)).toBe(true);
    expect(body.players).toHaveLength(3);
    // Players should be sorted by wagered descending
    expect(body.players[0].wagered).toBeGreaterThanOrEqual(body.players[1].wagered);
    // Each player should have name, wagered, prize, position
    expect(body.players[0]).toHaveProperty("name");
    expect(body.players[0]).toHaveProperty("wagered");
    expect(body.players[0]).toHaveProperty("prize");
    expect(body.players[0]).toHaveProperty("position");
    // Countdown should exist when endsAt is set
    expect(body).toHaveProperty("countdown");
    expect(body.countdown).toHaveProperty("endsAt");
    expect(body.countdown).toHaveProperty("remaining");
  });

  it("returns 404 for nonexistent slug", async () => {
    const env = mockEnv();
    const res = await handlePublicStandings(req("https://test.com/api/public/nonexistent/standings"), env, { slug: "nonexistent" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for suspended site", async () => {
    const env = mockEnv();
    const res = await handlePublicStandings(req("https://test.com/api/public/suspended/standings"), env, { slug: "suspended" });
    expect(res.status).toBe(404);
  });
});

// ── handlePublicPlayers ────────────────────────────────────────────────
describe("handlePublicPlayers", () => {
  it("returns players array with correct shape", async () => {
    const env = mockEnv();
    const res = await handlePublicPlayers(req("https://test.com/api/public/testboard/players"), env, { slug: "testboard" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("players");
    expect(Array.isArray(body.players)).toBe(true);
    expect(body.players).toHaveLength(3);
    // Sorted by wagered descending
    expect(body.players[0].wagered).toBeGreaterThanOrEqual(body.players[1].wagered);
  });

  it("returns 404 for nonexistent slug", async () => {
    const env = mockEnv();
    const res = await handlePublicPlayers(req("https://test.com/api/public/nonexistent/players"), env, { slug: "nonexistent" });
    expect(res.status).toBe(404);
  });
});

// ── handlePublicRank ───────────────────────────────────────────────────
describe("handlePublicRank", () => {
  it("returns plain-text rank for matching user", async () => {
    const env = mockEnv();
    const res = await handlePublicRank(req("https://test.com/api/public/testboard/rank?user=Alice"), env, { slug: "testboard" });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Alice");
    expect(text).toContain("#1");
    expect(text).toContain("Test Casino");
    expect(res.headers.get("content-type")).toContain("text/plain");
  });

  it("returns 400 when user param missing", async () => {
    const env = mockEnv();
    const res = await handlePublicRank(req("https://test.com/api/public/testboard/rank"), env, { slug: "testboard" });
    expect(res.status).toBe(400);
  });

  it("returns not-found message for unknown user", async () => {
    const env = mockEnv();
    const res = await handlePublicRank(req("https://test.com/api/public/testboard/rank?user=Unknown"), env, { slug: "testboard" });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("not on");
  });
});

// ── handlePublicData ───────────────────────────────────────────────────
describe("handlePublicData", () => {
  it("returns full data object", async () => {
    const env = mockEnv();
    const res = await handlePublicData(req("https://test.com/api/public/testboard"), env, { slug: "testboard" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("brand");
    expect(body).toHaveProperty("players");
  });

  it("returns 404 for nonexistent slug", async () => {
    const env = mockEnv();
    const res = await handlePublicData(req("https://test.com/api/public/nonexistent"), env, { slug: "nonexistent" });
    expect(res.status).toBe(404);
  });
});
