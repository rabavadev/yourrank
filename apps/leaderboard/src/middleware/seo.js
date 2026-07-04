// SEO endpoints: robots.txt, sitemap.xml, favicon.ico
import { query } from "../../../shared/db.js";

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

export async function serveSitemapXml(origin) {
  let entries = [
    `<url><loc>${origin}/</loc><priority>1.0</priority></url>`,
    `<url><loc>${origin}/terms</loc><priority>0.3</priority></url>`,
    `<url><loc>${origin}/privacy</loc><priority>0.3</priority></url>`,
    `<url><loc>${origin}/responsible</loc><priority>0.3</priority></url>`,
  ];
  try {
    const sites = await query("SELECT s.slug FROM sites s JOIN users u ON u.id = s.user_id WHERE s.published=true AND u.status != 'suspended'");
    for (const s of sites) {
      entries.push(`<url><loc>${origin}/${encodeURIComponent(s.slug)}</loc><priority>0.8</priority></url>`);
    }
  } catch (e) {
    console.error("sitemap: site query failed:", String(e?.message || e));
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;
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
