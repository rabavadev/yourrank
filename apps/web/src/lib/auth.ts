// @ts-nocheck
// Password hashing and constant-time comparison helpers.
// Adapted from apps/leaderboard/src/auth.js for the Next.js public board surface.

const PBKDF2_ITERATIONS = 100000;
const LEGACY_ITERATIONS = 100000;
const enc = new TextEncoder();
const _bytesToHex = (b: ArrayBuffer) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const hexToBytes = (h: string) => {
  const o = new Uint8Array(h.length / 2);
  for (let i = 0; i < o.length; i++) {
    o[i] = parseInt(h.substr(i * 2, 2), 16);
  }
  return o;
};

function parseStored(stored: string) {
  const s = String(stored ?? "");
  const i = s.indexOf("$");
  if (i > 0 && /^\d+$/.test(s.slice(0, i))) {
    return { iterations: Number(s.slice(0, i)), hash: s.slice(i + 1) };
  }
  return { iterations: LEGACY_ITERATIONS, hash: s };
}

export function safeEqual(a: string, b: string) {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < Math.max(sa.length, sb.length); i++) {
    diff |= (sa.charCodeAt(i) ?? 0) ^ (sb.charCodeAt(i) ?? 0);
  }
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expected: string,
) {
  const { iterations, hash: expectedHex } = parseStored(expected);
  const km = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(saltHex), iterations, hash: "SHA-256" },
    km,
    256,
  );
  const computed = _bytesToHex(new Uint8Array(bits));
  return { ok: safeEqual(computed, expectedHex), needsRehash: iterations < PBKDF2_ITERATIONS };
}
