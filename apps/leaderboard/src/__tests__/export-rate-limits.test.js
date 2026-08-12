import { describe, it, expect, mock, beforeEach } from "bun:test";

const authUrl = import.meta.resolve("../auth.js");
const authUrlTs = import.meta.resolve("../auth.ts");
const siteUrl = import.meta.resolve("../site.js");
const siteUrlTs = import.meta.resolve("../site.ts");
const statsUrl = import.meta.resolve("../stats.js");
const statsUrlTs = import.meta.resolve("../stats.ts");
const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");

const USER = { id: "user-1", status: "active", plan: "pro" };
const SITE = { id: "site-1", slug: "board", user_id: "user-1" };
const mockRateLimit = mock(() => Promise.resolve({
  ok: true,
  limit: 10,
  remaining: 9,
  retryAfter: 0,
}));
const mockGetByUser = mock(() => Promise.resolve(SITE));
const mockGetBoardById = mock(() => Promise.resolve(SITE));
const mockGetStats = mock(() => Promise.resolve({
  days: [],
  today: {},
  last7: {},
  last30: {},
}));

const authMock = () => ({
  requireUser: mock(() => Promise.resolve({ user: USER, res: null })),
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
});

const siteMock = () => ({
  getByUser: (...args) => mockGetByUser(...args),
  getBoardById: (...args) => mockGetBoardById(...args),
  getUserSite: mock(() => Promise.resolve(SITE)),
  getUserSiteById: mock(() => Promise.resolve(SITE)),
  getUserBoardsList: mock(() => Promise.resolve([])),
  createBoard: mock(() => Promise.resolve({ ok: true })),
  duplicateBoard: mock(() => Promise.resolve({ ok: true })),
  createArchive: mock(() => Promise.resolve({ ok: true })),
  deleteArchive: mock(() => Promise.resolve({ ok: true })),
  deleteBoard: mock(() => Promise.resolve({ ok: true })),
  setActiveBoard: mock(() => Promise.resolve({ ok: true })),
  updateSiteTheme: mock(() => Promise.resolve({ ok: true })),
  invalidateSiteCache: mock(() => {}),
  invalidateUserCache: mock(() => {}),
  saveSite: mock(() => Promise.resolve({ ok: true })),
  fromJsonb: (value) => value,
});
const statsMock = () => ({
  bumpStat: mock(() => Promise.resolve()),
  getStats: (...args) => mockGetStats(...args),
  getHeatmap: mock(() => Promise.resolve({})),
  getTopReferrers: mock(() => Promise.resolve([])),
});
const dbMock = () => ({
  one: mock(() => Promise.resolve(null)),
  exec: mock(() => Promise.resolve()),
  query: mock(() => Promise.resolve([])),
});

mock.module(authUrl, authMock);
mock.module(authUrlTs, authMock);
mock.module(siteUrl, siteMock);
mock.module(siteUrlTs, siteMock);
mock.module(statsUrl, statsMock);
mock.module(statsUrlTs, statsMock);
mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);

import { handleExportPlayers, handleExportStats } from "../handlers/sites.js";

const request = (url) => new Request(url, { method: "GET" });
const env = () => ({ HYPERDRIVE: { connectionString: "postgresql://mock" } });

describe("site export rate limits", () => {
  beforeEach(() => {
    mockRateLimit.mockReset();
    mockRateLimit.mockResolvedValue({
      ok: true,
      limit: 10,
      remaining: 9,
      retryAfter: 0,
    });
    mockGetByUser.mockClear();
    mockGetBoardById.mockClear();
    mockGetStats.mockClear();
  });

  it("uses the per-user players export bucket", async () => {
    const res = await handleExportPlayers(request("https://yourrank.site/api/site/players/export"), env());
    expect(res.status).toBe(200);
    expect(mockRateLimit).toHaveBeenCalledWith(env(), "site-players-export:user-1", 10, 3600);
  });

  it("uses the per-user stats export bucket", async () => {
    const res = await handleExportStats(request("https://yourrank.site/api/site/stats/export"), env());
    expect(res.status).toBe(200);
    expect(mockRateLimit).toHaveBeenCalledWith(env(), "site-stats-export:user-1", 10, 3600);
  });

  it("returns standard headers when a site export is rate limited", async () => {
    mockRateLimit.mockResolvedValueOnce({
      ok: false,
      limit: 10,
      remaining: 0,
      retryAfter: 3600,
    });

    const res = await handleExportPlayers(request("https://yourrank.site/api/site/players/export"), env());
    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBe("3600");
  });
});
