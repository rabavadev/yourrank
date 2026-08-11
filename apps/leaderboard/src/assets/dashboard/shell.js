// Dashboard shell: sidebar navigation and mobile drawer.
import { $ } from "./utils.js";
import { renderOverviewSummary } from "./overview.js";
import { fitDesignPreview, loadStats, refreshDesignPreview } from "./site.js";
import { SECTIONS, dashboardPath, defaultTab, parseDashboardPath } from "./routes.js";


const AREA_MAP = { home: "leaderboard", board: "leaderboard", boards: "leaderboard", games: "leaderboard", settings: "leaderboard", performance: "analytics" };

export function areaForPage(page) { return AREA_MAP[page] || "leaderboard"; }

function defaultHash(page) { return defaultTab(page); }

/** The section this document was opened at, from the path the Worker served. */
export function currentRoute() {
  return parseDashboardPath(location.pathname) || { page: "home", tab: "" };
}

function pushRoute(page, tab) {
  // Keep the query: `?board=<id>` selects which board the dashboard is editing,
  // so moving between sections must not drop it.
  const next = dashboardPath(page, tab) + location.search;
  if (next !== location.pathname + location.search) history.pushState({}, "", next);
}
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setActiveSideNav(page, hash = "") {
  const area = areaForPage(page);
  document.querySelectorAll(".lb-side-group").forEach((g) => { g.hidden = (g.dataset.area !== area && g.dataset.area !== "all"); });
  document.querySelectorAll(".lb-nav").forEach((n) => {
    const navPage = n.dataset.nav;
    const navHash = n.dataset.hash || "";
    const active = navPage === page && (!navHash || navHash === hash);
    n.classList.toggle("is-on", active);
    if (active) n.setAttribute("aria-current", "page");
    else n.removeAttribute("aria-current");
  });
  // Keep the shared product top-nav in sync when navigating inside the SPA.
  document.querySelectorAll(".gm-tab").forEach((t) => {
    const href = t.getAttribute("href") || "";
    const isActive = (area === "leaderboard" && href === "/dashboard") ||
                     (area === "analytics" && href.startsWith("/dashboard/analytics")) ||
                     (area === "rewards" && href.startsWith("/dashboard/rewards")) ||
                     (area === "bot" && href.startsWith("/bot"));
    t.classList.toggle("gm-tab--active", isActive);
  });
}

export function navTo(page, hash = "") {
  const scrollHash = hash || defaultHash(page);
  const navHash = page === "board" ? hash : scrollHash;

  // Keep the URL on the section actually being shown, without adding an entry:
  // navTo() is also how popstate and boot render, and those must not push.
  const canonical = dashboardPath(page, scrollHash);
  if (canonical !== location.pathname && typeof history.replaceState === "function") {
    history.replaceState(history.state || {}, "", canonical + location.search);
  }

  setActiveSideNav(page, navHash);
  document.querySelectorAll(".lb-page").forEach((p) => p.classList.toggle("is-on", p.dataset.page === page));
  closeDrawer();
  if (page === "home") renderOverviewSummary();
  if (page === "home" || page === "performance") loadStats();
  if (page === "games") window.dispatchEvent(new CustomEvent("yr-games-visible"));
  // Re-render and re-fit the live preview whenever the Editor becomes visible
  // (updateDesignPreview() no-ops while the section is hidden, so navigating in
  // has to ask for it again).
  if (page === "board") setTimeout(refreshDesignPreview, 0);
  const title = SECTIONS[page]?.title || page;
  document.title = `${title} · YourRank`;
  const topbarTitle = $("lbTopbarTitle");
  if (topbarTitle) { topbarTitle.textContent = title; topbarTitle.focus({ preventScroll: true }); }

  // Sync editor sub-tabs when navigating directly to a sub-group.
  if (page === "board") {
    const tabs = document.getElementById("editorTabs");
    if (tabs && tabs._show) tabs._show(scrollHash);
  }

  scrollToHash(scrollHash);
}

export function scrollToHash(hash) {
  if (!hash) {
    const main = document.querySelector(".lb-main");
    if (main) main.scrollIntoView({ block: "start" });
    return;
  }
  const target =
    document.getElementById(hash) ||
    document.querySelector(`[data-egroup="${hash}"]`) ||
    document.getElementById(`perf-${hash}`) ||
    document.getElementById(`cr-${hash}`);
  if (target) {
    // If the target is inside a collapsed <details>, open it before scrolling.
    const details = target.closest("details");
    if (details) details.open = true;
    target.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    target.classList.add("is-highlighted");
    setTimeout(() => target.classList.remove("is-highlighted"), 1200);
  }
}

export function openDrawer() {
  const side = $("lbSide");
  if (side) {
    side.classList.add("is-open");
    // The sidebar is a permanent navigation landmark on desktop and only becomes
    // a dialog while it is open as a drawer, so the role goes on here and comes
    // off on close — a static `role="dialog"` hides the nav from assistive tech.
    side.setAttribute("role", "dialog");
    side.setAttribute("aria-modal", "true");
  }
  document.querySelector(".lb-backdrop")?.classList.add("is-open");
  document.querySelectorAll(".lb-menu").forEach((b) => b.setAttribute("aria-expanded", "true"));
  // Inert the background so Tab can't reach content behind the drawer.
  document.querySelectorAll("main:not(.lb-side), header, footer").forEach((el) => {
    if (el !== side) el.inert = true;
  });
  const firstNav = side?.querySelector(".lb-nav");
  if (firstNav) setTimeout(() => firstNav.focus(), 0);
  // Focus trap: cycle Tab within the drawer.
  document.addEventListener("keydown", _drawerFocusTrap);
}

