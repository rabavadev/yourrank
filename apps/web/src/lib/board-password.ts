// @ts-nocheck
// Stateless password-token helpers for password-protected public boards.
// Adapted from apps/leaderboard/src/board-password.js.

import { verifyPassword, safeEqual } from "./auth";

const enc = new TextEncoder();
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const TOKEN_PREFIX = "yr_boardpass_";

function cookieName(slug: string) {
  return `${TOKEN_PREFIX}${slug}`;
}

function bytesToHex(b: ArrayBuffer) {
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(keyString: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(keyString),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return bytesToHex(sig);
}

export async function verifyBoardPassword(password: string, site: { password_hash?: string; password_salt?: string }) {
  if (!site.password_hash || !site.password_salt) return false;
  const v = await verifyPassword(password, site.password_salt, site.password_hash);
  return v.ok;
}

export async function issueBoardPasswordToken(site: { password_hash?: string; slug: string }, maxAge = COOKIE_MAX_AGE) {
  const expiry = Math.floor(Date.now() / 1000) + maxAge;
  const sig = await hmacSha256Hex(site.password_hash, `${site.slug}:${expiry}`);
  return `${site.slug}:${expiry}:${sig}`;
}

function parseBoardPasswordToken(token: string) {
  const parts = String(token).split(":");
  if (parts.length !== 3) return null;
  return { slug: parts[0], expiry: Number(parts[1]), sig: parts[2] };
}

export async function verifyBoardPasswordToken(token: string, site: { password_hash?: string; slug: string }) {
  const t = parseBoardPasswordToken(token);
  if (!t) return false;
  if (t.slug !== site.slug) return false;
  if (Number.isNaN(t.expiry) || t.expiry * 1000 < Date.now()) return false;
  if (!site.password_hash) return false;
  const expected = await hmacSha256Hex(site.password_hash, `${t.slug}:${t.expiry}`);
  return safeEqual(expected, t.sig);
}

export function boardPasswordCookieFromRequest(request: Request, site: { slug: string }) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;)\\s*${cookieName(site.slug)}=([^;]+)`));
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

export async function verifyBoardPasswordCookie(request: Request, site: { password_hash?: string; slug: string }) {
  const token = boardPasswordCookieFromRequest(request, site);
  if (!token) return false;
  return verifyBoardPasswordToken(token, site);
}

export function boardPasswordSetCookieHeader(
  site: { slug: string; password_hash?: string },
  token: string,
  opts: { isCustomDomain?: boolean } = {},
) {
  const isCustomDomain = !!opts.isCustomDomain;
  const path = isCustomDomain ? "/" : `/${site.slug}`;
  return `${cookieName(site.slug)}=${encodeURIComponent(token)}; Path=${path}; Max-Age=${COOKIE_MAX_AGE}; Secure; SameSite=Lax; HttpOnly`;
}
