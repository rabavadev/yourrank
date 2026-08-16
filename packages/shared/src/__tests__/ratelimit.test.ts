// ============================================================================
//  YourRank — SHARED RATE LIMITER (real executable tests)
//
//  Regression coverage for the "rate limited forever" platform outage: the
//  limiter now FAILS CLOSED by default (RL_FAIL_OPEN unset or false), so a
//  KV/backend problem blocks requests until it recovers. Operators can still
//  opt into fail-open for a specific call by passing RL_FAIL_OPEN=true, or
//  by calling rateLimit with a direct KV object (legacy/test path).
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
// daily write-quota-exhausted state.
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

  it('FAILS CLOSED when no env/RL_FAIL_OPEN is provided', async () => {
    const r = await rateLimit(undefined, 'anything', 5, 60);
    expect(r.ok).toBe(false);
  });

  it('FAILS OPEN when RL_FAIL_OPEN=true', async () => {
    const r = await rateLimit({ RL_FAIL_OPEN: 'true' } as any, 'anything', 5, 60);
    expect(r.ok).toBe(true);
  });

  it('FAILS OPEN when the KV write throws if RL_FAIL_OPEN=true', async () => {
    const env = { SESSIONS: writeFailKV(), RL_FAIL_OPEN: 'true' } as any;
    // Every call reads 0 (nothing ever persists) and the put throws — but the
    // request must still be allowed, not denied.
    for (let i = 0; i < 10; i++) {
      const r = await rateLimit(env, 'quota-test', 3, 60);
      expect(r.ok).toBe(true);
    }
  });

  it('FAILS CLOSED when the KV write throws without RL_FAIL_OPEN', async () => {
    const env = { SESSIONS: writeFailKV() } as any;
    const r = await rateLimit(env, 'quota-test-closed', 3, 60);
    expect(r.ok).toBe(false);
  });

  it('FAILS OPEN when the KV read throws if RL_FAIL_OPEN=true', async () => {
    const env = { SESSIONS: readFailKV(), RL_FAIL_OPEN: 'true' } as any;
    const r = await rateLimit(env, 'read-fail', 5, 60);
    expect(r.ok).toBe(true);
  });

  it('FAILS CLOSED when the KV read throws without RL_FAIL_OPEN', async () => {
    const env = { SESSIONS: readFailKV() } as any;
    const r = await rateLimit(env, 'read-fail-closed', 5, 60);
    expect(r.ok).toBe(false);
  });

  it('reports remaining headroom while healthy', async () => {
    const kv = workingKV();
    const first = await rateLimit(kv, 'headroom', 10, 60);
    expect(first.ok).toBe(true);
    expect(first.limit).toBe(10);
    expect(first.remaining).toBe(9);
  });
});
