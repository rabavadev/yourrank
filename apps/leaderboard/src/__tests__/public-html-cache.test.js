import { describe, expect, it } from "bun:test";
import {
  isPublicBoardCacheRequest,
  isPublicBoardCacheSite,
  publicBoardCacheKey,
  publicHtmlCacheControl,
} from "../public-html-cache.js";

const site = { published: true, isDraft: false };

function request(url, opts = {}) {
  return new Request(url, { method: opts.method || "GET", headers: opts.headers || {} });
}

describe("public HTML cache boundary", () => {
  it("allows only cookie-free GET board pages without query parameters", () => {
    expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer"), "home")).toBe(true);
    expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer/leaderboard"), "leaderboard")).toBe(true);
    expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer", { method: "POST" }), "home")).toBe(false);
    expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer?preview=1"), "home")).toBe(false);
    expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer/shop"), "shop")).toBe(false);
  });

  it("never serves an anonymous cache entry to a cookie-bearing request", () => {
    for (const cookie of ["yr_session=session", "yr_viewer=viewer", "yr_boardpass_streamer=token", "yr_vid=visitor"]) {
      expect(isPublicBoardCacheRequest(request("https://yourrank.site/streamer", { headers: { cookie } }), "home")).toBe(false);
    }
  });

  it("rejects password-protected, unpublished, draft, and suspended boards", () => {
    expect(isPublicBoardCacheSite(site)).toBe(true);
    expect(isPublicBoardCacheSite({ ...site, password_hash: "hash" })).toBe(false);
    expect(isPublicBoardCacheSite({ ...site, published: false })).toBe(false);
    expect(isPublicBoardCacheSite({ ...site, isDraft: true })).toBe(false);
    expect(isPublicBoardCacheSite({ ...site, suspended: true })).toBe(false);
    expect(isPublicBoardCacheSite({ ...site, pendingVerification: true })).toBe(false);
    expect(isPublicBoardCacheSite({ ...site, requiresPassword: true })).toBe(false);
  });

  it("includes the hostname in the cache key so tenants cannot collide", () => {
    const platform = publicBoardCacheKey(request("https://yourrank.site/streamer"));
    const custom = publicBoardCacheKey(request("https://streamer.example/streamer"));
    expect(platform.url).not.toBe(custom.url);
    expect(platform.url).toContain(encodeURIComponent("yourrank.site"));
    expect(custom.url).toContain(encodeURIComponent("streamer.example"));
  });

  it("uses the agreed edge-cache policy", () => {
    expect(publicHtmlCacheControl()).toBe("public, max-age=0, s-maxage=15, stale-while-revalidate=60");
  });
});
