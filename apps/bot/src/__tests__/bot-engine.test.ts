// Bot engine tests — tests ACTUAL exported functions, not reimplemented logic.
// Covers: HTML escaping (botEngine), plan limits (shared/plans),
// rate limiting (shared/ratelimit), conversion recording (conversions).
//
// Run: bun test src/__tests__/bot-engine.test.ts
//   or: bun test              (from apps/bot/)

import { describe, it, expect, mock, beforeEach } from "bun:test";

// ── Mock DB so conversions.ts loads without a real Hyperdrive ──────────
// Mock BOTH .js and .ts resolved URLs — bun resolves .js imports to .ts
const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");
const cryptoUrl = import.meta.resolve("../../../../shared/crypto.js");
const cryptoUrlTs = import.meta.resolve("../../../../shared/crypto.ts");

const mockOne = mock((..._args: any[]): Promise<any> => Promise.resolve(null));
const mockExec = mock((..._args: any[]): Promise<any> => Promise.resolve(undefined));

const dbMockFactory = () => ({
  one: (...args: any[]) => mockOne(...args),
  exec: (...args: any[]) => mockExec(...args),
  query: () => Promise.resolve([]),
  getSql: () => null,
  withTransaction: async (fn: any) =>
    fn({
      one: (...a: any[]) => mockOne(...a),
      exec: (...a: any[]) => mockExec(...a),
      unsafe: (...a: any[]) => mockExec(...a),
      query: () => Promise.resolve([]),
    }),
});
const cryptoMockFactory = () => ({
  decryptToken: (enc: string) => enc,
  encryptToken: (s: string) => s,
  hashToken: async (s: string) => "hash:" + s,
  reencryptToken: (s: string) => s,
  encrypt: (s: string) => s,
  decrypt: (s: string) => s,
  verifyHmacSha256Hex: async () => true,
  safeEqual: (a: string, b: string) => a === b,
  isCurrentVersion: () => true,
  newClickRef: () => "ref",
  newLinkSlug: () => "slug",
  newWebhookSecret: () => "secret",
  newPostbackKey: () => "pbkey",
  bytesToHex: (bytes: Uint8Array) =>
    Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(""),
  hexToBytes: (hex: string) =>
    new Uint8Array(hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || []),
  hashIp: async (ip: string) => Buffer.from(ip),
});

mock.module(dbUrl, dbMockFactory);
mock.module(dbUrlTs, dbMockFactory);
mock.module(cryptoUrl, cryptoMockFactory);
mock.module(cryptoUrlTs, cryptoMockFactory);

// ── Import REAL functions after mocks are in place ─────────────────────
import { esc } from "../botEngine.js";
import { recordConversion } from "../conversions.js";
import { PLAN_LIMITS, BOARD_LIMITS } from "../../../../shared/plans.js";
import { rateLimit } from "../../../../shared/ratelimit.js";

