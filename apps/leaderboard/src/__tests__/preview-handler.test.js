import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockCurrentUser = mock(() => Promise.resolve({ id: "user-1", plan: "pro", plan_expires_at: Date.now() + 86400000 }));
const mockGetUserSiteById = mock(() => Promise.resolve(null));

import { handleDashboardPreview } from "../handlers/preview.js";

const SITE = {
  id: "site-1",
  slug: "actual-board",
  data: {
    brand: { name: "Actual Board", casino: "Stake", prizePool: "$5,000", period: "Monthly" },
    branding: { template: "classic", accentA: "#111111", accentB: "#222222" },
    players: [{ name: "Actual Player", wagered: 1000, prize: 100 }],
    partner: {},
    rules: [],
    socials: [],
    whyStats: [],
  },
};

describe("handleDashboardPreview", () => {
  beforeEach(() => {
    mockCurrentUser.mockReset();
    mockGetUserSiteById.mockReset();
    mockCurrentUser.mockResolvedValue({ id: "user-1", plan: "pro", plan_expires_at: Date.now() + 86400000 });
    mockGetUserSiteById.mockResolvedValue(SITE);
  });

  it("requires an authenticated dashboard session", async () => {
    mockCurrentUser.mockResolvedValueOnce(null);
    const res = await handleDashboardPreview(
      new Request("https://test.com/dashboard/preview?board=site-1"),
      {},
      "nonce123",
      { currentUserImpl: (...args) => mockCurrentUser(...args), getUserSiteByIdImpl: (...args) => mockGetUserSiteById(...args) },
    );
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://test.com/login");
  });

  it("returns 404 when the requested board is not owned by the user", async () => {
    mockGetUserSiteById.mockResolvedValueOnce(null);
    const res = await handleDashboardPreview(
      new Request("https://test.com/dashboard/preview?board=other-site"),
      {},
      "nonce123",
      { currentUserImpl: (...args) => mockCurrentUser(...args), getUserSiteByIdImpl: (...args) => mockGetUserSiteById(...args) },
    );
    expect(res.status).toBe(404);
    expect(mockGetUserSiteById).toHaveBeenCalledWith({}, "user-1", "other-site", "pro");
  });

  it("overrides preview theme data without mutating stored board data", async () => {
    const res = await handleDashboardPreview(
      new Request("https://test.com/dashboard/preview?board=site-1&accentA=%2300ffd1&accentB=%23ff2cd0"),
      {},
      "nonce123",
      { currentUserImpl: (...args) => mockCurrentUser(...args), getUserSiteByIdImpl: (...args) => mockGetUserSiteById(...args) },
    );
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain('class="yr-site"');
    expect(html).toContain("Actual Board");
    expect(html).toContain("--yr-accent:#00ffd1");
    expect(html).toContain("Actual Player");
    expect(SITE.data.branding).toEqual({
      template: "classic",
      accentA: "#111111",
      accentB: "#222222",
    });
  });
});