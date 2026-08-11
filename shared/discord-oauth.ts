// Discord OAuth 2.0 helpers for viewer login.
// Shared between leaderboard Worker and any future features.

import { encryptToken, decryptToken } from "./crypto.js";
import { CircuitBreaker } from "./circuit-breaker.js";

export interface DiscordOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface DiscordTokens {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
}

const discordCircuit = new CircuitBreaker("discord-api", { failureThreshold: 5, resetTimeoutMs: 30_000 });

function getConfig(env: any): DiscordOAuthConfig {
  const clientId = env.DISCORD_CLIENT_ID;
  const clientSecret = env.DISCORD_CLIENT_SECRET;
  const redirectUri = env.DISCORD_REDIRECT_URI || "https://yourrank.site/api/viewer/auth/discord/callback";
  if (!clientId || !clientSecret) {
    throw new Error("DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are required");
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildDiscordAuthorizeURL(env: any, state: string, scope = "identify", redirectUri?: string): string {
  const { clientId } = getConfig(env);
  const finalRedirectUri = redirectUri || getConfig(env).redirectUri;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: finalRedirectUri,
    scope,
    state,
    prompt: "consent",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

async function postDiscordToken(env: any, body: URLSearchParams): Promise<DiscordTokens> {
  const { clientId, clientSecret } = getConfig(env);
  const auth = btoa(`${clientId}:${clientSecret}`);
  const res = await discordCircuit.call(() =>
    fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        authorization: `Basic ${auth}`,
      },
      body: body.toString(),
    })
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Discord token endpoint returned ${res.status}: ${text}`);
  }
  return JSON.parse(text) as DiscordTokens;
}

export function exchangeDiscordCode(env: any, code: string, redirectUri?: string): Promise<DiscordTokens> {
  const finalRedirectUri = redirectUri || getConfig(env).redirectUri;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: finalRedirectUri,
  });
  return postDiscordToken(env, body);
}

export function refreshDiscordTokens(env: any, refreshToken: string): Promise<DiscordTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return postDiscordToken(env, body);
}

export async function fetchDiscordCurrentUser(accessToken: string): Promise<DiscordUser | null> {
  const res = await discordCircuit.call(() =>
    fetch("https://discord.com/api/users/@me", {
      headers: { authorization: `Bearer ${accessToken}` },
    })
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Discord user endpoint returned ${res.status}: ${text}`);
  }
  return JSON.parse(text) as DiscordUser;
}

export async function encryptDiscordToken(plaintext: string): Promise<string> {
  const buf = await encryptToken(plaintext);
  return Buffer.from(buf).toString("hex");
}

export async function decryptDiscordToken(hex: string): Promise<string> {
  return decryptToken(Buffer.from(hex, "hex"));
}

export function discordAvatarUrl(userId: string, avatarHash: string | null | undefined): string | null {
  if (!avatarHash) return null;
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
}
