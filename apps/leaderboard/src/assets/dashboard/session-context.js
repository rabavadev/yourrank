// Session-level creator context for the persistent dashboard shell.
//
// Identity and the site list are fetched once at boot. Ordinary section
// changes reuse them. Create / delete / rename / switch-site refresh is
// deliberate. Authorization decisions are never cached: 401, logout, CSRF
// and permission checks still go through the live request helpers.

let identity = null;
let sites = null;

export function getCachedIdentity() {
  return identity;
}

export function getCachedSites() {
  return sites;
}

export function rememberIdentity(user) {
  identity = user || null;
}

export function rememberSites(list) {
  sites = Array.isArray(list) ? list : null;
}

export function invalidateIdentity() {
  identity = null;
}

export function invalidateSiteList() {
  sites = null;
}

export function currentSiteId() {
  const params = new URLSearchParams(typeof location === "undefined" ? "" : location.search);
  return params.get("siteId") || params.get("board") || sites?.[0]?.id || sites?.[0]?.siteId || "";
}
