// TOTP (Time-based One-Time Password) implementation per RFC 6238.
// Uses Web Crypto API HMAC-SHA1, available natively on Cloudflare Workers.
// 6-digit codes, 30-second time step, ±1 window drift allowed.

const TOTP_PERIOD = 30;      // seconds
const TOTP_DIGITS = 6;
const TOTP_ALGO = "SHA-1";   // RFC 6238 default
const DRIFT_WINDOWS = 1;     // allow ±1 window

// Base32 decode (RFC 4648) — used for TOTP secrets
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Decode(str) {
  const s = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes = [];
  let bits = 0, value = 0;
  for (const ch of s) {
    const idx = BASE32_CHARS.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

function base32Encode(bytes) {
  let bits = 0, value = 0, result = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += BASE32_CHARS[(value >>> bits) & 0x1f];
    }
  }
  if (bits > 0) result += BASE32_CHARS[(value << (5 - bits)) & 0x1f];
  return result;
}

// Generate a 32-byte random TOTP secret, return as base32 string.
export function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base32Encode(bytes);
}

// Compute HMAC-SHA1(key, message) using Web Crypto.
async function hmacSha1(keyBytes, message) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: { name: TOTP_ALGO } }, false, ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, message));
}

// Generate a TOTP code for a given time counter.
async function generateCode(secretBase32, counter) {
  const secretBytes = base32Decode(secretBase32);
  // Counter as 8-byte big-endian
  const counterBytes = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const hash = await hmacSha1(secretBytes, counterBytes);
  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return String(otp).padStart(TOTP_DIGITS, "0");
}

// Verify a TOTP code. Returns true if the code matches any window
// within ±DRIFT_WINDOWS of the current time.
export async function verifyCode(secretBase32, code) {
  if (!secretBase32 || !code) return false;
  const now = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(now / TOTP_PERIOD);

  for (let drift = -DRIFT_WINDOWS; drift <= DRIFT_WINDOWS; drift++) {
    const expected = await generateCode(secretBase32, currentCounter + drift);
    // Constant-time comparison (no length-based early return to prevent timing leaks)
    const codeStr = String(code);
    let diff = 0;
    // Compare lengths in constant-time by XORing first
    diff |= expected.length ^ codeStr.length;
    // Then compare each character
    const maxLen = Math.max(expected.length, codeStr.length);
    for (let i = 0; i < maxLen; i++) {
      diff |= expected.charCodeAt(i) ^ codeStr.charCodeAt(i);
    }
    if (diff === 0) return true;
  }
  return false;
}

// Generate an otpauth:// URI for QR code rendering.
export function generateOtpauthUri(secretBase32, email, issuer = "YourRank") {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}
