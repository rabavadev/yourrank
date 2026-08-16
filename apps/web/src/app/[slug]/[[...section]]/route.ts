import { proxyToWorker } from "@/lib/proxy";

async function handler(request: Request) {
  return proxyToWorker(request);
}

export const GET = handler;
export const POST = handler;
export const HEAD = handler;
