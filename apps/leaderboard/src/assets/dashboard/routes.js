// One table maps a dashboard URL to the section the SPA shows, and back.
//
// The dashboard used to live at `/dashboard?nav=<section>` while every link we
// wrote pointed at `/dashboard/<section>`, so the Worker bounced one to the
// other and the editor's steps were not addressable at all. The Worker now
// serves the paths directly and the shell pushes the same paths; both read this
// file, so the two cannot drift the way they did.
//
// No browser globals at module scope: the Worker imports this too.

export const SECTIONS = {
  home: { path: "/dashboard", title: "Overview" },
  board: { path: "/dashboard/editor", title: "Editor", tabs: ["setup", "players", "design", "share", "history"] },
  boards: { path: "/dashboard/boards", title: "All boards" },
  games: { path: "/dashboard/games", title: "Site Sections & Games" },
  performance: { path: "/dashboard/analytics", title: "Analytics", tabs: ["activity", "referrals", "events"] },
  settings: { path: "/dashboard/settings", title: "Settings", tabs: ["account", "plan", "connections", "data"] },
};

// Names we have shipped links for, in copy, e-mails and older builds.
export const SECTION_ALIASES = {
  overview: "home",
  editor: "board",
  analytics: "performance",
  growth: "performance",
  referrals: "performance",
  integrations: "settings",
  manage: "settings",
  billing: "settings",
};

export function resolveSection(name) {
  if (!name) return "";
  const key = SECTION_ALIASES[name] || name;
  return SECTIONS[key] ? key : "";
}

export function defaultTab(page) {
  return SECTIONS[page]?.tabs?.[0] || "";
}

/** `("board", "players") → "/dashboard/editor/players"` */
export function dashboardPath(page, tab = "") {
  const section = SECTIONS[resolveSection(page) || "home"];
  const tabs = section.tabs || [];
  return tabs.includes(tab) ? `${section.path}/${tab}` : section.path;
}

/** `"/dashboard/editor/players" → { page: "board", tab: "players" }`, or null. */
export function parseDashboardPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/dashboard";
  if (clean === "/dashboard" || clean === "/dashboard.html") return { page: "home", tab: "" };
  if (!clean.startsWith("/dashboard/")) return null;
  const [head, tail] = clean.slice("/dashboard/".length).split("/");
  const page = resolveSection(head);
  if (!page) return null;
  const tabs = SECTIONS[page].tabs || [];
  if (tail && !tabs.includes(tail)) return null;
  return { page, tab: tail || "" };
}
