// Data access layer for authentication operations
import { one, exec } from "../../../../shared/db.js";

export async function findUserByEmail(email) {
  return await one("SELECT id FROM users WHERE email=$1", [email]);
}

export async function findUserByCredentials(email) {
  return await one("SELECT id,email,password_hash,password_salt,status FROM users WHERE email=$1", [email]);
}

export async function findSiteByUserId(userId) {
  return await one("SELECT slug FROM sites WHERE user_id=$1", [userId]);
}

export async function findSiteBySlug(slug) {
  return await one("SELECT id FROM sites WHERE slug=$1", [slug]);
}

export async function findUserForReset(email) {
  return await one("SELECT id, email FROM users WHERE email=$1", [email]);
}

export async function findSubscriptionByUserId(userId) {
  return await one("SELECT provider FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1", [userId]);
}

export async function createUser(tx, userId, email, hash, salt) {
  await tx.unsafe("INSERT INTO users (id,email,password_hash,password_salt,plan,status) VALUES ($1,$2,$3,$4,$5,$6)", [userId, email, hash, salt, "free", "active"]);
}

export async function createSite(tx, siteId, userId, slug, name, extraJson) {
  // casino/prize_pool start empty (not "Stake"/"$0"): a fresh page must not
  // claim a Stake partnership or advertise a $0 prize pool before the owner
  // configures it. The public renderer shows neutral copy until these are set.
  await tx.unsafe("INSERT INTO sites (id,user_id,slug,name,casino,prize_pool,period,published,extra_json) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)", [siteId, userId, slug, name, "", "", "Monthly", true, JSON.stringify(extraJson)]);
}

export async function updateUserPassword(userId, hash, salt) {
  await exec("UPDATE users SET password_hash=$1, password_salt=$2, updated_at=now() WHERE id=$3", [hash, salt, userId]);
}

export async function findUserWithTotpSecret(userId) {
  return await one("SELECT totp_secret FROM users WHERE id=$1", [userId]);
}
