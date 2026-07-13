// Static asset server for bundled CSS/JS files.
// Asset URLs don't include content hashes (e.g., /assets/leaderboard.a1b2c3.js),
// so we can't cache them immutably. Instead we attach a content-derived ETag and
// force revalidation (no-cache): browsers/CDN keep the file but revalidate before
// use, so a deploy that changes an asset is picked up immediately (new ETag →
// full body) while unchanged assets cost only a cheap 304. This avoids the stale
// cache after deploys that a long max-age caused (a fix could sit unseen for up to
// 24h in the browser / 7d at the CDN edge).
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js, analytics_js, billing_js, attribution_js, bot_setup_js, overlay_js, admin2fa_js, setup_wizard_js, admin2fa_styles_css, setup_styles_css, shell_nav_css, qrcode_js, contact_js, cookie_consent_js } from "../assets_bundled.js";

const MIME = {
  ".css": "text/css; charset=utf-8", 
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", 
  ".svg": "image/svg+xml",
};

const ASSET_MAP = {
    "/assets/leaderboard.css": [leaderboard_css, ".css"],
    "/assets/leaderboard.js": [leaderboard_js, ".js"],
    "/assets/app.css": [app_css, ".css"],
    "/assets/auth.js": [auth_js, ".js"],
    "/assets/dashboard.js": [dashboard_js, ".js"],
    "/assets/admin.js": [admin_js, ".js"],
    "/assets/landing.css": [landing_css, ".css"],
    "/assets/landing.js": [landing_js, ".js"],
    "/assets/analytics.js": [analytics_js, ".js"],
    "/assets/billing.js": [billing_js, ".js"],
    "/assets/attribution.js": [attribution_js, ".js"],
    "/assets/bot-setup.js": [bot_setup_js, ".js"],
    "/assets/overlay.js": [overlay_js, ".js"],
    "/assets/admin2fa.js": [admin2fa_js, ".js"],
    "/assets/setup-wizard.js": [setup_wizard_js, ".js"],
    "/assets/admin2fa-styles.css": [admin2fa_styles_css, ".css"],
    "/assets/setup-styles.css": [setup_styles_css, ".css"],
    "/assets/shell-nav.css": [shell_nav_css, ".css"],
    "/assets/qrcode.js": [qrcode_js, ".js"],
    "/assets/contact.js": [contact_js, ".js"],
    "/assets/cookie-consent.js": [cookie_consent_js, ".js"],
  };

// FNV-1a 32-bit hash — synchronous, dependency-free, good enough to detect
// content changes between deploys for cache validation.
function contentHash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

// Precompute a strong ETag per asset once at module load.
const ETAGS = {};
for (const [p, entry] of Object.entries(ASSET_MAP)) {
  ETAGS[p] = `"${contentHash(entry[0])}"`;
}

export function serveStaticAsset(path, request) {
  const entry = ASSET_MAP[path];
  if (!entry) return new Response("not found", { status: 404 });

  const etag = ETAGS[path];
  const headers = {
    "content-type": MIME[entry[1]],
    "cache-control": "public, no-cache",
    "etag": etag,
  };

  const inm = request?.headers?.get?.("if-none-match");
  if (inm && inm.split(",").some((t) => t.replace(/^W\//, "").trim() === etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(entry[0], { headers });
}
