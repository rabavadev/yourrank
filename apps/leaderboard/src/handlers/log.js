// Client-side error / log ingestion endpoint.
// Dashboard JS posts here so client errors are correlated with server logs,
// Sentry, and the original request ID.
import { json, bad, rateLimit, clientIp, readJson } from "../auth.js";

const ALLOWED_LEVELS = new Set(["error", "warn", "info"]);

export async function handleLog(request, env, ctx, meta) {
  const { log, sentry, reqId } = meta || {};
  const ip = clientIp(request);
  const limit = await rateLimit(env, `clientlog:${ip}`, 30, 60);
  if (!limit.ok) return bad("Too many logs. Slow down.", 429);

  const body = await readJson(request);
  if (!body) return bad("Invalid JSON", 400);

  const level = ALLOWED_LEVELS.has(body?.level) ? body.level : "error";
  const context = typeof body?.context === "string" ? body.context : "dashboard";
  const message = typeof body?.message === "string" ? body.message : "";
  const stack = typeof body?.stack === "string" ? body.stack : undefined;
  const clientReqId = typeof body?.req_id === "string" ? body.req_id : undefined;
  const extra = body?.extra && typeof body.extra === "object" ? body.extra : {};

  if (!message) return bad("message is required", 400);

  const payload = {
    ...extra,
    ctx: "client_log",
    level,
    client_context: context,
    message,
    stack,
    client_req_id: clientReqId,
    req_id: reqId,
    ip,
    url: extra?.url,
    user_agent: request.headers.get("user-agent") || undefined,
  };

  if (log && typeof log[level] === "function") {
    log[level]("client_log", payload);
  } else {
    console.error(JSON.stringify(payload));
  }

  if (sentry) {
    sentry.setTags({ context, client_req_id: clientReqId, req_id: reqId });
    const sentryLevel = level === "warn" ? "warning" : level;
    sentry.captureMessage(message, sentryLevel);
  }

  return json({ ok: true });
}
