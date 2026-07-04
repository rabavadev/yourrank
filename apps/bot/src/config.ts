// config values are read LIVE from process.env via getters (see below) because
// worker.ts populates process.env from the Hyperdrive binding at fetch time —
// after this module has already evaluated. Nothing throws at import time so the
// Worker can boot and serve /health before any DB call.

// databaseUrl is read LIVE (getter) rather than snapshotted at module load,
// because worker.ts sets process.env.DATABASE_URL from the HYPERDRIVE binding
// at fetch time — after this module has already evaluated.
export const config = {
  get databaseUrl() {
    return process.env.DATABASE_URL;
  },
  get publicBaseUrl() {
    return (process.env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  },
  get tokenEncKey() {
    return Buffer.from(process.env.TOKEN_ENC_KEY || "", "hex");
  },
  get adminApiKey() {
    return process.env.ADMIN_API_KEY || "";
  },
  get ipHashSalt() {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) throw new Error("IP_HASH_SALT is not configured (required for IP hashing)");
    return salt;
  },
};

// Validate lazily — only complain when a value is actually needed and missing.
// (Called by data-layer code on first use rather than at import time, so the
// Worker can boot and serve /health even before bindings are read.)
// Note: This is a Cloudflare Workers deployment (not Node), so no port config is needed.
export function requireConfig(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
