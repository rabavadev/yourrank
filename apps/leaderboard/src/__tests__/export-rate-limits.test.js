import { describe, it, expect, mock, beforeEach } from "bun:test";
import { handleExportPlayers, handleExportStats } from "../handlers/sites.js";

const USER = { id: "user-1", status: "active", plan: "pro" };
const SITE = { id: "site-1", slug: "board", user_id: "user-1" };
const mockRateLimit = mock(() => Promise.resolve({
  ok: true,
  limit: 10,
  remaining: 9,
  retryAfter: 0,
}));
const mockGetByUser = mock(() => Promise.resolve(SITE));
const mockGetStats = mock(() => Promise.resolve({
  days: [],
  today: {},
  last7: {},
  last30: {},
}));

const request = (url) => new Request(url, { method: "GET" });
const env = () => ({ HYPERDRIVE: { connectionString: "postgresql://mock" } });
const deps = () => ({
  requireUserImpl: async () => ({ user: USER, res: null }),
  rateLimitImpl: mockRateLimit,
  getByUserImpl: mockGetByUser,
  getStatsImpl: mockGetStats,
  queryImpl: async () => [],
});

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
    mockGetStats.mockClear();
  });

  it("uses the per-user players export bucket", async () => {
    const res = await handleExportPlayers(
      request("https://yourrank.site/api/site/players/export"),
      env(),
      deps(),
    );
    expect(res.status).toBe(200);
    expect(mockRateLimit).toHaveBeenCalledWith(env(), "site-players-export:user-1", 10, 3600);
  });

  it("uses the per-user stats export bucket", async () => {
    const res = await handleExportStats(
      request("https://yourrank.site/api/site/stats/export"),
      env(),
      deps(),
    );
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

    const res = await handleExportPlayers(
      request("https://yourrank.site/api/site/players/export"),
      env(),
      deps(),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(res.headers.get("Retry-After")).toBe("3600");
  });
});
