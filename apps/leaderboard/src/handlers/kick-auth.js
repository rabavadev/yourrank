// Kick OAuth 2.1 flow for streamers linking their Kick channel.
import { currentUser, requireUser, ok, rateLimit } from "../auth.js";
import { one, exec } from "../../../../shared/db.js";
import {
  generatePKCE,
  buildKickAuthorizeURL,
  exchangeKickCode,
  fetchKickCurrentUser,
  fetchKickCurrentChannel,
  subscribeKickWebhookEvent,
  encryptKickToken,
} from "../../../../shared/kick-oauth.js";

const OAUTH_TTL = 600; // 10 minutes

function randomState() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Buffer.from(bytes).toString("hex");
}

async function storeOAuthState(env, state, data) {
  if (!env.SESSIONS) throw new Error("SESSIONS KV binding is not configured");
  await env.SESSIONS.put(`kick-oauth:${state}`, JSON.stringify(data), { expirationTtl: OAUTH_TTL });
}

async function getOAuthState(env, state) {
  if (!env.SESSIONS) return null;
  const raw = await env.SESSIONS.get(`kick-oauth:${state}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function deleteOAuthState(env, state) {
  if (env.SESSIONS) await env.SESSIONS.delete(`kick-oauth:${state}`);
}

function redirect(url, status = 302) {
  return new Response(null, { status, headers: { location: url } });
}

export async function handleKickAuthStart(request, env) {
  const user = await currentUser(request, env);
  if (user && !(await rateLimit(env, `kick-oauth-start:${user.id}`, 10, 60)).ok) {
    return redirect("/dashboard/credits?error=rate_limited");
  }
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId") || user.active_site_id || "";
  if (!siteId) {
    return redirect("/dashboard/credits?error=no_site_selected");
  }

  const site = await one("SELECT id FROM sites WHERE id=$1 AND user_id=$2", [siteId, user.id]);
  if (!site) {
    return redirect("/dashboard/credits?error=site_not_found");
  }

  try {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    const state = randomState();
    await storeOAuthState(env, state, { codeVerifier, siteId, userId: user.id });
    const authorizeURL = buildKickAuthorizeURL(env, state, codeChallenge);
    return redirect(authorizeURL);
  } catch (err) {
    console.error("[kick-auth] start failed:", err?.message || err);
    return redirect("/dashboard/credits?error=kick_auth_failed");
  }
}

export async function handleKickAuthCallback(request, env) {
  const user = await currentUser(request, env);
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return redirect(`/dashboard/credits?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return redirect("/dashboard/credits?error=missing_oauth_params");
  }

  const stateData = await getOAuthState(env, state);
  if (!stateData) {
    return redirect("/dashboard/credits?error=oauth_state_expired");
  }
  if (stateData.userId !== user.id) {
    return redirect("/dashboard/credits?error=oauth_user_mismatch");
  }

  await deleteOAuthState(env, state);

  try {
    const tokens = await exchangeKickCode(env, code, stateData.codeVerifier);
    if (!tokens.access_token) {
      throw new Error("Kick did not return an access token");
    }

    const [kickUser, kickChannel] = await Promise.all([
      fetchKickCurrentUser(tokens.access_token),
      fetchKickCurrentChannel(tokens.access_token),
    ]);
    if (!kickUser || !kickChannel) {
      throw new Error("Could not fetch Kick user or channel");
    }

    // Subscribe to the channel-point reward redemption event.
    try {
      await subscribeKickWebhookEvent(tokens.access_token, "channel.reward.redemption.updated");
    } catch (subErr) {
      console.warn("[kick-auth] event subscription failed:", subErr?.message || subErr);
    }

    const accessEnc = await encryptKickToken(tokens.access_token);
    const refreshEnc = tokens.refresh_token ? await encryptKickToken(tokens.refresh_token) : null;
    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    await exec(
      `UPDATE users
          SET kick_user_id = $1,
              kick_username = $2,
              kick_access_token_enc = $3,
              kick_refresh_token_enc = $4,
              kick_token_expires_at = $5,
              kick_linked_at = now(),
              updated_at = now()
        WHERE id = $6`,
      [
        String(kickUser.user_id),
        kickUser.name || "",
        accessEnc,
        refreshEnc,
        expiresAt,
        user.id,
      ]
    );

    await exec(
      `UPDATE sites
          SET kick_channel_external_id = $1,
              kick_channel_name = $2,
              updated_at = now()
        WHERE id = $3 AND user_id = $4`,
      [String(kickChannel.broadcaster_user_id), kickChannel.slug || "", stateData.siteId, user.id]
    );

    return redirect("/dashboard/credits?kick_connected=1");
  } catch (err) {
    console.error("[kick-auth] callback failed:", err?.message || err);
    return redirect(`/dashboard/credits?error=${encodeURIComponent(err?.message || "kick_auth_failed")}`);
  }
}

export async function handleKickAuthDisconnect(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;

  await exec(
    `UPDATE users
        SET kick_access_token_enc = null,
            kick_refresh_token_enc = null,
            kick_token_expires_at = null,
            updated_at = now()
      WHERE id = $1`,
    [user.id]
  );

  if (user.active_site_id) {
    await exec(
      `UPDATE sites
          SET kick_channel_external_id = null,
              kick_channel_name = null,
              updated_at = now()
        WHERE id = $1 AND user_id = $2`,
      [user.active_site_id, user.id]
    );
  }

  return ok({ disconnected: true });
}
