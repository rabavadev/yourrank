// Shared postback key lifecycle: creation, hashed lookup, rotation,
// revocation, and replay-guard deduplication.

import { one, exec } from "./db.js";
import { hashToken, newPostbackKey, safeEqual } from "./crypto.js";
import { encrypt, decrypt } from "./crypto.js";

const DEFAULT_TTL_S = 24 * 60 * 60;
const KEY_TTL_S = 365 * 24 * 60 * 60;

export interface PostbackOwner { id: string; userId: string; }
export type PostbackUsage = "signed" | "unsigned";

export const POSTBACK_SUNSET = "2026-10-01";

export function unsignedPostbacksEnabled(value?: string): boolean {
  return value !== "false" && value !== "0";
}

export function logPostbackIntake(
  path: "pb_legacy" | "api_postback_unsigned" | "pb_signed" | "scores_signed",
  owner: PostbackOwner,
  signed: boolean
): void {
  console.info(JSON.stringify({
    level: "info",
    event: "postback_intake",
    path,
    signed,
    owner_id: owner.userId,
    key_id: owner.id,
    ts: new Date().toISOString(),
  }));
}

async function hashPostbackKey(key: string): Promise<string> { return hashToken(key); }

async function getEncKey(): Promise<string> {
  const hex = process.env.TOKEN_ENC_KEY || "";
  if (hex.length !== 64) throw new Error("TOKEN_ENC_KEY must be 64 hex characters (32 bytes)");
  return hex;
}

export async function findPostbackOwner(
  key: string,
  usage?: PostbackUsage
): Promise<PostbackOwner | null> {
  const hash = await hashPostbackKey(key);
  const row = await one<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM postback_keys
       WHERE key_hash = $1
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > now())
       LIMIT 1`,
    [hash]
  );
  if (!row) return null;
  try {
    await exec(
      `UPDATE postback_keys
          SET last_used_at = now(),
              last_signed_used_at = CASE WHEN $2 = 'signed' THEN now() ELSE last_signed_used_at END,
              last_unsigned_used_at = CASE WHEN $2 = 'unsigned' THEN now() ELSE last_unsigned_used_at END
        WHERE id = $1`,
      [row.id, usage || null]
    );
  } catch (error) {
    const compatibilityFallback = (error as { code?: string })?.code === "42703";
    if (compatibilityFallback) {
      await exec("UPDATE postback_keys SET last_used_at = now() WHERE id = $1", [row.id]).catch(() => {});
    }
    console[compatibilityFallback ? "warn" : "error"](JSON.stringify({
      level: compatibilityFallback ? "warn" : "error",
      event: compatibilityFallback
        ? "postback_usage_breakdown_unavailable"
        : "postback_usage_update_failed",
      key_id: row.id,
      error: error instanceof Error ? error.message : String(error),
      ts: new Date().toISOString(),
    }));
  }
  return { id: row.id, userId: row.user_id as string };
}

export async function getActivePostbackKey(userId: string): Promise<string | null> {
  const row = await one<{ id: string; key_plaintext: string | null; key_enc: string | null }>(
    `SELECT id, key_plaintext, key_enc FROM postback_keys
       WHERE user_id = $1
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > now())
       ORDER BY created_at DESC
       LIMIT 1`,
    [userId]
  );
  if (!row) return null;
  if (row.key_enc) {
    const hexKey = await getEncKey();
    const raw = await decrypt(row.key_enc, hexKey);
    return raw;
  }
  if (row.key_plaintext) return row.key_plaintext;
  return null;
}

export async function createPostbackKey(
  userId: string,
  { label, revokeOthers = false }: { label?: string; revokeOthers?: boolean } = {}
): Promise<string> {
  const raw = newPostbackKey();
  const hash = await hashPostbackKey(raw);
  const hexKey = await getEncKey();
  const keyEnc = await encrypt(raw, hexKey);
  const inserted = await exec(
    `INSERT INTO postback_keys (user_id, key_hash, key_plaintext, key_enc, label, created_at, expires_at)
     VALUES ($1, $2, NULL, $3, $4, now(), now() + make_interval(secs => $5))
     RETURNING id`,
    [userId, hash, keyEnc, label || null, KEY_TTL_S]
  );
  const rowId = Array.isArray(inserted) && inserted[0]?.id;
  if (revokeOthers && rowId) {
    await revokePostbackKeys(userId, rowId);
  }
  return raw;
}

export async function revokePostbackKeys(userId: string, keyId?: string | null): Promise<number> {
  const result = await exec(
    `UPDATE postback_keys SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL AND ($2::uuid IS NULL OR id != $2::uuid)
       RETURNING id`,
    [userId, keyId || null]
  );
  return Array.isArray(result) ? result.length : 0;
}

export async function recordReplayHash(userId: string, replayHash: string, ttlSec = DEFAULT_TTL_S): Promise<boolean> {
  try {
    await exec(
      `INSERT INTO postback_replay_guard (user_id, replay_hash, expires_at)
       VALUES ($1, $2, now() + make_interval(secs => $3))`,
      [userId, replayHash, ttlSec]
    );
    return true;
  } catch (e: any) {
    if (e?.code === "23505") return false;
    throw e;
  }
}

export async function computeReplayHash(payload: Record<string, string | string[] | undefined>): Promise<string> {
  const cleaned: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(payload)) {
    const lower = k.toLowerCase();
    if (lower === "key" || lower === "signature" || lower === "x-postback-key" || lower === "x-postback-signature") continue;
    if (v === undefined) continue;
    cleaned[k] = v;
  }
  const canonical = Object.keys(cleaned)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => {
      const v = cleaned[k];
      return `${encodeURIComponent(k)}=${Array.isArray(v) ? v.map(encodeURIComponent).join(",") : encodeURIComponent(v)}`;
    })
    .join("&");
  const enc = new TextEncoder().encode(canonical);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export { safeEqual };
