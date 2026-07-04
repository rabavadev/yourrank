// ------------------------------------------------------------------
// Tiny KV-backed fixed-window rate limiter.
//
// Uses the SESSIONS KV namespace the Worker already binds (see
// wrangler.toml). Keys are short-lived (expirationTtl = window), so the
// store self-cleans and there's nothing to sweep.
//
// Fixed-window is intentionally simple: it can allow up to ~2x the limit
// across a window boundary, which is fine for coarse abuse/brute-force
// protection on an admin API. It is NOT a billing-accurate quota.
//
// KV reads are eventually consistent, so this is best-effort under heavy
// concurrent bursts — again, fine as a brute-force speed bump in front of a
// secret-key check, not a hard security boundary on its own.
//
// IMPORTANT: Due to KV's eventual consistency and lack of atomic increment,
// this limiter can under-count under burst conditions. Concurrent requests
// may read stale values and all increment from the same baseline, allowing
// more requests than the configured limit during bursts.
// ------------------------------------------------------------------

export interface RateLimitKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfter: number; // seconds until the window resets
}

/**
 * Count one hit against `id` in a `windowSec` window allowing `limit` hits.
 * Returns whether this hit is allowed plus headroom info for headers.
 * Fails CLOSED (denies the request) if KV is unavailable — the admin API is
 * still protected by its API key, but we prefer to lock down on KV failure as
 * a defense-in-depth measure against brute force attacks.
 */
export async function rateLimit(
  kv: RateLimitKV | undefined,
  id: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  if (!kv) return { ok: true, remaining: limit, limit, retryAfter: 0 };

  const window = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${id}:${window}`;

  try {
    const current = Number((await kv.get(key)) ?? 0);
    const used = current + 1;
    const retryAfter = windowSec - (Math.floor(Date.now() / 1000) % windowSec);

    if (current >= limit) {
      return { ok: false, remaining: 0, limit, retryAfter };
    }

    // Refresh the TTL to the current window each hit; the key dies with the window.
    // NOTE: Due to KV's eventual consistency and lack of atomic increment,
    // concurrent requests may read stale values and all increment from the same
    // baseline, allowing more requests than the configured limit during bursts.
    await kv.put(key, String(used), { expirationTtl: windowSec });
    return { ok: true, remaining: Math.max(0, limit - used), limit, retryAfter };
  } catch (err) {
    // Fail closed: if KV is down, deny the request rather than allowing
    // unlimited access. The admin API is still protected by its API key;
    // this just adds defense-in-depth against brute force.
    console.error("[ratelimit]: KV operation failed, failing closed", err);
    return { ok: false, remaining: 0, limit, retryAfter: windowSec };
  }
}