export function closeDrawer(focusMenu = true) {
  const side = $("lbSide");
  if (side) {
    side.classList.remove("is-open");
    side.removeAttribute("role");
    side.removeAttribute("aria-modal");
  }
  document.querySelector(".lb-backdrop")?.classList.remove("is-open");
  document.querySelectorAll(".lb-menu").forEach((b) => b.setAttribute("aria-expanded", "false"));
  // Remove inert from background.
  document.querySelectorAll("[inert]").forEach((el) => { el.inert = false; });
  document.removeEventListener("keydown", _drawerFocusTrap);
  if (focusMenu) {
    const menu = document.querySelector(".lb-page.is-on .lb-menu") || document.querySelector(".lb-menu");
    if (menu) setTimeout(() => menu.focus(), 0);
  }
}

// Focus trap handler — keeps Tab within the drawer while it's open.
function _drawerFocusTrap(e) {
  if (e.key !== "Tab") return;
  const side = $("lbSide");
  if (!side || !side.classList.contains("is-open")) return;
  const focusable = side.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// Editor sub-navigation: group the endless controls column into tabs
// (Setup / Players / Design / Share / History) so the form isn't one long scroll.
export function setupEditorTabs() {
    const tabs = document.getElementById("editorTabs");
    if (!tabs || tabs._wired) return;
    tabs._wired = true;
    const controls = document.querySelector(".design-controls");
    const buttons = [...tabs.querySelectorAll(".editor-step")];
    function show(group) {
      buttons.forEach((b) => {
        const on = b.dataset.egroup === group;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      if (controls) {
        controls.querySelectorAll("[data-egroup]").forEach((el) => {
          el.hidden = el.dataset.egroup !== group;
        });
      }
      // The preview measures off the visible column height; re-fit after toggling.
      setTimeout(fitDesignPreview, 0);
    }
    // Each step is its own URL, so a step can be linked to and Back returns to
    // the previous one instead of leaving the editor entirely.
    buttons.forEach((b) => b.addEventListener("click", () => {
      show(b.dataset.egroup);
      pushRoute("board", b.dataset.egroup);
    }));
    tabs.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i === -1) return;
      let next;
      if (e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
      else if (e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
      if (next) { e.preventDefault(); next.click(); next.focus(); }
    });
    tabs._show = show;
    const initialGroup = currentRoute().tab || location.hash.replace("#", "") || "setup";
    show(buttons.find((b) => b.dataset.egroup === initialGroup)?.dataset.egroup || "setup");
  }

export function setupShell() {
  if (setupShell._done) return;
  setupShell._done = true;
  setupEditorTabs();
  let backdrop = document.querySelector(".lb-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "lb-backdrop";
    document.body.appendChild(backdrop);
  }
  backdrop.addEventListener("click", () => closeDrawer());

  document.querySelectorAll(".lb-nav[data-nav]").forEach((link) => link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = link.dataset.nav;
    const hash = link.dataset.hash || "";
    pushRoute(page, hash || defaultHash(page));
    navTo(page, hash);
  }));
  document.querySelectorAll("[data-jump]").forEach((el) => el.addEventListener("click", () => {
    const page = el.dataset.jump;
    pushRoute(page, defaultHash(page));
    navTo(page, "");
  }));
  document.querySelectorAll(".lb-menu").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); openDrawer(); }));
  document.querySelectorAll("[data-close-side]").forEach((btn) => btn.addEventListener("click", () => closeDrawer()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lbSide")?.classList.contains("is-open")) { e.preventDefault(); closeDrawer(); } });

  // Make the shared top product tabs part of the same SPA for same-Worker pages.
  document.querySelectorAll(".gm-tab, .gm-brand").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("/dashboard") || href.startsWith("/dashboard/rewards")) return;
    link.addEventListener("click", (e) => {
      const url = new URL(href, location.origin);
      const route = parseDashboardPath(url.pathname);
      if (!route) return;
      e.preventDefault();
      pushRoute(route.page, route.tab || defaultHash(route.page));
      navTo(route.page, route.tab);
    });
  });

  // The profile dropdown's open/close behaviour ships with the header itself
  // (/assets/shell-nav.js) so it is identical on every Worker.

  // Handle browser back/forward inside the SPA.
  window.addEventListener("popstate", () => {
    const { page, tab } = currentRoute();
    navTo(page, tab);
  });

  // Allow nested dashboard modules to request navigation without a circular import.
  window.addEventListener("yr-nav", (e) => {
    const { page, hash } = e.detail || {};
    if (!page) return;
    e.preventDefault();
    pushRoute(page, hash || defaultHash(page));
    navTo(page, hash);
  });
}
