import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { appHtml } from "../../../bot/src/dashboard-views/app.ts";
import { pageLinks } from "../../../bot/src/dashboard-views/shell.ts";
import { PAGES } from "../pages.jsx";
import { BOARD_TABS, ANALYTICS_TABS } from "../pages/dashboard.jsx";
import { GIVEAWAY_TABS } from "../pages/giveaway-pages.js";
import { REWARDS_TABS } from "../pages/rewards.jsx";
import { SETTINGS_TABS } from "../pages/account.jsx";
import { SECTIONS } from "../assets/dashboard/routes.js";

const user = { display_name: "Test operator", email: "operator@example.com", plan: "pro" };
const workerSource = readFileSync(new URL("../index.js", import.meta.url), "utf8");

function linksIn(markup) {
  return [...markup.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((href) => href && href !== "#");
}

function region(markup, startPattern, endTag) {
  const start = markup.search(startPattern);
  if (start < 0) return "";
  const end = markup.indexOf(`</${endTag}>`, start);
  return markup.slice(start, end < 0 ? markup.length : end);
}

function subnavs(markup) {
  return [...markup.matchAll(/<nav\b[^>]*class="[^"]*(?:v3-tabs|editor-steps)[^"]*"[^>]*>[\s\S]*?<\/nav>/g)]
    .map((match) => match[0])
    .join("");
}

function breadcrumb(markup) {
  return region(markup, /<nav\b[^>]*class="v3-crumbs"/, "nav");
}

function normalizedPath(path) {
  return String(path || "").split("?")[0].replace(/\/+$/, "") || "/";
}

function deriveRenderableRoutes() {
  const routes = [];
  for (const [page, section] of Object.entries(SECTIONS)) {
    const tabs = page === "board"
      ? BOARD_TABS.map(([key]) => key)
      : page === "performance"
        ? ANALYTICS_TABS
        : section.tabs || [];
    routes.push({ path: section.path, render: "dashboard" });
    for (const tab of tabs) routes.push({ path: `${section.path}/${tab}`, render: "dashboard" });
  }
  for (const [tab] of GIVEAWAY_TABS) {
    routes.push({ path: `/dashboard/giveaways/${tab}`, render: "giveaways", tab });
  }
  for (const tab of REWARDS_TABS) {
    routes.push({
      path: tab.href,
      render: tab.href.startsWith("/dashboard/audience/") ? "rewards-audience" : "rewards",
      tab: tab.key,
    });
  }
  for (const [tab] of SETTINGS_TABS) {
    routes.push({ path: `/dashboard/settings/${tab[0]}`, render: "settings", tab: tab[0] });
  }
  for (const page of pageLinks) {
    routes.push({ path: page.href, render: "telegram", tab: page.key });
  }
  return routes;
}

function renderRoute(route) {
  if (route.render === "dashboard") {
    return PAGES.dashboard.Component({ activePath: route.path, user }).toString();
  }
  if (route.render === "giveaways") {
    return PAGES.giveaways.Component({ activePath: route.path, tab: route.tab, user }).toString();
  }
  if (route.render === "settings") {
    return PAGES.settingsUnified.Component({ activePath: route.path, tab: route.tab, user }).toString();
  }
  if (route.render === "rewards-audience") {
    const page = route.tab === "viewers" ? PAGES.rewardsViewers : PAGES.rewardsHistory;
    return page.Component({ activePath: route.path, user }).toString();
  }
  if (route.render === "rewards") {
    const page = {
      channel: PAGES.rewardsChannel,
      rules: PAGES.rewardsRules,
      shop: PAGES.rewardsShop,
      redemptions: PAGES.rewardsRedemptions,
    }[route.tab];
    return page.Component({ activePath: route.path, user }).toString();
  }
  if (route.render === "telegram") {
    return appHtml(user, "https://yourrank.site", undefined, route.tab, undefined, "/dashboard/telegram");
  }
  throw new Error(`No SSR renderer for derived route ${route.path}`);
}

function ownershipViolations(markup, activePath) {
  const regions = {
    sidebar: linksIn(region(markup, /<nav\b[^>]*class="lb-side-group lb-side-nav"/, "nav")),
    topbar: linksIn(region(markup, /<header\b[^>]*class="lb-topbar"/, "header")),
    subnav: linksIn(subnavs(markup)),
    breadcrumbs: linksIn(breadcrumb(markup)),
  };
  const owned = ["sidebar", "topbar", "subnav"].flatMap((name) =>
    regions[name].map((href) => ({ href, name }))
  );
  const counts = new Map();
  for (const entry of owned) {
    const list = counts.get(entry.href) || [];
    list.push(entry.name);
    counts.set(entry.href, list);
  }
  const duplicates = [...counts.entries()]
    .filter(([, owners]) => owners.length > 1)
    .map(([href, owners]) => ({ href, owners }));
  const sidebarHrefs = new Set(regions.sidebar);
  const sidebarSubnav = [...new Set(regions.subnav.filter((href) => sidebarHrefs.has(href)))];
  const active = normalizedPath(activePath);
  const activeBreadcrumbs = regions.breadcrumbs.filter((href) => normalizedPath(href) === active);
  return { regions, duplicates, sidebarSubnav, activeBreadcrumbs };
}

describe("dashboard chrome ownership", () => {
  it("covers every renderable Worker route with one rendered chrome invariant", () => {
    expect(workerSource).toContain('path.startsWith("/dashboard/giveaways/")');
    expect(workerSource).toContain('path.startsWith("/dashboard/rewards/")');
    expect(workerSource).toContain('if (path.startsWith("/dashboard/"))');
    expect(workerSource).toContain('renderHtmlPage(PAGES.dashboardNotFound');

    const routes = deriveRenderableRoutes();
    expect(new Set(routes.map(({ path }) => path)).size).toBe(routes.length);
    for (const route of routes) {
      const markup = renderRoute(route);
      const violations = ownershipViolations(markup, route.path);
      expect(violations.duplicates, route.path).toEqual([]);
      expect(violations.sidebarSubnav, route.path).toEqual([]);
      expect(violations.activeBreadcrumbs, route.path).toEqual([]);
    }
  });
});
