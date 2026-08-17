import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { handleGiveawayChatroom } from "../handlers/giveaway.js";
import { GiveawaysPage } from "../pages/giveaways.jsx";
import { giveawaysHtml } from "../pages/giveaway-pages.js";

const gamesSource = readFileSync(new URL("../assets/dashboard/games.js", import.meta.url), "utf8");
const siteSource = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const previewTabsSource = readFileSync(new URL("../assets/dashboard/preview-tabs.js", import.meta.url), "utf8");

describe("Giveaway Chatroom Handler", () => {
  const allowRateLimit = async () => ({ ok: true, remaining: 59, limit: 60, retryAfter: 0 });

  it("returns numeric chatroom ID when provided directly", async () => {
    const req = new Request("http://localhost/api/giveaways/chatroom?channel=12345678");
    const res = await handleGiveawayChatroom(req, {}, { rateLimitImpl: allowRateLimit });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.chatroomId).toBe(12345678);
    expect(data.channel).toBe("12345678");
  });

  it("returns 400 when channel parameter is missing and user has no site", async () => {
    const req = new Request("http://localhost/api/giveaways/chatroom");
    const res = await handleGiveawayChatroom(req, {}, { rateLimitImpl: allowRateLimit });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing channel parameter");
  });

  it("rejects over-limit callers before contacting Kick", async () => {
    let fetchCalled = false;
    const req = new Request("http://localhost/api/giveaways/chatroom?channel=streamer");
    const res = await handleGiveawayChatroom(req, {}, {
      rateLimitImpl: async () => ({ ok: false, remaining: 0, limit: 60, retryAfter: 60 }),
      fetchImpl: async () => {
        fetchCalled = true;
        return new Response("{}");
      },
    });
    expect(res.status).toBe(429);
    expect(fetchCalled).toBe(false);
  });

  it("builds entrant markup without interpolating API values into HTML", () => {
    const source = readFileSync(new URL("../assets/giveaways.js", import.meta.url), "utf8");
    expect(source).not.toContain("tr.innerHTML");
    expect(source).toContain("message.textContent = entrant.message");
    expect(source).toContain("userLink.textContent = entrant.username");
    expect(source).toContain("safeAvatarUrl(entrant.avatar, defaultAvatar)");
  });

  it("renders GiveawaysPage properly", () => {
    const vnode = GiveawaysPage({ user: { id: "u-1", email: "streamer@test.com" } });
    expect(vnode).toBeTruthy();
    const html = vnode.toString();
    expect(html).toContain("Live Chat Giveaways");
    expect(html).toContain("gw-setup-form");
    expect(html).toContain("gw-chat-feed");
    expect(html).toContain("gw-roller");
  });

  it("keeps giveaway history tables on the canonical table markup", () => {
    expect(giveawaysHtml).not.toContain('class="gw-table"');
    expect(giveawaysHtml).not.toContain('class="gw-table-wrap"');
    expect(giveawaysHtml.match(/<table\b/g)).toHaveLength(4);
    expect(giveawaysHtml.match(/<div class="v3-table-scroll">\s*<table class="v3-table">/g)).toHaveLength(4);
  });

  it("keeps preview frame navigations out of browser history", () => {
    expect(gamesSource).toContain("loadSimulatorFrame(iframe, embedUrl);");
    expect(gamesSource).toContain('loadSimulatorFrame(iframe, iframe.dataset.currentSrc + "&_t=" + Date.now());');

    const resetIndex = siteSource.indexOf("if (!resetPreviewFrame()) return;");
    const submitIndex = siteSource.indexOf("_previewForm.submit()");
    expect(resetIndex).toBeGreaterThanOrEqual(0);
    expect(submitIndex).toBeGreaterThan(resetIndex);
  });

  it("keeps preview device tabs under a single controller", () => {
    expect(dashboardSource).not.toContain('querySelectorAll(".preview-tab")');
    expect(previewTabsSource).not.toContain("stopImmediatePropagation");
  });
});
