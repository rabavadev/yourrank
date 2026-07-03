// Postgres data layer for the leaderboard Worker, on postgres.js.
//
// postgres.js (Cloudflare-listed Hyperdrive driver) gave the best reliability
// of the approaches tried: a single persistent connection per Worker isolate,
// kept warm, with Hyperdrive doing the global pooling to Supabase's DIRECT
// host (per Cloudflare's Supabase guide, use the direct connection, not the
// pooler). node-pg's per-request Client was worse (each request paid a full
// connect); node-pg's persistent Pool was middling.
//
// Exposes query()/one() for reads (safe to retry) and exec()/execOne() for
// mutations (no retry — callers must handle idempotency themselves). index.js
// populates process.env.DATABASE_URL from env.HYPERDRIVE.connectionString at
// the top of fetch, before any query runs.
import postgres from "postgres";

let sql = null;
export function getSql() {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, {
      max: 1,            // one connection per isolate; Hyperdrive pools globally
      prepare: false,    // we pass already-$n-parameterized SQL from call sites
      idle_timeout: 20,  // keep the connection warm briefly between requests
      connect_timeout: 30,
      debug: false,
    });
  }
  return sql;
}

/** Kill the cached sql instance so the next getSql() creates a fresh one.
 *  Called when a query fails with a connection-level error. */
function resetSql() {
  try { if (sql) sql.end({ timeout: 1 }); } catch {}
  sql = null;
}

/** Small delay to let the old connection fully close before reconnecting. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Run a parameterized READ query ($1, $2, ...) and return the rows array.
 *  Retries once with a FRESH connection if the cached one is stale. */
export async function query(text, params = []) {
  try {
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  } catch (e) {
    // Connection went stale — destroy it and retry with a fresh one
    resetSql();
    await sleep(50);
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  }
}

/** Like query() but returns the first row (or undefined). */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}

/** Run a parameterized mutation (INSERT/UPDATE/DELETE). Retries once with a
 *  FRESH connection on connection errors, but NOT on constraint violations. */
export async function exec(text, params = []) {
  try {
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  } catch (e) {
    const msg = String(e?.message || e);
    // Don't retry on constraint violations — only on connection errors
    if (/23505|23514|23503|23502|23506/.test(msg)) throw e;
    // Stale connection — destroy and retry with a fresh one
    resetSql();
    await sleep(50);
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  }
}

/** Like exec() but returns the first row (or undefined). */
export async function execOne(text, params = []) {
  const rows = await exec(text, params);
  return rows[0];
}
