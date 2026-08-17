import { describe, expect, it } from "bun:test";
import { handleDomainPurchase } from "../handlers/domains.js";

function request(body) {
  return new Request("https://example.test/api/domains/purchase", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deps(user, authorization, oneImpl = async () => null, provider = {}) {
  let providerCalls = 0;
  return {
    providerCalls: () => providerCalls,
    requireUserImpl: async () => ({ user, res: null }),
    rateLimitImpl: async () => ({ ok: true }),
    getByUserImpl: async () => ({ id: "site-1", user_id: user.id, slug: "board" }),
    getBoardByIdImpl: async () => ({ id: "site-1", user_id: user.id, slug: "board" }),
    requireSiteCapabilityImpl: async () => authorization,
    oneImpl,
    getDomainProviderImpl: () => {
      providerCalls += 1;
      return provider;
    },
  };
}

describe("domain purchase authorization", () => {
  it("rejects a moderator before invoking the provider", async () => {
    let providerCalls = 0;
    const response = await handleDomainPurchase(
      request({ domain: "example.com" }),
      {},
      {
        ...deps(
          { id: "moderator", plan: "pro" },
          { role: "moderator", res: new Response("forbidden", { status: 403 }) }
        ),
        getDomainProviderImpl: () => {
          providerCalls += 1;
          return {};
        },
      }
    );
    expect(response.status).toBe(403);
    expect(providerCalls).toBe(0);
  });

  it("rejects a free-plan owner before invoking the provider", async () => {
    let providerCalls = 0;
    const response = await handleDomainPurchase(
      request({ domain: "example.com" }),
      {},
      {
        ...deps({ id: "owner", plan: "free" }, { role: "owner", res: null }),
        getDomainProviderImpl: () => {
          providerCalls += 1;
          return {};
        },
      }
    );
    expect(response.status).toBe(403);
    expect(providerCalls).toBe(0);
  });

  it("rejects an owner over the active order quota before invoking the provider", async () => {
    let providerCalls = 0;
    const response = await handleDomainPurchase(
      request({ domain: "example.com" }),
      {},
      {
        ...deps(
          { id: "owner", plan: "pro", plan_expires_at: Date.now() + 86400000 },
          { role: "owner", res: null },
          async (sql) => sql.includes("site_id") ? { id: "active-order" } : { count: 0 }
        ),
        getDomainProviderImpl: () => {
          providerCalls += 1;
          return {};
        },
      }
    );
    expect(response.status).toBe(400);
    expect(providerCalls).toBe(0);
  });
});
