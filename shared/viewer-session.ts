// ============================================================================
//  YourRank — VIEWER SESSION (canonical TypeScript source)
//
//  Cookie:      yr_viewer
//  Cookie domain: .yourrank.site (or SESSION_COOKIE_DOMAIN)
//  Storage:     Postgres "viewer_sessions" table
//  Token:       64-hex-char (32 random bytes), hashed with SHA-256 in DB.
//
//  Viewers are a separate identity from streamer users, so they use a
//  separate cookie and session table.
// ============================================================================

import { one, exec, query } from "./db.js";
import { hashToken } from "./crypto.js";

export interface ViewerSessionEnv {
  SESSION_COOKIE_DOMAIN?: string;
  ENVIRONMENT?: string;
}

export interface ViewerRecord {
  id: string;
  kick_user_id: string | null;
  kick_username: string | null;
  discord_user_id: string | null;
  discord_username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const VIEWER_COOKIE_NAME = "yr_viewer";
export const VIEWER_SESSION_TTL_S = 30 * 86400;    // 30 days
export const VIEWER_SESSION_ROTATE_AFTER_S = 86400; // 24 h
const VIEWER_COOKIE_DOMAIN = ".yourrank.site";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newViewerToken(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

function cookieDomain(env: ViewerSessionEnv): string {
  return env.SESSION_COOKIE_DOMAIN || VIEWER_COOKIE_DOMAIN;
}

function cookieAttrs(env?: ViewerSessionEnv): string {
  const domain = env ? cookieDomain(env) : VIEWER_COOKIE_DOMAIN;
  const secure = env?.ENVIRONMENT === "development" ? "" : "Secure; ";
  return `HttpOnly; ${secure}SameSite=Lax; Domain=${domain}; Path=/`;
}

export function viewerCookieSet(token: string, env?: ViewerSessionEnv): string {
  return `${VIEWER_COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttrs(env)}; Max-Age=${VIEWER_SESSION_TTL_S}`;
}

export function viewerCookieClear(env?: ViewerSessionEnv): string {
  return `${VIEWER_COOKIE_NAME}=; ${cookieAttrs(env)}; Max-Age=0`;
}

export function readViewerToken(req: Request): string | null {
  const header = req.headers.get("cookie") || "";
  const m = header.match(new RegExp(`(?:^|;\\s*)${VIEWER_COOKIE_NAME}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function createViewerSession(_env: ViewerSessionEnv, viewerId: string): Promise<string> {
  const token = newViewerToken();
  const tokenHash = await hashToken(token);
  await exec(
    `INSERT INTO viewer_sessions (token, viewer_id, created_at, expires_at)
     VALUES ($1, $2, now(), now() + make_interval(secs => $3))
     ON CONFLICT (token) DO NOTHING`,
    [tokenHash, viewerId, VIEWER_SESSION_TTL_S]
  );
  return token;
}

export async function destroyViewerSession(_env: ViewerSessionEnv, token: string | null): Promise<void> {
  if (!token) return;
  const tokenHash = await hashToken(token);
  await exec("DELETE FROM viewer_sessions WHERE token = $1", [tokenHash]);
}

interface ResolveResult {
  viewerId: string | null;
  cookie: string | null;
}

export async function resolveViewerSession(req: Request, env: ViewerSessionEnv): Promise<ResolveResult> {
  const token = readViewerToken(req);
  if (!token) return { viewerId: null, cookie: null };
  const tokenHash = await hashToken(token);

  const row = await query(
    `SELECT viewer_id, extract(epoch FROM now() - created_at)::int AS age
       FROM viewer_sessions
      WHERE token = $1 AND expires_at > now()`,
    [tokenHash]
  );
  if (!row || row.length === 0) return { viewerId: null, cookie: null };

  const viewerId = row[0].viewer_id as string;
  const age = Number(row[0].age || 0);

  // Rotate session if older than threshold.
  if (age > VIEWER_SESSION_ROTATE_AFTER_S) {
    try {
      const rotated = newViewerToken();
      const rotatedHash = await hashToken(rotated);
      const updated = await exec(
        `UPDATE viewer_sessions
            SET token = $1, created_at = now(), expires_at = now() + make_interval(secs => $2)
          WHERE token = $3
        RETURNING token`,
        [rotatedHash, VIEWER_SESSION_TTL_S, tokenHash]
      );
      if (updated && updated.length > 0) {
        return { viewerId, cookie: viewerCookieSet(rotated, env) };
      }
    } catch {
      console.error("[viewer-session] rotation failed, serving with old token");
    }
  }

  // Sliding-window TTL refresh.
  exec(
    "UPDATE viewer_sessions SET expires_at = now() + make_interval(secs => $1) WHERE token = $2",
    [VIEWER_SESSION_TTL_S, tokenHash]
  ).catch((e) => console.error("[viewer-session] TTL refresh failed:", (e as Error)?.message));

  return { viewerId, cookie: null };
}

export async function loadViewer(_env: ViewerSessionEnv, viewerId: string): Promise<ViewerRecord | null> {
  try {
    return (await one<ViewerRecord>(
      `SELECT id, kick_user_id, kick_username, discord_user_id, discord_username, avatar_url, created_at
         FROM viewers WHERE id = $1`,
      [viewerId]
    )) ?? null;
  } catch (e) {
    console.error("[viewer-session] loadViewer failed:", (e as Error)?.message ?? e);
    return null;
  }
}

export async function resolveViewer(
  req: Request,
  env: ViewerSessionEnv
): Promise<{ viewer: ViewerRecord | null; cookie: string | null }> {
  const { viewerId, cookie } = await resolveViewerSession(req, env);
  if (!viewerId) return { viewer: null, cookie: null };
  const viewer = await loadViewer(env, viewerId);
  return { viewer, cookie };
}
