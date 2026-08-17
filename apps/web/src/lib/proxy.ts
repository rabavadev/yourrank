import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  generateCsrfToken,
  readCsrfToken,
  ensureCsrfCookie,
  csrfCookie,
  shouldRequireCsrf,
} from "./csrf";

const API_BASE = process.env.API_BASE_URL || "https://yourrank.site";

export async function proxyToWorker(
  request: Request,
  pathname?: string,
): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  const api = (env as Record<string, unknown>).API as
    | { fetch: typeof fetch }
    | undefined;

  const url = new URL(request.url);
  if (pathname !== undefined) {
    url.pathname = pathname;
  }

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  let csrfSetCookie: string | undefined;
  if (shouldRequireCsrf(request.method, url.pathname)) {
    const incomingCookie = request.headers.get("cookie") || "";
    const token = readCsrfToken(incomingCookie) || generateCsrfToken();
    headers.set("x-csrf-token", token);
    headers.set("cookie", ensureCsrfCookie(incomingCookie, token));
    csrfSetCookie = csrfCookie(token);
  }

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined;

  if (api) {
    const upstream = new Request(url, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });
    const response = await api.fetch(upstream);
    return sanitizeResponse(response, csrfSetCookie);
  }

  const base = new URL(API_BASE);
  url.protocol = base.protocol;
  url.host = base.host;
  url.port = base.port;

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    duplex: "half",
    redirect: "manual",
  } as RequestInit);
  return sanitizeResponse(response, csrfSetCookie);
}

function sanitizeResponse(
  response: Response,
  csrfSetCookie?: string,
): Response {
  const headers = new Headers(response.headers);
  headers.delete("access-control-allow-origin");
  headers.delete("access-control-allow-credentials");
  headers.delete("access-control-allow-methods");
  headers.delete("access-control-allow-headers");
  if (csrfSetCookie) {
    headers.append("set-cookie", csrfSetCookie);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
