// AES-256-GCM encrypt/decrypt for the leaderboard Worker.
// Mirrors the bot Worker's crypto.ts pattern.
// Uses env.TOKEN_ENC_KEY (32-byte hex, 64 hex chars).
// Blob layout: v1:[12-byte IV][ciphertext + 16-byte auth tag]

const VERSION_PREFIX = "v1:";
const VERSION_PREFIX_BYTES = new TextEncoder().encode(VERSION_PREFIX);

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function getKey(hexKey) {
  return crypto.subtle.importKey(
    "raw",
    hexToBytes(hexKey),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns a hex-encoded string: "v1:" + [12-byte IV][ciphertext+tag]
 */
export async function encrypt(plaintext, hexKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(hexKey);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  // Combine: v1: + iv + ciphertext+tag
  const combined = new Uint8Array(
    VERSION_PREFIX_BYTES.length + iv.length + ct.byteLength
  );
  combined.set(VERSION_PREFIX_BYTES, 0);
  combined.set(iv, VERSION_PREFIX_BYTES.length);
  combined.set(new Uint8Array(ct), VERSION_PREFIX_BYTES.length + iv.length);
  // Store as hex for safe TEXT column storage
  return [...combined].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Decrypt a hex-encoded blob produced by encrypt().
 * Supports v1: prefix and legacy (no prefix) blobs.
 */
export async function decrypt(blobHex, hexKey) {
  const bytes = hexToBytes(blobHex);
  const asStr = new TextDecoder("latin1").decode(bytes);
  let offset = 0;
  if (asStr.startsWith(VERSION_PREFIX)) {
    offset = VERSION_PREFIX_BYTES.length;
  }
  const iv = bytes.slice(offset, offset + 12);
  const ct = bytes.slice(offset + 12);
  const key = await getKey(hexKey);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(pt);
}
