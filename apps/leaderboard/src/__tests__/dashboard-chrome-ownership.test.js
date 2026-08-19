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
  if (end < 0) return "";
  return markup.slice(start, end + endTag.length + 3);
}

function subnavs(markup) {
  return [...markup.matchAll(/<(nav|div)\b[^>]*class="[^"]*(?:v3-tabs|editor-steps)[^"]*"[^>]*>[\s\S]*?<\/\1>/g)]
    .map((match) => match[0])
    .join("");
}

function breadcrumb(markup) {
  return region(markup, /<nav\b[^>]*class="v3-crumbs"/, "nav");
}

function workerRouteLiterals(source) {
  return [...source.matchAll(/(["'])(\/dashboard[^"']*)\1/g)]
    .map((match) => normalizedPath(match[2]))
    .filter((path) => !path.includes("${") && !path.includes("*"));
}

function workerBranchTabRoutes(source, prefix) {
  const start = source.indexOf(`path.startsWith("${prefix}/")`);
  if (start < 0) return [];
  const end = source.indexOf("\n      if (path.", start + 1);
  const branch = source.slice(start, end < 0 ? source.length : end);
  const tabs = new Set();
  for (const match of branch.matchAll(/tab\s*===\s*"([^"]+)"/g)) tabs.add(match[1]);
  for (const match of branch.matchAll(/\[([^\]]+)\]\.includes\(tab\)/g)) {
    for (const tab of match[1].matchAll(/"([^"]+)"/g)) tabs.add(tab[1]);
  }
  const map = branch.match(/const map = \{([\s\S]*?)\};/);
  if (map) {
    for (const tab of map[1].matchAll(/^\s*([a-z]+):/gm)) tabs.add(tab[1]);
  }
  return [...tabs].map((tab) => `${prefix}/${tab}`);
}

function workerRenderedRewardRoutes(source) {
  const prefix = "/dashboard/rewards";
  const start = source.indexOf(`path.startsWith("${prefix}/")`);
  if (start < 0) return [];
  const end = source.indexOf("\n      //", start + 1);
  const branch = source.slice(start, end < 0 ? source.length : end);
  const routes = [];
  for (const match of branch.matchAll(/if \(tab === "([^"]+)"\) return renderDashboardPage\("([^"]+)"/g)) {
    routes.push({ path: `${prefix}/${match[1]}`, render: "rewards", tab: match[1] });
  }
  const map = branch.match(/const map = \{([\s\S]*?)\};/);
  if (map) {
    for (const match of map[1].matchAll(/^\s*([a-z]+):/gm)) {
      routes.push({ path: `${prefix}/${match[1]}`, render: "rewards", tab: match[1] });
    }
  }
  return routes;
}

function workerRegexTabRoutes(source, prefix) {
  const escapedPrefix = prefix.replaceAll("/", "\\\\/");
  const match = source.match(new RegExp(`${escapedPrefix}\\\\/\\(([^)]+)\\)`));
  if (!match) return [];
  return match[1].split("|").map((tab) => `${prefix}/${tab}`);
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
    const hasSubnav = page === "board" || page === "performance" || page === "site";
    const hasBreadcrumbs = ["board", "performance"].includes(page);
    routes.push({ path: section.path, render: "dashboard", hasSubnav, hasBreadcrumbs });
    for (const tab of tabs) routes.push({ path: `${section.path}/${tab}`, render: "dashboard", hasSubnav: true, hasBreadcrumbs: true });
  }
  for (const [tab] of GIVEAWAY_TABS) {
    routes.push({ path: `/dashboard/giveaways/${tab}`, render: "giveaways", tab, hasSubnav: true, hasBreadcrumbs: true });
  }
  for (const tab of REWARDS_TABS) {
    routes.push({
      path: tab.href,
      render: tab.href.startsWith("/dashboard/audience/") ? "rewards-audience" : "rewards",
      tab: tab.key,
      hasSubnav: true,
      hasBreadcrumbs: tab.key !== "redemptions",
    });
  }
  for (const route of workerRenderedRewardRoutes(workerSource)) {
    if (!routes.some(({ path }) => path === route.path)) {
      routes.push({ ...route, hasSubnav: true, hasBreadcrumbs: true });
    }
  }
  routes.push({ path: "/dashboard/settings", render: "settings", tab: "account", hasSubnav: true, hasBreadcrumbs: true });
  for (const [key] of SETTINGS_TABS) {
    routes.push({ path: `/dashboard/settings/${key}`, render: "settings", tab: key, hasSubnav: true, hasBreadcrumbs: true });
  }
  for (const page of pageLinks) {
    routes.push({ path: page.href, render: "telegram", tab: page.key, hasSubnav: true, hasBreadcrumbs: true });
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
  const sidebarMarkup = region(markup, /<nav\b[^>]*class="lb-side-group lb-side-nav"/, "nav");
  const topbarMarkup = region(markup, /<header\b[^>]*class="lb-topbar"/, "header");
  const subnavMarkup = subnavs(markup);
  const breadcrumbMarkup = breadcrumb(markup);
  const regions = {
    sidebar: linksIn(sidebarMarkup),
    topbar: linksIn(topbarMarkup),
    subnav: linksIn(subnavMarkup),
    breadcrumbs: linksIn(breadcrumbMarkup),
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
  return {
    regions,
    markup: {
      sidebar: sidebarMarkup,
      topbar: topbarMarkup,
      subnav: subnavMarkup,
      breadcrumbs: breadcrumbMarkup,
    },
    duplicates,
    sidebarSubnav,
    activeBreadcrumbs,
  };
}

describe("dashboard chrome ownership", () => {
  it("covers every renderable Worker route with one rendered chrome invariant", () => {
    const routes = deriveRenderableRoutes();
    expect(new Set(routes.map(({ path }) => path)).size).toBe(routes.length);
    expect(routes.map(({ path }) => path)).toContain("/dashboard/settings/account");
    expect(routes.map(({ path }) => path)).toContain("/dashboard/settings/team");
    expect(routes.map(({ path }) => path)).toContain("/dashboard/settings/plan");
    expect(routes.map(({ path }) => path)).toContain("/dashboard/settings/connections");
    expect(routes.map(({ path }) => path)).toContain("/dashboard/settings/data");
    expect(routes.map(({ path }) => path)).toContain("/dashboard/rewards/channel");

    const checkedRoutes = new Set(routes.map(({ path }) => normalizedPath(path)));
    const allowlistedWorkerRoutes = new Map([
      ["/dashboard/settings/integrations", "redirect-only legacy alias to Rewards channel"],
      ["/dashboard/billing", "redirect-only legacy alias to account plan"],
      ["/dashboard/attribution", "redirect-only legacy alias to account connections"],
      ["/dashboard/security", "redirect-only legacy alias to account security tab"],
      ["/dashboard/integrations", "redirect-only legacy alias to account connections"],
      ["/dashboard/manage", "redirect-only legacy alias to account settings"],
      ["/dashboard/preview", "POST endpoint for template preview, not a dashboard chrome page"],
      ["/dashboard/setup", "redirect-only legacy alias to dashboard overview"],
      ["/dashboard/support", "redirect-only redirect to help"],
      ["/dashboard/credits", "redirect-only legacy alias to Rewards channel"],
      ["/dashboard/giveaways", "redirect-only section root to the default tab"],
      ["/dashboard/rewards", "redirect-only section root to the default tab"],
      ["/dashboard/rewards/maps", "redirect-only legacy alias to Rewards points"],
      ["/dashboard/rewards/rewards", "redirect-only legacy alias to Rewards points"],
      ["/dashboard/rewards/viewers", "redirect-only legacy alias to Audience viewers"],
      ["/dashboard/rewards/history", "redirect-only legacy alias to Audience activity"],
    ]);
    const workerRoutes = new Set(workerRouteLiterals(workerSource));
    for (const path of workerBranchTabRoutes(workerSource, "/dashboard/giveaways")) workerRoutes.add(path);
    for (const path of workerBranchTabRoutes(workerSource, "/dashboard/rewards")) workerRoutes.add(path);
    for (const path of workerRegexTabRoutes(workerSource, "/dashboard/settings")) workerRoutes.add(path);
    for (const [path, reason] of allowlistedWorkerRoutes) {
      expect(workerRoutes).toContain(path);
      expect(reason.trim()).not.toBe("");
    }
    const uncoveredWorkerRoutes = [...workerRoutes]
      .filter((path) => !checkedRoutes.has(path) && !allowlistedWorkerRoutes.has(path));
    expect(uncoveredWorkerRoutes).toEqual([]);
    for (const path of [
      "/dashboard/giveaways/chat",
      "/dashboard/giveaways/preds",
      "/dashboard/rewards/channel",
      "/dashboard/rewards/maps",
      "/dashboard/settings/data",
    ]) {
      expect(workerRoutes).toContain(path);
    }

    for (const route of routes) {
      const markup = renderRoute(route);
      const violations = ownershipViolations(markup, route.path);
      expect(violations.markup.sidebar, `${route.path} sidebar`).not.toBe("");
      expect(violations.markup.topbar, `${route.path} topbar`).not.toBe("");
      if (route.hasSubnav) {
        expect(violations.markup.subnav, `${route.path} subnav`).not.toBe("");
      }
      if (route.hasBreadcrumbs) {
        expect(violations.markup.breadcrumbs, `${route.path} breadcrumbs`).not.toBe("");
      }
      expect(violations.duplicates, route.path).toEqual([]);
      expect(violations.sidebarSubnav, route.path).toEqual([]);
      expect(violations.activeBreadcrumbs, route.path).toEqual([]);
    }
  });

  it("reports duplicate chrome links and active breadcrumb links", () => {
    const markup = `
      <nav class="lb-side-group lb-side-nav"><a href="/dashboard/leaderboard">Leaderboard</a></nav>
      <header class="lb-topbar"><a href="/dashboard/leaderboard">Leaderboard</a></header>
      <nav class="v3-tabs"><a href="/dashboard/leaderboard/players">Players</a></nav>
      <nav class="v3-crumbs"><a href="/dashboard/leaderboard/players">Players</a></nav>
    `;
    const violations = ownershipViolations(markup, "/dashboard/leaderboard/players");
    expect(violations.duplicates).toEqual([
      { href: "/dashboard/leaderboard", owners: ["sidebar", "topbar"] },
    ]);
    expect(violations.activeBreadcrumbs).toEqual(["/dashboard/leaderboard/players"]);
  });
});
