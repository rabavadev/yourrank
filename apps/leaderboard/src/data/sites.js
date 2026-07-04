// Data access layer for site operations
import { one } from "../../../../shared/db.js";

export async function findSiteLogoData(slug) {
  return await one("SELECT logo_data FROM sites WHERE slug=$1", [slug]);
}

export async function findSiteStatus(slug) {
  return await one("SELECT s.slug, s.published, (u.status = 'suspended') AS suspended FROM sites s LEFT JOIN users u ON u.id = s.user_id WHERE s.slug=$1", [slug]);
}

export async function findUserTotpSecret(userId) {
  return await one("SELECT totp_secret FROM users WHERE id=$1", [userId]);
}