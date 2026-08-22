import { updateProfileMenu } from "./profile-menu.js";
import { getMe, getSites, handleAuthError } from "./session.js";
import { renderSiteSelector } from "./site-selector.js";

const $ = (id) => document.getElementById(id);

export const siteQuery = () => new URLSearchParams(location.search).get("siteId");
export const sitePath = (path, explicitSiteId = "") => {
  const siteId = explicitSiteId || siteQuery() || "";
  return `${path}${siteId ? `${path.includes("?") ? "&" : "?"}siteId=${encodeURIComponent(siteId)}` : ""}`;
};

export function preserveSiteContextLinks(activeSiteId = "") {
  const siteId = siteQuery() || activeSiteId;
  if (!siteId) return;
  const sitesLink = document.querySelector('[data-product-link="sites"]');
  if (sitesLink) sitesLink.href = `/dashboard/leaderboards?board=${encodeURIComponent(siteId)}`;
  const creditsLink = document.querySelector('[data-product-link="credits"]');
  if (creditsLink) creditsLink.href = `/dashboard/rewards?siteId=${encodeURIComponent(siteId)}`;
  const creditsDestinations = new Set([
    "/dashboard/rewards",
    "/dashboard/rewards/redemptions",
    "/dashboard/rewards/shop",
    "/dashboard/rewards/rules",
    "/dashboard/audience/members",
    "/dashboard/rewards/activity",
    "/dashboard/rewards/channel",
  ]);
  const siteDestinations = new Set([
    "/dashboard",
    "/dashboard/games",
    "/dashboard/analytics/activity",
    "/dashboard/site",
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

export async function loadBoardShell() {
  // The shell is persistent: identity and the site list are established once
  // on initial boot and reused across navigation. The session cache avoids
  // re-fetching /api/auth/me and /api/site/list on every section entry.
  // A failed fetch clears the cache entry so the next call retries.
  const [user, list] = await Promise.all([
    getMe().catch((err) => { handleAuthError(err); throw err; }),
    getSites().catch((err) => { handleAuthError(err); throw err; }),
  ]);
  if (!user) throw new Error("The authentication response was invalid.");
  updateProfileMenu(user);
  const current = siteQuery() || list[0]?.id || list[0]?.siteId;
  const select = $("sidebarBoardSelect");
  const activeSiteId = current || "";
  renderSiteSelector({
    select,
    sites: list,
    activeId: activeSiteId,
    onSelect: (id) => {
      location.href = `${location.pathname}?siteId=${encodeURIComponent(id)}`;
    },
  });
  const board = list.find((b) => String(b.id || b.siteId) === String(current)) || list[0] || {};
  const live = Boolean(board.published) && user.emailVerified !== false;
  const pendingVerification = Boolean(board.published) && user.emailVerified === false;
  const status = $("lbTopbarStatus");
  if (status) {
    status.textContent = live ? "Live" : pendingVerification ? "Verification needed" : "Not live";
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
