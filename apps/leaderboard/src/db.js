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
      idle_timeout: 5,   // drop idle connections fast — stale ones cause 500s
      connect_timeout: 30,
      debug: false,
    });
  }
  return sql;
}

/** Kill the cached sql instance so the next getSql() creates a fresh one. */
function resetSql() {
  try { if (sql) sql.end({ timeout: 1 }); } catch {}
  sql = null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Core query runner — tries up to 3 times with fresh connections on failure. */
async function runWithRetry(fn) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await getSql().unsafe(fn.text, fn.params);
      return rows.map((r) => ({ ...r }));
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      // Constraint violations — don't retry, caller needs to see these
      if (/23505|23514|23503|23502|23506/.test(msg)) throw e;
      // Connection error — destroy and retry with a fresh connection
      resetSql();
      if (attempt < 2) await sleep(100 * (attempt + 1));
    }
  }
  throw lastErr;
}

/** Run a parameterized READ query and return the rows array. */
export async function query(text, params = []) {
  return runWithRetry({ text, params });
}

/** Like query() but returns the first row (or undefined). */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}

/** Run a parameterized mutation (INSERT/UPDATE/DELETE). Same retry logic
 *  as query() — fresh connection on each retry, no retry on constraint errors. */
export async function exec(text, params = []) {
  return runWithRetry({ text, params });
}

/** Like exec() but returns the first row (or undefined). */
export async function execOne(text, params = []) {
  const rows = await exec(text, params);
  return rows[0];
}
