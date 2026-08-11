// Viewer OAuth login: Kick and Discord.
// Separate from streamer OAuth so viewers get their own /me dashboard.

import { one, exec } from "../../../../shared/db.js";
import { encryptKickToken, buildKickViewerAuthorizeURL, exchangeKickViewerCode, fetchKickCurrentUser } from "../../../../shared/kick-oauth.js";
import {
  buildDiscordAuthorizeURL,
  exchangeDiscordCode,
  fetchDiscordCurrentUser,
  encryptDiscordToken,
  discordAvatarUrl,
} from "../../../../shared/discord-oauth.js";
import {
  resolveViewer,
  createViewerSession,
  destroyViewerSession,
  viewerCookieSet,
  viewerCookieClear,
  readViewerToken,
} from "../../../../shared/viewer-session.js";
import { bad, json, rateLimit, clientIp } from "../auth.js";

const OAUTH_TTL = 600; // 10 minutes

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("hex");
}

async function storeOAuthState(env, state, data) {
  if (!env.SESSIONS) throw new Error("SESSIONS KV binding is not configured");
  await env.SESSIONS.put(`viewer-oauth:${state}`, JSON.stringify(data), { expirationTtl: OAUTH_TTL });
}

async function getOAuthState(env, state) {
  if (!env.SESSIONS) return null;
  const raw = await env.SESSIONS.get(`viewer-oauth:${state}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function deleteOAuthState(env, state) {
  if (env.SESSIONS) await env.SESSIONS.delete(`viewer-oauth:${state}`);
}

function redirect(url, headers = {}, status = 302) {
  return new Response(null, { status, headers: { location: url, ...headers } });
}

function safeReturnTo(raw, allowedOrigin, fallback = "/me") {
  const s = String(raw || "").trim();
  // Same-origin relative path.
  if (s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\")) return s;
  // Same-origin absolute URL (or a custom domain whose auth flow started on that origin).
  if (allowedOrigin) {
    try {
      const u = new URL(s, allowedOrigin);
      if (u.origin === allowedOrigin) return s;
    } catch {
      // ignore malformed URLs
    }
  }
  return fallback;
}

export async function requireViewer(req, env) {
  const { viewer, cookie } = await resolveViewer(req, env);
  if (!viewer) return { viewer: null, cookie, res: bad("unauthorized", 401) };
  return { viewer, cookie, res: null };
}

// --- Kick ---

export async function handleKickViewerAuthStart(request, env) {
  if (!(await rateLimit(env, `viewer-oauth-start:kick:${clientIp(request)}`, 20, 60)).ok) {
    return redirect("/me?error=rate_limited");
  }
  const url = new URL(request.url);
  const origin = url.origin;
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"), origin);
  const redirectUri = `${origin}/api/viewer/auth/kick/callback`;

  const { generatePKCE } = await import("../../../../shared/kick-oauth.js");
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = randomState();
  await storeOAuthState(env, state, { provider: "kick", codeVerifier, returnTo, origin, redirectUri });

  const authorizeURL = buildKickViewerAuthorizeURL(env, state, codeChallenge, undefined, redirectUri);
  return redirect(authorizeURL);
}

export async function handleKickViewerAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect(`/me?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return redirect(`/me?error=${encodeURIComponent("missing_oauth_params")}`);
  }

  const stateData = await getOAuthState(env, state);
  if (!stateData || stateData.provider !== "kick") {
    return redirect(`/me?error=${encodeURIComponent("oauth_state_expired")}`);
  }
  await deleteOAuthState(env, state);

  try {
    const tokens = await exchangeKickViewerCode(env, code, stateData.codeVerifier, stateData.redirectUri);
    if (!tokens.access_token) {
      throw new Error("Kick did not return an access token");
    }

    const kickUser = await fetchKickCurrentUser(tokens.access_token);
    if (!kickUser) {
      throw new Error("Could not fetch Kick user");
    }

    const accessEnc = await encryptKickToken(tokens.access_token);
    const refreshEnc = tokens.refresh_token ? await encryptKickToken(tokens.refresh_token) : null;
    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    const kickUserId = String(kickUser.user_id);
    const kickUsername = kickUser.name || "";
    const avatarUrl = kickUser.profile_picture || null;

    const existing = await one("SELECT id, kick_username FROM viewers WHERE kick_user_id=$1", [kickUserId]);
    let viewerId;
    if (existing) {
      viewerId = existing.id;
      const oldUsername = String(existing.kick_username || "").trim().toLowerCase();
      const newUsername = kickUsername.trim().toLowerCase();
      if (oldUsername && oldUsername !== newUsername) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, oldUsername]
        );
      }
      await exec(
        `UPDATE viewers
            SET kick_username = $1,
                kick_access_token_enc = $2,
                kick_refresh_token_enc = $3,
                kick_token_expires_at = $4,
                kick_linked_at = now(),
                avatar_url = COALESCE($5, avatar_url),
                updated_at = now()
          WHERE id = $6`,
        [kickUsername, accessEnc, refreshEnc, expiresAt, avatarUrl, viewerId]
      );
      if (newUsername) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, newUsername]
        );
      }
    } else {
      const rows = await exec(
        `INSERT INTO viewers (kick_user_id, kick_username, kick_access_token_enc, kick_refresh_token_enc, kick_token_expires_at, kick_linked_at, avatar_url)
         VALUES ($1, $2, $3, $4, $5, now(), $6)
         RETURNING id`,
        [kickUserId, kickUsername, accessEnc, refreshEnc, expiresAt, avatarUrl]
      );
      viewerId = rows[0].id;
      if (kickUsername.trim()) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, kickUsername.trim().toLowerCase()]
        );
      }
    }

    const sessionToken = await createViewerSession(env, viewerId);
    return redirect(safeReturnTo(stateData.returnTo, stateData.origin), { "set-cookie": viewerCookieSet(sessionToken, env, request) });
  } catch (err) {
    console.error("[viewer-auth] kick callback failed:", err?.message || err);
    return redirect(`/me?error=${encodeURIComponent(err?.message || "kick_auth_failed")}`);
  }
}

