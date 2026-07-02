// Postgres data layer for the bot Worker, on postgres.js.
// Single persistent connection per isolate (Hyperdrive pools globally to
// Supabase's direct host). Exposes the SAME query<T>()/one<T>() API.
import postgres from "postgres";
import { config } from "./config.js";

let sql: ReturnType<typeof postgres> | null = null;
function getSql(): ReturnType<typeof postgres> {
  if (!sql) {
    sql = postgres(config.databaseUrl, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 30,
      debug: false,
    });
  }
  return sql;
}

/** Run a parameterized query ($1, $2, ...) and return the rows array. */
export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const rows = (await getSql().unsafe(text, params as any[])) as unknown[];
  return rows.map((r) => ({ ...(r as Record<string, unknown>) })) as T[];
}

/** Like query() but returns the first row (or undefined). */
export async function one<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}
