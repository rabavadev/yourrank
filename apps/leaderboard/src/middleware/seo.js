// SEO endpoints: robots.txt, sitemap.xml, favicon.ico
import { query } from "../../../../shared/db.js";

export function serveRobotsTxt(origin) {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /admin\nDisallow: /auth\nDisallow: /billing\nSitemap: ${origin}/sitemap.xml\n`, 
    {
      headers: { 
        "content-type": "text/plain; charset=utf-8", 
        "cache-control": "public, max-age=86400" 
      },
    }
  );
}

// PERF-001: L1 in-memory cache for sitemap (per-isolate).
// This addresses both PERF-001 (unbounded queries) and PERF-006 (L1-only = per-isolate).
let sitemapCache = { xml: null, ts: 0 };
const SITEMAP_TTL = 300_000; // 5 minutes L1 TTL

export async function serveSitemapXml(origin, env) {
  // L1: in-memory cache (instant, per-isolate)
  if (sitemapCache.xml && Date.now() - sitemapCache.ts < SITEMAP_TTL) {
    return new Response(sitemapCache.xml, {
      headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" },
    });
  }


  let entries = [
    `<url><loc>${origin}/</loc><priority>1.0</priority></url>`,
    `<url><loc>${origin}/terms</loc><priority>0.3</priority></url>`,
    `<url><loc>${origin}/privacy</loc><priority>0.3</priority></url>`,
    `<url><loc>${origin}/responsible</loc><priority>0.3</priority></url>`,
  ];
  try {
    // PERF-001: LIMIT 5000 prevents unbounded result sets (more than enough for any
    // reasonable leaderboard count). The sitemap spec caps at 50k URLs anyway.
    const sites = await query("SELECT s.slug, s.updated_at FROM sites s JOIN users u ON u.id = s.user_id WHERE s.published=true AND u.status != 'suspended' LIMIT 5000");
    const TEST_SLUG_RE = /^e2e[-_]|^debug[-_]|^del-|^rapid-|^login-debug|^verifyfix|^launch-verify|^devintest|^audittest|^invalid-|^test[-_]/;
    for (const s of sites) {
      if (TEST_SLUG_RE.test(s.slug)) continue;
      const lastmod = s.updated_at ? `<lastmod>${new Date(s.updated_at).toISOString().split("T")[0]}</lastmod>` : "";
      entries.push(`<url><loc>${origin}/${encodeURIComponent(s.slug)}</loc>${lastmod}<priority>0.8</priority></url>`);
    }
  } catch (e) {
    console.error("sitemap: site query failed:", String(e?.message || e));
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  // L1-only cache (KV removed)
  sitemapCache = { xml: sitemap, ts: Date.now() };

  return new Response(sitemap, {
    headers: { 
      "content-type": "application/xml", 
      "cache-control": "public, max-age=3600" 
    },
  });
}

export function serveFavicon() {
  return new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>', 
    {
      headers: { 
        "content-type": "image/svg+xml", 
        "cache-control": "public, max-age=86400" 
      },
    }
  );
}
