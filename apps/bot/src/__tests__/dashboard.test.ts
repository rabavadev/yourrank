// Dashboard + bot onboarding integration tests.
// Mocks DB and Telegram API, then exercises the real Hono routes and views.

import { describe, it, expect, mock, beforeEach } from "bun:test";

// ── Mocks (set up before importing the SUT) ───────────────────────────
const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");
const cryptoUrl = import.meta.resolve("../../../../shared/crypto.js");
const cryptoUrlTs = import.meta.resolve("../../../../shared/crypto.ts");
const telegramUrl = import.meta.resolve("../telegram.js");
const telegramUrlTs = import.meta.resolve("../telegram.ts");

const mockOne = mock<(...args: any[]) => Promise<any>>(() => Promise.resolve(null));
const mockExec = mock<(...args: any[]) => Promise<any>>(() => Promise.resolve(undefined));
const mockQuery = mock<(...args: any[]) => Promise<any>>(() => Promise.resolve([]));

const dbMock = () => ({
  one: (...args: any[]) => mockOne(...args),
  exec: (...args: any[]) => mockExec(...args),
  query: (...args: any[]) => mockQuery(...args),
  getSql: () => null,
  withTransaction: async (fn: any) => fn({ one: (...a: any[]) => mockOne(...a), exec: (...a: any[]) => mockExec(...a), query: (...a: any[]) => mockQuery(...a) }),
});

const cryptoMock = () => ({
  encryptToken: (s: string) => `enc:${s}`,
  decryptToken: (enc: Buffer | string) => enc.toString().replace("enc:", ""),
  encrypt: (s: string) => s,
  decrypt: (s: string) => s,
  verifyHmacSha256Hex: async () => true,
  safeEqual: (a: string, b: string) => a === b,
  reencryptToken: (s: string) => s,
  isCurrentVersion: () => true,
  newClickRef: () => "ref",
  newLinkSlug: () => "abcd",
  newPostbackKey: () => "pbkey",
  newWebhookSecret: () => "secret",
});

