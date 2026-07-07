// Test for Telegram login widget verification — tests the ACTUAL
// verifyTelegramLogin function from dashboard-auth.ts, not a reimplementation.
//
// Run: bun test shared/__tests__/telegram-login.test.ts
//   or: bun test              (from apps/bot/)

import { describe, test, expect } from "bun:test";

// Import the real function
import { verifyTelegramLogin } from "../../apps/bot/src/dashboard-auth.js";

const BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

// Helper: compute the correct hash for given data + bot token
async function computeHash(data: Record<string, unknown>, token: string): Promise<string> {
  const { hash: _, ...fields } = data;
  const checkString = Object.keys(fields).sort()
    .filter((k) => fields[k] != null)
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(checkString));
  return Buffer.from(sig).toString("hex");
}

// Helper: make a valid payload with fresh auth_date
function freshData(fields: Record<string, unknown> = {}) {
  return {
    id: 123456789,
    first_name: "John",
    auth_date: Math.floor(Date.now() / 1000) - 10, // 10 seconds ago
    hash: "", // placeholder, filled by makeValidPayload
    ...fields,
  };
}

// Helper: create a fully valid signed payload
async function makeValidPayload(fields: Record<string, unknown> = {}) {
  const data = freshData(fields);
  const hash = await computeHash(data, BOT_TOKEN);
  return { ...data, hash };
}

describe("verifyTelegramLogin (dashboard-auth)", () => {
  test("accepts a valid payload with all fields", async () => {
    const data = await makeValidPayload({
      first_name: "John",
      last_name: "Doe",
      username: "john_doe",
      photo_url: "https://example.com/photo.jpg",
    });
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(true);
  });

  test("accepts a valid payload with minimal fields", async () => {
    const data = await makeValidPayload({ first_name: "John" });
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(true);
  });

  test("rejects tampered hash", async () => {
    const data = await makeValidPayload();
    data.hash = "0".repeat(64); // wrong hash
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(false);
  });

  test("rejects stale auth_date (older than 5 minutes)", async () => {
    const data = await makeValidPayload({ auth_date: Math.floor(Date.now() / 1000) - 600 });
    // Need to recompute hash with the stale auth_date
    const hash = await computeHash(data, BOT_TOKEN);
    data.hash = hash;
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(false);
  });

  test("rejects wrong bot token", async () => {
    const data = await makeValidPayload();
    // Sign with correct token, then verify with wrong one
    expect(await verifyTelegramLogin(data as any, "wrong:token")).toBe(false);
  });

  test("handles optional fields being absent (not null)", async () => {
    const data = await makeValidPayload({
      // Only id, first_name, auth_date — no last_name, username, photo_url
    });
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(true);
  });

  test("check-string construction: hash field is excluded", async () => {
    // If hash were included in the check-string, the signature would be wrong
    const data = await makeValidPayload({ first_name: "Test" });
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(true);
  });

  test("check-string construction: fields are sorted alphabetically", async () => {
    // Verify by computing hash with unsorted fields — should fail
    const data = await freshData({ first_name: "Zoe", last_name: "Alpha" });
    // Manually build check-string in WRONG order (by insertion, not sorted)
    const badCheckString = `id=${data.id}\nfirst_name=Zoe\nlast_name=Alpha\nauth_date=${data.auth_date}`;
    const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(BOT_TOKEN));
    const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(badCheckString));
    data.hash = Buffer.from(sig).toString("hex");
    // This should fail because the real function sorts alphabetically
    expect(await verifyTelegramLogin(data as any, BOT_TOKEN)).toBe(false);
  });
});
