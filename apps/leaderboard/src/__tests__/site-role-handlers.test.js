import { describe, expect, it } from "bun:test";
import {
  handleArchive,
  handleDeleteSite,
  handleExportStats,
  handleHeatmap,
  handleStats,
} from "../handlers/sites.js";

const site = { id: "site-1", user_id: "owner-1", slug: "board" };
const env = {};
const user = { id: "member-1", status: "active" };
const request = (url, body) => new Request(`https://example.test${url}`, {
  method: body ? "POST" : "GET",
  headers: body ? { "content-type": "application/json" } : undefined,
  body: body ? JSON.stringify(body) : undefined,
});

function deps(role, extra = {}) {
  return {
    requireUserImpl: async () => ({ user, res: null }),
    getByUserImpl: async () => site,
    getBoardByIdImpl: async () => site,
    requireSiteCapabilityImpl: async (_user, _site, capability) => (
      ["owner", "manager", "moderator"].includes(role) &&
      (capability === "canRoleManageBilling" ? role === "owner" : true)
        ? { role, res: null }
        : { role, res: new Response("forbidden", { status: 403 }) }
    ),
    ...extra,
  };
}

describe("site role handler authorization", () => {
  for (const role of ["manager", "moderator"]) {
    it(`${role} can read stats and heatmap`, async () => {
      const stats = await handleStats(request("/api/site/stats"), env, {
        ...deps(role),
        getStatsImpl: async () => ({ today: {} }),
      });
      const heatmap = await handleHeatmap(request("/api/site/stats/heatmap"), env, {
        ...deps(role),
        getHeatmapImpl: async () => [],
        getTopReferrersImpl: async () => [],
      });
      expect(stats.status).toBe(200);
      expect(heatmap.status).toBe(200);
    });

    it(`${role} can create an archive`, async () => {
      const response = await handleArchive(
        request("/api/site/archive", { label: "snapshot", clear: "none" }),
        env,
        {
          ...deps(role),
          rateLimitImpl: async () => ({ ok: true }),
          createArchiveImpl: async () => ({ label: "snapshot" }),
        }
      );
      expect(response.status).toBe(200);
    });
  }

  it("denies a moderator from exporting stats or deleting a board", async () => {
    const exportResponse = await handleExportStats(
      request("/api/site/stats/export"),
      env,
      {
        ...deps("moderator"),
        rateLimitImpl: async () => ({ ok: true }),
      }
    );
    const deleteResponse = await handleDeleteSite(
      request("/api/site", { siteId: site.id }),
      env,
      {
        ...deps("moderator"),
        rateLimitImpl: async () => ({ ok: true }),
      }
    );
    expect(exportResponse.status).toBe(403);
    expect(deleteResponse.status).toBe(403);
  });
});
