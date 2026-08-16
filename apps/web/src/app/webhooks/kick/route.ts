import { proxyToWorker } from "@/lib/proxy";

async function handler(request: Request) {
  return proxyToWorker(request, "/webhooks/kick");
}

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;
export const HEAD = handler;
