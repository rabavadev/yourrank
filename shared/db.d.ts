import postgres from "postgres";
export declare function getSql(): ReturnType<typeof postgres>;
/** Execute a SQL read query with automatic retry on connection errors. */
export declare function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
/** Execute one read with a transaction-local statement timeout. */
export declare function queryWithTimeout<T = Record<string, unknown>>(text: string, params?: unknown[], timeoutMs?: number): Promise<T[]>;
/** Execute a SQL read query and return the first row, or undefined if no rows. */
export declare function one<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T | undefined>;
/** Execute a SQL write statement. NO automatic retry — caller handles idempotency. */
export declare function exec(text: string, params?: unknown[]): Promise<any>;
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
export declare function withTransaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R>;
