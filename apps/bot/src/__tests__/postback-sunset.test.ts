import { describe, expect, it } from "bun:test";
import { buildHonoApp } from "../hono-app.js";

describe("legacy bot postback sunset", () => {
  it("returns 410 with deprecation headers when unsigned intake is disabled", async () => {
    const response = await buildHonoApp().request(
      "https://bot.yourrank.site/pb/legacy",
      { method: "POST" },
      {
        POSTBACK_UNSIGNED_ENABLED: "false",
        RL_FAIL_OPEN: "true",
      }
    );

    expect(response.status).toBe(410);
    expect(response.headers.get("deprecation")).toBe("true");
    expect(response.headers.get("sunset")).toBe("2026-10-01");
    expect(response.headers.get("link")).toContain("successor-version");
  });
});
