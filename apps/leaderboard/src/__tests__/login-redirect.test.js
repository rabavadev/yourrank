import { describe, expect, it } from "bun:test";
import { redirectToLogin } from "../login-redirect.js";

describe("protected page login redirects", () => {
  it("preserves the requested path and query in a sanitized next parameter", () => {
    const response = redirectToLogin(
      new URL("https://yourrank.site/dashboard/settings?tab=plan"),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://yourrank.site/login?next=%2Fdashboard%2Fsettings%3Ftab%3Dplan",
    );
  });

  it("drops unsafe or off-origin next candidates", () => {
    const response = redirectToLogin(
      new URL("https://yourrank.site/dashboard"),
      "https://evil.example/phishing",
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://yourrank.site/login");
  });
});
