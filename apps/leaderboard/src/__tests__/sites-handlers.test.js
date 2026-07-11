// Tests for sites handlers: /api/site/* and /api/boards/*
// Tests response shapes, error paths, and auth.
// Uses bun:test with mocked DB and KV session store.
//
// Run: bun test src/__tests__/sites-handlers.test.js

import { describe, it, expect, mock, beforeEach } from "bun:test";

// ── Mock shared modules ────────────────────────────────────────────────
const dbUrl    = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs  = import.meta.resolve("../../../../shared/db.ts");
const sessUrl  = import.meta.resolve("../../../../shared/session.js");
const sessUrlTs = import.meta.resolve("../../../../shared/session.ts");

const mockExec = mock(() => Promise.resolve());
const mockOne = mock(() => Promise.resolve(null));
const mockQuery = mock(() => Promise.resolve([]));

const dbMock = () => ({
  one: (...args) => mockOne(...args),
  exec: (...args) => mockExec(...args),
  query: (...args) => mockQuery(...args),
  getSql: () => null,
  withTransaction: async (fn) => fn({ one: (...a) => mockOne(...a), exec: (...a) => mockExec(...a), query: (...a) => mockQuery(...a) }),
});
const sessMock = () => ({
  createSession: () => Promise.resolve("tok"),
  destroySession: () => Promise.resolve(),
  destroyAllUserSessions: () => Promise.resolve(),
  cookieSet: (t) => `yr_session=${t}`,
  cookieClear: () => "yr_session=",
  readToken: (req) => {
    const cookie = req?.headers?.get?.("cookie") || "";
    const m = cookie.match(/yr_session=([^;]+)/);
    return m ? m[1] : null;
  },
  resolveSession: (req) => {
    const cookie = req?.headers?.get?.("cookie") || "";
    const m = cookie.match(/yr_session=([^;]+)/);
    return Promise.resolve({ userId: m ? "user-1" : null, cookie: null });
  },
  loadUser: () => Promise.resolve(USER_ROW),
  hasLegacyCookie: () => false,
  cookieClearLegacy: () => "sess=",
  cookieClearLegacy2: () => "gm_session=",
  SESSION_ROTATE_AFTER_S: 86400,
  SESSION_TTL_S: 2592000,
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);
mock.module(sessUrl, sessMock);
mock.module(sessUrlTs, sessMock);

// Mock site.js
const siteUrl   = import.meta.resolve("../site.js");
const siteUrlTs = import.meta.resolve("../site.ts");
const siteMock = () => ({
  getPublicSite: () => null,
  getByUser: mock(() => Promise.resolve({
    id: "site-1", slug: "testboard", published: true, user_id: "user-1",
    data: { brand: { name: "Test" }, players: [] },
    plan: "free", has_logo: false, custom_domain: "", domain_status: "pending",
    extra_json: {}, archives: [],
  })),
  getAllBoards: mock(() => Promise.resolve([
    { id: "site-1", slug: "testboard", published: true, name: "Test" }
  ])),
  invalidateSiteCache: () => {},
  invalidateUserCache: () => {},
});
mock.module(siteUrl, siteMock);
mock.module(siteUrlTs, siteMock);

// Mock data layer
const dataSitesUrl   = import.meta.resolve("../data/sites.js");
const dataSitesUrlTs = import.meta.resolve("../data/sites.ts");
mock.module(dataSitesUrl, () => ({
  findSiteLogoData: () => null,
  findSiteStatus: () => null,
  findUserTotpSecret: () => null,
}));
mock.module(dataSitesUrlTs, () => ({
  findSiteLogoData: () => null,
  findSiteStatus: () => null,
  findUserTotpSecret: () => null,
}));

// ── Import after mocks ─────────────────────────────────────────────────
import { handleGetSite, handleListBoards, handleStats, handleTrackCopy } from "../handlers/sites.js";

// Session value matching parseSessionValue format: {"u":"user-1","c":<timestamp>}
const SESSION_VALUE = JSON.stringify({ u: "user-1", c: Date.now() });
const USER_ROW = {
  id: "user-1", email: "test@test.com", plan: "free",
  plan_expires_at: null, status: "active", is_admin: false, created_at: Date.now(),
};

function req(url, method = "GET", body = null) {
  const opts = { method, headers: { cookie: "yr_session=tok" } };
  if (body) {
    opts.headers["content-type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  return new Request(url, opts);
}

function mockEnv() {
  const store = new Map([["sess:tok", SESSION_VALUE]]);
  return {
    SESSIONS: {
      get: (key) => Promise.resolve(store.get(key) ?? null),
      put: (key, value) => { store.set(key, value); return Promise.resolve(); },
    },
    HYPERDRIVE: { connectionString: "postgresql://mock" },
  };
}

// ── handleGetSite ──────────────────────────────────────────────────────
describe("handleGetSite", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockQuery.mockReset();
  });

  it("returns site data for authenticated user", async () => {
    // loadUser query returns user row
    mockOne.mockResolvedValueOnce(USER_ROW);
    const env = mockEnv();
    const res = await handleGetSite(req("https://test.com/api/site"), env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
    expect(body).toHaveProperty("slug");
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("plan");
    expect(body).toHaveProperty("boards");
    expect(body).toHaveProperty("notify");
    expect(body).toHaveProperty("archives");
    expect(body).toHaveProperty("siteId");
    expect(body).toHaveProperty("customDomain");
    expect(body).toHaveProperty("domainStatus");
    // Verify data sub-shape matches what dashboard.js expects
    expect(body.data).toHaveProperty("brand");
    expect(body.data).toHaveProperty("players");
  });

  it("returns 401 for unauthenticated user", async () => {
    const env = mockEnv();
    // No session cookie → readToken returns null
    const noAuthReq = new Request("https://test.com/api/site", { method: "GET" });
    const res = await handleGetSite(noAuthReq, env);
    expect(res.status).toBe(401);
  });
});

// ── handleListBoards ───────────────────────────────────────────────────
describe("handleListBoards", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockQuery.mockReset();
  });

  it("returns boards array with limits", async () => {
    mockOne.mockResolvedValueOnce(USER_ROW);
    const env = mockEnv();
    const res = await handleListBoards(req("https://test.com/api/boards"), env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
    expect(body).toHaveProperty("boards");
    expect(Array.isArray(body.boards)).toBe(true);
    expect(body).toHaveProperty("limits");
    expect(body.limits).toHaveProperty("boards");
    expect(body.limits).toHaveProperty("players");
    expect(body).toHaveProperty("plan");
    // Verify limits are numbers (frontend uses them for UI gating)
    expect(typeof body.limits.boards).toBe("number");
    expect(typeof body.limits.players).toBe("number");
  });
});

