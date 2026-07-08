// ============================================================================
//  YourRank — SHARED RATE LIMITER (real executable tests)
//
//  Regression coverage for the "rate limited forever" platform outage: the
//  limiter used to FAIL CLOSED, so once Cloudflare KV started erroring (e.g.
//  the daily write quota was exhausted) every rate-limited endpoint returned
//  429 until the quota reset. It now FAILS OPEN — a KV problem degrades to
//  "no rate limiting" instead of a full outage.
// ============================================================================

import { describe, it, expect } from 'bun:test';
import { rateLimit, type RateLimitKV } from '../ratelimit';

// A working in-memory KV.
function workingKV(): RateLimitKV {
  const store = new Map<string, string>();
  return {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
  };
}

// KV whose reads work but whose WRITES always throw — models the free-tier
// daily write-quota-exhausted state that caused the outage.
function writeFailKV(): RateLimitKV {
  const store = new Map<string, string>();
  return {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: () => Promise.reject(new Error('KV PUT failed: daily write quota exceeded')),
  };
}

// KV whose reads throw.
function readFailKV(): RateLimitKV {
  return {
    get: () => Promise.reject(new Error('KV GET failed')),
    put: () => Promise.resolve(),
  };
}

describe('rateLimit', () => {
  it('allows requests under the limit and denies over it (KV healthy)', async () => {
    const kv = workingKV();
    const id = `test-${Math.random()}`;
    // limit = 3 in a long window
    for (let i = 0; i < 3; i++) {
      const r = await rateLimit(kv, id, 3, 3600);
      expect(r.ok).toBe(true);
    }
    // 4th hit is over the limit
    const over = await rateLimit(kv, id, 3, 3600);
    expect(over.ok).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it('FAILS OPEN when KV is undefined (no binding)', async () => {
    const r = await rateLimit(undefined, 'anything', 5, 60);
    expect(r.ok).toBe(true);
  });

  it('FAILS OPEN when the KV write throws (write quota exhausted)', async () => {
    const kv = writeFailKV();
    // Every call reads 0 (nothing ever persists) and the put throws — but the
    // request must still be allowed, not denied.
    for (let i = 0; i < 10; i++) {
      const r = await rateLimit(kv, 'quota-test', 3, 60);
      expect(r.ok).toBe(true);
    }
  });

  it('FAILS OPEN when the KV read throws', async () => {
    const r = await rateLimit(readFailKV(), 'read-fail', 5, 60);
    expect(r.ok).toBe(true);
  });

  it('reports remaining headroom while healthy', async () => {
    const kv = workingKV();
    const first = await rateLimit(kv, 'headroom', 10, 60);
    expect(first.ok).toBe(true);
    expect(first.limit).toBe(10);
    expect(first.remaining).toBe(9);
  });
});
