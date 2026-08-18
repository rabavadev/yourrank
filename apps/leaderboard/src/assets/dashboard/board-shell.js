import { updateProfileMenu } from "./profile-menu.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const csrf = () => document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/)?.[1] || "";

async function boardApi(method, path) {
  const res = await fetch(path, { method, credentials: "same-origin", headers: { "x-csrf-token": csrf() } });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
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
  const [me, boards] = await Promise.all([requestFn("GET", "/api/auth/me"), requestFn("GET", "/api/site/list")]);
  const user = me.user || {};
  updateProfileMenu(user);
  const list = boards.sites || boards.boards || boards || [];
  const current = siteQuery() || list[0]?.id || list[0]?.siteId;
  const select = $("sidebarBoardSelect");
  const activeSiteId = current || "";
  if (select) {
    select.innerHTML = list.map((b) => `<option value="${esc(b.id || b.siteId)}" ${String(b.id || b.siteId) === String(current) ? "selected" : ""}>${esc(b.name || b.slug || "Board")}</option>`).join("");
    select.addEventListener("change", () => { location.href = `${location.pathname}?siteId=${encodeURIComponent(select.value)}`; });
  }
  const board = list.find((b) => String(b.id || b.siteId) === String(current)) || list[0] || {};
  const name = $("activeBoardName");
  if (name) name.textContent = board.name || board.slug || "Site";
  const topbarPath = $("lbTopbarSitePath");
  if (topbarPath) topbarPath.textContent = board.slug ? `/${board.slug}` : "";
  const live = Boolean(board.published) && user.emailVerified !== false;
  const pendingVerification = Boolean(board.published) && user.emailVerified === false;
  const status = $("lbTopbarStatus");
  if (status) {
    status.textContent = live ? "Public" : pendingVerification ? "Email verification needed" : "Private";
    status.className = `lb-status ${live ? "lb-status--live" : pendingVerification ? "lb-status--pending" : "lb-status--draft"}`;
  }
  const planBadge = $("planBadge");
  if (planBadge) planBadge.textContent = `${String(board.plan || user.plan || "free").toUpperCase()} PLAN`;
  const publicLink = $("liveLink");
  if (publicLink) {
    if (live && board.slug) {
      publicLink.href = `/${board.slug}`;
      publicLink.textContent = "Open public page ↗";
      publicLink.target = "_blank";
      publicLink.rel = "noopener noreferrer";
    } else {
      publicLink.href = pendingVerification ? "/verify-email" : `/dashboard/leaderboard/share?board=${encodeURIComponent(current || "")}`;
      publicLink.textContent = pendingVerification ? "Verify email to publish" : "Publish your site";
      publicLink.removeAttribute("target");
      publicLink.removeAttribute("rel");
    }
  }
  preserveSiteContextLinks(activeSiteId);
  return { activeSiteId, board, list, user };
}
