// Dashboard shell: sidebar navigation and mobile drawer.
import { $ } from "./utils.js";
import { state } from "./state.js";
import { renderOverviewSummary } from "./overview.js";
import { loadStats } from "./site.js";
import { initKickrewards } from "../credits.js";

const AREA_MAP = { home: "leaderboard", board: "leaderboard", boards: "leaderboard", settings: "leaderboard", performance: "analytics", kickrewards: "rewards" };

export function areaForPage(page) { return AREA_MAP[page] || "leaderboard"; }

export function setActiveSideNav(page, hash = "") {
  const area = areaForPage(page);
  document.querySelectorAll(".lb-side-group").forEach((g) => { g.hidden = g.dataset.area !== area; });
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
                     (area === "analytics" && href === "/dashboard?nav=performance") ||
                     (area === "rewards" && href === "/dashboard?nav=kickrewards") ||
                     (area === "bot" && href.startsWith("/bot"));
    t.classList.toggle("gm-tab--active", isActive);
  });
}

export function navTo(page, hash = "") {
  setActiveSideNav(page, hash);
  document.querySelectorAll(".lb-page").forEach((p) => p.classList.toggle("is-on", p.dataset.page === page));
  closeDrawer();
  if (page === "home") renderOverviewSummary();
  if (page === "home" || page === "performance") loadStats();
  // Re-fit the live preview whenever the Editor becomes visible (it can't measure while hidden).
  if (page === "board" && typeof state.fitDesignPreview === "function") setTimeout(state.fitDesignPreview, 0);
  if (page === "kickrewards") initKickrewards().catch((err) => { console.error("kickrewards init failed", err); });
  const titles = { home: "Overview", board: "Editor", boards: "All boards", performance: "Analytics", settings: "Settings", kickrewards: "Kick rewards" };
  const topbarTitle = $("lbTopbarTitle");
  if (topbarTitle) { topbarTitle.textContent = titles[page] || page; topbarTitle.focus({ preventScroll: true }); }
  scrollToHash(hash);
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
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    target.classList.add("is-highlighted");
    setTimeout(() => target.classList.remove("is-highlighted"), 1200);
  }
}

export function openDrawer() {
  const side = $("lbSide");
  if (side) {
    side.classList.add("is-open");
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
    side.setAttribute("aria-modal", "false");
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
      if (typeof state.fitDesignPreview === "function") setTimeout(state.fitDesignPreview, 0);
    }
    buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.egroup)));
    tabs.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i === -1) return;
      let next;
      if (e.key === "ArrowRight") next = buttons[(i + 1) % buttons.length];
      else if (e.key === "ArrowLeft") next = buttons[(i - 1 + buttons.length) % buttons.length];
      if (next) { e.preventDefault(); next.click(); next.focus(); }
    });
    tabs._show = show;
    const initialGroup = location.hash.replace("#", "") || "setup";
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
    const query = page === "home" ? "" : `?nav=${encodeURIComponent(page)}${hash ? "#" + hash : ""}`;
    const newPath = `/dashboard${query}`;
    if (newPath !== location.pathname + location.search + location.hash) {
      history.pushState({}, "", newPath);
    }
    navTo(page, hash);
  }));
  document.querySelectorAll("[data-jump]").forEach((el) => el.addEventListener("click", () => navTo(el.dataset.jump)));
  document.querySelectorAll(".lb-menu").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); openDrawer(); }));
  document.querySelectorAll("[data-close-side]").forEach((btn) => btn.addEventListener("click", () => closeDrawer()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lbSide")?.classList.contains("is-open")) { e.preventDefault(); closeDrawer(); } });
  // Handle browser back/forward inside the SPA.
  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(location.search);
    const page = params.get("nav") || "home";
    const hash = location.hash.replace("#", "");
    navTo(page, hash);
  });
}
