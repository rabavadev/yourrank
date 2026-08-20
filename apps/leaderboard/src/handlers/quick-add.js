import { requireUser, json, bad, readJson, rateLimit } from "../auth.js";
import { getBoardById, getPlayers, saveSite } from "../site.js";
import { logAudit } from "@yourrank/shared/audit";
import { requireSiteCapability } from "../site-authorization.js";
import { normalizePlayerName, truncatePlayerName } from "@yourrank/shared/player-names";

// POST /api/sites/:id/quick-add
// Takes { name: "Steve", amount: 500 }
// Updates existing player or creates new one, then saves board.
export async function handleQuickAdd(request, env) {
  const { user, res } = await requireUser(request, env);
  if (res) return res;
  if (user.status === "suspended") return bad("This account is suspended.", 403);
  
  if (!(await rateLimit(env, `quick-add:${user.id}`, 60, 60)).ok) return bad("Too many requests. Try again shortly.", 429);
  
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/sites\/([^/]+)\/quick-add$/);
  const siteId = match ? match[1] : null;
  if (!siteId) return bad("Invalid board ID", 400);

  const payload = await readJson(request);
  if (!payload || !String(payload.name || "").trim()) return bad("Player name required", 400);
  
  const rawAmount = payload.amount;
  const amount = rawAmount === undefined || rawAmount === null || String(rawAmount).trim() === ""
    ? 0
    : Number(String(rawAmount).trim());
  if (!Number.isFinite(amount) || amount < 0) {
    return bad("Amount must be a non-negative number.", 400);
  }

  // Fetch current site state
  const site = await getBoardById(env, user.id, siteId);
  if (!site) return bad("Board not found", 404);
  const authorization = await requireSiteCapability(user, site, "canRoleManageBoard");
  if (authorization.res) return authorization.res;

  // getBoardById returns the raw sites row; players live in the players table.
  const rows = await getPlayers(env, site.id);
  const players = (rows || []).map((p) => ({
    name: p.name,
    wagered: p.wagered,
    prize: p.prize,
    score: p.score,
    hands: p.hands,
    netProfit: p.net_profit,
    winRate: p.win_rate,
    change: p.change,
  }));
  
  // Find or create player
  const searchName = normalizePlayerName(payload.name);
  let playerIndex = players.findIndex(p => normalizePlayerName(p.name) === searchName);
  
  if (playerIndex >= 0) {
    // Update existing
    players[playerIndex].wagered = (players[playerIndex].wagered || 0) + amount;
    if (players[playerIndex].score !== undefined) players[playerIndex].score += amount;
  } else {
    // Create new
    players.push({
      name: truncatePlayerName(payload.name),
      wagered: amount,
      prize: 0
    });
  }

  // Keep the response order aligned with the board's selected ranking field.
  const rankField = site.rank_by === "score" ? "score" : "wagered";
  players.sort((a, b) => (b[rankField] || 0) - (a[rankField] || 0));

  // Save the updated site
  const r = await saveSite(env, user, { players, siteId: site.id }, site.id, request);
  if (r.error) return bad(r.error, 400, {}, r);

  await logAudit({
    actorId: user.id,
    action: "quick_add_player",
    entityType: "site",
    entityId: site.id,
    request,
    details: { player: payload.name.trim(), amount_added: amount },
  });

  return json({ ok: true, players });
}
