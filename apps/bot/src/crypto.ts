import { config } from "./config.js";

// Web Crypto API — available on Node 20+, Bun, and Cloudflare Workers.
// AES-256-GCM. Blob layout: [12-byte iv][ciphertext + 16-byte auth tag].
// (Web Crypto appends the tag to the ciphertext, unlike Node's createCipheriv.)

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

export async function encryptToken(plaintext: string): Promise<Buffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey();
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return Buffer.concat([Buffer.from(iv), Buffer.from(ct)]);
}

export async function decryptToken(blob: Buffer): Promise<string> {
  const iv = new Uint8Array(blob.subarray(0, 12));
  const ct = new Uint8Array(blob.subarray(12));
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(decrypted);
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
  return Buffer.from(crypto.getRandomValues(new Uint8Array(4))).toString("base64url");
}

/** Public click reference id — echoed back by casinos in postbacks. */
export function newClickRef(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(9))).toString("base64url");
}

/** Secret per-streamer postback key. */
export function newPostbackKey(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64url");
}
