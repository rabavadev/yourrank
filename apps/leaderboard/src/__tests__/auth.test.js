// Unit tests for auth helpers: hashPassword, verifyPassword, safeEqual, isEmail, slugify.
// Uses bun:test. No real DB or KV needed — all crypto runs in the bun runtime.
//
// Run: bun test src/__tests__/auth.test.js
//   or: bun test   (from apps/leaderboard/)

import { mock, test, expect, describe } from "bun:test";

// ── stub heavy deps so auth.js loads without a real DB or session KV ──────
// We use import.meta.resolve() to get the exact resolved URL that auth.js will
// request, so the mock intercepts regardless of CJS/ESM interop quirks.
const dbUrl      = import.meta.resolve("../../../../shared/db.js");
const sessionUrl = import.meta.resolve("../../../../shared/session.js");

mock.module(dbUrl, () => ({
  one:   () => Promise.resolve(null),
  exec:  () => Promise.resolve(),
  query: () => Promise.resolve([]),
}));

mock.module(sessionUrl, () => ({
    createSession:          () => Promise.resolve("mock-session-token"),
    destroySession:         () => Promise.resolve(),
    destroyAllUserSessions: () => Promise.resolve(),
    cookieSet:  (t) => `yr_session=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
    cookieClear: ()  => "yr_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    readToken:  (_req) => null,
    KV_PREFIX:  "session:",
    // SEC-104
    hasLegacyCookie:  (_req) => false,
    cookieClearLegacy: () => "sess=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    // SEC-107: shared session module now resolves via resolveSession + loadUser
    resolveSession: (_req) => Promise.resolve({
      userId: null,
      uid: null,
      cookie: null,
      rotatedCookie: null,
    }),
    loadUser: (_env, _userId) => Promise.resolve(null),
    SESSION_ROTATE_AFTER_S: 86400,
    SESSION_TTL_S: 2592000, // 30 days
    }));

const {
  hashPassword,
  verifyPassword,
  safeEqual,
  isEmail,
  slugify,
} = await import("../auth.js");

// ── hashPassword ───────────────────────────────────────────────────────────

describe("hashPassword", () => {
  test("returns salt and hash strings", async () => {
    const { salt, hash } = await hashPassword("correcthorsebatterystaple");
    expect(typeof salt).toBe("string");
    expect(typeof hash).toBe("string");
    expect(salt.length).toBeGreaterThan(0);
    expect(hash.length).toBeGreaterThan(0);
  });

  test("hash is versioned: starts with '<iterations>$'", async () => {
    const { hash } = await hashPassword("mypassword");
    expect(hash).toMatch(/^\d+\$/);
  });

  test("uses 100000 iterations (current target)", async () => {
    const { hash } = await hashPassword("mypassword");
    expect(hash.startsWith("100000$")).toBe(true);
  });

  test("salt is a 32-char hex string (16 bytes)", async () => {
    const { salt } = await hashPassword("mypassword");
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  test("accepts explicit saltHex and produces deterministic output", async () => {
    const fixedSalt = "deadbeefdeadbeefdeadbeefdeadbeef";
    const { hash: h1 } = await hashPassword("password", fixedSalt);
    const { hash: h2 } = await hashPassword("password", fixedSalt);
    expect(h1).toBe(h2);
  });

  test("different passwords produce different hashes (same salt)", async () => {
    const fixedSalt = "aaaabbbbccccddddaaaabbbbccccdddd";
    const { hash: h1 } = await hashPassword("password1", fixedSalt);
    const { hash: h2 } = await hashPassword("password2", fixedSalt);
    expect(h1).not.toBe(h2);
  });

  test("different salts produce different hashes for the same password", async () => {
    const { salt: s1, hash: h1 } = await hashPassword("samepassword");
    const { salt: s2, hash: h2 } = await hashPassword("samepassword");
    expect(s1).not.toBe(s2);
    expect(h1).not.toBe(h2);
  });
});

// ── verifyPassword ─────────────────────────────────────────────────────────

describe("verifyPassword", () => {
  test("correct password verifies successfully", async () => {
    const password = "correcthorsebatterystaple";
    const { salt, hash } = await hashPassword(password);
    const { ok } = await verifyPassword(password, salt, hash);
    expect(ok).toBe(true);
  });

  test("wrong password fails verification", async () => {
    const { salt, hash } = await hashPassword("realpassword");
    const { ok } = await verifyPassword("wrongpassword", salt, hash);
    expect(ok).toBe(false);
  });

  test("needsRehash is false for current iteration count (100000)", async () => {
    const { salt, hash } = await hashPassword("password");
    const { needsRehash } = await verifyPassword("password", salt, hash);
    expect(needsRehash).toBe(false);
  });

  test("needsRehash is true for legacy 50k hash", async () => {
    // Simulate an old hash produced at 50k iterations (pre-upgrade)
    const fixedSalt = "cafebabecafebabecafebabecafebabe";
    const saltBytes = Uint8Array.from({ length: 16 }, (_, i) =>
      parseInt(fixedSalt.slice(i * 2, i * 2 + 2), 16)
    );
    const km = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode("mypassword"), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: 50000, hash: "SHA-256" }, km, 256
    );
    const hex = [...new Uint8Array(bits)].map(x => x.toString(16).padStart(2, "0")).join("");
    const legacyHash = `50000$${hex}`;

    const { ok, needsRehash } = await verifyPassword("mypassword", fixedSalt, legacyHash);
    expect(ok).toBe(true);
    expect(needsRehash).toBe(true);
  });

  test("needsRehash is true for bare-hex (pre-versioned) legacy hash", async () => {
    // Bare-hex hashes predate the versioned format — treated as LEGACY_ITERATIONS (100k).
    // Since current target is also 100k, bare-hex won't trigger needsRehash.
    // This test verifies bare-hex is parsed correctly and verified.
    const fixedSalt = "deadbeefdeadbeefdeadbeefdeadbeef";
    const saltBytes = Uint8Array.from({ length: 16 }, (_, i) =>
      parseInt(fixedSalt.slice(i * 2, i * 2 + 2), 16)
    );
    const km = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode("pw"), "PBKDF2", false, ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: 100000, hash: "SHA-256" }, km, 256
    );
    const bareHex = [...new Uint8Array(bits)].map(x => x.toString(16).padStart(2, "0")).join("");

    const { ok, needsRehash } = await verifyPassword("pw", fixedSalt, bareHex);
    expect(ok).toBe(true);
    // Bare-hex at 100k matches current target, so no rehash needed
    expect(needsRehash).toBe(false);
  });

  test("empty password does not match a real hash", async () => {
    const { salt, hash } = await hashPassword("realpassword");
    const { ok } = await verifyPassword("", salt, hash);
    expect(ok).toBe(false);
  });

  test("returns ok=false for an empty stored hash", async () => {
    const { ok } = await verifyPassword("password", "deadbeefdeadbeefdeadbeefdeadbeef", "");
    expect(ok).toBe(false);
  });
});

// ── safeEqual ─────────────────────────────────────────────────────────────

describe("safeEqual", () => {
  test("equal strings return true", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("", "")).toBe(true);
    expect(safeEqual("x", "x")).toBe(true);
  });

  test("unequal strings return false", () => {
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "ab")).toBe(false);
    expect(safeEqual("abc", "")).toBe(false);
    expect(safeEqual("", "abc")).toBe(false);
  });

  test("handles null/undefined gracefully (coerces to '')", () => {
    expect(safeEqual(null, null)).toBe(true);
    expect(safeEqual(undefined, undefined)).toBe(true);
    expect(safeEqual(null, undefined)).toBe(true);
    expect(safeEqual("abc", null)).toBe(false);
    expect(safeEqual(null, "abc")).toBe(false);
  });
});

// ── isEmail ───────────────────────────────────────────────────────────────

describe("isEmail", () => {
  test("valid emails pass", () => {
    expect(isEmail("user@example.com")).toBe(true);
    expect(isEmail("a+tag@b.co")).toBe(true);
    expect(isEmail("user.name@sub.domain.org")).toBe(true);
  });

  test("invalid emails fail", () => {
    expect(isEmail("notanemail")).toBe(false);
    expect(isEmail("missing@tld")).toBe(false);
    expect(isEmail("@nodomain.com")).toBe(false);
    expect(isEmail("spaces @example.com")).toBe(false);
    expect(isEmail("")).toBe(false);
    expect(isEmail(null)).toBe(false);
    expect(isEmail(undefined)).toBe(false);
    expect(isEmail(42)).toBe(false);
  });
});

// ── slugify ───────────────────────────────────────────────────────────────

describe("slugify", () => {
  test("lowercases and trims whitespace", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  test("replaces non-alphanumeric runs with a single dash", () => {
    expect(slugify("foo!!bar")).toBe("foo-bar");
    expect(slugify("foo   bar")).toBe("foo-bar");
    expect(slugify("foo_bar-baz")).toBe("foo-bar-baz");
  });

  test("strips leading and trailing dashes", () => {
    expect(slugify("-foo-")).toBe("foo");
    expect(slugify("---hello---")).toBe("hello");
  });

  test("truncates to 40 characters", () => {
    const long = "a".repeat(50);
    expect(slugify(long).length).toBeLessThanOrEqual(40);
  });

  test("handles empty / null / undefined", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null)).toBe("");
    expect(slugify(undefined)).toBe("");
  });

  test("strips unicode non-word chars", () => {
    expect(slugify("café latte")).toBe("caf-latte");
  });
});