// ── handleStats ────────────────────────────────────────────────────────
describe("handleStats", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockQuery.mockReset();
  });

  it("returns stats for authenticated user with site", async () => {
    mockOne.mockResolvedValueOnce(USER_ROW);
    // getStats calls query()
    mockQuery.mockResolvedValueOnce([{ day: "2026-07-07", views: 100, clicks: 10 }]);
    const env = mockEnv();
    const res = await handleStats(req("https://test.com/api/stats"), env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
    expect(body).toHaveProperty("stats");
  });
});

// ── handleTrackCopy ────────────────────────────────────────────────────
describe("handleTrackCopy", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockExec.mockReset();
    mockExec.mockResolvedValue(undefined);
  });

  it("returns ok even with null body", async () => {
    const env = mockEnv();
    // GET request with no body → readJson returns null
    const res = await handleTrackCopy(req("https://test.com/api/track-copy", "GET"), env, { waitUntil: () => {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
  });

  it("returns ok with valid slug body", async () => {
    mockOne.mockResolvedValueOnce({ id: "site-1" }); // site lookup
    const env = mockEnv();
    const ctx = { waitUntil: (p) => p };
    const res = await handleTrackCopy(req("https://test.com/api/track-copy", "POST", { slug: "testboard" }), env, ctx);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("ok", true);
  });
});
