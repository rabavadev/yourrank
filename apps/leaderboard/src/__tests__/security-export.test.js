import { describe, it, expect, mock, beforeEach } from "bun:test";

const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");
const authUrl = import.meta.resolve("../auth.js");
const authUrlTs = import.meta.resolve("../auth.ts");

const USER = {
  id: "user-1",
  email: "owner@example.com",
  display_name: "Owner",
  plan: "pro",
  status: "active",
};

const sites = [
  { id: "site-1", slug: "first", name: "First", published: true },
  { id: "site-2", slug: "second", name: "Second", published: false },
];
const players = [
  { id: "player-1", site_id: "site-1", name: "Alice", wagered: "10.00" },
  { id: "player-2", site_id: "site-2", name: "Bob", wagered: "20.00" },
];
const archives = [
  { id: "archive-1", site_id: "site-1", snapshot_json: [{ name: "Alice", wagered: "10.00" }] },
  { id: "archive-2", site_id: "site-2", snapshot_json: [] },
];

const mockOne = mock(() => Promise.resolve(USER));
const mockQuery = mock((sql) => {
  const text = String(sql);
  if (text.includes("FROM sites")) return Promise.resolve(sites);
  if (text.includes("FROM players")) return Promise.resolve(players);
  if (text.includes("FROM archives")) return Promise.resolve(archives);
  return Promise.resolve([]);
});
const mockRateLimit = mock(() => Promise.resolve({
  ok: true,
  limit: 2,
  remaining: 1,
  retryAfter: 0,
}));

const dbMock = () => ({
  one: (...args) => mockOne(...args),
  exec: mock(() => Promise.resolve()),
  query: (...args) => mockQuery(...args),
});
const authMock = () => ({
  currentUser: mock(() => Promise.resolve(USER)),
  createSession: mock(() => Promise.resolve("token")),
  readToken: mock(() => "token"),
  cookieSet: mock(() => "cookie"),
  destroyAllUserSessions: mock(() => Promise.resolve()),
  json: (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  }),
  bad: (message, status = 400, headers = {}) => new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "content-type": "application/json", ...headers },
  }),
  ok: (data) => new Response(JSON.stringify({ ok: true, ...data }), {
    headers: { "content-type": "application/json" },
  }),
  readJson: mock(() => Promise.resolve(null)),
  rateLimit: (...args) => mockRateLimit(...args),
  rateLimitHeaders: (rl) => ({
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    ...(rl.retryAfter > 0 ? { "Retry-After": String(rl.retryAfter) } : {}),
  }),
  clientIp: mock(() => "127.0.0.1"),
  hashPassword: mock(() => Promise.resolve({ hash: "hash", salt: "salt" })),
  verifyPassword: mock(() => Promise.resolve({ ok: true })),
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);
mock.module(authUrl, authMock);
mock.module(authUrlTs, authMock);

import { handleExportData } from "../handlers/security.js";

function request() {
  return new Request("https://yourrank.site/api/account/export", {
    method: "GET",
    headers: { cookie: "yr_session=token" },
  });
}

function env() {
  return { HYPERDRIVE: { connectionString: "postgresql://mock" } };
}

describe("handleExportData", () => {
  beforeEach(() => {
    mockOne.mockClear();
    mockQuery.mockClear();
    mockRateLimit.mockClear();
    mockRateLimit.mockResolvedValue({
      ok: true,
      limit: 2,
      remaining: 1,
      retryAfter: 0,
    });
  });

  it("streams the same compact JSON document shape with multiple boards and empty collections", async () => {
    const originalNow = Date.now;
    Date.now = () => 1720000000000;
    const originalIso = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2024-07-03T12:00:00.000Z";

    try {
      const res = await handleExportData(request(), env());
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/json; charset=utf-8");
      expect(res.headers.get("content-disposition")).toBe(
        'attachment; filename="yourrank-export-1720000000000-user-1.json"',
      );

      const actual = await res.text();
      const expected = JSON.stringify({
        ok: true,
        exportId: "1720000000000-user-1",
        data: {
          exportedAt: "2024-07-03T12:00:00.000Z",
          user: USER,
          sites,
          players,
          archives,
          subscriptions: [],
          payments: [],
          sessions: [],
          offers: [],
          shortLinks: [],
          conversions: [],
          bots: [],
          botCommands: [],
          broadcasts: [],
          botSubscribers: [],
          postbackKeys: [],
          featureOverrides: [],
          onboardingEmails: [],
          referralRewards: [],
          auditLog: [],
          adminAudit: [],
          supportMessages: [],
          siteStatsHourly: [],
          siteReferrers: [],
        },
      });

      expect(actual).toBe(expected);
    } finally {
      Date.now = originalNow;
      Date.prototype.toISOString = originalIso;
    }
  });

  it("fails closed with standard headers when the account export limit is exhausted", async () => {
    mockRateLimit.mockResolvedValueOnce({
      ok: false,
      limit: 2,
      remaining: 0,
      retryAfter: 1800,
    });

    const res = await handleExportData(request(), env());
    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBe("1800");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
