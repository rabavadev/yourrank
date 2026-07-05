// HTTP response headers constants

export const MIME = {
  ".css": "text/css; charset=utf-8", 
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", 
  ".svg": "image/svg+xml",
};

export const HTML = { 
  "content-type": "text/html; charset=utf-8", 
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff", 
  "Referrer-Policy": "strict-origin-when-cross-origin" 
};

// Hardened headers for the authenticated/app pages (login, signup, forgot,
// reset, dashboard, admin). The public leaderboard keeps the plain HTML set
// (it's intentionally iframe-able and loads Google Fonts) so we scope security
// headers only to the pages that hold sessions/credentials. All inline styles
// have been extracted to external CSS files (SEC-713); style-src no longer
// needs 'unsafe-inline'. nosniff + Referrer-Policy are free wins everywhere.
export const SECURE_HTML = {
  "content-type": "text/html; charset=utf-8",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'self' https://telegram.org; connect-src 'self' https://telegram.org; frame-src https://telegram.org; frame-ancestors 'self'",
};

// HTML-escape a value for interpolation into text/attribute context
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function notFoundPage(slug) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>No leaderboard here</h1><p>There's no page at <b>/${esc(slug)}</b> yet.</p><p><a href="/">Back to YourRank</a></p></div></body></html>`;
}

export function suspendedPage() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unavailable</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}</style></head>
<body><div class="b"><h1>This page is unavailable</h1><p>The owner's account is suspended.</p><p><a href="/">YourRank</a></p></div></body></html>`;
}

export function comingSoonPage(slug) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coming Soon</title>
<style>body{background:#0b0b0c;color:#ededf0;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0}.b{text-align:center}a{color:#c8ff00}h1{font-size:48px;margin:0 0 12px}p{color:rgba(255,255,255,0.5);font-size:16px}</style></head>
<body><div class="b"><h1>🚧 Coming Soon</h1><p>This leaderboard is being set up. Check back soon!</p><p><a href="/">YourRank</a></p></div></body></html>`;
}
