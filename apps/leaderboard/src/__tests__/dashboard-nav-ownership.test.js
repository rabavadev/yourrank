import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dashboardNavItems } from "@yourrank/shared/dashboard-nav";
import { PAGES } from "../pages.jsx";
import { mapActiveNav } from "../pages/dashboard-shell.jsx";
import { NAV_OWNER_MAP, navOwner, parseDashboardPath } from "../assets/dashboard/routes.js";

const user = { display_name: "Test operator", plan: "pro" };
const worker = readFileSync(new URL("../index.js", import.meta.url), "utf8");
const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const assetBundle = readFileSync(new URL("../assets_bundled.js", import.meta.url), "utf8");
const boardsJs = readFileSync(new URL("../assets/dashboard/boards.js", import.meta.url), "utf8");
const boardShellJs = readFileSync(new URL("../assets/dashboard/board-shell.js", import.meta.url), "utf8");
const siteSelectorJs = readFileSync(new URL("../assets/dashboard/site-selector.js", import.meta.url), "utf8");
const dashboardV4Css = readFileSync(new URL("../assets/dashboard-v4.css", import.meta.url), "utf8");

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
    for (const path of ["/dashboard", "/dashboard/leaderboards", "/dashboard/site"]) {
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
    expect(boardShellJs).not.toContain("topbarPath");
    expect(siteSelectorJs).not.toContain("topbarPath");
  });

  it("renders leaderboard tabs only on leaderboard routes", () => {
    for (const path of ["/dashboard", "/dashboard/games", "/dashboard/analytics/activity", "/dashboard/leaderboards", "/dashboard/site"]) {
      expect(dashboardHtml(path)).not.toContain('aria-label="Leaderboard pages"');
    }
    expect(dashboardHtml("/dashboard/site")).toContain('id="savebar"');
    expect(dashboardHtml("/dashboard/leaderboard/setup")).toContain('aria-label="Leaderboard pages"');
  });

  it("resolves every sidebar href to a real dashboard route", () => {
    for (const { href } of flattenNav(dashboardNavItems())) {
      const path = new URL(href, "https://yourrank.test").pathname;
      const parsed = parseDashboardPath(path);
      const routeHandled = parsed ||
        (path === "/dashboard/settings" && worker.includes('path === "/dashboard/settings"')) ||
        (path === "/dashboard/giveaways" && worker.includes('path === "/dashboard/giveaways"')) ||
        (path === "/dashboard/rewards" && worker.includes('path === "/dashboard/rewards"')) ||
        (path === "/dashboard/telegram" && readFileSync(new URL("../../../bot/src/dashboard-views/app.ts", import.meta.url), "utf8").includes('canonicalPath = "/dashboard/telegram"')) ||
        (path.startsWith("/dashboard/giveaways/") && worker.includes('path.startsWith("/dashboard/giveaways/")')) ||
        (path.startsWith("/dashboard/rewards/") && worker.includes('path.startsWith("/dashboard/rewards/")'));
      expect(routeHandled).toBeTruthy();
    }
  });

  it("maps each route to exactly one visible navigation key", () => {
    const keys = new Set(flattenNav(dashboardNavItems()).map((item) => item.key));
    const items = Object.fromEntries(flattenNav(dashboardNavItems()).map((item) => [item.key, item]));
    expect(items.sites.icon).not.toBe(items.site.icon);
    for (const [route, owner] of [
      ["home", "home"],
      ["board", "board"],
      ["games", "games"],
      ["performance", "performance"],
      ["telegram", "telegram"],
      ["boards", "sites"],
      ["settings", "settings"],
      ["account", "settings"],
      ["connections", "settings"],
      ["integrations", "settings"],
      ["redemptions", "redemptions"],
      ["rules", "redemptions"],
      ["shop", "redemptions"],
      ["viewers", "redemptions"],
      ["history", "redemptions"],
      ["engage", "engage"],
      ["giveaways", "engage"],
      ["raffles", "engage"],
      ["predictions", "engage"],
      ["drops", "engage"],
    ]) {
      expect(navOwner(route)).toBe(owner);
      expect(mapActiveNav(route)).toBe(navOwner(route));
      expect(keys.has(NAV_OWNER_MAP[route] || route)).toBe(true);
    }
    for (const path of ["/dashboard", "/dashboard/leaderboard/setup", "/dashboard/games", "/dashboard/analytics/activity", "/dashboard/leaderboards", "/dashboard/site"]) {
      expect((dashboardHtml(path).match(/class="lb-nav[^"]* is-on/g) || []).length).toBe(1);
    }
    expect(dashboardHtml("/dashboard/leaderboards")).toContain('data-nav="sites"');
    expect(dashboardHtml("/dashboard/site")).toContain('data-nav="site"');
  });

  it("uses one shared active-navigation map in server and client code", () => {
    const shell = readFileSync(new URL("../pages/dashboard-shell.jsx", import.meta.url), "utf8");
    expect(shell).toContain('from "@yourrank/shared/dashboard-nav"');
    expect(shell).not.toContain("../assets/dashboard/routes.js");
    expect(readFileSync(new URL("../assets/dashboard/shell.js", import.meta.url), "utf8"))
      .not.toContain("const NAV_OWNER_MAP");
    expect(assetBundle).not.toContain("@yourrank/shared/dashboard-nav");
    expect(assetBundle).toContain('"/assets/dashboard/routes.js"');
    for (const [route] of Object.entries(NAV_OWNER_MAP)) {
      expect(mapActiveNav(route)).toBe(navOwner(route));
    }
  });

  it("keeps the site address quiet in the topbar", () => {
    const html = dashboardHtml("/dashboard");
    const share = dashboardHtml("/dashboard/leaderboard/share");
    expect(html).not.toContain('id="lbTopbarSitePath"');
    expect(html).not.toContain(">Web address</span>");
    expect(siteSelectorJs).not.toContain("Web address");
    expect(boardShellJs).not.toContain("Web address");
    expect(share).toContain('id="embedPublicLink"');
    expect(share).toContain('id="embedPublicCopy"');
  });

  it("keeps feature subnavigation in normal document flow", () => {
    const start = dashboardV4Css.lastIndexOf('section[data-page="board"] .editor-steps');
    const end = dashboardV4Css.indexOf('.editor-steps::-webkit-scrollbar', start);
    expect(start).toBeGreaterThan(-1);
    expect(dashboardV4Css.slice(start, end)).not.toContain("position: sticky");
  });

  it("aligns the topbar band and content to the main column", () => {
    expect(dashboardV4Css).toContain("position: sticky;");
    expect(dashboardV4Css).toContain("top: 0;");
    expect(dashboardV4Css).toContain("margin-inline: calc(-1 * var(--v3-main-pad-inline));");
    expect(dashboardV4Css).toContain("margin: 0 calc(-1 * var(--v3-main-pad-inline));");
    expect(dashboardV4Css).toContain("padding: 0 var(--v3-main-pad-inline) 64px;");
    expect(dashboardV4Css).toContain(".lb-main > .lb-topbar + .lb-bento");
    expect(dashboardV4Css).not.toContain("inset: 0 0 auto var(--v3-sidebar-w);");
    expect(dashboardV4Css).toContain(".lb-topbar-hud");
    expect(dashboardV4Css).toContain(".lb-availability .lb-live-link");
    expect(dashboardV4Css).toContain(".lb-availability .lb-status--published");
    expect(dashboardV4Css).toContain(".lb-publish-action--secondary");
  });

  it("gives identifying names flexible space and full-value hints", () => {
    expect(dashboardV4Css).toContain(".v3-dash[data-auth-workspace] .v3-players-table td:nth-child(3) {");
    expect(dashboardV4Css).toContain("width: 34%;");
    expect(dashboardV4Css).toContain("min-width: 240px;");
    expect(dashboardV4Css).toContain(".ov-player-name {\n  min-width: 0;");
    expect(boardsJs).toContain("renderSiteSelector({");
    expect(siteSelectorJs).toContain("import { esc } from \"./utils.js\";");
    expect(readFileSync(new URL("../assets/dashboard/players.js", import.meta.url), "utf8"))
      .toContain('class="p-name" placeholder="Player name" title="${esc(p.name)}"');
    expect(readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8"))
      .toContain('class="ov-player-name" title="${esc(player.name)}"');
  });
});
