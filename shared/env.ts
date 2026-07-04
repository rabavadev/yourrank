// Shared environment population helper for both Workers
// Copies Cloudflare Workers bindings to process.env so shared modules
// (which read process.env, not c.env) work unchanged.

export function populateEnv(env: Record<string, any>, options?: { setGlobalEnv?: boolean }): void {
  if (typeof (globalThis as any).process === "undefined") {
    (globalThis as any).process = { env: {} };
  }
  const pe = (globalThis as any).process.env;
  
  // Prefer the direct DATABASE_URL secret over Hyperdrive — the Hyperdrive
  // config currently has an empty password so its connection string is
  // unusable. The direct URL includes sslmode=require for Supabase TLS.
  let hdConn: string | null = null;
  try { hdConn = env.HYPERDRIVE?.connectionString ?? null; } catch {}
  pe.DATABASE_URL = env.DATABASE_URL || hdConn;
  
  // Common bindings used by both Workers
  pe.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
  pe.TOKEN_ENC_KEY = env.TOKEN_ENC_KEY;
  pe.ADMIN_API_KEY = env.ADMIN_API_KEY;
  pe.IP_HASH_SALT = env.IP_HASH_SALT;
  pe.SESSION_COOKIE_DOMAIN = env.SESSION_COOKIE_DOMAIN;
  
  // Bot-specific bindings
  pe.LOGIN_BOT_TOKEN = env.LOGIN_BOT_TOKEN;
  pe.LOGIN_BOT_USERNAME = env.LOGIN_BOT_USERNAME;
  pe.ALLOW_DEV_LOGIN = env.ALLOW_DEV_LOGIN;
  pe.PLATFORM_BOT_TOKEN = env.PLATFORM_BOT_TOKEN;
  pe.PLATFORM_WEBHOOK_SECRET = env.PLATFORM_WEBHOOK_SECRET;
  
  // Leaderboard-specific: set global env reference for KV-backed cache invalidation
  if (options?.setGlobalEnv) {
    (globalThis as any).__yr_env = env;
  }
}