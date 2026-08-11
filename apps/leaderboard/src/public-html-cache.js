const PUBLIC_HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=15, stale-while-revalidate=60";
const PUBLIC_HTML_CACHE_KEY_PREFIX = "https://yourrank.site/__public-board-cache/";

function cacheApi() {
  return globalThis.caches?.default || null;
}

function cookieHeader(request) {
  return request.headers.get("cookie") || "";
}

export function isPublicBoardCacheRequest(request, section) {
  if (!request || request.method !== "GET") return false;
  if (section !== "home" && section !== "leaderboard") return false;
  const url = new URL(request.url);
  if (url.search) return false;
  // Reject every cookie, not only the session/viewer/password cookies. This
  // keeps analytics and future cookie-based personalization out of the cache.
  return cookieHeader(request) === "";
}

export function isPublicBoardCacheSite(site) {
  return !!site
    && !site.requiresPassword
    && !site.suspended
    && !site.pendingVerification
    && !site.password_hash
    && site.published !== false
    && site.isDraft !== true;
}

export function publicBoardCacheKey(request) {
  const url = new URL(request.url);
  // Host is part of the key because custom domains map different tenants to
  // the same Worker pathname.
  return new Request(`${PUBLIC_HTML_CACHE_KEY_PREFIX}${encodeURIComponent(url.host)}${url.pathname}`);
}

export function publicHtmlCacheControl() {
  return PUBLIC_HTML_CACHE_CONTROL;
}

export async function getPublicBoardCache(request) {
  const cache = cacheApi();
  if (!cache) return null;
  try {
    return await cache.match(publicBoardCacheKey(request));
  } catch (err) {
    console.error("[public-html-cache] match failed:", String(err?.message || err));
    return null;
  }
}

export async function putPublicBoardCache(request, response) {
  const cache = cacheApi();
  if (!cache) return;
  try {
    const cached = response.clone();
    cached.headers.delete("set-cookie");
    await cache.put(publicBoardCacheKey(request), cached);
  } catch (err) {
    console.error("[public-html-cache] put failed:", String(err?.message || err));
  }
}

export async function invalidatePublicBoardCache(...hostsAndPaths) {
  const cache = cacheApi();
  if (!cache) return;
  try {
    await Promise.all(hostsAndPaths.filter(Boolean).map((value) => {
      const request = new Request(value.startsWith("http") ? value : `https://${value}`);
      return cache.delete(publicBoardCacheKey(request));
    }));
  } catch (err) {
    console.error("[public-html-cache] delete failed:", String(err?.message || err));
  }
}

export function cachedPublicBoardResponse(cached, csrfToken, csrfCookieHeader) {
  return cached.text().then((html) => {
    const body = csrfToken
      ? html.replace(
        /(<meta\s+name="csrf-token"\s+content=")[^"]*(")/,
        `$1${csrfToken}$2`
      )
      : html;
    const headers = new Headers(cached.headers);
    if (csrfCookieHeader) headers.set("set-cookie", csrfCookieHeader);
    headers.set("cache-control", PUBLIC_HTML_CACHE_CONTROL);
    return new Response(body, { status: cached.status, statusText: cached.statusText, headers });
  });
}
