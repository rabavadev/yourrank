const DEFAULT_FALLBACK_POLL_MS = 60_000;
const DEFAULT_MAX_SUBSCRIBERS = 10_000;
const RETRY_AFTER_SECONDS = 30;

function numberEnv(env, name, fallback, minimum = 1) {
  const value = Number(env?.[name]);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
}

export function liveBoardPushEnabled(env) {
  return String(env?.LIVE_BOARD_PUSH_ENABLED || "").toLowerCase() === "true";
}

export function liveBoardStreamDisabled(env) {
  return String(env?.LIVE_BOARD_STREAM_KILL_SWITCH || "").toLowerCase() === "true";
}

export function liveBoardFallbackPollMs(env) {
  return numberEnv(env, "LIVE_BOARD_FALLBACK_POLL_MS", DEFAULT_FALLBACK_POLL_MS);
}

export function liveBoardMaxSubscribers(env) {
  return numberEnv(env, "LIVE_BOARD_MAX_SUBSCRIBERS", DEFAULT_MAX_SUBSCRIBERS);
}

export function liveBoardRetryAfter() {
  return RETRY_AFTER_SECONDS;
}

export async function notifyLiveBoard(env, siteId, version = new Date().toISOString()) {
  try {
    if (!liveBoardPushEnabled(env) || !env?.LIVE_BOARD_DO || !siteId) return;
    const id = env.LIVE_BOARD_DO.idFromName(String(siteId));
    await env.LIVE_BOARD_DO.get(id).fetch("https://live-board/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId: String(siteId), version }),
    });
  } catch (error) {
    console.error("[live-board] notification failed:", String(error?.message || error));
  }
}

export function liveBoardResponse(response, rateHeaders) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(rateHeaders || {})) {
    if (key.toLowerCase() !== "retry-after") headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
