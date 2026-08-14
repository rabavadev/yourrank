import { describe, it, expect } from "bun:test";
import {
  handleTeamList,
  handleTeamInvite,
  handleTeamRevokeInvite,
  handleTeamRemoveMember,
  handleTeamUpdateRole,
  handleTeamAcceptInvite,
  handleGetInviteInfo,
} from "../handlers/team.js";

describe("Team API Handlers", () => {
  it("handleGetInviteInfo returns 400 when token is missing", async () => {
    const badReq = new Request("https://yourrank.site/api/site/team/invite-info");
    const badRes = await handleGetInviteInfo(badReq, {});
    expect(badRes.status).toBe(400);
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
