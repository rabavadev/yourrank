// Billing unit tests — effectivePlan, PLAN_LIMITS, PLAN_PRICES, priceUsd
// All pure functions live in shared/plans.js (no DB dependency, no mocks needed).
// billing.js re-exports them for production code, but tests import from source directly
// to avoid mock.module issues in bun v1.2.x CI.

import { mock, test, expect, describe, beforeAll, afterAll, jest } from "bun:test";

// Mock shared/db.js before importing anything else — shared/plans.js is CJS and
// will load db.js into the module cache, breaking mocks in other test files.
const _dbUrl = import.meta.resolve("../../../../shared/db.js");
mock.module(_dbUrl, () => ({
  query: () => Promise.resolve([]),
  one: () => Promise.resolve(null),
  exec: () => Promise.resolve(),
  getSql: () => { throw new Error("getSql should not be called in unit tests"); },
  withTransaction: async (fn) => fn({ one: () => Promise.resolve(null), exec: () => Promise.resolve(), query: () => Promise.resolve([]) }),
}));

const {
  effectivePlan,
  priceUsd,
  PLAN_LIMITS,
  BOARD_LIMITS,
  PLAN_PRICES,
  PLAN_META,
} = await import("../../../../shared/plans.js");

// QA-006: Freeze the clock so Date.now()-based tests are deterministic
const FROZEN_TIME = new Date("2025-06-15T12:00:00Z").getTime();
beforeAll(() => { jest.setSystemTime(FROZEN_TIME); });
afterAll(() => { jest.useRealTimers(); });

// ─── effectivePlan ────────────────────────────────────────────────────────