// --- Discord ---

export async function handleDiscordViewerAuthStart(request, env) {
  if (!(await rateLimit(env, `viewer-oauth-start:discord:${clientIp(request)}`, 20, 60)).ok) {
    return redirect("/me?error=rate_limited");
  }
  const url = new URL(request.url);
  const origin = url.origin;
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"), origin);
  const redirectUri = `${origin}/api/viewer/auth/discord/callback`;

  const state = randomState();
  await storeOAuthState(env, state, { provider: "discord", returnTo, origin, redirectUri });

  const authorizeURL = buildDiscordAuthorizeURL(env, state, undefined, redirectUri);
  return redirect(authorizeURL);
}

export async function handleDiscordViewerAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect(`/me?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return redirect(`/me?error=${encodeURIComponent("missing_oauth_params")}`);
  }

  const stateData = await getOAuthState(env, state);
  if (!stateData || stateData.provider !== "discord") {
    return redirect(`/me?error=${encodeURIComponent("oauth_state_expired")}`);
  }
  await deleteOAuthState(env, state);

  try {
    const tokens = await exchangeDiscordCode(env, code, stateData.redirectUri);
    if (!tokens.access_token) {
      throw new Error("Discord did not return an access token");
    }

    const discordUser = await fetchDiscordCurrentUser(tokens.access_token);
    if (!discordUser) {
      throw new Error("Could not fetch Discord user");
    }

    const accessEnc = await encryptDiscordToken(tokens.access_token);
    const refreshEnc = tokens.refresh_token ? await encryptDiscordToken(tokens.refresh_token) : null;
    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
    const discordUserId = discordUser.id;
    const discordUsername = discordUser.global_name || discordUser.username || "";
    const avatarUrl = discordAvatarUrl(discordUser.id, discordUser.avatar);

    const existing = await one("SELECT id, discord_username FROM viewers WHERE discord_user_id=$1", [discordUserId]);
    let viewerId;
    if (existing) {
      viewerId = existing.id;
      const oldUsername = String(existing.discord_username || "").trim().toLowerCase();
      const newUsername = discordUsername.trim().toLowerCase();
      if (oldUsername && oldUsername !== newUsername) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, oldUsername]
        );
      }
      await exec(
        `UPDATE viewers
            SET discord_username = $1,
                discord_access_token_enc = $2,
                discord_refresh_token_enc = $3,
                discord_token_expires_at = $4,
                discord_linked_at = now(),
                avatar_url = COALESCE($5, avatar_url),
                updated_at = now()
          WHERE id = $6`,
        [discordUsername, accessEnc, refreshEnc, expiresAt, avatarUrl, viewerId]
      );
      if (newUsername) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, newUsername]
        );
      }
    } else {
      const rows = await exec(
        `INSERT INTO viewers (discord_user_id, discord_username, discord_access_token_enc, discord_refresh_token_enc, discord_token_expires_at, discord_linked_at, avatar_url)
         VALUES ($1, $2, $3, $4, $5, now(), $6)
         RETURNING id`,
        [discordUserId, discordUsername, accessEnc, refreshEnc, expiresAt, avatarUrl]
      );
      viewerId = rows[0].id;
      if (discordUsername.trim()) {
        await exec(
          `INSERT INTO viewer_username_history (viewer_id, username)
           VALUES ($1, $2)
           ON CONFLICT (viewer_id, username)
           DO UPDATE SET seen_at = now()`,
          [viewerId, discordUsername.trim().toLowerCase()]
        );
      }
    }

    const sessionToken = await createViewerSession(env, viewerId);
    return redirect(safeReturnTo(stateData.returnTo, stateData.origin), { "set-cookie": viewerCookieSet(sessionToken, env, request) });
  } catch (err) {
    console.error("[viewer-auth] discord callback failed:", err?.message || err);
    return redirect(`/me?error=${encodeURIComponent(err?.message || "discord_auth_failed")}`);
  }
}

// --- Logout ---

export async function handleViewerLogout(request, env) {
  const token = readViewerToken(request);
  await destroyViewerSession(env, token);
  return json({ ok: true, loggedOut: true }, 200, { "set-cookie": viewerCookieClear(env, request) });
}
