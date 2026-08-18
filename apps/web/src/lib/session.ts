import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  currentUser,
  COOKIE_NAME,
  type UserRecord,
  type SessionEnv,
} from "@yourrank/shared/session";
import { safeNextPath } from "@yourrank/shared/safe-next";

function getDatabaseUrl(env: Record<string, unknown>): string {
  const hyperdrive = env.HYPERDRIVE as { connectionString?: string } | undefined;
  if (hyperdrive?.connectionString) {
    return hyperdrive.connectionString;
  }
  if (typeof env.DATABASE_URL === "string" && env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  if (typeof process !== "undefined" && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    "DATABASE_URL is not configured (set the HYPERDRIVE binding or DATABASE_URL secret)"
  );
}

export async function getCurrentUser(): Promise<UserRecord | null> {
  const { env } = await getCloudflareContext({ async: true });
  const databaseUrl = getDatabaseUrl(env as Record<string, unknown>);

  if (typeof process !== "undefined") {
    process.env.DATABASE_URL = databaseUrl;
  }

  const cookieHeader = (await headers()).get("cookie") ?? "";
  const request = new Request("http://localhost", {
    headers: { cookie: cookieHeader },
  });

  const sessionEnv: SessionEnv = {
    SESSION_COOKIE_DOMAIN:
      typeof process !== "undefined" && process.env.SESSION_COOKIE_DOMAIN
        ? process.env.SESSION_COOKIE_DOMAIN
        : ".yourrank.site",
  };

  return currentUser(request, sessionEnv);
}

export async function requireCurrentUser(
  currentPath: string,
  user?: UserRecord | null,
): Promise<UserRecord> {
  const resolvedUser = user === undefined ? await getCurrentUser() : user;
  if (resolvedUser) return resolvedUser;
  redirect(`/login?next=${encodeURIComponent(safeNextPath(currentPath))}`);
}

export { COOKIE_NAME, type UserRecord };
