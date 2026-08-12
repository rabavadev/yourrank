// Every dashboard section is a URL now. The Worker and the shell both build and
// parse those URLs from routes.js, so these assertions cover both sides.
import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { dashboardPath, parseDashboardPath, resolveSection, defaultTab } from "../assets/dashboard/routes.js";

describe("dashboard routes", () => {
  it("round-trips every section and sub-tab", () => {
    for (const [page, tab] of [["home", ""], ["board", "players"], ["boards", ""], ["games", ""], ["performance", "referrals"], ["settings", "connections"]]) {
      expect(parseDashboardPath(dashboardPath(page, tab))).toEqual({ page, tab });
    }
  });

  it("addresses the editor steps individually", () => {
    expect(dashboardPath("board", "design")).toBe("/dashboard/editor/design");
    expect(parseDashboardPath("/dashboard/editor/design")).toEqual({ page: "board", tab: "design" });
  });

  it("addresses every unified settings tab explicitly", () => {
    for (const tab of ["account", "plan", "connections", "data"]) {
      expect(dashboardPath("settings", tab)).toBe(`/dashboard/settings/${tab}`);
      expect(parseDashboardPath(`/dashboard/settings/${tab}`)).toEqual({ page: "settings", tab });
    }
    expect(parseDashboardPath("/dashboard/settings/integrations")).toBeNull();
  });

  it("keeps the links we have already shipped working", () => {
    // ?nav= names and older section names still resolve, so old bookmarks and
    // e-mails land on the section they meant rather than on a 404.
    expect(resolveSection("overview")).toBe("home");
    expect(resolveSection("analytics")).toBe("performance");
    expect(resolveSection("billing")).toBe("settings");
    expect(resolveSection("editor")).toBe("board");
    expect(dashboardPath("performance")).toBe("/dashboard/analytics");
  });

  it("rejects paths that are not sections", () => {
    expect(parseDashboardPath("/dashboard/rewards/channel")).toBeNull();
    expect(parseDashboardPath("/dashboard/editor/nope")).toBeNull();
    expect(parseDashboardPath("/account/profile")).toBeNull();
    expect(parseDashboardPath("/dashboard/")).toEqual({ page: "home", tab: "" });
  });

  it("defaults a section to its first tab", () => {
    expect(defaultTab("performance")).toBe("activity");
    expect(defaultTab("board")).toBe("setup");
    expect(defaultTab("settings")).toBe("account");
  });

  it("no longer navigates through ?nav=", () => {
    for (const file of ["../assets/dashboard/shell.js", "../assets/dashboard.js", "../pages/dashboard.jsx"]) {
      const src = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(src).not.toContain("?nav=");
    }
  });
});
