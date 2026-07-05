// Shared environment population helper for both Workers
// Copies Cloudflare Workers bindings to process.env so shared modules
// (which read process.env, not c.env) work unchanged.

export function populateEnv(env: Record<string, any>, options?: { setGlobalEnv?: boolean }): void {
  if (typeof (globalThis as any).process === "undefined") {
    (globalThis as any).process = { env: {} };
  }
  const pe = (globalThis as any).process.env;
  
  // Prefer Hyperdrive over the direct DATABASE_URL secret. Hyperdrive
  // handles TLS to the origin internally via its local proxy, so the
  // postgres driver connects over plain TCP to localhost — no TLS needed.
  // The postgres.js package's tls.connect() does not work in Workers.
  let hdConn: string | null = null;
  try { hdConn = env.HYPERDRIVE?.connectionString ?? null; } catch {}
  pe.DATABASE_URL = hdConn || env.DATABASE_URL;
  
  // Common bindings used by both Workers.
  // Only set values that are actually defined — process.env coerces
  // everything to strings, so `undefined` becomes the literal "undefined".
  if (env.PUBLIC_BASE_URL !== undefined) pe.PUBLIC_BASE_URL = env.PUBLIC_BASE_URL;
  if (env.TOKEN_ENC_KEY !== undefined) pe.TOKEN_ENC_KEY = env.TOKEN_ENC_KEY;
  if (env.ADMIN_API_KEY !== undefined) pe.ADMIN_API_KEY = env.ADMIN_API_KEY;
  if (env.IP_HASH_SALT !== undefined) pe.IP_HASH_SALT = env.IP_HASH_SALT;
  if (env.SESSION_COOKIE_DOMAIN !== undefined) pe.SESSION_COOKIE_DOMAIN = env.SESSION_COOKIE_DOMAIN;
  
  // Bot-specific bindings
  if (env.LOGIN_BOT_TOKEN !== undefined) pe.LOGIN_BOT_TOKEN = env.LOGIN_BOT_TOKEN;
  if (env.LOGIN_BOT_USERNAME !== undefined) pe.LOGIN_BOT_USERNAME = env.LOGIN_BOT_USERNAME;
  if (env.ALLOW_DEV_LOGIN !== undefined) pe.ALLOW_DEV_LOGIN = env.ALLOW_DEV_LOGIN;
  if (env.PLATFORM_BOT_TOKEN !== undefined) pe.PLATFORM_BOT_TOKEN = env.PLATFORM_BOT_TOKEN;
  if (env.PLATFORM_WEBHOOK_SECRET !== undefined) pe.PLATFORM_WEBHOOK_SECRET = env.PLATFORM_WEBHOOK_SECRET;
  
  // Leaderboard-specific: set global env reference for KV-backed cache invalidation
  if (options?.setGlobalEnv) {
    (globalThis as any).__yr_env = env;
  }
}