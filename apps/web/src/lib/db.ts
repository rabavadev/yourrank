import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function setDatabaseUrl(): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  const e = env as any;

  const hyperdrive = e.HYPERDRIVE as { connectionString?: string } | undefined;
  if (hyperdrive?.connectionString) {
    process.env.DATABASE_URL = hyperdrive.connectionString;
    return hyperdrive.connectionString;
  }

  if (typeof e.DATABASE_URL === "string" && e.DATABASE_URL) {
    process.env.DATABASE_URL = e.DATABASE_URL;
    return e.DATABASE_URL;
  }

  if (typeof process !== "undefined" && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error(
    "DATABASE_URL is not configured (set the HYPERDRIVE binding or DATABASE_URL secret)"
  );
}
