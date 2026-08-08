// Kick OAuth 2.1 helpers for streamer channel linking.
// Shared between leaderboard Worker and any future bot features.

import { encryptToken, decryptToken } from "./crypto.js";

export interface KickOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface KickTokens {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

export interface KickUser {
  user_id: number;
  name: string;
  email?: string;
  profile_picture?: string;
}

export interface KickChannel {
  broadcaster_user_id: number;
  slug: string;
  channel_description?: string;
  banner_picture?: string;
  stream_title?: string;
}

function base64UrlEncode(buf: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buf.length; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  const base64 = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return base64;
}

export async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(64));
  const codeVerifier = base64UrlEncode(verifierBytes);

  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(new Uint8Array(digest)),
  };
}

function getConfig(env: any): KickOAuthConfig {
  const clientId = env.KICK_CLIENT_ID;
  const clientSecret = env.KICK_CLIENT_SECRET;
  const redirectUri = env.KICK_REDIRECT_URI || "https://yourrank.site/auth/kick/callback";
  if (!clientId || !clientSecret) {
    throw new Error("KICK_CLIENT_ID and KICK_CLIENT_SECRET are required");
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildKickAuthorizeURL(
  env: any,
  state: string,
  codeChallenge: string,
  scope = "user:read channel:read channel:rewards:read events:subscribe"
): string {
  const { clientId, redirectUri } = getConfig(env);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://id.kick.com/oauth/authorize?${params.toString()}`;
}

async function postTokenEndpoint(env: any, body: URLSearchParams): Promise<KickTokens> {
  const { clientId, clientSecret } = getConfig(env);
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch("https://id.kick.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Kick token endpoint returned ${res.status}: ${text}`);
  }
  return JSON.parse(text) as KickTokens;
}

export function exchangeKickCode(
  env: any,
  code: string,
  codeVerifier: string
): Promise<KickTokens> {
  const { redirectUri } = getConfig(env);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  return postTokenEndpoint(env, body);
}

export function refreshKickTokens(env: any, refreshToken: string): Promise<KickTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return postTokenEndpoint(env, body);
}

async function kickApiGet<T>(accessToken: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Kick API GET ${url} returned ${res.status}: ${text}`);
  }
  return JSON.parse(text) as T;
}

interface KickApiList<T> {
  data: T[];
  message?: string;
}

export async function fetchKickCurrentUser(accessToken: string): Promise<KickUser | null> {
  const resp = await kickApiGet<KickApiList<KickUser>>(accessToken, "https://api.kick.com/public/v1/users");
  const user = resp?.data?.[0];
  return user || null;
}

export async function fetchKickCurrentChannel(accessToken: string): Promise<KickChannel | null> {
  const resp = await kickApiGet<KickApiList<KickChannel>>(accessToken, "https://api.kick.com/public/v1/channels");
  const channel = resp?.data?.[0];
  return channel || null;
}

export async function subscribeKickWebhookEvent(
  accessToken: string,
  eventName: string,
  version = 1
): Promise<void> {
  const res = await fetch("https://api.kick.com/public/v1/events/subscriptions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      events: [{ name: eventName, version }],
      method: "webhook",
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Kick event subscription failed ${res.status}: ${text}`);
  }
}

export async function encryptKickToken(plaintext: string): Promise<string> {
  const buf = await encryptToken(plaintext);
  return Buffer.from(buf).toString("hex");
}

export async function decryptKickToken(hex: string): Promise<string> {
  return decryptToken(Buffer.from(hex, "hex"));
}

export async function getValidKickAccessToken(
  env: any,
  encryptedAccess: string,
  encryptedRefresh: string | null,
  expiresAt: Date | string | null
): Promise<string> {
  const now = Date.now();
  const expiry = expiresAt ? new Date(expiresAt).getTime() : 0;
  if (encryptedAccess && expiry > now + 60_000) {
    return decryptKickToken(encryptedAccess);
  }
  if (!encryptedRefresh) {
    throw new Error("Kick refresh token not available");
  }
  const refresh = await decryptKickToken(encryptedRefresh);
  const tokens = await refreshKickTokens(env, refresh);
  // Caller is responsible for persisting refreshed tokens if desired.
  return tokens.access_token;
}
