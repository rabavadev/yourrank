// Auth module for the bot dashboard.
// Extracted from dashboard.ts to separate authentication logic.

interface TgLogin {
  id: number; 
  first_name?: string; 
  last_name?: string; 
  username?: string;
  photo_url?: string; 
  auth_date: number; 
  hash: string;
}

// CSRF defense (same-origin check)
// The session cookie is HttpOnly; Secure; SameSite=Lax, which already blocks
// the cookie from riding along on cross-site POST/PATCH. This is a second,
// tokenless layer: reject state-changing requests whose Origin isn't us.
export function sameOrigin(req: Request, publicBaseUrl: string): boolean {
  const origin = req.headers.get("origin");
  // Require Origin header for state-changing methods. Browsers always send
  // Origin on cross-origin POST/PATCH. Missing Origin = non-browser client,
  // which should include its own CSRF token if it wants to make changes.
  //
  // SEC-008-v7: If neither Origin nor Referer is present on a state-changing
  // request, we REJECT it (return false) unless the path is explicitly exempted.
  // This is intentional defense-in-depth alongside the SameSite=Lax session
  // cookie. The exempted paths (/auth/telegram, /pb/*, /billing/hook) are
  // server-to-server callbacks or browser widget redirects that don't send
  // Origin in all embed contexts. Risk: a non-browser attacker sending
  // requests without Origin could still reach exempted paths, but those
  // paths have their own auth (HMAC, Telegram signature).
  if (!origin) {
    const method = req.method.toUpperCase();
    if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
      // Allow POST without Origin only for the Telegram auth endpoint (widget
      // sends form-encoded data without Origin in some embed contexts) and
      // postback endpoints (server-to-server callbacks).
      const url = new URL(req.url);
      const path = url.pathname;
      if (path.endsWith("/auth/telegram") || path.startsWith("/pb") || path.startsWith("/billing/hook")) {
        return true;
      }
      return false;
    }
    return true; // GET/HEAD/OPTIONS are safe (no state change)
  }
  try {
    return new URL(origin).host === new URL(publicBaseUrl).host;
  } catch {
    return false;
  }
}

// Telegram Login widget payloads are a one-shot signed snapshot. There's no
// server nonce, so the only replay defense is freshness: reject any payload
// whose auth_date is older than this. 5 minutes is generous for a user
// clicking the widget then our POST firing; 24h (the previous value) let a
// captured payload be replayed for a full day.
const AUTH_MAX_AGE_S = 5 * 60;

export async function verifyTelegramLogin(data: TgLogin, botToken: string): Promise<boolean> {
  if (!data || typeof data !== "object") return false;
  const { hash, ...fields } = data;
  if (!hash || typeof hash !== "string") return false;
  
  // Build the data-check-string exactly as Telegram computes it:
  // - Sort all received fields alphabetically (excluding hash)
  // - Format as key=value joined by \n
  // - Only include fields that were actually sent (non-null, non-undefined)
  // Telegram's widget only sends fields that have values, so we check for null/undefined
  const checkString = Object.keys(fields).sort()
    .filter((k) => (fields as any)[k] != null) // Check for null or undefined (not just undefined)
    .map((k) => `${k}=${(fields as any)[k]}`).join("\n");
  
  const secretKey = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(botToken));
  const key = await crypto.subtle.importKey("raw", secretKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(checkString));
  const expected = Buffer.from(sig).toString("hex");
  
  // Constant-time compare so a guessed hash can't be distinguished from a real
  // one by response timing. (Web Crypto doesn't ship subtle timing in JS, but
  // a plain === short-circuits on length difference, which leaks the length.)
  const ok = expected.length === hash.length;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ (ok ? hash.charCodeAt(i) : 0);
  const sigMatch = diff === 0;
  
  // Reject stale login attempts: a captured widget payload is only good briefly.
  const fresh = Date.now() / 1000 - Number(data.auth_date) < AUTH_MAX_AGE_S;
  
  return sigMatch && fresh;
}
