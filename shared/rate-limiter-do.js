"use strict";
// Durable Object rate limiter for YourRank.
// Replaces KV-backed rate limiting with atomic, consistent counters.
// Each unique rate-limit key gets its own DO instance.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
/**
 * RateLimiter Durable Object.
 * Uses fixed-window counting with atomic in-memory state.
 * Each DO instance handles one rate-limit key.
 */
class RateLimiter {
    state;
    windows = new Map();
    constructor(state) {
        this.state = state;
    }
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === "/check" && request.method === "POST") {
            const body = await request.json();
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
    check(limit, windowSec) {
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
exports.RateLimiter = RateLimiter;
