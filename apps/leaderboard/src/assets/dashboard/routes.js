// One table maps a dashboard URL to the section the SPA shows, and back.
//
// The dashboard used to live at `/dashboard?nav=<section>` while every link we
// wrote pointed at `/dashboard/<section>`, so the Worker bounced one to the
// other and the editor's steps were not addressable at all. The Worker now
// serves the paths directly and the shell pushes the same paths; both read this
// file, so the two cannot drift the way they did.
//
// No browser globals at module scope: the Worker imports this too.

import {
  ACCOUNT_SECTION_PATHS,
  LEGACY_ACCOUNT_PATHS,
  NAV_OWNER_MAP,
  navOwner,
} from "@yourrank/shared/dashboard-nav";

export const SECTIONS = {
  home: { path: "/dashboard", title: "Home" },
  board: { path: "/dashboard/leaderboard", title: "Leaderboard", tabs: ["setup", "players", "design", "share", "history"] },
  boards: { path: "/dashboard/leaderboards", title: "Sites" },
  games: { path: "/dashboard/games", title: "Games" },
  performance: { path: "/dashboard/analytics", title: "Analytics", tabs: ["activity", "referrals", "events"] },
  // Account settings (`/dashboard/settings` and its tabs) are their own
  // documents, served by the Worker. This section is the selected site's
  // settings, which is all this document knows to render.
  site: { path: "/dashboard/site", title: "Site settings" },
};

export const TAB_TITLES = {
  board: { setup: "Setup", players: "Players", design: "Appearance", share: "Share", history: "History" },
  performance: { activity: "Site visitors", referrals: "Referrals", events: "Events" },
};

export const MANAGE_SITES_VALUE = "__manage_sites__";

// ---- Dynamic sections ----
//
// These dashboard areas were separate server-rendered documents, each with its
// own boot script (credits.js / giveaways.js / account.js). The persistent
// shell now fetches their content as fragments and boots them lazily so
// navigation between them and the core SPA sections never reloads the page.
//
// `boot` names the client module that owns the section's lifecycle:
//   "credits"   → assets/credits.js     (Rewards + Audience)
//   "giveaways" → assets/giveaways.js   (Engagement)
//   "account"   → assets/account.js     (Account settings)
//
// `boardContext` tells the shell which topbar controls to show:
//   "selector"  → site selector, no publish controls
//   "none"      → account context, no site selector
//
// `navOwner` is the rail key that should be active for this section.

export const DYNAMIC_SECTIONS = {
  rewards: {
    boot: "credits",
    navKey: "redemptions",
    boardContext: "selector",
    rootId: "cr-dash",
    // tab → URL path segment. "overview" is the bare /dashboard/rewards.
    tabs: ["overview", "shop", "rules", "redemptions", "history", "channel"],
    tabPaths: { overview: "/dashboard/rewards", shop: "/dashboard/rewards/shop", rules: "/dashboard/rewards/rules", redemptions: "/dashboard/rewards/redemptions", history: "/dashboard/rewards/activity", channel: "/dashboard/rewards/channel" },
  },
  giveaways: {
    boot: "giveaways",
    navKey: "engage",
    boardContext: "selector",
    rootId: "gw-dash",
    tabs: ["chat", "raffles", "drops", "preds", "tournaments"],
    tabPaths: { chat: "/dashboard/giveaways/chat", raffles: "/dashboard/giveaways/raffles", drops: "/dashboard/giveaways/drops", preds: "/dashboard/giveaways/predictions", tournaments: "/dashboard/giveaways/tournaments" },
  },
  audience: {
    boot: "credits",
    navKey: "audience",
    boardContext: "selector",
    rootId: "cr-dash",
    tabs: ["viewers"],
    tabPaths: { viewers: "/dashboard/audience/members" },
  },
  settings: {
    boot: "account",
    navKey: "settings",
    boardContext: "none",
    rootId: "acc-app",
    // "plan" is the internal tab key; the URL uses "billing".
    tabs: ["account", "team", "plan", "connections", "data"],
    tabPaths: { account: "/dashboard/settings/account", team: "/dashboard/settings/team", plan: "/dashboard/settings/billing", connections: "/dashboard/settings/connections", data: "/dashboard/settings/data" },
  },
};

// Map URL path prefix → dynamic section key, for fast lookups.
const DYNAMIC_PATH_PREFIXES = [
  ["rewards", "/dashboard/rewards"],
  ["giveaways", "/dashboard/giveaways"],
  ["audience", "/dashboard/audience"],
  ["settings", "/dashboard/settings"],
];

/** true if `page` is one of the dynamic (fragment-loaded) sections. */
export function isDynamicSection(page) {
  return Boolean(DYNAMIC_SECTIONS[page]);
}

/**
 * Parse a dashboard URL into a dynamic section route, or null if the path
 * does not belong to a dynamic section.
 *
 * `/dashboard/rewards/shop` → { page: "rewards", tab: "shop", dynamic: true }
 * `/dashboard/settings`     → { page: "settings", tab: "account", dynamic: true }
 */
