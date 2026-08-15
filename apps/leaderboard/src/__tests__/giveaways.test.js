import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { handleGiveawayChatroom } from "../handlers/giveaway.js";
import { GiveawaysPage } from "../pages/giveaways.jsx";

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
});
