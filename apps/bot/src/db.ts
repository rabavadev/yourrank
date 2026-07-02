import { Pool, type QueryResultRow } from "pg";
import { config } from "./config.js";

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params as any[]);
  return res.rows;
}

/** Like query() but returns the first row (or undefined). */
export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}
