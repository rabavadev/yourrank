// Audit follow-up validation tests:
//  - POST /api/billing/checkout rejects an explicitly-provided unknown plan (C4)
//  - saveSite() rejects a non-http(s) referral/CTA URL server-side (audit §9 "Improve")
// Uses bun:test with mocked DB and session store (same scaffold as sites-handlers).

import { describe, it, expect, mock, beforeEach } from "bun:test";

const dbUrl     = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs   = import.meta.resolve("../../../../shared/db.ts");
const sessUrl   = import.meta.resolve("../../../../shared/session.js");
const sessUrlTs = import.meta.resolve("../../../../shared/session.ts");

const mockExec  = mock(() => Promise.resolve());
const mockOne   = mock(() => Promise.resolve(null));
const mockQuery = mock(() => Promise.resolve([]));

const dbMock = () => ({
  one: (...a) => mockOne(...a),
  exec: (...a) => mockExec(...a),
  query: (...a) => mockQuery(...a),
  getSql: () => null,
  withTransaction: async (fn) => fn({ unsafe: (...a) => mockQuery(...a), one: (...a) => mockOne(...a), exec: (...a) => mockExec(...a), query: (...a) => mockQuery(...a) }),
});

const USER_ROW = {
  id: "user-1", email: "test@test.com", plan: "free",
  plan_expires_at: null, status: "active", is_admin: false, created_at: Date.now(),
};

const sessMock = () => ({
  createSession: () => Promise.resolve("tok"),
  destroySession: () => Promise.resolve(),
  destroyAllUserSessions: () => Promise.resolve(),
  cookieSet: (t) => `yr_session=${t}`,
  cookieClear: () => "yr_session=",
  readToken: (req) => {
    const m = (req?.headers?.get?.("cookie") || "").match(/yr_session=([^;]+)/);
    return m ? m[1] : null;
  },
  resolveSession: (req) => {
    const m = (req?.headers?.get?.("cookie") || "").match(/yr_session=([^;]+)/);
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

const { handleCheckout } = await import("../billing.js");
const { saveSite } = await import("../site.js");

const SESSION_VALUE = JSON.stringify({ u: "user-1", c: Date.now() });
function mockEnv(extra = {}) {
  const store = new Map([["sess:tok", SESSION_VALUE]]);
  return {
    SESSIONS: {
      get: (k) => Promise.resolve(store.get(k) ?? null),
      put: (k, v) => { store.set(k, v); return Promise.resolve(); },
    },
    HYPERDRIVE: { connectionString: "postgresql://mock" },
    ...extra,
  };
}
function checkoutReq(plan) {
  return new Request("https://test.com/api/billing/checkout", {
    method: "POST",
    headers: { cookie: "yr_session=tok", "content-type": "application/json" },
    body: JSON.stringify({ plan }),
  });
}

describe("handleCheckout plan validation (C4)", () => {
  beforeEach(() => { mockOne.mockReset(); mockQuery.mockReset(); mockExec.mockReset(); });

  it("rejects an explicitly-provided unknown plan with 400", async () => {
    mockOne.mockResolvedValue(USER_ROW); // currentUser → loadUser
    const res = await handleCheckout(checkoutReq("bad"), mockEnv({ NOWPAYMENTS_API_KEY: "test" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/unknown plan/i);
  });

  it("rejects a non-paid-tier plan name ('free') with 400", async () => {
    mockOne.mockResolvedValue(USER_ROW);
    const res = await handleCheckout(checkoutReq("free"), mockEnv({ NOWPAYMENTS_API_KEY: "test" }));
    expect(res.status).toBe(400);
  });
});

describe("saveSite referral/CTA URL validation", () => {
  const SITE = { id: "site-1", slug: "x", user_id: "user-1", cta_url: "", published: true, updated_at: null };
  beforeEach(() => { mockOne.mockReset(); mockQuery.mockReset(); mockExec.mockReset(); });

  it("rejects a non-URL ctaUrl", async () => {
    mockOne.mockResolvedValue(SITE);
    const r = await saveSite(mockEnv(), USER_ROW, { brand: { ctaUrl: "not a url" } }, "site-1");
    expect(r.code).toBe("invalid_cta");
  });

  it("rejects a javascript: ctaUrl", async () => {
    mockOne.mockResolvedValue(SITE);
    const r = await saveSite(mockEnv(), USER_ROW, { brand: { ctaUrl: "javascript:alert(1)" } }, "site-1");
    expect(r.code).toBe("invalid_cta");
  });

  it("allows an empty ctaUrl (clearing the field)", async () => {
    mockOne.mockResolvedValue(SITE);
    const r = await saveSite(mockEnv(), USER_ROW, { brand: { ctaUrl: "" } }, "site-1");
    expect(r.code).not.toBe("invalid_cta");
  });
});