// ── esc: HTML-escape for Telegram parse_mode ───────────────────────────
describe("esc (botEngine)", () => {
  it("escapes ampersands", () => {
    expect(esc("a&b")).toBe("a&amp;b");
  });

  it("escapes HTML tags", () => {
    expect(esc("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes quotes", () => {
    expect(esc('"hello"')).toBe("&quot;hello&quot;");
    expect(esc("'hello'")).toBe("&#39;hello&#39;");
  });

  it("handles null and undefined", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });

  it("converts non-string values to string", () => {
    expect(esc(42)).toBe("42");
    expect(esc(true)).toBe("true");
  });

  it("passes clean strings through unchanged", () => {
    expect(esc("hello world")).toBe("hello world");
  });
});

// ── PLAN_LIMITS: real plan hierarchy from shared/plans ─────────────────
describe("Plan limits (shared/plans)", () => {
  it("free tier allows 10 players", () => {
    expect(PLAN_LIMITS.free).toBe(10);
  });

  it("starter allows more players than free", () => {
    expect(PLAN_LIMITS.starter).toBeGreaterThan(PLAN_LIMITS.free);
  });

  it("pro allows more players than starter", () => {
    expect(PLAN_LIMITS.pro).toBeGreaterThan(PLAN_LIMITS.starter);
  });

  it("agency allows at least as many boards as pro", () => {
    expect(BOARD_LIMITS.agency).toBeGreaterThanOrEqual(BOARD_LIMITS.pro);
  });

  it("pro allows more boards than starter", () => {
    expect(BOARD_LIMITS.pro).toBeGreaterThan(BOARD_LIMITS.starter);
  });

  it("all plan tiers exist", () => {
    expect(PLAN_LIMITS).toHaveProperty("free");
    expect(PLAN_LIMITS).toHaveProperty("starter");
    expect(PLAN_LIMITS).toHaveProperty("pro");
    expect(PLAN_LIMITS).toHaveProperty("agency");
  });
});

// ── rateLimit: real KV-backed rate limiter from shared/ratelimit ────────
describe("rateLimit (shared/ratelimit)", () => {
  // rateLimit uses windowed keys: `rl:${id}:${window}`. We use a Map-backed
  // mock that matches any key, not a hardcoded one.
  function mockKV() {
    const store = new Map<string, string>();
    return {
      get: mock((key: string) => Promise.resolve(store.get(key) ?? null)),
      put: mock((key: string, value: string) => { store.set(key, value); return Promise.resolve(); }),
      store,
    };
  }

  it("allows first request (no prior entries)", async () => {
    const kv = mockKV();
    const result = await rateLimit(kv, "test", 5, 60);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("denies when over limit", async () => {
    const kv = mockKV();
    // Pre-populate the windowed key with a value over the limit
    const window = Math.floor(Date.now() / 1000 / 60);
    kv.store.set(`rl:test:${window}`, "6");
    const result = await rateLimit(kv, "test", 5, 60);
    expect(result.ok).toBe(false);
  });

  it("allows when exactly at limit - 1", async () => {
    const kv = mockKV();
    const window = Math.floor(Date.now() / 1000 / 60);
    kv.store.set(`rl:test:${window}`, "4");
    const result = await rateLimit(kv, "test", 5, 60);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("fails OPEN when KV throws (a KV outage must not take the platform down)", async () => {
    const kv = {
      get: mock(() => Promise.reject(new Error("KV down"))),
      put: mock(() => Promise.reject(new Error("KV down"))),
    };
    const result = await rateLimit(kv, "test", 5, 60);
    expect(result.ok).toBe(true);
  });

  it("fails OPEN when the KV write throws but the read is under limit", async () => {
    const kv = {
      get: mock(() => Promise.resolve(null)),
      put: mock(() => Promise.reject(new Error("daily write quota exceeded"))),
    };
    const result = await rateLimit(kv, "test", 5, 60);
    expect(result.ok).toBe(true);
  });
});

// ── recordConversion: real conversion recording with mocked DB ─────────
describe("recordConversion (conversions)", () => {
  beforeEach(() => {
    mockOne.mockReset();
    mockExec.mockReset();
    mockExec.mockResolvedValue(undefined);
  });

  it("extracts click_ref from click_ref param", async () => {
    // First call: offer lookup by click_ref → no match
    // Second call: idempotency check → no match
    // Third call: INSERT
    mockOne.mockResolvedValue(null);

    await recordConversion("owner-1", { click_ref: "abc123", event: "deposit", amount: "50" });

    // Should have called one() twice: offer lookup + idempotency check
    expect(mockOne).toHaveBeenCalledTimes(2);
    // The offer lookup query should include the click_ref
    expect(mockOne.mock.calls[0][1]).toContain("abc123");
    // The INSERT should have been called
    expect(mockExec).toHaveBeenCalledTimes(1);
  });

  it("extracts click_ref from clickid fallback", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { clickid: "fallback-id", event: "deposit", amount: "50" });
    expect(mockOne.mock.calls[0][1]).toContain("fallback-id");
  });

  it("defaults event to 'deposit' when missing", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { click_ref: "abc" });
    // The INSERT should use "deposit" as event
    const insertCall = mockExec.mock.calls[0];
    expect(insertCall[1][3]).toBe("deposit");
  });

  it("clamps negative amounts to null", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { click_ref: "abc", amount: "-50" });
    const insertCall = mockExec.mock.calls[0];
    expect(insertCall[1][4]).toBeNull();
  });

  it("clamps NaN amounts to null", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { click_ref: "abc", amount: "not-a-number" });
    const insertCall = mockExec.mock.calls[0];
    expect(insertCall[1][4]).toBeNull();
  });

  it("clamps amounts exceeding 1e12 to null", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { click_ref: "abc", amount: "999999999999999" });
    const insertCall = mockExec.mock.calls[0];
    expect(insertCall[1][4]).toBeNull();
  });

  it("uppercases and truncates currency to 8 chars", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { click_ref: "abc", currency: "abcdefghijk" });
    const insertCall = mockExec.mock.calls[0];
    expect(insertCall[1][5]).toBe("ABCDEFGH");
  });

  it("skips INSERT when idempotency check finds existing", async () => {
    // Second call to one() (idempotency check) returns existing row
    mockOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "existing-id" });

    await recordConversion("owner-1", { click_ref: "abc", event: "deposit", amount: "50" });

    // Should NOT have called exec (no INSERT)
    expect(mockExec).not.toHaveBeenCalled();
  });

  it("skips offer lookup and idempotency check when no click_ref", async () => {
    mockOne.mockResolvedValue(null);
    await recordConversion("owner-1", { event: "deposit", amount: "50" });

    // No click_ref means both offer lookup and idempotency check are skipped
    expect(mockOne).not.toHaveBeenCalled();
    // INSERT still fires (no idempotency fast-path without click_ref)
    expect(mockExec).toHaveBeenCalledTimes(1);
  });
});

// ── Safe URL validation (pattern used in dashboard-views) ──────────────
describe("Safe URL validation", () => {
  // This pattern is used client-side in dashboard-views.ts.
  // Testing the regex pattern directly since the function isn't exported.
  const safeUrl = (u: string | null | undefined) =>
    /^https?:\/\//i.test(u ?? "") ? u ?? "#" : "#";

  it("allows https URLs", () => {
    expect(safeUrl("https://example.com")).toBe("https://example.com");
  });

  it("allows http URLs", () => {
    expect(safeUrl("http://example.com")).toBe("http://example.com");
  });

  it("rejects javascript: URLs", () => {
    expect(safeUrl("javascript:alert(1)")).toBe("#");
  });

  it("rejects data: URLs", () => {
    expect(safeUrl("data:text/html,<script>alert(1)</script>")).toBe("#");
  });

  it("rejects empty/null/undefined", () => {
    expect(safeUrl("")).toBe("#");
    expect(safeUrl(null)).toBe("#");
    expect(safeUrl(undefined)).toBe("#");
  });
});
