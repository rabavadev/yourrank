import { describe, expect, it } from "bun:test";
import { serializeWebhookUrl } from "../assets/dashboard/notifications.js";

describe("webhook notification settings", () => {
  it("clears a configured webhook when the operator disables it", () => {
    expect(serializeWebhookUrl("", false)).toBe(null);
  });

  it("preserves a configured webhook across unrelated board saves", () => {
    expect(serializeWebhookUrl("", true)).toBe(undefined);
  });

  it("stores a replacement URL when re-enabled", () => {
    expect(serializeWebhookUrl(" https://discord.com/api/webhooks/1/token ", false))
      .toBe("https://discord.com/api/webhooks/1/token");
  });
});
