// Postgres data layer for the bot Worker, on postgres.js.
// Single persistent connection per isolate (Hyperdrive pools globally to
// Supabase's direct host). Exposes the SAME query<T>()/one<T>() API.
import postgres from "postgres";
import { config } from "./config.js";

let sql: ReturnType<typeof postgres> | null = null;
function getSql(): ReturnType<typeof postgres> {
  if (!sql) {
    const url = config.databaseUrl;
    if (!url) throw new Error("DATABASE_URL is not configured (set the HYPERDRIVE binding or DATABASE_URL secret)");
    sql = postgres(url, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 30,
      debug: false,
    });
  }
  return sql;
}

function resetSql() {
  try { if (sql) sql.end({ timeout: 1 }); } catch {}
  sql = null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  try {
    const rows = (await getSql().unsafe(text, params as any[])) as unknown[];
    return rows.map((r) => ({ ...(r as Record<string, unknown>) })) as unknown as T[];
  } catch {
    resetSql();
    await sleep(50);
    const rows = (await getSql().unsafe(text, params as any[])) as unknown[];
    return rows.map((r) => ({ ...(r as Record<string, unknown>) })) as unknown as T[];
  }
}

export async function exec(text: string, params: unknown[] = []): Promise<any> {
  try {
    return await getSql().unsafe(text, params as any[]);
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (/23505|23514|23503|23502|23506/.test(msg)) throw e;
    resetSql();
    await sleep(50);
    return await getSql().unsafe(text, params as any[]);
  }
}

/** Like query() but returns the first row (or undefined). */
export async function one<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

/**
 * A transaction-scoped handle. Mirrors query()/one() so callers use the same
 * shape, but every statement runs on the SAME connection inside one
 * BEGIN/COMMIT. postgres.js drives the transaction boundary for us.
 */
export interface Tx {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
  one<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | undefined>;
}

/**
 * Run `fn` inside a database transaction. Commits on success, rolls back on
 * any throw — postgres.js drives both automatically via sql.begin(callback).
 * Use this for multi-statement writes that must all land or none land (e.g.
 * recording a payment + activating a plan).
 *
 * Note: no in-band retry here (unlike query()). A retry mid-transaction would
 * be unsafe — the caller must decide whether re-running the whole unit is OK.
 * With max:1, sql.begin reserves the single warm connection; within one Worker
 * isolate that is fine because a request's writes are sequential.
 */
export async function withTransaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R> {
  // sql.begin reserves one connection, issues BEGIN, runs the callback, then
  // commits on resolve / rolls back on reject (and re-throws the error).
  const result = await getSql().begin(async (sqlTx) => {
    const tx: Tx = {
      async query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
        const rows = (await sqlTx.unsafe(text, params as any[])) as unknown[];
        return rows.map((r) => ({ ...(r as Record<string, unknown>) })) as unknown as T[];
      },
      async one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | undefined> {
        const rows = (await sqlTx.unsafe(text, params as any[])) as unknown[];
        return rows[0] ? ({ ...(rows[0] as Record<string, unknown>) } as T) : undefined;
      },
    };
    return fn(tx);
  });
  // postgres.js types begin()'s return as UnwrapPromiseArray<R>; for a plain
  // (non-promise-array) R that resolves to R, so this cast is sound.
  return result as unknown as R;
}
