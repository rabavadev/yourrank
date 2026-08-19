import { describe, expect, test } from "bun:test";
import { handleKickAuthCallback, handleKickAuthDisconnect, handleKickAuthStart } from "../handlers/kick-auth.js";
import { handleKickViewerAuthStart } from "../handlers/viewer-auth.js";

const user = { id: "user-1" };
const site = { id: "site-1", user_id: "owner-1" };
const noRateLimit = async () => ({ ok: true });
const managerCapability = async () => ({ role: "manager", res: null });
const pkce = async () => ({ codeVerifier: "verifier", codeChallenge: "challenge" });

function request(path) {
  return new Request(`https://test.local${path}`);
}

describe("Kick OAuth state integration seams", () => {
  test("requires an authenticated user before rate limiting or site lookup", async () => {
    let rateLimited = false;
    const response = await handleKickAuthStart(request("/auth/kick?siteId=site-1"), {}, {
      currentUser: async () => null,
      rateLimit: async () => {
        rateLimited = true;
        return { ok: true };
      },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/login");
    expect(rateLimited).toBe(false);
  });

  test("streamer and viewer starts use the same injected state collaborator", async () => {
    const calls = [];
    const storeOAuthState = async (...args) => calls.push(args);
    const streamer = await handleKickAuthStart(request("/auth/kick?siteId=site-1"), {}, {
      currentUser: async () => user,
      rateLimit: noRateLimit,
      one: async () => site,
      requireSiteCapability: managerCapability,
      storeOAuthState,
      generatePKCE: pkce,
      buildKickAuthorizeURL: (_env, state) => `https://kick.test/authorize?state=${state}`,
    });
    const viewer = await handleKickViewerAuthStart(request("/api/viewer/auth/kick"), {}, {
      rateLimit: noRateLimit,
      clientIp: () => "127.0.0.1",
      storeOAuthState,
      generatePKCE: pkce,
      buildKickViewerAuthorizeURL: (_env, state) => `https://kick.test/authorize?state=${state}`,
    });

    expect(streamer.status).toBe(302);
    expect(viewer.status).toBe(302);
    expect(calls).toHaveLength(2);
    expect(calls.map(([provider]) => provider)).toEqual(["kick", "kick"]);
    expect(calls[0][2]).toMatchObject({ siteId: "site-1", userId: "user-1" });
    expect(calls[1][2]).toMatchObject({ codeVerifier: "verifier", redirectUri: "https://test.local/api/viewer/auth/kick/callback" });
  });

  test("rejects a site when the user lacks board-management capability", async () => {
    const response = await handleKickAuthStart(request("/auth/kick?siteId=site-1"), {}, {
      currentUser: async () => user,
      rateLimit: noRateLimit,
      one: async () => site,
      requireSiteCapability: async () => ({ role: "viewer", res: new Response("forbidden", { status: 403 }) }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/dashboard/rewards/channel?error=site_not_authorized&siteId=site-1");
  });

  test("streamer callback rejects a state created for another user", async () => {
    const response = await handleKickAuthCallback(request("/auth/kick/callback?code=code&state=state"), {}, {
      currentUser: async () => user,
      consumeOAuthState: async () => ({ userId: "another-user", siteId: "site-1", codeVerifier: "verifier" }),
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/dashboard/rewards/channel?error=oauth_user_mismatch&siteId=site-1");
  });

  test("disconnects the explicitly selected site and clears identity plus token fields", async () => {
    const queries = [];
    const response = await handleKickAuthDisconnect(request("/api/kick/disconnect?siteId=site-2"), {}, {
      requireUser: async () => ({ user, res: null }),
      one: async (sql, params) => {
        queries.push({ sql, params });
        return { ...site, id: "site-2" };
      },
      requireSiteCapability: managerCapability,
      readJson: async () => ({}),
      exec: async (sql, params) => queries.push({ sql, params }),
    });

    expect(response.status).toBe(200);
    expect(queries[0].params).toEqual(["site-2"]);
    expect(queries[1].sql).toContain("kick_user_id = null");
    expect(queries[1].sql).toContain("kick_username = null");
    expect(queries[1].sql).toContain("kick_access_token_enc = null");
    expect(queries[1].sql).toContain("kick_refresh_token_enc = null");
    expect(queries[1].sql).toContain("kick_token_expires_at = null");
    expect(queries[1].sql).toContain("kick_linked_at = null");
    expect(queries[2].params).toEqual(["site-2"]);
    expect(queries[2].sql).toContain("kick_channel_external_id = null");
  });
});
