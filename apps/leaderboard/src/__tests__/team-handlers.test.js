import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import {
  handleTeamList,
  handleTeamInvite,
  handleTeamRevokeInvite,
  handleTeamRemoveMember,
  handleTeamUpdateRole,
  handleTeamAcceptInvite,
  handleGetInviteInfo,
} from "../handlers/team.js";
import { InvitePage } from "../pages/invite.jsx";

describe("Team API Handlers", () => {
  const allowRateLimit = async () => ({ ok: true, remaining: 29, limit: 30, retryAfter: 0 });
  const headers = (rl) => ({ "X-RateLimit-Limit": String(rl.limit) });

  it("returns one generic response for missing invite metadata", async () => {
    const badReq = new Request("https://yourrank.site/api/site/team/invite-info");
    const badRes = await handleGetInviteInfo(badReq, {}, {
      rateLimit: allowRateLimit,
      rateLimitHeaders: headers,
      getInviteByToken: async () => null,
    });
    expect(badRes.status).toBe(404);
    expect(await badRes.json()).toEqual({ ok: false, error: "Invitation is not available." });
  });

  it("ships invite acceptance as an external CSP-compatible CSRF-aware asset", () => {
    const page = readFileSync(new URL("../pages/invite.jsx", import.meta.url), "utf8");
    const script = readFileSync(new URL("../assets/invite.js", import.meta.url), "utf8");
    expect(page).toContain('<script src="/assets/invite.js" defer></script>');
    expect(page).not.toContain("<script dangerouslySetInnerHTML");
    expect(script).toContain('"x-csrf-token": getCsrf()');
    expect(script).toContain('window.location.assign("/dashboard")');
  });

  it("allows a moderator to read the team list but blocks every mutation", async () => {
    const user = { id: "moderator-1", email: "mod@example.com" };
    const site = { id: "site-1" };
    const deps = {
      requireUser: async () => ({ user, res: null }),
      getSiteById: async (env, siteId) => siteId === site.id ? site : null,
      getByUser: async () => null,
      getSiteRole: async () => "moderator",
      listSiteMembers: async () => [],
      listSiteInvites: async () => [],
      rateLimit: allowRateLimit,
      rateLimitHeaders: headers,
      createSiteInvite: async () => ({ ok: true }),
      revokeSiteInvite: async () => ({ ok: true }),
      removeSiteMember: async () => ({ ok: true }),
      updateSiteMemberRole: async () => ({ ok: true }),
    };

    const listRes = await handleTeamList(
      new Request("https://yourrank.site/api/site/team?siteId=site-1"),
      {},
      deps,
    );
    expect(listRes.status).toBe(200);
    expect((await listRes.json()).currentRole).toBe("moderator");

    const requests = [
      [handleTeamInvite, { siteId: "site-1", email: "other@example.com" }],
      [handleTeamRevokeInvite, { siteId: "site-1", inviteId: "invite-1" }],
      [handleTeamRemoveMember, { siteId: "site-1", targetUserId: "other-user" }],
      [handleTeamUpdateRole, { siteId: "site-1", targetUserId: "other-user", role: "manager" }],
    ];
    for (const [handler, body] of requests) {
      const res = await handler(
        new Request("https://yourrank.site/api/site/team/action", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
        {},
        deps,
      );
      expect(res.status).toBe(403);
    }
  });

  it("resolves a member-owned-free account through its earliest membership", async () => {
    const calls = [];
    const deps = {
      requireUser: async () => ({ user: { id: "moderator-1" }, res: null }),
      one: async (sql, params) => {
        calls.push([sql, params]);
        if (sql.includes("FROM sites WHERE user_id=$1")) return null;
        if (sql.includes("FROM sites s") && sql.includes("site_members")) return { id: "site-member-first" };
        return null;
      },
      getSiteRole: async (siteId, userId) => siteId === "site-member-first" && userId === "moderator-1" ? "moderator" : null,
      listSiteMembers: async () => [],
      listSiteInvites: async () => [],
    };

    const res = await handleTeamList(
      new Request("https://yourrank.site/api/site/team"),
      {},
      deps,
    );
    expect(res.status).toBe(200);
    expect((await res.json()).siteId).toBe("site-member-first");
    expect(calls).toHaveLength(2);
    expect(calls[1][1]).toEqual(["moderator-1"]);
  });

  it("returns 404 for a non-member instead of exposing team existence", async () => {
    const deps = {
      requireUser: async () => ({ user: { id: "outsider" }, res: null }),
      getSiteById: async () => null,
      getSiteRole: async () => null,
    };
    const res = await handleTeamList(
      new Request("https://yourrank.site/api/site/team?siteId=site-1"),
      {},
      deps,
    );
    expect(res.status).toBe(404);
  });

  it("preserves the invite after signed-out visitors authenticate", () => {
    const html = String(InvitePage({
      invite: {
        siteName: "Board",
        ownerName: "Owner",
        role: "moderator",
        status: "pending",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      token: "invite-token",
      user: null,
    }));
    expect(html).toContain("/login?next=%2Finvite%2Finvite-token");
    expect(html).toContain("/signup?next=%2Finvite%2Finvite-token");
  });

  it("rejects unauthorized calls on team endpoints", async () => {
    const fakeEnv = {};
    const req = new Request("https://yourrank.site/api/site/team?siteId=site-1", {
      headers: { "content-type": "application/json" },
    });

    const res = await handleTeamList(req, fakeEnv);
    expect(res.status).toBe(401);

    const inviteReq = new Request("https://yourrank.site/api/site/team/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: "site-1", email: "mod@example.com", role: "moderator" }),
    });
    const inviteRes = await handleTeamInvite(inviteReq, fakeEnv);
    expect(inviteRes.status).toBe(401);

    const revokeReq = new Request("https://yourrank.site/api/site/team/invite/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: "site-1", inviteId: "inv-1" }),
    });
    const revokeRes = await handleTeamRevokeInvite(revokeReq, fakeEnv);
    expect(revokeRes.status).toBe(401);

    const removeReq = new Request("https://yourrank.site/api/site/team/remove", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: "site-1", targetUserId: "u-1" }),
    });
    const removeRes = await handleTeamRemoveMember(removeReq, fakeEnv);
    expect(removeRes.status).toBe(401);

    const roleReq = new Request("https://yourrank.site/api/site/team/role", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: "site-1", targetUserId: "u-1", role: "manager" }),
    });
    const roleRes = await handleTeamUpdateRole(roleReq, fakeEnv);
    expect(roleRes.status).toBe(401);

    const acceptReq = new Request("https://yourrank.site/api/site/team/accept-invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "tok-123" }),
    });
    const acceptRes = await handleTeamAcceptInvite(acceptReq, fakeEnv);
    expect(acceptRes.status).toBe(401);
  });
});