const telegramMock = () => ({
  getMe: () => Promise.resolve({ id: 123456, username: "testbot", first_name: "Test Bot" }),
  setWebhook: () => Promise.resolve(true),
  deleteWebhook: () => Promise.resolve(true),
  getWebhookInfo: () => Promise.resolve({ url: "https://yourrank.site/hook/secret", pending_update_count: 0 }),
  sendMessage: () => Promise.resolve({ message_id: 1, chat: { id: 123456 } }),
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);
mock.module(cryptoUrl, cryptoMock);
mock.module(cryptoUrlTs, cryptoMock);
mock.module(telegramUrl, telegramMock);
mock.module(telegramUrlTs, telegramMock);

// ── Import real modules after mocks are registered ─────────────────────
import { buildDashboard } from "../dashboard.js";
import { sameOrigin } from "../dashboard-auth.js";
import { loginHtml, appHtml } from "../dashboard-views.js";

function resetMocks() {
  mockOne.mockImplementation(() => Promise.resolve(null));
  mockExec.mockImplementation(() => Promise.resolve(undefined));
  mockQuery.mockImplementation((sql: string) => {
    if (typeof sql === "string" && sql.includes("FROM sessions")) {
      return Promise.resolve([{ user_id: "u-1", created_at: new Date(), age: 0 }]);
    }
    return Promise.resolve([]);
  });
}

// ── Unit tests for pure helpers and views ─────────────────────────────
describe("sameOrigin", () => {
  const publicBaseUrl = "https://yourrank.site";

  it("allows GET requests without Origin", () => {
    const req = new Request("https://yourrank.site/bot/dashboard", { method: "GET" });
    expect(sameOrigin(req, publicBaseUrl)).toBe(true);
  });

  it("rejects cross-origin POST", () => {
    const req = new Request("https://yourrank.site/bot/dash/api/bots", {
      method: "POST",
      headers: { origin: "https://evil.com" },
    });
    expect(sameOrigin(req, publicBaseUrl)).toBe(false);
  });

  it("allows same-origin POST matching publicBaseUrl", () => {
    const req = new Request("https://yourrank.site/bot/dash/api/bots", {
      method: "POST",
      headers: { origin: "https://yourrank.site" },
    });
    expect(sameOrigin(req, publicBaseUrl)).toBe(true);
  });

  it("allows local/preview origin matching Host header", () => {
    const req = new Request("http://localhost:8787/bot/dash/api/bots", {
      method: "POST",
      headers: { origin: "http://localhost:8787", host: "localhost:8787" },
    });
    expect(sameOrigin(req, publicBaseUrl)).toBe(true);
  });
});

describe("dashboard views", () => {
  it("loginHtml does not contain inline event handlers", () => {
    const html = loginHtml("testbot", true, "nonce123");
    expect(html).toContain('data-action="devLogin"');
    expect(html).toContain('data-onauth="onTgAuth"');
    expect(html).toContain('nonce="nonce123"');
    expect(html).not.toContain("onclick=");
    expect(html).not.toContain("onfocus=");
    expect(html).not.toContain("onblur=");
  });

  it("appHtml does not contain inline event handlers and uses data-action", () => {
    const html = appHtml({ display_name: "Test", email: "test@example.com", plan: "free" }, "https://yourrank.site", "nonce123");
    expect(html).toContain('data-action="connectBot"');
    expect(html).toContain('data-action="createOffer"');
    expect(html).toContain('data-action="sendBroadcast"');
    expect(html).toContain('data-action="checkHealth"');
    expect(html).toContain('nonce="nonce123"');
    expect(html).not.toContain("onclick=");
    expect(html).not.toContain("onfocus=");
    expect(html).not.toContain("onblur=");
  });
});

// ── Dashboard route integration tests ─────────────────────────────────
describe("buildDashboard", () => {
  const app = buildDashboard();

  beforeEach(() => {
    resetMocks();
    process.env.LOGIN_BOT_USERNAME = "testbot";
    process.env.ALLOW_DEV_LOGIN = "1";
    process.env.LOGIN_BOT_TOKEN = "test_token";
    process.env.PUBLIC_BASE_URL = "https://yourrank.site";
  });

  it("GET /dashboard returns the login page when not authenticated", async () => {
    const req = new Request("http://localhost:8787/dashboard");
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('data-action="devLogin"');
    expect(html).toContain('data-onauth="onTgAuth"');
    const csp = res.headers.get("content-security-policy") || "";
    const scriptSrc = csp.split(";").find((s) => s.trim().startsWith("script-src")) || "";
    expect(scriptSrc).toContain("nonce-");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("POST /auth/dev returns a session cookie for local dev login", async () => {
    mockOne.mockImplementation(() => Promise.resolve({ id: "u-1" }));
    const req = new Request("http://localhost:8787/auth/dev", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:8787" },
      body: JSON.stringify({ telegram_user_id: 123456 }),
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ok).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("yr_session");
  });

  it("POST /auth/logout returns JSON when Accept is application/json", async () => {
    const req = new Request("http://localhost:8787/auth/logout", {
      method: "POST",
      headers: { accept: "application/json" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ok).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("yr_session");
  });

  it("POST /auth/logout redirects to /bot/dashboard for form/logout button submission", async () => {
    const req = new Request("http://localhost:8787/auth/logout", { method: "POST" });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("/bot/dashboard");
  });

  it("GET /dashboard returns the app HTML when authenticated", async () => {
    mockQuery.mockImplementation((sql: string) => {
      if (sql.includes("FROM sessions")) return Promise.resolve([{ user_id: "u-1", created_at: new Date(), age: 0 }]);
      return Promise.resolve([]);
    });
    const req = new Request("http://localhost:8787/dashboard", {
      headers: { cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('data-action="connectBot"');
    expect(html).toContain('data-action="logout"');
    expect(html).toContain('data-action="checkHealth"');
    expect(html).toContain('data-action="disconnectBot"');
    expect(html).toContain('data-action="reconnectBot"');
    expect(html).not.toContain("onclick=");

    const csp = res.headers.get("content-security-policy") || "";
    const m = csp.match(/nonce-([a-f0-9]+)/);
    expect(m).toBeTruthy();
    expect(html).toContain(`nonce="${m![1]}"`);
  });

  it("POST /dash/api/bots connects a bot and returns its info", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT plan, plan_expires_at")) return Promise.resolve({ plan: "free", plan_expires_at: null });
      if (sql.includes("INSERT INTO bots")) return Promise.resolve({ id: "b-1", username: "testbot" });
      if (sql.includes("count(*)")) return Promise.resolve({ n: 0 });
      return Promise.resolve(null);
    });
    const req = new Request("http://localhost:8787/dash/api/bots", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://yourrank.site",
        cookie: "yr_session=token123",
      },
      body: JSON.stringify({ token: "123456:ABC-DEF" }),
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.username).toBe("testbot");
    expect(body.try_it).toBe("https://t.me/testbot");
  });

  it("GET /dash/api/bots/:id/health returns webhook status", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT plan, plan_expires_at")) return Promise.resolve({ plan: "free", plan_expires_at: null });
      if (sql.includes("FROM bots") && sql.includes("webhook_secret")) {
        return Promise.resolve({ token_encrypted: "enc:123456:ABC-DEF", webhook_secret: "secret" });
      }
      return Promise.resolve(null);
    });
    const req = new Request("http://localhost:8787/dash/api/bots/b-1/health", {
      headers: { cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.ok).toBe(true);
    expect(body.configured).toBe(true);
    expect(body.url).toBe("https://yourrank.site/hook/secret");
  });

  it("POST /dash/api/bots/:id/disconnect revokes the bot", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT id, token_encrypted, webhook_secret FROM bots")) {
        return Promise.resolve({ id: "b-1", token_encrypted: "enc:123456:ABC-DEF", webhook_secret: "secret" });
      }
      if (sql.includes("UPDATE bots SET status = 'revoked'")) return Promise.resolve({ id: "b-1" });
      return Promise.resolve(null);
    });
    const req = new Request("http://localhost:8787/dash/api/bots/b-1/disconnect", {
      method: "POST",
      headers: { origin: "https://yourrank.site", cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.webhook_removed).toBe(true);
  });

  it("POST /dash/api/bots/:id/reconnect reactivates the bot", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT id, token_encrypted, webhook_secret FROM bots")) {
        return Promise.resolve({ id: "b-1", token_encrypted: "enc:123456:ABC-DEF", webhook_secret: "secret" });
      }
      if (sql.includes("UPDATE bots SET status = 'active'")) return Promise.resolve({ id: "b-1", username: "testbot" });
      return Promise.resolve(null);
    });
    const req = new Request("http://localhost:8787/dash/api/bots/b-1/reconnect", {
      method: "POST",
      headers: { origin: "https://yourrank.site", cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.username).toBe("testbot");
  });

  it("DELETE /dash/api/bots/:id permanently deletes the bot", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT id, token_encrypted, status FROM bots")) {
        return Promise.resolve({ id: "b-1", token_encrypted: "enc:123456:ABC-DEF", status: "active" });
      }
      return Promise.resolve(null);
    });
    mockExec.mockImplementation(() => Promise.resolve([{ id: "b-1" }]));
    const req = new Request("http://localhost:8787/dash/api/bots/b-1", {
      method: "DELETE",
      headers: { origin: "https://yourrank.site", cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
  });

  it("POST /dash/api/bots/:id/test-message sends a Telegram DM", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      if (sql.includes("SELECT token_encrypted FROM bots")) return Promise.resolve({ token_encrypted: "enc:123456:ABC-DEF" });
      return Promise.resolve(null);
    });
    const req = new Request("http://localhost:8787/dash/api/bots/b-1/test-message", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://yourrank.site", cookie: "yr_session=token123" },
      body: JSON.stringify({ chat_id: 123456, text: "Hello from dashboard" }),
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
    expect(body.message_id).toBe(1);
  });

  it("DELETE /dash/api/broadcasts/:id cancels a scheduled broadcast", async () => {
    mockOne.mockImplementation((sql: string) => {
      if (sql.includes("SELECT status FROM users")) return Promise.resolve({ status: "active" });
      return Promise.resolve(null);
    });
    mockExec.mockImplementation(() => Promise.resolve([{ id: "bc-1" }]));
    const req = new Request("http://localhost:8787/dash/api/broadcasts/bc-1", {
      method: "DELETE",
      headers: { origin: "https://yourrank.site", cookie: "yr_session=token123" },
    });
    const res = await app.fetch(req, {} as any);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
  });
});
