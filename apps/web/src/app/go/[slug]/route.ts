import { proxyToWorker } from "@/lib/proxy";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  const { slug } = await params;
  return proxyToWorker(request, `/go/${slug}`);
}

export async function HEAD(request: Request, { params }: RouteParams): Promise<Response> {
  const { slug } = await params;
  return proxyToWorker(request, `/go/${slug}`);
}
