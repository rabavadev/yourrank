// Static asset server for bundled CSS/JS files.
// Asset URLs don't include content hashes (e.g. /assets/leaderboard.a1b2c3.js),
// so we can't cache them immutably. Instead we attach a content-derived ETag and
// force revalidation (no-cache): browsers/CDN keep the file but revalidate before
// use, so a deploy that changes an asset is picked up immediately (new ETag →
// full body) while unchanged assets cost only a cheap 304. This avoids the stale
// cache after deploys that a long max-age caused.
import { ASSETS } from "../assets_bundled.js";

const MIME = {
  ".css": "text/css; charset=utf-8", 
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", 
  ".svg": "image/svg+xml",
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
for (const [p, entry] of Object.entries(ASSETS)) {
  ETAGS[p] = `"${contentHash(entry[0])}"`;
}

export function serveStaticAsset(path, request) {
  const entry = ASSETS[path];
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
