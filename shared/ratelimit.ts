// ------------------------------------------------------------------
// Shared rate limiter for YourRank — KV or Durable Object backend.
//
// Same public API. First argument can be:
//   - A KV namespace (legacy, direct KV access)
//   - An env object with SESSIONS and optionally RATE_LIMITER_DO + RL_BACKEND
//
// When RL_BACKEND=do and RATE_LIMITER_DO binding exists, uses Durable Objects.
// Otherwise falls back to KV.
//
// Backend failures are logged and are FAIL-OPEN by default so a broken rate
// limiter cannot take the site down. Set RL_FAIL_OPEN=false (wrangler.toml
// var or env secret) to harden critical paths and fail-closed instead.
// ------------------------------------------------------------------

export interface RateLimitKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfter: number;
}

export interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

export interface DurableObjectId {
  toString(): string;
}

export interface DurableObjectStub {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export interface RateLimitEnv {
  SESSIONS?: RateLimitKV;
  RATE_LIMITER_DO?: DurableObjectNamespace;
  RL_BACKEND?: string;
  RL_FAIL_OPEN?: string;
}

function isFailOpen(env: RateLimitEnv | undefined): boolean {
  if (!env || typeof env !== "object") return true;
  const v = env.RL_FAIL_OPEN;
  if (v === undefined || v === null) return true;
  return String(v).toLowerCase() !== "false";
}

function logRateLimitFailure(
  backend: string,
  error: unknown,
  failOpen: boolean,
  id: string,
  limit: number,
  windowSec: number
): void {
  const level = failOpen ? "warn" : "error";
  const message = error instanceof Error ? error.message : String(error ?? "unknown");
  console.error(
    JSON.stringify({
      level,
      ctx: "rateLimit",
      backend,
      fail_open: failOpen,
      action: failOpen ? "allow_request" : "block_request",
      id,
      limit,
      windowSec,
      error: message,
      ts: new Date().toISOString(),
    })
  );
}

function failOpenResult(
  limit: number,
  windowSec: number,
  failOpen: boolean
): RateLimitResult {
  if (failOpen) {
    return { ok: true, remaining: limit, limit, retryAfter: 0 };
  }
  return { ok: false, remaining: 0, limit, retryAfter: windowSec };
}

/**
 * Count one hit against `id` in a `windowSec` window allowing `limit` hits.
 * First argument: KV namespace OR env object (auto-detected).
 * Backend failures are logged. RL_FAIL_OPEN controls whether the request is
 * allowed (default) or blocked when the backend is unavailable.
 */
export async function rateLimit(
  kvOrEnv: RateLimitKV | RateLimitEnv | undefined,
  id: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  // Auto-detect: if it has get/put methods, it's a KV namespace
  if (
    kvOrEnv &&
    typeof (kvOrEnv as RateLimitKV).get === "function" &&
    typeof (kvOrEnv as RateLimitKV).put === "function"
  ) {
    // KV namespace passed directly (bot Worker pattern); no env to read RL_FAIL_OPEN from.
    return rateLimitKV(kvOrEnv as RateLimitKV, id, limit, windowSec, true);
  }

  // Env object passed (leaderboard Worker pattern)
  const env = kvOrEnv as RateLimitEnv | undefined;
  const failOpen = isFailOpen(env);

  if (!env) {
    logRateLimitFailure("none", "no env provided", failOpen, id, limit, windowSec);
    return failOpenResult(limit, windowSec, failOpen);
  }

  const backend = env.RL_BACKEND || "kv";
  if (backend === "do" && env.RATE_LIMITER_DO) {
    return rateLimitDO(env.RATE_LIMITER_DO, id, limit, windowSec, failOpen);
  }

  // No DO configured; fall back to SESSIONS KV.
  if (!env.SESSIONS) {
    logRateLimitFailure("none", "no SESSIONS KV binding", failOpen, id, limit, windowSec);
    return failOpenResult(limit, windowSec, failOpen);
  }
  return rateLimitKV(env.SESSIONS, id, limit, windowSec, failOpen);
}

// --- Durable Object backend ---

async function rateLimitDO(
  ns: DurableObjectNamespace,
  id: string,
  limit: number,
  windowSec: number,
  failOpen: boolean
): Promise<RateLimitResult> {
  try {
    const doId = ns.idFromName(`rl:${id}`);
    const stub = ns.get(doId);
    const res = await stub.fetch("https://do/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ limit, windowSec }),
    });

    if (!res.ok) {
      logRateLimitFailure("do", `DO returned ${res.status}`, failOpen, id, limit, windowSec);
      return failOpenResult(limit, windowSec, failOpen);
    }

    return (await res.json()) as RateLimitResult;
  } catch (err) {
    logRateLimitFailure("do", err, failOpen, id, limit, windowSec);
    return failOpenResult(limit, windowSec, failOpen);
  }
}

// --- KV backend (original implementation) ---

async function rateLimitKV(
  kv: RateLimitKV | undefined,
  id: string,
  limit: number,
  windowSec: number,
  failOpen: boolean
): Promise<RateLimitResult> {
  if (!kv) {
    logRateLimitFailure("kv", "no KV binding", failOpen, id, limit, windowSec);
    return failOpenResult(limit, windowSec, failOpen);
  }

  const window = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${id}:${window}`;
  const retryAfter = windowSec - (Math.floor(Date.now() / 1000) % windowSec);

  let current: number;
  try {
    current = Number((await kv.get(key)) ?? 0);
  } catch (err) {
    logRateLimitFailure("kv", err, failOpen, id, limit, windowSec);
    return failOpenResult(limit, windowSec, failOpen);
  }

  if (current >= limit) {
    return { ok: false, remaining: 0, limit, retryAfter };
  }

  const used = current + 1;
  try {
    await kv.put(key, String(used), { expirationTtl: windowSec });
  } catch (err) {
    logRateLimitFailure("kv", err, failOpen, id, limit, windowSec);
    // If we cannot persist the count, fail-closed users block; fail-open users
    // allow but have already been warned. Either way we cannot return a reliable
    // remaining count, so return the conservative result for the chosen mode.
    return failOpenResult(limit, windowSec, failOpen);
  }

  return { ok: true, remaining: Math.max(0, limit - used), limit, retryAfter };
}
