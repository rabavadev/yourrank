// HTTP response headers constants

export const MIME = {
  ".css": "text/css; charset=utf-8", 
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", 
  ".svg": "image/svg+xml",
};

// SEC-005-v7: HTML intentionally has NO Content-Security-Policy or X-Frame-Options.
// Public leaderboard pages MUST be iframe-embeddable (streamers embed in OBS/browser
// sources). Authenticated pages (login, dashboard, admin) use SECURE_HTML which
// includes frame-ancestors 'self' and a full CSP. Do NOT add frame restrictions here.
export const HTML = {
  "content-type": "text/html; charset=utf-8",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // SEC-002-v9: Permissive CSP for public pages. Allows iframe embedding (frame-ancestors *)
  // for streamers while blocking inline scripts and data exfiltration as XSS defense-in-depth.
  // style-src includes 'unsafe-inline' because error pages, OBS overlays, and dynamic branding
  // use <style> blocks (nonces would require per-request CSP generation — tracked for future).
  // All style="" attributes have been extracted to CSS classes (SEC-713) for maintainability.
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://telegram.org https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors *; base-uri 'none'; form-action 'self'; upgrade-insecure-requests; report-uri /api/csp-report",
};

// Hardened headers for the authenticated/app pages (login, signup, forgot,
// reset, dashboard, admin). The public leaderboard keeps the plain HTML set
// (it's intentionally iframe-able and loads Google Fonts) so we scope security
// headers only to the pages that hold sessions/credentials. All inline scripts
// are external; style-src still allows 'unsafe-inline' because a few dynamic UI
// elements (progress bars, dashboard widgets) set inline styles via JS/templates.
export const SECURE_HTML = {
  "content-type": "text/html; charset=utf-8",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self'; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests",
};

// HTML-escape a value for interpolation into text/attribute context
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Inject nonce into CSP header for both style-src and script-src.
// Replaces 'unsafe-inline' with 'nonce-xxx' where present, adds nonce otherwise.
export function withNonce(headers, nonce) {
  const csp = headers["Content-Security-Policy"];
  if (!nonce || !csp) return headers;
  const updated = csp
    .replace(/style-src 'self' 'unsafe-inline'/, `style-src 'self' 'nonce-${nonce}'`)
    .replace(/script-src 'self'/, `script-src 'self' 'nonce-${nonce}'`);
  return { ...headers, "Content-Security-Policy": updated };
}

export function notFoundPage(slug, nonce) {
  const n = nonce ? ` nonce="${nonce}"` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Not found</title>
<style${n}>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>No leaderboard here</h1><p>There's no page at <b>/${esc(slug)}</b> yet.</p><p><a href="/">Back to YourRank</a></p></div><script src="/assets/cookie-consent.js" defer></script></body></html>`;
}

export function suspendedPage(nonce) {
  const n = nonce ? ` nonce="${nonce}"` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Unavailable</title>
<style${n}>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>This page is unavailable</h1><p>The owner's account is suspended.</p><p><a href="/">YourRank</a></p></div><script src="/assets/cookie-consent.js" defer></script></body></html>`;
}
