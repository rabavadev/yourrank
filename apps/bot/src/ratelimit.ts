// Re-export the shared rate limiter so existing bot imports keep working.
// The shared implementation lives in packages/shared/src/ratelimit.ts and supports
// both KV and Durable Object backends via RL_BACKEND env var.
export { rateLimit } from "@yourrank/shared/ratelimit";
export type { RateLimitKV, RateLimitEnv, RateLimitResult } from "@yourrank/shared/ratelimit";
