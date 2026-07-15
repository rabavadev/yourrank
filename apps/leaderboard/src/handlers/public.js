// Public API handlers for leaderboard data access
import { getPublicSite } from "../site.js";
import { getStats } from "../stats.js";
import { rateLimit, rateLimitHeaders, clientIp, json, bad } from "../auth.js";
import { one } from "../../../../shared/db.js";

/**
 * Handle GET /api/public/:slug/standings
 * Returns full standings JSON for embedding / Telegram bot queries
 */
export async function handlePublicStandings(request, env, ctx) {
  try {
    const slug = ctx.slug;
    const rl = await rateLimit(env, `pub-standings:${clientIp(request)}`, 100, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
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
    }, 200, { "cache-control": "public, max-age=30", ...rateLimitHeaders(rl) });
  } catch (e) {
    console.error("[public/standings]", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}

/**
 * Handle GET /api/public/:slug/players
 * Returns lightweight players-only endpoint for live polling
 */
export async function handlePublicPlayers(request, env, ctx) {
  try {
    const slug = ctx.slug;
    const rl = await rateLimit(env, `pub-players:${clientIp(request)}`, 120, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
    const r = await getPublicSite(env, slug);
    if (!r || r.suspended) return bad("not found", 404);
    const url = new URL(request.url);
    const limit = Math.min(9999, Math.max(0, Number(url.searchParams.get("limit")) || 0)) || undefined;

    // C-11 / M-13: cheap ETag based on the most recent player mutation. This lets
    // the client skip DOM churn and the server skip serializing unchanged boards.
    const version = await one(
      "SELECT max(updated_at) AS m, count(*)::int AS c FROM players WHERE site_id=$1",
      [r.id]
    );
    const maxTs = version?.m ? new Date(version.m).toISOString() : "0";
    const etag = `W/"${slug}-${maxTs}-${version?.c || 0}${limit ? `-l${limit}` : ""}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { "cache-control": "public, max-age=10", etag, ...rateLimitHeaders(rl) } });
    }

    let players = (r.data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
    if (limit && players.length > limit) players = players.slice(0, limit);
    return json({ players }, 200, { "cache-control": "public, max-age=10", etag, ...rateLimitHeaders(rl) });
  } catch (e) {
    console.error("[public/players]", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}

/**
 * Handle GET /api/public/:slug/rank?user=X
 * Returns plain-text rank lookup for Nightbot / Streamlabs custom commands
 */
export async function handlePublicRank(request, env, ctx) {
  try {
    const slug = ctx.slug;
    const userParam = new URL(request.url).searchParams.get("user") || "";
    const rl = await rateLimit(env, `pub-rank:${clientIp(request)}`, 60, 60);
    const rankHeaders = { "content-type": "text/plain; charset=utf-8", ...rateLimitHeaders(rl) };
    if (!userParam) {
      return new Response("Usage: /api/public/:slug/rank?user=NAME", {
        status: 400,
        headers: { ...rankHeaders, "cache-control": "public, max-age=30" }
      });
    }
    if (!rl.ok) {
      return new Response("Rate limit exceeded.", {
        status: 429,
        headers: rankHeaders
      });
    }
    const r = await getPublicSite(env, slug);
    if (!r || r.suspended) {
      return new Response("Leaderboard not found.", {
        status: 404,
        headers: { ...rankHeaders, "cache-control": "public, max-age=30" }
      });
    }
    const sorted = (r.data.players || []).slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0));
    const matchUser = userParam.toLowerCase().replace(/^@/, "").replace(/\s+/g, " ").trim();
    const normalizeForRank = (n) => String(n || "").toLowerCase().replace(/^\*+/, "").replace(/\s+/g, " ").trim();
    const idx = sorted.findIndex(p => normalizeForRank(p.name) === matchUser);
    if (idx === -1) {
      return new Response(`${userParam} is not on ${r.data.brand?.name || slug}'s leaderboard yet.`, {
        headers: { ...rankHeaders, "cache-control": "public, max-age=30" }
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
      headers: { ...rankHeaders, "cache-control": "public, max-age=30" }
    });
  } catch (e) {
    console.error("[public/rank]", String(e?.message || e));
    return new Response("Something went wrong.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}

/**
 * Handle GET /api/public/:slug (generic endpoint)
 * Returns the full leaderboard data as JSON
 */
export async function handlePublicData(request, env, ctx) {
  try {
    const slug = ctx.slug;
    const rl = await rateLimit(env, `pub-data:${clientIp(request)}`, 120, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
    const r = await getPublicSite(env, slug);
    return r && !r.suspended ? json(r.data, 200, { "cache-control": "public, max-age=30", ...rateLimitHeaders(rl) }) : bad("not found", 404);
  } catch (e) {
    console.error("[public/data]", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}

/**
 * Handle GET /api/public/:slug/stats
 * Public stats page for publishers/streamers to share.
 * Returns summary counts and a 14-day views series.
 */
export async function handlePublicStats(request, env, ctx) {
  try {
    const slug = ctx.slug;
    const rl = await rateLimit(env, `pub-stats:${clientIp(request)}`, 60, 60);
    if (!rl.ok) return bad("Rate limit exceeded. Try again shortly.", 429, rateLimitHeaders(rl));
    const r = await getPublicSite(env, slug);
    if (!r || r.suspended) return bad("not found", 404);
    const stats = await getStats(env, r.id);
    return json({
      slug,
      name: r.data.brand?.name || slug,
      playerCount: r.data.players?.length || 0,
      summary: stats ? { last7: stats.last7, last30: stats.last30, today: stats.today } : { last7: {}, last30: {}, today: {} },
      days: stats?.days || [],
    }, 200, { "cache-control": "public, max-age=60", ...rateLimitHeaders(rl) });
  } catch (e) {
    console.error("[public/stats]", String(e?.message || e));
    return bad("Something went wrong. Try again.", 500);
  }
}
