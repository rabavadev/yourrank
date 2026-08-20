import { safeNextPath } from "@yourrank/shared/safe-next";

export function redirectResponse(location, status = 302) {
  return new Response(null, { status, headers: { location: String(location) } });
}

export function redirectToLogin(url, requestedPath = `${url.pathname}${url.search}`) {
  const loginUrl = new URL("/login", url);
  const next = safeNextPath(requestedPath, "");
  if (next) loginUrl.searchParams.set("next", next);
  return redirectResponse(loginUrl, 302);
}
