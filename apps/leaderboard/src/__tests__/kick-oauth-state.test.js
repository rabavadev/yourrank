import { describe, expect, test } from "bun:test";
import { handleKickAuthCallback, handleKickAuthDisconnect, handleKickAuthStart } from "../handlers/kick-auth.js";
import { handleKickViewerAuthCallback, handleKickViewerAuthStart } from "../handlers/viewer-auth.js";

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

  test("resolves the active owned site when the start URL omits siteId", async () => {
    const calls = [];
    const response = await handleKickAuthStart(request("/auth/kick"), {}, {
      currentUser: async () => ({ ...user, active_site_id: "site-1" }),
      rateLimit: noRateLimit,
      one: async (sql, params) => {
        calls.push({ sql, params });
        return site;
      },
      requireSiteCapability: managerCapability,
      storeOAuthState: async (...args) => calls.push({ state: args }),
      generatePKCE: pkce,
      buildKickAuthorizeURL: (_env, state) => `https://kick.test/authorize?state=${state}`,
    });

    expect(response.status).toBe(302);
    expect(calls[0].sql).toContain("active_site_id");
    expect(calls.find((call) => call.state)?.state[2]).toMatchObject({ siteId: "site-1" });
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

  test("streamer callback redirects with a stable error code", async () => {
    const response = await handleKickAuthCallback(request("/auth/kick/callback?code=code&state=state"), {}, {
      currentUser: async () => user,
      consumeOAuthState: async () => ({ userId: user.id, siteId: site.id, codeVerifier: "verifier" }),
      one: async () => site,
      requireSiteCapability: managerCapability,
      exchangeKickCode: async () => {
        throw new Error("Kick token endpoint returned 401: response body");
      },
    });

    expect(response.headers.get("location")).toBe("/dashboard/rewards/channel?error=kick_auth_failed&siteId=site-1");
  });

  test("viewer callback redirects with a stable error code", async () => {
    const response = await handleKickViewerAuthCallback(request("/api/viewer/auth/kick/callback?code=code&state=state"), {}, {
      consumeOAuthState: async () => ({ codeVerifier: "verifier", redirectUri: "https://test.local/callback" }),
      exchangeKickViewerCode: async () => {
        throw new Error("Kick token endpoint returned 401: response body");
      },
    });

    expect(response.headers.get("location")).toBe("/me?error=kick_auth_failed");
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
      withTransaction: async (fn) => fn({
        unsafe: async (sql, params) => queries.push({ sql, params }),
        one: async (sql, params) => {
          queries.push({ sql, params });
          return null;
        },
        query: async () => [],
      }),
    });

    expect(response.status).toBe(200);
    expect(queries[0].params).toEqual(["site-2"]);
    expect(queries[1].sql).toContain("FOR UPDATE");
    expect(queries[2].sql).toContain("kick_channel_external_id");
    expect(queries[3].sql).toContain("kick_user_id = null");
  });

  test("preserves the account link when another owned site remains connected", async () => {
    const queries = [];
    const response = await handleKickAuthDisconnect(request("/api/kick/disconnect?siteId=site-2"), {}, {
      requireUser: async () => ({ user, res: null }),
      one: async (sql, params) => {
        queries.push({ sql, params });
        return { ...site, id: "site-2" };
      },
      requireSiteCapability: managerCapability,
      readJson: async () => ({}),
      withTransaction: async (fn) => fn({
        unsafe: async (sql, params) => queries.push({ sql, params }),
        one: async (sql, params) => {
          queries.push({ sql, params });
          return { id: "other-site" };
        },
        query: async () => [],
      }),
    });

    expect(response.status).toBe(200);
    expect(queries.some((query) => query.sql.includes("kick_user_id = null"))).toBe(false);
    expect(queries.at(-1).sql).toContain("kick_channel_external_id");
  });
});
