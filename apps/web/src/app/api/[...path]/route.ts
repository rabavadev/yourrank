import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

async function handler(request: Request, { params }: RouteParams) {
  const { path } = await params;
  return proxyToWorker(request, `/api/${path.join("/")}`);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;
