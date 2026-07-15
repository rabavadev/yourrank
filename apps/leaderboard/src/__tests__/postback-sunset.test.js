import { describe, expect, test } from "bun:test";
import { handlePostback } from "../handlers/attribution.js";

describe("legacy attribution postback sunset", () => {
  test("returns 410 with deprecation headers when unsigned intake is disabled", async () => {
    const request = new Request("https://yourrank.site/api/postback?key=legacy", {
      method: "POST",
    });
    const response = await handlePostback(request, {
      POSTBACK_UNSIGNED_ENABLED: "false",
      RL_FAIL_OPEN: "true",
    });

    expect(response.status).toBe(410);
    expect(response.headers.get("deprecation")).toBe("true");
    expect(response.headers.get("sunset")).toBe("2026-10-01");
    expect(response.headers.get("link")).toContain("successor-version");
  });
});
