import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

async function handler(request: Request, { params }: RouteParams) {
  const { path } = await params;
  return proxyToWorker(request, `/overlay/${path.join("/")}`);
}

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
export const HEAD = handler;
