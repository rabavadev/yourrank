import { getCloudflareContext } from "@opennextjs/cloudflare";
import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

async function handler(request: Request, { params }: RouteParams) {
  const { path } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const assets = (env as Record<string, unknown>).ASSETS as
    | { fetch: typeof fetch }
    | undefined;

  if (assets) {
    const response = await assets.fetch(request);
    if (response.status !== 404) {
      return response;
    }
  }

  return proxyToWorker(request, `/assets/${path.join("/")}`);
}

export const GET = handler;
export const HEAD = handler;
export const OPTIONS = handler;