export function parseDynamicPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/dashboard";
  for (const [key, prefix] of DYNAMIC_PATH_PREFIXES) {
    if (clean === prefix) {
      // Bare prefix → first tab of that section.
      const section = DYNAMIC_SECTIONS[key];
      return { page: key, tab: section.tabs[0], dynamic: true };
    }
    if (clean.startsWith(prefix + "/")) {
      const segment = clean.slice(prefix.length + 1).split("/")[0];
      const section = DYNAMIC_SECTIONS[key];
      // Map URL segment back to the internal tab key.
      const tabByKey = section.tabs.find((t) => t === segment);
      const tabByPath = Object.entries(section.tabPaths).find(([, p]) => p === clean)?.[0];
      const tab = tabByKey || tabByPath;
      if (tab) return { page: key, tab, dynamic: true };
      return null; // unknown sub-path → let the server handle it
    }
  }
  return null;
}

/** Build the URL path for a dynamic section + tab. */
export function dynamicPath(page, tab = "") {
  const section = DYNAMIC_SECTIONS[page];
  if (!section) return "";
  const resolvedTab = tab || section.tabs[0];
  return section.tabPaths[resolvedTab] || section.tabPaths[section.tabs[0]];
}

/** Human-readable title for a dynamic section route. */
export function dynamicTitle(page, tab = "") {
  const section = DYNAMIC_SECTIONS[page];
  if (!section) return "Dashboard · YourRank";
  const labels = {
    rewards: { overview: "Overview", shop: "Shop", rules: "Ways to earn", redemptions: "Orders", history: "Activity", channel: "Kick connection" },
    giveaways: { chat: "Giveaways", raffles: "Raffles", drops: "Drops", preds: "Predictions", tournaments: "Tournaments" },
    audience: { viewers: "Members" },
    settings: { account: "Account", team: "Team", plan: "Billing", connections: "Connections", data: "Data" },
  };
  const sectionLabels = labels[page] || {};
  const tabLabel = sectionLabels[tab || section.tabs[0]] || "";
  const sectionLabel = page === "rewards" ? "Rewards" : page === "giveaways" ? "Engagement" : page === "audience" ? "Audience" : page === "settings" ? "Account" : page;
  return `${tabLabel ? `${tabLabel} · ` : ""}${sectionLabel} · YourRank`;
}

export { ACCOUNT_SECTION_PATHS, LEGACY_ACCOUNT_PATHS, NAV_OWNER_MAP, navOwner };

// Names we have shipped links for, in copy, e-mails and older builds.
export const SECTION_ALIASES = {
  overview: "home",
  editor: "board",
  leaderboard: "board",
  leaderboards: "boards",
  sites: "boards",
  analytics: "performance",
  growth: "performance",
  referrals: "performance",
  integrations: "connections",
  manage: "site",
  billing: "plan",
  settings: "site",
};

export function legacyDashboardPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/dashboard";
  if (clean === "/dashboard/editor" || clean.startsWith("/dashboard/editor/")) {
    return `/dashboard/leaderboard${clean.slice("/dashboard/editor".length)}`;
  }
  if (clean === "/dashboard/boards") return "/dashboard/leaderboards";
  return "";
}

export function resolveSection(name) {
  if (!name) return "";
  const key = SECTION_ALIASES[name] || name;
  return SECTIONS[key] || ACCOUNT_SECTION_PATHS[key] ? key : "";
}

export function defaultTab(page) {
  return SECTIONS[page]?.tabs?.[0] || "";
}

/** `("board", "players") → "/dashboard/leaderboard/players" */
export function dashboardPath(page, tab = "") {
  const resolved = resolveSection(page) || "home";
  if (ACCOUNT_SECTION_PATHS[resolved]) return ACCOUNT_SECTION_PATHS[resolved];
  const section = SECTIONS[resolved];
  const tabs = section.tabs || [];
  return tabs.includes(tab) ? `${section.path}/${tab}` : section.path;
}

/** `"/dashboard/leaderboard/players" → { page: "board", tab: "players" }`, or null. */
export function parseDashboardPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/dashboard";
  if (clean === "/dashboard" || clean === "/dashboard.html") return { page: "home", tab: "" };
  // The account settings document owns every other `/dashboard/settings` URL.
  // Returning a route for them made the shell intercept the sidebar link and
  // show this document's board settings instead of navigating to that page.
  if (clean === "/dashboard/settings" || clean.startsWith("/dashboard/settings/")) return null;
  if (!clean.startsWith("/dashboard/")) return null;
  const [head, tail] = clean.slice("/dashboard/".length).split("/");
  const page = resolveSection(head);
  if (!page) return null;
  if (ACCOUNT_SECTION_PATHS[page]) return null;
  const tabs = SECTIONS[page].tabs || [];
  if (tail && !tabs.includes(tail)) return null;
  return { page, tab: tail || "" };
}

export function dashboardTitle(route) {
  const section = SECTIONS[route?.page];
  if (!section) return "Dashboard · YourRank";
  const tabTitle = TAB_TITLES[route.page]?.[route.tab];
  return `${tabTitle ? `${tabTitle} · ` : ""}${section.title} · YourRank`;
}

export function dashboardTitleForPath(pathname) {
  return dashboardTitle(parseDashboardPath(pathname));
}
