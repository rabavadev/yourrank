// Handler for Kick Giveaway and Live Chatroom resolution
import { currentUser, ok, bad, clientIp, rateLimit, rateLimitHeaders } from "../auth.js";
import { getByUser, getBoardById } from "../site.js";

function cleanChannelSlug(raw) {
  return String(raw || "").trim().toLowerCase().replace(/^@/, "").replace(/^https?:\/\/(www\.)?kick\.com\//, "");
}

export async function handleGiveawayChatroom(request, env, {
  currentUserImpl = currentUser,
  rateLimitImpl = rateLimit,
  clientIpImpl = clientIp,
  rateLimitHeadersImpl = rateLimitHeaders,
  fetchImpl = fetch,
} = {}) {
  const rl = await rateLimitImpl(env, `giveaway-chatroom:${clientIpImpl(request)}`, 60, 60);
  if (!rl.ok) return bad("Too many requests. Try again later.", 429, rateLimitHeadersImpl(rl));

  const url = new URL(request.url);
  let channel = url.searchParams.get("channel");

  const user = await currentUserImpl(request, env);

  // If no channel query param, try to find the linked Kick channel for user's site
  if (!channel && user) {
    const siteId = url.searchParams.get("siteId");
    const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
    if (site?.kick_channel_name) {
      channel = site.kick_channel_name;
    }
  }

  if (!channel) {
    return bad("Missing channel parameter", 400);
  }

  const cleanSlug = cleanChannelSlug(channel);
  if (!cleanSlug) {
    return bad("Invalid channel name", 400);
  }

  // If the user already provided a numeric chatroom ID
  if (/^\d+$/.test(cleanSlug)) {
    return ok({
      channel: cleanSlug,
      chatroomId: parseInt(cleanSlug, 10),
      isLive: false,
    });
  }

  // Fetch channel metadata from Kick API
  try {
    const kickRes = await fetchImpl(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanSlug)}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (kickRes.ok) {
      const data = await kickRes.json();
      const chatroomId = data?.chatroom?.id || data?.id;
      if (chatroomId) {
        return ok({
          channel: cleanSlug,
          chatroomId: Number(chatroomId),
          user: data?.user?.username || cleanSlug,
          avatar: data?.user?.profile_pic || null,
          isLive: Boolean(data?.livestream),
          viewers: data?.livestream?.viewer_count || 0,
        });
      }
    }

    // Try V1 endpoint fallback
    const v1Res = await fetchImpl(`https://kick.com/api/v1/channels/${encodeURIComponent(cleanSlug)}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (v1Res.ok) {
      const dataV1 = await v1Res.json();
      const chatroomId = dataV1?.chatroom?.id || dataV1?.id;
      if (chatroomId) {
        return ok({
          channel: cleanSlug,
          chatroomId: Number(chatroomId),
          user: dataV1?.user?.username || cleanSlug,
          avatar: dataV1?.user?.profilepic || null,
          isLive: Boolean(dataV1?.livestream),
          viewers: dataV1?.livestream?.viewer_count || 0,
        });
      }
    }
  } catch (err) {
    console.error("[giveaway] Kick channel lookup error:", err?.message || err);
  }

  // If auto-resolution fails, return a graceful response allowing manual fallback
  return ok({
    channel: cleanSlug,
    chatroomId: null,
    error: "Could not auto-resolve chatroom ID for this Kick channel. You can enter the numeric chatroom ID directly.",
    fallbackManual: true,
  });
}
