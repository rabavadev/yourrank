// Durable Object rate limiter for YourRank.
// Replaces KV-backed rate limiting with atomic, consistent counters.
// Each unique rate-limit key gets its own DO instance.

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfter: number;
}

interface WindowState {
  count: number;
  windowStart: number;
}

const WINDOW_KEY = "window";

/**
 * RateLimiter Durable Object.
 * Uses fixed-window counting persisted to Durable Object storage so the
 * counter survives hibernation/eviction. Each DO instance handles one
 * rate-limit key.
 */
export class RateLimiter {
  private state: any;

  constructor(state: any) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/check" && request.method === "POST") {
      const body = await request.json() as { limit: number; windowSec: number };
      const { limit, windowSec } = body;

      if (!limit || !windowSec || limit <= 0 || windowSec <= 0) {
        return new Response(JSON.stringify({ error: "invalid params" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      const result = await this.check(limit, windowSec);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/reset" && request.method === "POST") {
      await this.state.storage.delete(WINDOW_KEY);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("RateLimiter DO", { status: 200 });
  }

  private async check(limit: number, windowSec: number): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const windowId = Math.floor(now / windowSec);
    const windowStart = windowId * windowSec;
    const retryAfter = windowSec - (now % windowSec);

    let stored: WindowState | null = null;
    try {
      stored = (await this.state.storage.get(WINDOW_KEY)) as WindowState | null;
    } catch (e) {
      // Storage read failed; fall back to an empty window.
      stored = null;
    }

    if (!stored || stored.windowStart !== windowStart) {
      stored = { count: 0, windowStart };
    }

    if (stored.count >= limit) {
      return { ok: false, remaining: 0, limit, retryAfter };
    }

    stored.count++;
    await this.state.storage.put(WINDOW_KEY, stored);
    return { ok: true, remaining: Math.max(0, limit - stored.count), limit, retryAfter };
  }
}
