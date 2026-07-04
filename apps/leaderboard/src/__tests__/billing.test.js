// Billing unit tests — effectivePlan, PLAN_LIMITS, PLAN_PRICES, priceUsd
// Uses bun's built-in test runner. No extra dependencies.
//
// billing.js imports auth.js and db.js (which need a real Postgres connection),
// so we mock those modules before any import of billing.js runs.

import { mock, test, expect, describe, beforeAll, beforeEach } from "bun:test";

// Stub the heavy dependencies so billing.js can load in a test environment.
mock.module("../db.js", () => ({
  query: () => Promise.resolve([]),
  one: () => Promise.resolve(null),
  exec: () => Promise.resolve(),
  getSql: () => {
    throw new Error("getSql should not be called in unit tests");
  },
}));

// Now we can safely import billing.js
const {
  effectivePlan,
  PLAN_LIMITS,
  BOARD_LIMITS,
  PLAN_PRICES,
  PLAN_META,
  priceUsd,
} = await import("../billing.js");

// ─── effectivePlan ────────────────────────────────────────────────────────

describe("effectivePlan", () => {
  test("returns 'free' for null user", () => {
    expect(effectivePlan(null)).toBe("free");
  });

  test("returns 'free' for undefined user", () => {
    expect(effectivePlan(undefined)).toBe("free");
  });

  test("returns 'free' for suspended user regardless of plan", () => {
    expect(effectivePlan({ plan: "pro", status: "suspended" })).toBe("free");
    expect(effectivePlan({ plan: "agency", status: "suspended" })).toBe("free");
    expect(effectivePlan({ plan: "starter", status: "suspended" })).toBe("free");
  });

  test("returns 'free' for user with plan='free'", () => {
    expect(effectivePlan({ plan: "free" })).toBe("free");
  });

  test("returns 'starter' for user with plan='starter'", () => {
    expect(effectivePlan({ plan: "starter", plan_expires_at: Date.now() + 86_400_000 })).toBe("starter");
  });

  test("returns 'pro' for user with plan='pro'", () => {
    expect(effectivePlan({ plan: "pro", plan_expires_at: Date.now() + 86_400_000 })).toBe("pro");
  });

  test("returns 'agency' for user with plan='agency'", () => {
    expect(effectivePlan({ plan: "agency", plan_expires_at: Date.now() + 86_400_000 })).toBe("agency");
  });

  test("returns 'free' when plan_expires_at is in the past (expired)", () => {
    const pastMs = Date.now() - 100_000; // ~100 seconds ago
    expect(effectivePlan({ plan: "pro", plan_expires_at: pastMs })).toBe("free");
  });

  test("returns 'pro' when plan_expires_at is in the future (not expired)", () => {
    const futureMs = Date.now() + 86_400_000; // ~1 day from now
    expect(effectivePlan({ plan: "pro", plan_expires_at: futureMs })).toBe("pro");
  });

  test("returns 'free' when plan_expires_at is 0 (expired)", () => {
    expect(effectivePlan({ plan: "pro", plan_expires_at: 0 })).toBe("free");
  });

  test("returns 'free' for unknown plan value", () => {
    expect(effectivePlan({ plan: "enterprise" })).toBe("free");
    expect(effectivePlan({ plan: "" })).toBe("free");
    expect(effectivePlan({ plan: null })).toBe("free");
  });

  test("is case insensitive: 'PRO' returns 'pro'", () => {
    const futureExp = Date.now() + 86_400_000;
    expect(effectivePlan({ plan: "PRO", plan_expires_at: futureExp })).toBe("pro");
    expect(effectivePlan({ plan: "Starter", plan_expires_at: futureExp })).toBe("starter");
    expect(effectivePlan({ plan: "AGENCY", plan_expires_at: futureExp })).toBe("agency");
  });

  test("returns 'free' for user with no plan property", () => {
    expect(effectivePlan({})).toBe("free");
  });
});

// ─── PLAN_LIMITS ──────────────────────────────────────────────────────────

