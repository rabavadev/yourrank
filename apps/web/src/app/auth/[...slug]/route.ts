import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

async function handler(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  return proxyToWorker(request, `/auth/${slug.join("/")}`);
}

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
export const HEAD = handler;
