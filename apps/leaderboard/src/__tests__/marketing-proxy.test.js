import { describe, expect, it } from "bun:test";
import { proxyMarketingHome } from "../marketing-proxy.js";

const request = new Request("https://yourrank.site/");

describe("apex marketing proxy", () => {
  it("forwards the apex request to the app host with a marker", async () => {
    let forwarded;
    const response = await proxyMarketingHome({
      request,
      binding: {
        fetch: async (upstream) => {
          forwarded = upstream;
          return new Response("marketing", { status: 200, headers: { "x-test": "ok" } });
        },
      },
      fallback: () => new Response("fallback", { status: 200 }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-test")).toBe("ok");
    expect(await response.text()).toBe("marketing");
    expect(forwarded.url).toBe("https://app.yourrank.site/");
    expect(forwarded.headers.get("x-yr-marketing")).toBe("1");
  });

  it("returns a plain 503 when the binding is missing, throws, or degrades", async () => {
    expect((await proxyMarketingHome({ request })).status).toBe(503);
    expect(await (await proxyMarketingHome({
      request,
      binding: { fetch: async () => { throw new Error("offline"); } },
    })).text()).toBe("marketing service unavailable");
    expect(await (await proxyMarketingHome({
      request,
      binding: { fetch: async () => new Response("bad", { status: 503 }) },
    })).text()).toBe("marketing service unavailable");
  });

  it("forwards homepage asset requests with the same marker", async () => {
    const assetRequest = new Request("https://yourrank.site/_next/static/chunks/home.js");
    let forwarded;
    const response = await proxyMarketingHome({
      request: assetRequest,
      binding: {
        fetch: async (upstream) => {
          forwarded = upstream;
          return new Response("asset", { status: 200 });
        },
      },
    });

    expect(response.status).toBe(200);
    expect(forwarded.url).toBe("https://app.yourrank.site/_next/static/chunks/home.js");
    expect(forwarded.headers.get("x-yr-marketing")).toBe("1");
  });
});