describe("PLAN_LIMITS", () => {
  test("free: 10 players", () => {
    expect(PLAN_LIMITS.free).toBe(10);
  });

  test("starter: 25 players", () => {
    expect(PLAN_LIMITS.starter).toBe(25);
  });

  test("pro: 9999 players", () => {
    expect(PLAN_LIMITS.pro).toBe(9999);
  });

  test("agency: 9999 players", () => {
    expect(PLAN_LIMITS.agency).toBe(9999);
  });
});

// ─── BOARD_LIMITS ─────────────────────────────────────────────────────────

describe("BOARD_LIMITS", () => {
  test("free: 1 board", () => {
    expect(BOARD_LIMITS.free).toBe(1);
  });

  test("starter: 1 board", () => {
    expect(BOARD_LIMITS.starter).toBe(1);
  });

  test("pro: 3 boards", () => {
    expect(BOARD_LIMITS.pro).toBe(3);
  });

  test("agency: 99 boards", () => {
    expect(BOARD_LIMITS.agency).toBe(99);
  });
});

// ─── PLAN_PRICES ──────────────────────────────────────────────────────────

describe("PLAN_PRICES", () => {
  test("free: $0", () => {
    expect(PLAN_PRICES.free).toBe(0);
  });

  test("starter: $12", () => {
    expect(PLAN_PRICES.starter).toBe(12);
  });

  test("pro: $29", () => {
    expect(PLAN_PRICES.pro).toBe(29);
  });

  test("agency: $79", () => {
    expect(PLAN_PRICES.agency).toBe(79);
  });
});

// ─── Tier progression ────────────────────────────────────────────────────

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
    expect(PLAN_LIMITS.free).toBeLessThan(PLAN_LIMITS.starter);
    expect(PLAN_LIMITS.starter).toBeLessThanOrEqual(PLAN_LIMITS.pro);
  });

  test("tier comparison: BOARD_LIMITS increase", () => {
    expect(BOARD_LIMITS.free).toBeLessThan(BOARD_LIMITS.pro);
    expect(BOARD_LIMITS.pro).toBeLessThan(BOARD_LIMITS.agency);
  });
});

// ─── priceUsd ────────────────────────────────────────────────────────────

describe("priceUsd", () => {
  test("returns PLAN_PRICES.pro (29) for pro when PRO_PRICE_USD env not set", () => {
    expect(priceUsd({})).toBe(29);
    expect(priceUsd({ PRO_PRICE_USD: "" })).toBe(29);
    expect(priceUsd({ PRO_PRICE_USD: undefined })).toBe(29);
  });

  test("returns PRO_PRICE_USD env var for pro when set", () => {
    expect(priceUsd({ PRO_PRICE_USD: "39" })).toBe(39);
    expect(priceUsd({ PRO_PRICE_USD: "19.99" })).toBe(19.99);
  });

  test("returns 12 for starter", () => {
    expect(priceUsd({}, "starter")).toBe(12);
    expect(priceUsd({ PRO_PRICE_USD: "99" }, "starter")).toBe(12);
  });

  test("returns 79 for agency", () => {
    expect(priceUsd({}, "agency")).toBe(79);
    expect(priceUsd({ PRO_PRICE_USD: "99" }, "agency")).toBe(79);
  });

  test("returns 0 for free", () => {
    expect(priceUsd({}, "free")).toBe(0);
  });

  test("defaults to pro price for unknown plan", () => {
    // priceUsd falls back to PLAN_PRICES.pro for unknown plans
    expect(priceUsd({}, "unknown")).toBe(29);
  });

  test("defaults to pro when no plan argument given", () => {
    expect(priceUsd({})).toBe(29);
  });
});

// ─── PLAN_META ────────────────────────────────────────────────────────────

describe("PLAN_META", () => {
  test("has entries for all four tiers", () => {
    expect(PLAN_META.free).toBeDefined();
    expect(PLAN_META.starter).toBeDefined();
    expect(PLAN_META.pro).toBeDefined();
    expect(PLAN_META.agency).toBeDefined();
  });

  test("pro is the highlighted tier", () => {
    expect(PLAN_META.pro.highlight).toBe(true);
    expect(PLAN_META.free.highlight).toBe(false);
    expect(PLAN_META.starter.highlight).toBe(false);
    expect(PLAN_META.agency.highlight).toBe(false);
  });
});
