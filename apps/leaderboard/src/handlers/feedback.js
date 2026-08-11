// Public viewer feedback handler.
// Submits feedback tied to the current site and (optionally) signed-in viewer.
import { bad, json, readJson, rateLimit, clientIp, rateLimitHeaders } from "../auth.js";
import { exec } from "../../../../shared/db.js";
import { getBySlug } from "../site.js";
import { resolveViewer } from "../../../../shared/viewer-session.js";

const MIN_LEN = 10;
const MAX_LEN = 2000;
const LIMIT = 5;
const WINDOW_SEC = 900;

async function hashIp(ip) {
  const enc = new TextEncoder().encode(ip || "");
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function handleFeedback(request, env) {
  const ip = clientIp(request);
  const rl = await rateLimit(env, `feedback:${ip}`, LIMIT, WINDOW_SEC);
  if (!rl.ok) return bad("Too many messages. Please wait before submitting again.", 429, rateLimitHeaders(rl));

  const body = await readJson(request);
  if (!body) return bad("Invalid JSON.", 400);

  const slug = String(body?.slug || "").trim().toLowerCase();
  const message = String(body?.message || "").trim();

  if (!slug) return bad("Site slug is required.", 400);
  if (!message || message.length < MIN_LEN || message.length > MAX_LEN) {
    return bad(`Feedback must be between ${MIN_LEN} and ${MAX_LEN} characters.`, 400);
  }

  const site = await getBySlug(env, slug);
  if (!site || !site.published || site.suspended) return bad("Site not found.", 404);

  const { viewer } = await resolveViewer(request, env);
  let siteViewerId = null;
  if (viewer) {
    const siteViewer = await exec(
      `SELECT id FROM site_viewers WHERE site_id=$1 AND viewer_id=$2`,
      [site.id, viewer.id]
    );
    if (siteViewer?.length) siteViewerId = siteViewer[0].id;
  }

  await exec(
    `INSERT INTO viewer_feedback (site_id, site_viewer_id, viewer_id, kick_username, message, ip_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [site.id, siteViewerId, viewer?.id || null, viewer?.kick_username || null, message, await hashIp(ip)]
  );

  return json({ ok: true }, 200, rateLimitHeaders(rl));
}
