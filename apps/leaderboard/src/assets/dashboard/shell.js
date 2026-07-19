// Dashboard shell: sidebar navigation and mobile drawer.
import { $ } from "./utils.js";
import { state } from "./state.js";
import { renderOverviewSummary } from "./overview.js";

export function setAriaCurrentNav(page) {
  document.querySelectorAll(".lb-nav").forEach((n) => {
    const active = n.dataset.nav === page;
    n.classList.toggle("is-on", active);
    n.setAttribute("aria-current", active ? "page" : "false");
  });
}

export function navTo(page) {
  setAriaCurrentNav(page);
  document.querySelectorAll(".lb-page").forEach((p) => p.classList.toggle("is-on", p.dataset.page === page));
  closeDrawer();
  if (page === "overview") renderOverviewSummary();
  // Re-fit the live preview whenever the Editor becomes visible (it can't measure while hidden).
  if (page === "board" && typeof state.fitDesignPreview === "function") setTimeout(state.fitDesignPreview, 0);
  const heading = document.querySelector(".lb-page.is-on .lb-phead h1");
  if (heading) heading.focus({ preventScroll: true });
  const main = document.querySelector(".lb-main");
  if (main) main.scrollIntoView({ block: "start" });
}

export function openDrawer() {
  $("lbSide")?.classList.add("is-open");
  document.querySelector(".lb-backdrop")?.classList.add("is-open");
  document.querySelectorAll(".lb-menu").forEach((b) => b.setAttribute("aria-expanded", "true"));
  const firstNav = $("lbSide")?.querySelector(".lb-nav");
  if (firstNav) setTimeout(() => firstNav.focus(), 0);
}

export function closeDrawer(focusMenu = true) {
  $("lbSide")?.classList.remove("is-open");
  document.querySelector(".lb-backdrop")?.classList.remove("is-open");
  document.querySelectorAll(".lb-menu").forEach((b) => b.setAttribute("aria-expanded", "false"));
  if (focusMenu) {
    const menu = document.querySelector(".lb-page.is-on .lb-menu") || document.querySelector(".lb-menu");
    if (menu) setTimeout(() => menu.focus(), 0);
  }
}

export function setupShell() {
  if (setupShell._done) return;
  setupShell._done = true;
  let backdrop = document.querySelector(".lb-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "lb-backdrop";
    document.body.appendChild(backdrop);
  }
  backdrop.addEventListener("click", () => closeDrawer());
  document.querySelectorAll(".lb-nav").forEach((btn) => btn.addEventListener("click", () => navTo(btn.dataset.nav)));
  document.querySelectorAll("[data-jump]").forEach((el) => el.addEventListener("click", () => navTo(el.dataset.jump)));
  document.querySelectorAll(".lb-menu").forEach((btn) => btn.addEventListener("click", (e) => { e.stopPropagation(); openDrawer(); }));
  document.querySelectorAll("[data-close-side]").forEach((btn) => btn.addEventListener("click", () => closeDrawer()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("lbSide")?.classList.contains("is-open")) { e.preventDefault(); closeDrawer(); } });
}
