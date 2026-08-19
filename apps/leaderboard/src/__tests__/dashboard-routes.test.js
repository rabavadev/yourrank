// Every dashboard section is a URL now. The Worker and the shell both build and
// parse those URLs from routes.js, so these assertions cover both sides.
import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { ACCOUNT_SECTION_PATHS } from "@yourrank/shared/dashboard-nav";
import { dashboardPath, parseDashboardPath, resolveSection, defaultTab, legacyDashboardPath } from "../assets/dashboard/routes.js";
import { LEGACY_TELEGRAM_REDIRECTS, legacyTelegramRedirect } from "../telegram-routes.js";

describe("dashboard routes", () => {
  it("round-trips every section and sub-tab", () => {
    for (const [page, tab] of [["home", ""], ["board", "players"], ["boards", ""], ["games", ""], ["performance", "referrals"], ["site", ""]]) {
      expect(parseDashboardPath(dashboardPath(page, tab))).toEqual({ page, tab });
    }
  });

  it("addresses the editor steps individually", () => {
    expect(dashboardPath("board", "design")).toBe("/dashboard/leaderboard/design");
    expect(parseDashboardPath("/dashboard/leaderboard/design")).toEqual({ page: "board", tab: "design" });
  });

  it("leaves the account settings document to the Worker", () => {
    // Account settings are their own pages: if the shell claimed them it would
    // intercept the sidebar link and show board settings instead.
    for (const tab of ["", "/account", "/plan", "/connections", "/data", "/integrations"]) {
      expect(parseDashboardPath(`/dashboard/settings${tab}`)).toBeNull();
    }
    expect(dashboardPath("settings")).toBe("/dashboard/settings/board");
    expect(parseDashboardPath("/dashboard/settings/board")).toEqual({ page: "site", tab: "" });
  });

  it("keeps the links we have already shipped working", () => {
    // ?nav= names and older section names still resolve, so old bookmarks and
    // e-mails land on the section they meant rather than on a 404.
    expect(resolveSection("overview")).toBe("home");
    expect(resolveSection("analytics")).toBe("performance");
    expect(resolveSection("billing")).toBe("plan");
    expect(resolveSection("integrations")).toBe("connections");
    expect(resolveSection("settings")).toBe("site");
    expect(dashboardPath("billing")).toBe("/dashboard/settings/plan");
    expect(dashboardPath("integrations")).toBe("/dashboard/settings/connections");
    expect(ACCOUNT_SECTION_PATHS.billing).toBe(dashboardPath("billing"));
    expect(ACCOUNT_SECTION_PATHS.integrations).toBe(dashboardPath("integrations"));
    const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");
    expect(worker).toContain("ACCOUNT_SECTION_PATHS[legacyNav]");
    expect(worker).not.toContain("legacyAccountPaths");
    expect(resolveSection("editor")).toBe("board");
    expect(dashboardPath("performance")).toBe("/dashboard/analytics");
  });

  it("rejects paths that are not sections", () => {
    expect(parseDashboardPath("/dashboard/rewards/channel")).toBeNull();
    expect(parseDashboardPath("/dashboard/leaderboard/nope")).toBeNull();
    expect(legacyDashboardPath("/dashboard/editor/design")).toBe("/dashboard/leaderboard/design");
    expect(legacyDashboardPath("/dashboard/boards")).toBe("/dashboard/leaderboards");
    expect(parseDashboardPath("/account/profile")).toBeNull();
    expect(parseDashboardPath("/dashboard/")).toEqual({ page: "home", tab: "" });
  });

  it("maps legacy Telegram pages to the canonical Bot Worker", () => {
    expect(LEGACY_TELEGRAM_REDIRECTS).toEqual({
      "/bot": "/dashboard/telegram",
      "/bot/dashboard": "/dashboard/telegram",
      "/bot/bots": "/dashboard/telegram/bots",
      "/bot/commands": "/dashboard/telegram/commands",
      "/bot/offers": "/dashboard/telegram/offers",
      "/bot/broadcasts": "/dashboard/telegram/broadcasts",
      "/dashboard/telegram/overview": "/dashboard/telegram",
      "/dashboard/bot/setup": "/dashboard/telegram",
    });
    for (const [legacy, canonical] of Object.entries(LEGACY_TELEGRAM_REDIRECTS)) {
      expect(legacyTelegramRedirect(legacy)).toBe(canonical);
    }
    expect(legacyTelegramRedirect("/dashboard/telegram")).toBe("");
    const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");
    expect(worker).toContain('path === "/dashboard/integrations"');
    expect(worker).toContain('redirectKeepingSearch("/dashboard/settings/connections", url)');
    for (const alias of ["/bot", "/bot/dashboard", "/bot/bots", "/bot/commands", "/bot/offers", "/bot/broadcasts"]) {
      expect(worker).not.toContain(`path === "${alias}"`);
    }
  });

  it("defaults a section to its first tab", () => {
    expect(defaultTab("performance")).toBe("activity");
    expect(defaultTab("board")).toBe("setup");
    expect(defaultTab("settings")).toBe("");
  });

  it("loads a new document when the target section is not in this one", () => {
    const shell = readFileSync(new URL("../assets/dashboard/shell.js", import.meta.url), "utf8");
    expect(shell).toContain('if (reload || !document.querySelector(`section[data-page="${page}"]`)) {');
    const boot = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
    // Setup only runs for the sections this document actually has.
    expect(boot).toContain("const hasEditor = hasSection(\"board\")");
    expect(boot).toContain("navTo(route.page, hash)");
    expect(boot).not.toContain("isBoardSetup");
  });

  it("keeps unknown dashboard paths inside the authenticated dashboard boundary", () => {
    const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");
    const boundaryStart = worker.indexOf('if (path.startsWith("/dashboard/")) {', worker.indexOf("An unknown tab under a real section"));
    const boundaryEnd = worker.indexOf('if (path === "/me"', boundaryStart);
    const boundary = worker.slice(boundaryStart, boundaryEnd);
    expect(worker).toContain("PAGES.dashboardNotFound");
    expect(worker).toContain("status: 404");
    expect(worker).toContain("if (!user) return redirectToLogin(url);");
    expect(boundary).toContain("PAGES.dashboardNotFound");
    expect(boundary).not.toContain("notFoundPage(");
    expect(boundaryStart).toBeGreaterThan(-1);
    expect(boundaryStart).toBeLessThan(worker.indexOf("notFoundPage(", boundaryStart));
    expect(readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8"))
      .toContain("err?.status === 404");
  });

  it("keeps dashboard query parameters through client-side login", () => {
    const auth = readFileSync(new URL("../assets/auth.js", import.meta.url), "utf8");
    expect(auth).toContain("return path + u.search");
  });

  it("no longer navigates through ?nav=", () => {
    for (const file of ["../assets/dashboard/shell.js", "../assets/dashboard.js", "../pages/dashboard.jsx"]) {
      const src = readFileSync(new URL(file, import.meta.url), "utf8");
      expect(src).not.toContain("?nav=");
    }
  });
});
