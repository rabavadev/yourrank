// Postgres data layer for the leaderboard Worker.
// Mirrors casino-bot-platform/src/db.ts so both Workers share one API.
//
// The Pool is created lazily on first use so that index.js's fetch handler
// has a chance to populate process.env.DATABASE_URL (from the Hyperdrive
// binding) before the Pool reads the connection string.
import pg from "pg";
const { Pool } = pg;

let pool = null;
function getPool() {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

/** Run a query and return the rows array. */
export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

/** Like query() but returns the first row (or undefined). */
export async function one(text, params = []) {
  const rows = await query(text, params);
  return rows[0];
}
