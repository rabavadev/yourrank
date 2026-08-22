// Session-level in-memory cache for the authenticated creator and the site
// list. With a persistent shell, identity and site context are established
// once on initial boot and reused across dashboard navigation instead of
// being re-fetched on every section change.
//
// This is a UX/performance optimization only — it does NOT bypass server-side
// authentication. Every API endpoint still authenticates normally; a cached
// identity that has since expired will produce a 401 on the next real request,
// which the existing auth-error handling turns into a login redirect.

import { fetchDashboardJson, loginRedirectPath } from "./request.js";

let mePromise = null;
let sitesPromise = null;

/** Returns a cached promise for the authenticated user. Re-fetches on failure. */
export function getMe() {
  if (!mePromise) {
    mePromise = fetchDashboardJson("/api/auth/me", { credentials: "same-origin" })
      .then(({ body }) => {
        if (!body?.ok || !body.user) {
          throw new Error("The authentication response was invalid.");
        }
        return body.user;
      })
      .catch((err) => {
        // Allow a retry on the next call — a transient failure should not
        // poison the cache for the rest of the session.
        mePromise = null;
        throw err;
      });
  }
  return mePromise;
}

/** Returns a cached promise for the site list. Re-fetches on failure. */
export function getSites() {
  if (!sitesPromise) {
    sitesPromise = fetchDashboardJson("/api/site/list", { credentials: "same-origin" })
      .then(({ body }) => {
        const list = body?.sites || body?.boards || body || [];
        return Array.isArray(list) ? list : [];
      })
      .catch((err) => {
        sitesPromise = null;
        throw err;
      });
  }
  return sitesPromise;
}

/** Force a re-fetch of the site list (after create/delete/rename). */
export function refreshSites() {
  sitesPromise = null;
  return getSites();
}

/** Drop all cached session data (logout, account switch). */
export function clearSession() {
  mePromise = null;
  sitesPromise = null;
}

/** Redirect to login if the session has ended. Returns true if redirected. */
export function handleAuthError(err) {
  if (err?.code === "AUTH") {
    location.href = loginRedirectPath(location);
    return true;
  }
  return false;
}
