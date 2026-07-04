// Public API handlers for leaderboard data access
import { getPublicSite } from "../site.js";
import { rateLimit, clientIp, json, bad } from "../auth.js";

/**
 * Handle GET /api/public/:slug/standings
 * Returns full standings JSON for embedding / Telegram bot queries
 */
export async function handlePublicStandings(request, env, ctx) {
  const slug = ctx.slug;
  if (!(await rateLimit(env, `pub-standings:${clientIp(request)}`, 100, 60))) {
    return bad("Rate limit exceeded. Try again shortly.", 429);
  }
  const r = await getPublicSite(env, slug);
  if (!r || r.suspended) return bad("not found", 404);
  const d = r.data;
  const sorted = (d.players || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
  const players = sorted.map((p, i) => ({ name: p.name, wagered: p.wagered, prize: p.prize, position: i + 1 }));
  const endsAt = d.endsAt || null;
  let countdown = null;
  if (endsAt) {
    const remaining = Math.max(0, new Date(endsAt).getTime() - Date.now());
    countdown = { endsAt, remaining };
  }
  return json({
    slug,
    name: d.brand?.name || slug,
    casino: d.brand?.casino || "",
    period: d.brand?.period || "Monthly",
    prizePool: d.brand?.prizePool || "$0",
    players,
    countdown,
  }, 200, { "cache-control": "public, max-age=30" });
}

/**
 * Handle GET /api/public/:slug/players
 * Returns lightweight players-only endpoint for live polling
 */
export async function handlePublicPlayers(request, env, ctx) {
  const slug = ctx.slug;
  const r = await getPublicSite(env, slug);
  if (!r || r.suspended) return bad("not found", 404);
  const players = (r.data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
  return json({ players }, 200, { "cache-control": "public, max-age=10" });
}

/**
 * Handle GET /api/public/:slug/rank?user=X
 * Returns plain-text rank lookup for Nightbot / Streamlabs custom commands
 */
export async function handlePublicRank(request, env, ctx) {
  const slug = ctx.slug;
  const userParam = new URL(request.url).searchParams.get("user") || "";
  if (!userParam) {
    return new Response("Usage: /api/public/:slug/rank?user=NAME", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" }
    });
  }
  if (!(await rateLimit(env, `pub-rank:${clientIp(request)}`, 60, 60))) {
    return new Response("Rate limit exceeded.", {
      status: 429,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
  const r = await getPublicSite(env, slug);
  if (!r || r.suspended) {
    return new Response("Leaderboard not found.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" }
    });
  }
  const sorted = (r.data.players || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
  const matchUser = userParam.toLowerCase().replace(/^@/, "");
  const idx = sorted.findIndex(p => String(p.name || "").toLowerCase().replace(/^\*+/, "").includes(matchUser));
  if (idx === -1) {
    return new Response(`${userParam} is not on ${r.data.brand?.name || slug}'s leaderboard yet.`, {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" }
    });
  }
  const player = sorted[idx];
  const rank = idx + 1;
  const total = sorted.length;
  const wagered = "$" + Number(player.wagered || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  let gap = "";
  if (rank > 1) {
    const ahead = sorted[idx - 1];
    const diff = (ahead.wagered || 0) - (player.wagered || 0);
    gap = ` ($${Number(diff).toLocaleString("en-US", { maximumFractionDigits: 0 })} behind #${rank - 1})`;
  }
  const name = r.data.brand?.name || slug;
  const text = rank === 1
    ? `${player.name} is #1 of ${total} on ${name}'s leaderboard! 🏆 ${wagered} wagered`
    : `${player.name} is #${rank} of ${total} on ${name}'s leaderboard. ${wagered} wagered${gap}`;
  return new Response(text, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=30" }
  });
}

/**
 * Handle GET /api/public/:slug (generic endpoint)
 * Returns the full leaderboard data as JSON
 */
export async function handlePublicData(request, env, ctx) {
  const slug = ctx.slug;
  const r = await getPublicSite(env, slug);
  return r && !r.suspended ? json(r.data, 200, { "cache-control": "public, max-age=30" }) : bad("not found", 404);
}
