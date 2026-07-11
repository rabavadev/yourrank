// Static asset server for bundled CSS/JS files
// PERF-007: Asset URLs don't include content hashes (e.g., /assets/leaderboard.a1b2c3.js).
// Content-hash filenames would enable immutable caching (max-age=31536000) and eliminate
// stale cache issues after deploys. This requires a build pipeline change: hash each file,
// inject hashes into HTML templates, and serve with immutable cache-control. Currently
// mitigated by short max-age (24h) — acceptable tradeoff until build infra is set up.
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js, analytics_js, billing_js, bot_setup_js, overlay_js, admin2fa_js, setup_wizard_js, admin2fa_styles_css, setup_styles_css, shell_nav_css, qrcode_js, contact_js, cookie_consent_js } from "../assets_bundled.js";

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

export function serveStaticAsset(path) {
  const entry = ASSET_MAP[path];
  if (entry) {
    return new Response(entry[0], { 
      headers: { 
        "content-type": MIME[entry[1]], 
        // PERF-002: Long cache — assets_bundled.js is regenerated on every deploy
        // (bundled from src/assets/ by build.js), so content changes = new deploy.
        // Browser gets stale asset for max 24h; CDN edge serves for up to 7 days.
        "cache-control": "public, max-age=86400, s-maxage=604800" 
      } 
    });
  }
  return new Response("not found", { status: 404 });
}
