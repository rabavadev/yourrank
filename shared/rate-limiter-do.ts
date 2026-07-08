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

/**
 * RateLimiter Durable Object.
 * Uses fixed-window counting with atomic in-memory state.
 * Each DO instance handles one rate-limit key.
 */
export class RateLimiter {
  private state: any;
  private windows: Map<string, WindowState> = new Map();

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

      const result = this.check(limit, windowSec);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/reset" && request.method === "POST") {
      this.windows.clear();
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response("RateLimiter DO", { status: 200 });
  }

  private check(limit: number, windowSec: number): RateLimitResult {
    const now = Math.floor(Date.now() / 1000);
    const windowId = Math.floor(now / windowSec);
    const windowKey = `w:${windowId}`;
    const retryAfter = windowSec - (now % windowSec);

    let state = this.windows.get(windowKey);

    // Clean up old windows (keep only current)
    for (const [key] of this.windows) {
      if (key !== windowKey) {
        this.windows.delete(key);
      }
    }

    if (!state) {
      state = { count: 0, windowStart: windowId * windowSec };
      this.windows.set(windowKey, state);
    }

    if (state.count >= limit) {
      return { ok: false, remaining: 0, limit, retryAfter };
    }

    state.count++;
    return { ok: true, remaining: Math.max(0, limit - state.count), limit, retryAfter };
  }
}
