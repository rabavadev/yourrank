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

export const MANAGE_SITES_VALUE = "__manage_sites__";

export { ACCOUNT_SECTION_PATHS, LEGACY_ACCOUNT_PATHS, NAV_OWNER_MAP, navOwner };

// Names we have shipped links for, in copy, e-mails and older builds.
export const SECTION_ALIASES = {
  overview: "home",
  editor: "board",
  leaderboard: "board",
  leaderboards: "boards",
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
