// Postgres data layer for the leaderboard Worker, on postgres.js.
//
// postgres.js (Cloudflare-listed Hyperdrive driver) gave the best reliability
// of the approaches tried: a single persistent connection per Worker isolate,
// kept warm, with Hyperdrive doing the global pooling to Supabase's DIRECT
// host (per Cloudflare's Supabase guide, use the direct connection, not the
// pooler). node-pg's per-request Client was worse (each request paid a full
// connect); node-pg's persistent Pool was middling.
//
// Exposes the SAME query()/one() API the rest of the app uses. index.js
// populates process.env.DATABASE_URL from env.HYPERDRIVE.connectionString at
// the top of fetch, before any query runs.
import postgres from "postgres";

let sql = null;
function getSql() {
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

/** Run a parameterized query ($1, $2, ...) and return the rows array.
 *  One retry on the SAME sql instance. Hyperdrive's pooled connection
 *  occasionally throws on first use after an idle period while it re-establishes
 *  the link; a single retry lets the (now-warming) connection handle it instead
 *  of surfacing as a Cloudflare 1101. Non-idempotent callers (INSERTs) should
 *  not rely on this, but every read endpoint benefits. */
export async function query(text, params = []) {
  try {
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  } catch {
    const rows = await getSql().unsafe(text, params);
    return rows.map((r) => ({ ...r }));
  }
}

/** Like query() but returns the first row (or undefined). */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}
