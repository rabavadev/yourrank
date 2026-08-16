import { getCloudflareContext } from "@opennextjs/cloudflare";

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

  if (api) {
    const upstream = new Request(url, request);
    const response = await api.fetch(upstream);
    return sanitizeResponse(response);
  }

  const base = new URL(API_BASE);
  url.protocol = base.protocol;
  url.host = base.host;
  url.port = base.port;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.delete("content-length");

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined;

  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
    duplex: "half",
  } as RequestInit);
  return sanitizeResponse(response);
}

function sanitizeResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete("access-control-allow-origin");
  headers.delete("access-control-allow-credentials");
  headers.delete("access-control-allow-methods");
  headers.delete("access-control-allow-headers");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
