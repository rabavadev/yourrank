import { afterEach, describe, expect, it, mock } from "bun:test";
import { escapeTgMarkdown, notifyReset } from "../notifications.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("notification delivery", () => {
  it("rejects when Discord rejects a reset notification", async () => {
    globalThis.fetch = mock(async () => new Response("provider unavailable", { status: 503 }));
    const db = {
      one: async () => ({ discord_webhook_url_enc: "https://discord.example/webhook" }),
    };

    await expect(notifyReset(db, {}, "site-1", "Board", [], "monthly"))
      .rejects.toThrow("Discord delivery failed: Discord 503");
  });

  it("escapes interpolated Telegram Markdown", () => {
    expect(escapeTgMarkdown("Board_[one].")).toBe("Board\\_\\[one\\]\\.");
  });
});
