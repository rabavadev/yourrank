import { updateProfileMenu } from "./profile-menu.js";
import {
  fetchDashboardJson,
  loginRedirectPath,
  withDashboardTimeout,
} from "./request.js";
import { MANAGE_SITES_VALUE } from "./routes.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const csrf = () => document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";

async function boardApi(method, path) {
  try {
    const { body } = await fetchDashboardJson(path, {
      method,
      credentials: "same-origin",
      headers: { "x-csrf-token": csrf() },
    });
    return body;
  } catch (error) {
    if (error?.code === "AUTH") {
      location.href = loginRedirectPath(location);
    }
    throw error;
  }
}

export const siteQuery = () => new URLSearchParams(location.search).get("siteId");
export const sitePath = (path) => `${path}${siteQuery() ? `${path.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteQuery())}` : ""}`;

export function preserveSiteContextLinks(activeSiteId = "") {
  const siteId = siteQuery() || activeSiteId;
  if (!siteId) return;
  const sitesLink = document.querySelector('[data-product-link="sites"]');
  if (sitesLink) sitesLink.href = `/dashboard?board=${encodeURIComponent(siteId)}`;
  const creditsLink = document.querySelector('[data-product-link="credits"]');
  if (creditsLink) creditsLink.href = `/dashboard/rewards/redemptions?siteId=${encodeURIComponent(siteId)}`;
  const creditsDestinations = new Set([
    "/dashboard/rewards/redemptions",
    "/dashboard/rewards/shop",
    "/dashboard/rewards/rules",
    "/dashboard/audience/viewers",
    "/dashboard/audience/activity",
    "/dashboard/rewards/channel",
  ]);
  const siteDestinations = new Set([
    "/dashboard",
    "/dashboard/games",
    "/dashboard/analytics/activity",
    "/dashboard/settings/board",
    "/dashboard/leaderboards",
    "/dashboard/leaderboard",
  ]);
  document.querySelectorAll("a[href]").forEach((link) => {
    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#")) return;
    const target = new URL(raw, location.origin);
    if (creditsDestinations.has(target.pathname) && !target.searchParams.has("siteId")) {
      target.searchParams.set("siteId", siteId);
    } else if ((siteDestinations.has(target.pathname) || target.pathname.startsWith("/dashboard/leaderboard/")) && !target.searchParams.has("board")) {
      target.searchParams.set("board", siteId);
    } else {
      return;
    }
    link.href = `${target.pathname}${target.search}${target.hash}`;
  });
}

export async function loadBoardShell({ request: requestFn = boardApi } = {}) {
  // Injected request functions cannot receive the controller signal, so this path is timeout-raced only.
  const request = requestFn === boardApi
    ? requestFn
    : (method, path) => withDashboardTimeout(() => requestFn(method, path));
  const [me, boards] = await Promise.all([request("GET", "/api/auth/me"), request("GET", "/api/site/list")]);
  if (!me?.user) throw new Error("The authentication response was invalid.");
  const user = me.user;
  updateProfileMenu(user);
  const list = boards.sites || boards.boards || boards || [];
  const current = siteQuery() || list[0]?.id || list[0]?.siteId;
  const select = $("sidebarBoardSelect");
  const activeSiteId = current || "";
  if (select) {
    select.innerHTML = list.map((b) => `<option value="${esc(b.id || b.siteId)}" ${String(b.id || b.siteId) === String(current) ? "selected" : ""}>${esc(b.name || b.slug || "Site")}</option>`).join("");
    select.insertAdjacentHTML("beforeend", `<option value="${MANAGE_SITES_VALUE}">Manage all sites…</option>`);
    select.addEventListener("change", () => {
      if (select.value === MANAGE_SITES_VALUE) {
        location.href = "/dashboard/leaderboards";
        return;
      }
      location.href = `${location.pathname}?siteId=${encodeURIComponent(select.value)}`;
    });
  }
  const board = list.find((b) => String(b.id || b.siteId) === String(current)) || list[0] || {};
  const topbarPath = $("lbTopbarSitePath");
  if (topbarPath) topbarPath.textContent = board.slug ? `Web address: /${board.slug}` : "Web address unavailable";
  const live = Boolean(board.published) && user.emailVerified !== false;
  const pendingVerification = Boolean(board.published) && user.emailVerified === false;
  const status = $("lbTopbarStatus");
  if (status) {
    status.textContent = live ? "Published" : pendingVerification ? "Verification needed" : "Not published";
    status.className = `lb-status ${live ? "lb-status--live" : pendingVerification ? "lb-status--pending" : "lb-status--draft"}`;
  }
  const planBadge = $("planBadge");
  if (planBadge) planBadge.textContent = `${String(board.plan || user.plan || "free").toUpperCase()} PLAN`;
  const publicLink = $("liveLink");
  if (publicLink) {
    if (live && board.slug) {
      publicLink.href = `/${board.slug}`;
      publicLink.textContent = "View site ↗";
      publicLink.target = "_blank";
      publicLink.rel = "noopener noreferrer";
    } else {
      publicLink.href = pendingVerification ? "/verify-email" : `/dashboard/leaderboard/share?board=${encodeURIComponent(current || "")}`;
      publicLink.textContent = pendingVerification ? "Verify email" : "Publish site";
      publicLink.removeAttribute("target");
      publicLink.removeAttribute("rel");
    }
  }
  preserveSiteContextLinks(activeSiteId);
  return { activeSiteId, board, list, user };
}
