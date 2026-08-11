import { describe, it, expect } from "bun:test";
import { DashboardShell } from "../pages/dashboard-shell.jsx";

describe("dashboard shell profile", () => {
  it("renders the supplied plan in the topbar profile badge", () => {
    const html = DashboardShell({ user: { display_name: "Pro user", plan: "pro" } }).toString();
    expect(html).toContain("gm-badge--paid\">Pro</span>");
    expect(html).not.toContain("gm-badge--free\">Free</span>");
  });
});
