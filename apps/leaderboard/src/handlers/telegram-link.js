// Telegram identity linking handler (Phase 5.1)
// Allows users to link their Telegram account to their existing email/password account.
// After linking, the bot dashboard can use the main session.

import { json, bad, requireUser, readJson } from "../auth.js";
import { query, one } from "../../../../shared/db.js";

/**
 * POST /api/auth/telegram/link
 * Link a Telegram identity to the current user's account.
 * Body: { id, first_name, last_name, username, photo_url, auth_date, hash }
 *
 * Verifies the Telegram Login widget payload, then links the telegram_id
 * to the current user. If the telegram_id is already linked to another
 * account, returns an error.
 */
export async function handleTelegramLink(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  if (!env.LOGIN_BOT_TOKEN) return bad("Telegram linking not configured", 503);

  const body = await readJson(request);
  if (!body) return bad("Invalid JSON body");

  const { id, first_name, last_name, username, photo_url, auth_date, hash } = body;

  if (!id || !hash || !auth_date) {
    return bad("Missing required Telegram fields (id, hash, auth_date)");
  }

  // Verify Telegram signature (same as bot dashboard auth)
  // Inline Telegram Login verification (same logic as bot dashboard-auth.ts)
  const fields = { id, first_name, last_name, username, photo_url, auth_date };
  const checkString = Object.keys(fields).sort()
    .filter((k) => fields[k] != null)
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(env.LOGIN_BOT_TOKEN));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(checkString));
  const expected = Buffer.from(sig).toString("hex");
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ hash.charCodeAt(i);
  const isValid = diff === 0;
  if (!isValid) return bad("Invalid Telegram signature", 401);

  // Check freshness (5 minutes max)
  const age = Math.floor(Date.now() / 1000) - Number(auth_date);
  if (age > 300 || age < -30) {
    return bad("Telegram auth payload expired or future-dated");
  }

  const telegramId = Number(id);

  // Check if this Telegram ID is already linked to another user
  const existing = await one(
    "SELECT id, email FROM users WHERE telegram_id = $1",
    [telegramId]
  );

  if (existing && existing.id !== user.id) {
    return bad("This Telegram account is already linked to another user", 409);
  }

  if (existing && existing.id === user.id) {
    // Already linked to this user — update username
    await query(
      "UPDATE users SET telegram_username = $1, updated_at = now() WHERE id = $2",
      [username || null, user.id]
    );
    return json({ ok: true, linked: true, message: "Telegram account already linked" });
  }

  // Link Telegram identity to this user
  await query(
    `UPDATE users 
     SET telegram_id = $1, telegram_username = $2, telegram_linked_at = now(), updated_at = now()
     WHERE id = $3`,
    [telegramId, username || null, user.id]
  );

  return json({
    ok: true,
    linked: true,
    telegram_id: telegramId,
    telegram_username: username || null,
  });
}

/**
 * POST /api/auth/telegram/unlink
 * Unlink Telegram identity from the current user's account.
 */
export async function handleTelegramUnlink(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  await query(
    `UPDATE users 
     SET telegram_id = NULL, telegram_username = NULL, telegram_linked_at = NULL, updated_at = now()
     WHERE id = $1`,
    [user.id]
  );

  return json({ ok: true, linked: false });
}

/**
 * GET /api/auth/telegram/status
 * Check if the current user has a linked Telegram account.
 */
export async function handleTelegramStatus(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  return json({
    ok: true,
    linked: !!user.telegram_id,
    telegram_id: user.telegram_id || null,
    telegram_username: user.telegram_username || null,
  });
}
