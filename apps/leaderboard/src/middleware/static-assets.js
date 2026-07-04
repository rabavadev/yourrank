// Static asset server for bundled CSS/JS files
import { leaderboard_css, leaderboard_js, app_css, auth_js, dashboard_js, admin_js, landing_css, landing_js, analytics_js, billing_js, bot_setup_js, overlay_js } from "../assets_bundled.js";

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
};

export function serveStaticAsset(path) {
  const entry = ASSET_MAP[path];
  if (entry) {
    return new Response(entry[0], { 
      headers: { 
        "content-type": MIME[entry[1]], 
        "cache-control": "public, max-age=300, s-maxage=3600" 
      } 
    });
  }
  return new Response("not found", { status: 404 });
}