describe("effectivePlan", () => {
  test("returns 'free' for null user", () => {
    expect(effectivePlan(null)).toBe("free");
  });

  test("returns 'free' for undefined user", () => {
    expect(effectivePlan(undefined)).toBe("free");
  });

  test("returns 'free' for suspended user regardless of plan", () => {
    expect(effectivePlan({ plan: "pro", status: "suspended", plan_expires_at: Date.now() + 86400000 })).toBe("free");
  });

  test("returns 'free' for user with plan='free'", () => {
    expect(effectivePlan({ plan: "free", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("free");
  });

  test("returns 'starter' for user with plan='starter'", () => {
    expect(effectivePlan({ plan: "starter", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("starter");
  });

  test("returns 'pro' for user with plan='pro'", () => {
    expect(effectivePlan({ plan: "pro", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("pro");
  });

  test("returns 'agency' for user with plan='agency'", () => {
    expect(effectivePlan({ plan: "agency", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("agency");
  });

  test("returns 'free' when plan_expires_at is in the past (expired)", () => {
    expect(effectivePlan({ plan: "pro", status: "active", plan_expires_at: Date.now() - 86400000 })).toBe("free");
  });

  test("returns 'pro' when plan_expires_at is in the future (not expired)", () => {
    expect(effectivePlan({ plan: "pro", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("pro");
  });

  test("returns 'free' when plan_expires_at is 0 (expired)", () => {
    expect(effectivePlan({ plan: "pro", status: "active", plan_expires_at: 0 })).toBe("free");
  });

  test("returns 'free' for unknown plan value", () => {
    expect(effectivePlan({ plan: "vip", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("free");
  });

  test("is case insensitive: 'PRO' returns 'pro'", () => {
    expect(effectivePlan({ plan: "PRO", status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("pro");
  });

  test("returns 'free' for user with no plan property", () => {
    expect(effectivePlan({ status: "active", plan_expires_at: Date.now() + 86400000 })).toBe("free");
  });
});

// ─── PLAN_LIMITS ──────────────────────────────────────────────────────────

describe("PLAN_LIMITS", () => {
  test("free: 10 players", () => { expect(PLAN_LIMITS.free).toBe(10); });
  test("starter: 25 players", () => { expect(PLAN_LIMITS.starter).toBe(25); });
  test("pro: 9999 players", () => { expect(PLAN_LIMITS.pro).toBe(9999); });
  test("agency: 9999 players", () => { expect(PLAN_LIMITS.agency).toBe(9999); });
});

// ─── BOARD_LIMITS ─────────────────────────────────────────────────────────

describe("BOARD_LIMITS", () => {
  test("free: 1 board", () => { expect(BOARD_LIMITS.free).toBe(1); });
  test("starter: 1 board", () => { expect(BOARD_LIMITS.starter).toBe(1); });
  test("pro: 3 boards", () => { expect(BOARD_LIMITS.pro).toBe(3); });
  test("agency: 99 boards", () => { expect(BOARD_LIMITS.agency).toBe(99); });
});

// ─── PLAN_PRICES ──────────────────────────────────────────────────────────

describe("PLAN_PRICES", () => {
  test("free: $0", () => { expect(PLAN_PRICES.free).toBe(0); });
  test("starter: $12", () => { expect(PLAN_PRICES.starter).toBe(12); });
  test("pro: $29", () => { expect(PLAN_PRICES.pro).toBe(29); });
  test("agency: $79", () => { expect(PLAN_PRICES.agency).toBe(79); });
});

// ─── tier progression ─────────────────────────────────────────────────────

describe("tier progression", () => {
  test("tiers array order is [free, starter, pro, agency]", () => {
    const tiers = ["free", "starter", "pro", "agency"];
    expect(tiers).toEqual(["free", "starter", "pro", "agency"]);
  });

  test("tier comparison: each tier index increases", () => {
    const tiers = ["free", "starter", "pro", "agency"];
    expect(tiers.indexOf("free")).toBeLessThan(tiers.indexOf("starter"));
    expect(tiers.indexOf("starter")).toBeLessThan(tiers.indexOf("pro"));
    expect(tiers.indexOf("pro")).toBeLessThan(tiers.indexOf("agency"));
  });

  test("tier comparison: free < starter < pro < agency by PLAN_PRICES", () => {
    expect(PLAN_PRICES.free).toBeLessThan(PLAN_PRICES.starter);
    expect(PLAN_PRICES.starter).toBeLessThan(PLAN_PRICES.pro);
    expect(PLAN_PRICES.pro).toBeLessThan(PLAN_PRICES.agency);
  });

  test("tier comparison: PLAN_LIMITS increase (players)", () => {
    expect(PLAN_LIMITS.free).toBeLessThanOrEqual(PLAN_LIMITS.starter);
    expect(PLAN_LIMITS.starter).toBeLessThan(PLAN_LIMITS.pro);
  });

  test("tier comparison: BOARD_LIMITS increase", () => {
    expect(BOARD_LIMITS.free).toBeLessThanOrEqual(BOARD_LIMITS.starter);
    expect(BOARD_LIMITS.starter).toBeLessThan(BOARD_LIMITS.pro);
    expect(BOARD_LIMITS.pro).toBeLessThan(BOARD_LIMITS.agency);
  });
});

// ─── priceUsd ─────────────────────────────────────────────────────────────

describe("priceUsd", () => {
  test("returns PLAN_PRICES.pro (29) for pro when PRO_PRICE_USD env not set", () => {
    expect(priceUsd({})).toBe(29);
  });

  test("returns PRO_PRICE_USD env var for pro when set", () => {
    expect(priceUsd({ PRO_PRICE_USD: "39" })).toBe(39);
  });

  test("returns 12 for starter", () => {
    expect(priceUsd({}, "starter")).toBe(12);
  });

  test("returns 79 for agency", () => {
    expect(priceUsd({}, "agency")).toBe(79);
  });

  test("returns 0 for free", () => {
    expect(priceUsd({}, "free")).toBe(0);
  });

  test("defaults to pro price for unknown plan", () => {
    expect(priceUsd({}, "unknown")).toBe(29);
  });

  test("defaults to pro when no plan argument given", () => {
    expect(priceUsd({})).toBe(29);
  });
});

// ─── PLAN_META ────────────────────────────────────────────────────────────

describe("PLAN_META", () => {
  test("has entries for all four tiers", () => {
    expect(Object.keys(PLAN_META).sort()).toEqual(["agency", "free", "pro", "starter"]);
  });

  test("pro is the highlighted tier", () => {
    expect(PLAN_META.pro.highlight).toBe(true);
  });
});
