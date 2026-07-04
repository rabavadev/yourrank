// Custom domain resolution with in-memory caching
// Maps custom domain hostnames to site slugs for serving leaderboards on custom domains
import { one } from "../../../../shared/db.js";

const CUSTOM_DOMAIN_CACHE = new Map();
const CUSTOM_DOMAIN_TTL = 60_000; // 60 seconds

export async function resolveCustomDomain(env, host) {
  const now = Date.now();
  const cached = CUSTOM_DOMAIN_CACHE.get(host);
  if (cached && cached.expires > now) return cached.slug;
  try {
    const row = await one("SELECT s.slug FROM sites s JOIN users u ON u.id = s.user_id WHERE s.custom_domain=$1 AND s.published=true AND u.status != 'suspended'", [host]);
    const slug = row?.slug || null;
    CUSTOM_DOMAIN_CACHE.set(host, { slug, expires: now + CUSTOM_DOMAIN_TTL });
    return slug;
  } catch {
    return cached?.slug || null;
  }
}

export function isCustomHost(host) {
  return host !== "yourrank.site" && host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".yourrank.site");
}
