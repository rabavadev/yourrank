export interface SessionEnv {
    SESSION_COOKIE_DOMAIN?: string;
    HYPERDRIVE?: unknown;
}
export interface UserRecord {
    id: string;
    email: string;
    slug: string;
    plan: string;
    plan_expires_at: string | null;
    status: string;
    is_admin?: boolean;
}
export declare const COOKIE_NAME = "yr_session";
export declare const SESSION_TTL_S: number;
export declare const SESSION_ROTATE_AFTER_S = 86400;
export declare function readToken(req: Request): string | null;
export declare function cookieDomain(env: SessionEnv): string;
/** Return a Set-Cookie header string that stores `token`. */
export declare function cookieSet(token: string, env?: SessionEnv): string;
/** Return a Set-Cookie header string that clears the session. */
export declare function cookieClear(env?: SessionEnv): string;
/** Create a new session for `userId`. Returns the raw token (cookie value). */
export declare function createSession(env: SessionEnv, userId: string): Promise<string>;
/** Delete one session.  Used during logout. */
export declare function destroySession(env: SessionEnv, token: string): Promise<void>;
/**
 * Delete ALL sessions for a user.  Used during password change or admin
 * "log out everywhere".  DB cascade ON DELETE also handles this when the
 * user row is deleted, but explicit call is needed for revoke-all.
 */
export declare function destroyAllUserSessions(env: SessionEnv, userId: string): Promise<void>;
interface ResolveResult {
    userId: string | null;
    cookie: string | null;
}
/**
 * Resolve the current user ID from the request cookie.
 *
 * Reads the session from Postgres. If valid, refreshes the expiry (sliding
 * window) and rotates the token if it's older than SESSION_ROTATE_AFTER_S.
 *
 * Returns { userId, cookie } — cookie is non-null when rotation happened and
 * must be appended to the response as a Set-Cookie header.
 */
export declare function resolveSession(req: Request, env: SessionEnv): Promise<ResolveResult>;
/**
 * Resolve just the user ID (no rotation cookie).
 * Use resolveSession() when you need the rotation cookie.
 */
export declare function currentUserId(req: Request, env: SessionEnv): Promise<string | null>;
export declare function loadUser(env: SessionEnv, userId: string): Promise<UserRecord | null>;
/** Return the current user (or null) and propagate rotation cookie. */
export declare function resolveUser(req: Request, env: SessionEnv): Promise<{
    user: UserRecord | null;
    cookie: string | null;
}>;
/** Return the current user (or null).  Convenience wrapper. */
export declare function currentUser(req: Request, env: SessionEnv): Promise<UserRecord | null>;
export {};
