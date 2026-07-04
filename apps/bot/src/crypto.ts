import { config } from "./config.js";

// Web Crypto API — available on Node 20+, Bun, and Cloudflare Workers.
// AES-256-GCM. Blob layout: [12-byte iv][ciphertext + 16-byte auth tag].
// (Web Crypto appends the tag to the ciphertext, unlike Node's createCipheriv.)
//
// KEY ROTATION (v1 prefix):
//   All newly encrypted tokens are prefixed with "v1:" (5 bytes) so a future
//   key rotation can introduce "v2:<ciphertext>" using a new key while still
//   decrypting old "v1:" entries with the original key. Legacy tokens (no
//   prefix) also decrypt with the current key.
//
//   To rotate:
//     1. Set a new TOKEN_ENC_KEY_V2 env var (32-byte hex).
//     2. Update this module: map "v2:" to the new key via config.tokenEncKeyV2.
//     3. New encrypts produce "v2:" prefix.
//     4. Run POST /api/admin/reencrypt to re-encrypt all "v1:" tokens with v2.
//     5. Once all tokens are migrated, optionally remove v1 support.

// Current key version prefix embedded in all new ciphertexts.
const CURRENT_KEY_VERSION = "v1";
const VERSION_PREFIX = `${CURRENT_KEY_VERSION}:`;
const VERSION_PREFIX_BYTES = Buffer.from(VERSION_PREFIX);

let _key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (_key) return _key;
  _key = await crypto.subtle.importKey(
    "raw",
    config.tokenEncKey,
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
  return _key;
}

/**
 * Resolve which CryptoKey to use for decryption based on the key version
 * prefix embedded in the blob. Legacy blobs (no prefix) use the current key.
 */
async function getKeyForBlob(blob: Buffer): Promise<{ key: CryptoKey; offset: number }> {
  const asString = blob.toString("latin1");
  if (asString.startsWith("v1:")) {
    return { key: await getKey(), offset: 3 };
  }
  // Legacy (no prefix) — use current key, offset 0
  return { key: await getKey(), offset: 0 };
}

export async function encryptToken(plaintext: string): Promise<Buffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  // Prepend version prefix: "v1:" + [12-byte iv][ciphertext + tag]
  return Buffer.concat([VERSION_PREFIX_BYTES, Buffer.from(iv), Buffer.from(ct)]);
}

export async function decryptToken(blob: Buffer): Promise<string> {
  const { key, offset } = await getKeyForBlob(blob);
  const iv = new Uint8Array(blob.subarray(offset, offset + 12));
  const ct = new Uint8Array(blob.subarray(offset + 12));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(decrypted);
}

/**
 * Re-encrypt a token blob: decrypt with the key determined by its prefix,
 * then re-encrypt with the current key (producing a fresh "v1:" prefix).
 * Used by POST /api/admin/reencrypt to migrate legacy tokens.
 */
export async function reencryptToken(blob: Buffer): Promise<Buffer> {
  const plaintext = await decryptToken(blob);
  return encryptToken(plaintext);
}

/** Check if a token blob already has the current key version prefix. */
export function isCurrentVersion(blob: Buffer): boolean {
  const asString = blob.toString("latin1");
  return asString.startsWith(VERSION_PREFIX);
}

/** Salted hash — we never store raw visitor IPs. */
export async function hashIp(ip: string): Promise<Buffer> {
  const data = new TextEncoder().encode(config.ipHashSalt + ip);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash);
}

/** Routing id + Telegram secret header value. */
export function newWebhookSecret(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("hex");
}

/** Short, url-safe slug for /r/:slug links. */
export function newLinkSlug(): string {
  // Increased from 4 to 8 bytes (64 bits) to prevent collisions and enumeration.
  // 4 bytes = 32 bits (birthday bound ~65k links) - too low for public URLs.
  // 8 bytes = 64 bits (birthday bound ~4 billion links) - sufficient for production.
  return Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString("base64url");
}

/** Public click reference id — echoed back by casinos in postbacks. */
export function newClickRef(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(9))).toString("base64url");
}

/** Secret per-streamer postback key. */
export function newPostbackKey(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64url");
}

/**
 * Constant-time verify of a hex HMAC-SHA256 over `payload` keyed by `secret`.
 * Used by the signed postback endpoint (POST /pb). Casinos that support signing
 * send `X-Postback-Signature: <hex hmac>` where the hmac is of the exact query
 * string they sent (e.g. `event=deposit&amount=50&click_ref=x`). Verified
 * against the streamer's own postback_key as the HMAC secret — same value the
 * legacy path uses, so no schema change.
 */
export async function verifyHmacSha256Hex(secret: string, payload: string, signatureHex: string): Promise<boolean> {
  const sig = String(signatureHex ?? "").trim().toLowerCase();
  if (!sig || !/^[0-9a-f]{64}$/.test(sig)) return false; // SHA-256 = 64 hex chars
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Buffer.from(mac).toString("hex");
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
