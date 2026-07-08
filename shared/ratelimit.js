"use strict";
// ------------------------------------------------------------------
// Shared KV-backed fixed-window rate limiter.
//
// Used by both the leaderboard and bot Workers. Uses a KV namespace
// (typically SESSIONS) for storage. Keys are short-lived (expirationTtl
// = window), so the store self-cleans and there's nothing to sweep.
//
// Fixed-window is intentionally simple: it can allow up to ~2x the limit
// across a window boundary, which is fine for coarse abuse/brute-force
// protection. It is NOT a billing-accurate quota.
//
// KV reads are eventually consistent, so this is best-effort under heavy
// concurrent bursts — again, fine as a brute-force speed bump.
//
// IMPORTANT: Due to KV's eventual consistency and lack of atomic increment,
// this limiter can under-count under burst conditions. Concurrent requests
// may read stale values and all increment from the same baseline, allowing
// more requests than the configured limit during bursts.
//
// FAILS OPEN: this limiter is a best-effort abuse speed bump, not a hard
// security control. If KV is unavailable — missing binding, transient error,
// or (crucially) the daily WRITE quota being exhausted — we ALLOW the request
// instead of denying it. A KV hiccup must never take the whole platform
// offline (it previously did: every rate-limit check writes to KV on the
// allowed path, so once the free-tier write quota was spent, every endpoint —
// login, signup, bot connect, redirects, postbacks, public polling — returned
// 429 until the quota reset). Endpoints that need real protection have their
// own controls (per-account login lockout, HMAC-signed postbacks, admin key).
// ------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
/**
 * Count one hit against `id` in a `windowSec` window allowing `limit` hits.
 * Returns whether this hit is allowed plus headroom info for headers.
 * Fails OPEN (allows the request) if KV is unavailable — see file header.
 */
async function rateLimit(kv, id, limit, windowSec) {
    // No binding — can't enforce, so allow rather than deny.
    if (!kv)
        return { ok: true, remaining: limit, limit, retryAfter: 0 };
    const window = Math.floor(Date.now() / 1000 / windowSec);
    const key = `rl:${id}:${window}`;
    const retryAfter = windowSec - (Math.floor(Date.now() / 1000) % windowSec);
    let current;
    try {
        current = Number((await kv.get(key)) ?? 0);
    }
    catch (err) {
        // Read failed — we can't make a decision, so allow. Best-effort.
        console.error("[rateLimit] KV read failed, allowing request:", String(err?.message ?? err));
        return { ok: true, remaining: limit, limit, retryAfter: 0 };
    }
    if (current >= limit) {
        return { ok: false, remaining: 0, limit, retryAfter };
    }
    const used = current + 1;
    try {
        // Refresh the TTL to the current window each hit; the key dies with the window.
        await kv.put(key, String(used), { expirationTtl: windowSec });
    }
    catch (err) {
        // Write failed (e.g. daily KV write quota exhausted). The request already
        // passed the read check above, so ALLOW it — never flip an allowed request
        // to denied just because we couldn't persist the incremented count.
        console.error("[rateLimit] KV write failed, allowing request (count not persisted):", String(err?.message ?? err));
    }
    return { ok: true, remaining: Math.max(0, limit - used), limit, retryAfter };
}
