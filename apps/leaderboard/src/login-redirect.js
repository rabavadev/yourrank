import { safeNextPath } from "@yourrank/shared/safe-next";

export function redirectToLogin(url, requestedPath = `${url.pathname}${url.search}`) {
  const loginUrl = new URL("/login", url);
  const next = safeNextPath(requestedPath, "");
  if (next) loginUrl.searchParams.set("next", next);
  return Response.redirect(loginUrl, 302);
}
