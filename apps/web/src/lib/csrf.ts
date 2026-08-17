import { safeEqual } from "./auth";

const CSRF_TOKEN_BYTES = 32;
const CSRF_MAX_AGE = 86400;

export const CSRF_EXEMPT = new Set([
  "/api/billing/ipn",
  "/api/lead",
  "/api/track/copy",
  "/api/scores",
  "/api/postback",
  "/api/csp-report",
  "/webhooks/kick",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot",
  "/api/auth/reset",
  "/api/auth/verify",
  "/api/auth/resend-verification",
]);

export function generateCsrfToken(): string {
  return [...crypto.getRandomValues(new Uint8Array(CSRF_TOKEN_BYTES))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function csrfCookieDomain(): string {
  const raw =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.SESSION_COOKIE_DOMAIN) ||
    "";
  return raw && raw !== "undefined" ? raw : ".yourrank.site";
}

export function csrfCookie(token: string): string {
  return `__csrf=${token}; Path=/; Domain=${csrfCookieDomain()}; Secure; SameSite=Lax; Max-Age=${CSRF_MAX_AGE}`;
}

export function readCsrfToken(cookieHeader: string): string | null {
  const m = cookieHeader.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : null;
}

export function verifyCsrfToken(cookieHeader: string, header: string | null): boolean {
  const cookie = readCsrfToken(cookieHeader);
  if (!cookie || !header) return false;
  return safeEqual(cookie, header);
}

export function shouldRequireCsrf(method: string, path: string): boolean {
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())) return false;
  return !CSRF_EXEMPT.has(path);
}

export function ensureCsrfCookie(cookieHeader: string, token: string): string {
  const existing = cookieHeader.match(/(?:^|;\s*)__csrf=[^;]+/);
  if (existing) {
    return cookieHeader.replace(existing[0], `; __csrf=${token}`).replace(/^; /, "");
  }
  return cookieHeader ? `${cookieHeader}; __csrf=${token}` : `__csrf=${token}`;
}
