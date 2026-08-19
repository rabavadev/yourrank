import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dashboardNavItems } from "@yourrank/shared/dashboard-nav";
import { PAGES } from "../pages.jsx";
import { mapActiveNav } from "../pages/dashboard-shell.jsx";
import { NAV_OWNER_MAP, navOwner, parseDashboardPath } from "../assets/dashboard/routes.js";

const user = { display_name: "Test operator", plan: "pro" };
const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");
const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const boardsJs = readFileSync(new URL("../assets/dashboard/boards.js", import.meta.url), "utf8");
const boardShellJs = readFileSync(new URL("../assets/dashboard/board-shell.js", import.meta.url), "utf8");
const siteSelectorJs = readFileSync(new URL("../assets/dashboard/site-selector.js", import.meta.url), "utf8");

function dashboardHtml(activePath) {
  return PAGES.dashboard.Component({ activePath, user }).toString();
}

function hrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);
}

function shellArea(html, tag, endTag) {
  const start = html.indexOf(`<${tag}`);
  const end = html.indexOf(`</${endTag}>`, start);
  return html.slice(start, end);
}

function flattenNav(items) {
  return items.flatMap((item) => "children" in item ? item.children : [item]);
}

describe("dashboard navigation ownership", () => {
  it("keeps every rendered destination owned by one shell area", () => {
    for (const path of ["/dashboard", "/dashboard/leaderboards", "/dashboard/settings/board"]) {
      const html = dashboardHtml(path);
      const rail = new Set(hrefs(shellArea(html, "aside", "aside")));
      const topbar = new Set(hrefs(shellArea(html, "header", "header")));
      expect([...rail].filter((href) => topbar.has(href))).toEqual([]);
    }
  });

  it("keeps site creation on the Sites page rather than the topbar", () => {
    const overview = dashboardHtml("/dashboard");
    const sites = dashboardHtml("/dashboard/leaderboards");
    const overviewTopbar = shellArea(overview, "header", "header");
    const sitesTopbar = shellArea(sites, "header", "header");
    expect(overviewTopbar).not.toContain("newBoard");
    expect(overviewTopbar).not.toContain("boardLimitUpsell");
    expect(sitesTopbar).not.toContain("newBoard");
    expect(sites).toContain('id="newBoard"');
    expect(sites).toContain('id="newBoardForm"');
    expect(sites).toContain('id="boardLimitUpsell"');
    expect(sites).not.toContain('aria-label="Create another site"');
    expect(sites).toContain('title="Create another site">+ New site');
    expect(dashboardJs).not.toContain("#newBoardSide, #addBoardBtn");
    expect(boardsJs).not.toContain("addBoardFromBoards");
    expect(boardsJs).toContain('const newBtn = $("newBoard")');
    expect(boardsJs).toContain("renderSiteSelector({");
    expect(boardShellJs).toContain("renderSiteSelector({");
    expect(boardsJs).not.toContain("MANAGE_SITES_VALUE");
    expect(boardShellJs).not.toContain("MANAGE_SITES_VALUE");
    expect(boardShellJs).toContain('topbarPath: $("lbTopbarSitePath")');
  });

  it("renders leaderboard tabs only on leaderboard routes", () => {
    for (const path of ["/dashboard", "/dashboard/games", "/dashboard/analytics/activity", "/dashboard/leaderboards", "/dashboard/settings/board"]) {
      expect(dashboardHtml(path)).not.toContain('aria-label="Leaderboard pages"');
    }
    expect(dashboardHtml("/dashboard/settings/board")).toContain('id="savebar"');
    expect(dashboardHtml("/dashboard/leaderboard/setup")).toContain('aria-label="Leaderboard pages"');
  });

  it("resolves every sidebar href to a real dashboard route", () => {
    for (const { href } of flattenNav(dashboardNavItems())) {
      const path = new URL(href, "https://yourrank.test").pathname;
      const parsed = parseDashboardPath(path);
      const routeHandled = parsed ||
        (path === "/dashboard/settings" && worker.includes('path === "/dashboard/settings"')) ||
        (path === "/dashboard/telegram" && readFileSync(new URL("../../../bot/src/dashboard-views/app.ts", import.meta.url), "utf8").includes('canonicalPath = "/dashboard/telegram"')) ||
        (path.startsWith("/dashboard/giveaways/") && worker.includes('path.startsWith("/dashboard/giveaways/")')) ||
        (path.startsWith("/dashboard/rewards/") && worker.includes('path.startsWith("/dashboard/rewards/")'));
      expect(routeHandled).toBeTruthy();
    }
  });

  it("maps each route to exactly one visible navigation key", () => {
    const keys = new Set(flattenNav(dashboardNavItems()).map((item) => item.key));
    for (const [route, owner] of [
      ["home", "home"],
      ["board", "board"],
      ["games", "games"],
      ["performance", "performance"],
      ["telegram", "telegram"],
      ["boards", "site"],
      ["settings", "site"],
      ["account", "settings"],
      ["connections", "settings"],
      ["integrations", "settings"],
      ["redemptions", "redemptions"],
      ["rules", "redemptions"],
      ["shop", "redemptions"],
      ["viewers", "redemptions"],
      ["history", "redemptions"],
    ]) {
      expect(navOwner(route)).toBe(owner);
      expect(mapActiveNav(route)).toBe(navOwner(route));
      expect(keys.has(NAV_OWNER_MAP[route] || route)).toBe(true);
    }
    for (const path of ["/dashboard", "/dashboard/leaderboard/setup", "/dashboard/games", "/dashboard/analytics/activity", "/dashboard/leaderboards", "/dashboard/settings/board"]) {
      expect((dashboardHtml(path).match(/class="lb-nav[^"]* is-on/g) || []).length).toBe(1);
    }
  });

  it("uses one shared active-navigation map in server and client code", () => {
    expect(readFileSync(new URL("../assets/dashboard/shell.js", import.meta.url), "utf8"))
      .not.toContain("const NAV_OWNER_MAP");
    for (const [route] of Object.entries(NAV_OWNER_MAP)) {
      expect(mapActiveNav(route)).toBe(navOwner(route));
    }
  });

  it("keeps the site address quiet in the topbar", () => {
    const html = dashboardHtml("/dashboard");
    expect(html).toContain(">Web address</span>");
    expect(html).not.toContain("Web address loading");
    expect(siteSelectorJs).toContain('topbarPath.textContent = "Web address"');
    expect(boardShellJs).not.toContain("Web address: /");
  });
});
