import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

async function handler(request: Request, { params }: RouteParams) {
  const { path } = await params;
  return proxyToWorker(request, `/assets/${path.join("/")}`);
}

export const GET = handler;
export const HEAD = handler;
export const OPTIONS = handler;
