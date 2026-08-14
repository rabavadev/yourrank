import { describe, it, expect } from "bun:test";
import { handleGiveawayChatroom } from "../handlers/giveaway.js";
import { GiveawaysPage } from "../pages/giveaways.jsx";

describe("Giveaway Chatroom Handler", () => {
  it("returns numeric chatroom ID when provided directly", async () => {
    const req = new Request("http://localhost/api/giveaways/chatroom?channel=12345678");
    const res = await handleGiveawayChatroom(req, {});
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.chatroomId).toBe(12345678);
    expect(data.channel).toBe("12345678");
  });

  it("returns 400 when channel parameter is missing and user has no site", async () => {
    const req = new Request("http://localhost/api/giveaways/chatroom");
    const res = await handleGiveawayChatroom(req, {});
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing channel parameter");
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
