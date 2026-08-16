import { getCloudflareContext } from "@opennextjs/cloudflare";

const API_BASE = process.env.API_BASE_URL || "https://yourrank.site";

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

async function proxyAuth(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const upstream = new URL(request.url);
  const base = new URL(API_BASE);
  upstream.protocol = base.protocol;
  upstream.host = base.host;
  upstream.port = base.port;
  upstream.pathname = `${base.pathname.replace(/\/$/, "")}/${slug.join("/")}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.delete("content-length");

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    body,
  };

  const { env } = await getCloudflareContext({ async: true });
  const apiBinding = (env as Record<string, unknown>).API as
    | { fetch: (req: Request) => Promise<Response> }
    | undefined;

  const response = apiBinding
    ? await apiBinding.fetch(new Request(upstream.toString(), init))
    : await fetch(upstream.toString(), init);

  const responseHeaders = new Headers(response.headers);
  // Strip upstream CORS headers; the caller is same-origin with the Next.js app.
  responseHeaders.delete("access-control-allow-origin");
  responseHeaders.delete("access-control-allow-credentials");
  responseHeaders.delete("access-control-allow-methods");
  responseHeaders.delete("access-control-allow-headers");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyAuth;
export const POST = proxyAuth;
export const OPTIONS = proxyAuth;
