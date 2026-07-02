import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  publicBaseUrl: required("PUBLIC_BASE_URL").replace(/\/+$/, ""),
  tokenEncKey: Buffer.from(required("TOKEN_ENC_KEY"), "hex"),
  adminApiKey: required("ADMIN_API_KEY"),
  ipHashSalt: required("IP_HASH_SALT"),
  port: Number(process.env.PORT ?? 3000),
};

if (config.tokenEncKey.length !== 32) {
  throw new Error("TOKEN_ENC_KEY must be 32 bytes of hex (64 hex characters)");
}
