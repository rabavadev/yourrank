// SEC-108: CSRF token helpers. Tokens are stored in a __csrf cookie (readable
// by JS) and must be echoed in a X-CSRF-Token header on every state-changing
// POST/PUT/DELETE. SameSite=Lax already blocks cross-site POST forms, but
// this adds defense-in-depth against XSS exfiltration.
export function generateCsrfToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function csrfCookie(token) {
  const raw = (typeof process !== "undefined" && process.env && process.env.SESSION_COOKIE_DOMAIN) || "";
  const domain = (raw && raw !== "undefined") ? raw : ".yourrank.site";
  return `__csrf=${token}; Path=/; Domain=${domain}; Secure; SameSite=Lax; Max-Age=86400`;
}

// Debug helper — remove after fixing CSRF domain bug
export function csrfDebugDomain() {
  try {
    const hasProcess = typeof process !== "undefined";
    const hasEnv = hasProcess && typeof process.env !== "undefined";
    const raw = hasEnv ? process.env.SESSION_COOKIE_DOMAIN : "N/A";
    const cookie = csrfCookie("test");
    return { hasProcess, hasEnv, rawDomain: String(raw), rawTypeof: typeof raw, cookieHeader: cookie };
  } catch (e) {
    return { error: String(e) };
  }
}

export function readCsrfToken(req) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(/(?:^|;\s*)__csrf=([^;]+)/);
  return m ? m[1] : null;
}

export function verifyCsrf(req) {
  const cookie = readCsrfToken(req);
  const header = req.headers.get("x-csrf-token");
  if (!cookie || !header) return false;
  // Constant-time comparison
  if (cookie.length !== header.length) return false;
  let diff = 0;
  for (let i = 0; i < cookie.length; i++) diff |= cookie.charCodeAt(i) ^ header.charCodeAt(i);
  return diff === 0;
}

// CSRF-exempt paths (no session yet or public endpoints)
export const CSRF_EXEMPT = new Set(["/api/billing/ipn", "/api/lead", "/api/track/copy", "/api/scores", "/api/auth/login", "/api/auth/signup", "/api/auth/forgot", "/api/auth/reset"]);

export function shouldRequireCsrf(method, path) {
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) return false;
  return !CSRF_EXEMPT.has(path);
}
