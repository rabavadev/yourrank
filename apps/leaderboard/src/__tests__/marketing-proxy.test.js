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

  it("falls back when the binding is missing, throws, or degrades", async () => {
    const fallback = () => new Response("fallback", { status: 200 });
    expect(await (await proxyMarketingHome({ request, fallback })).text()).toBe("fallback");
    expect(await (await proxyMarketingHome({
      request,
      fallback,
      binding: { fetch: async () => { throw new Error("offline"); } },
    })).text()).toBe("fallback");
    expect(await (await proxyMarketingHome({
      request,
      fallback,
      binding: { fetch: async () => new Response("bad", { status: 503 }) },
    })).text()).toBe("fallback");
  });
});
