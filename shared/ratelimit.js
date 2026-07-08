"use strict";
// ------------------------------------------------------------------
// Shared rate limiter for YourRank — KV or Durable Object backend.
//
// Same public API. First argument can be:
//   - A KV namespace (legacy, direct KV access)
//   - An env object with SESSIONS and optionally RATE_LIMITER_DO + RL_BACKEND
//
// When RL_BACKEND=do and RATE_LIMITER_DO binding exists, uses Durable Objects.
// Otherwise falls back to KV. Fails OPEN in all cases.
// ------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
/**
 * Count one hit against `id` in a `windowSec` window allowing `limit` hits.
 * First argument: KV namespace OR env object (auto-detected).
 * Fails OPEN (allows the request) if the backend is unavailable.
 */
async function rateLimit(kvOrEnv, id, limit, windowSec) {
    // Auto-detect: if it has get/put methods, it's a KV namespace
    if (kvOrEnv && typeof kvOrEnv.get === "function" && typeof kvOrEnv.put === "function") {
        // KV namespace passed directly (bot Worker pattern)
        // Check if we should still use DO by looking at globalThis (not available)
        // In this case, stick with KV since we don't have the env reference
        return rateLimitKV(kvOrEnv, id, limit, windowSec);
    }
    // Env object passed (leaderboard Worker pattern)
    const env = kvOrEnv;
    if (!env)
        return { ok: true, remaining: limit, limit, retryAfter: 0 };
    const backend = env.RL_BACKEND || "kv";
    if (backend === "do" && env.RATE_LIMITER_DO) {
        return rateLimitDO(env.RATE_LIMITER_DO, id, limit, windowSec);
    }
    return rateLimitKV(env.SESSIONS, id, limit, windowSec);
}
// --- Durable Object backend ---
async function rateLimitDO(ns, id, limit, windowSec) {
    try {
        const doId = ns.idFromName(`rl:${id}`);
        const stub = ns.get(doId);
        const res = await stub.fetch("https://do/check", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ limit, windowSec }),
        });
        if (!res.ok) {
            console.error("[rateLimit] DO returned non-ok, allowing request");
            return { ok: true, remaining: limit, limit, retryAfter: 0 };
        }
        return await res.json();
    }
    catch (err) {
        console.error("[rateLimit] DO error, allowing request:", String(err?.message ?? err));
        return { ok: true, remaining: limit, limit, retryAfter: 0 };
    }
}
// --- KV backend (original implementation) ---
async function rateLimitKV(kv, id, limit, windowSec) {
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
        console.error("[rateLimit] KV read failed, allowing request:", String(err?.message ?? err));
        return { ok: true, remaining: limit, limit, retryAfter: 0 };
    }
    if (current >= limit) {
        return { ok: false, remaining: 0, limit, retryAfter };
    }
    const used = current + 1;
    try {
        await kv.put(key, String(used), { expirationTtl: windowSec });
    }
    catch (err) {
        console.error("[rateLimit] KV write failed, allowing request (count not persisted):", String(err?.message ?? err));
    }
    return { ok: true, remaining: Math.max(0, limit - used), limit, retryAfter };
}
