import { requireUser, json, bad, readJson, rateLimit } from "../auth.js";
import { getBoardById, getPlayers, saveSite } from "../site.js";
import { logAudit } from "../../../../shared/audit.js";

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
  if (!payload || !payload.name) return bad("Player name required", 400);
  
  let amount = 0;
  if (payload.amount) {
    amount = parseFloat(String(payload.amount).replace(/[^0-9.-]/g, ""));
    if (isNaN(amount)) amount = 0;
  }

  // Fetch current site state
  const site = await getBoardById(env, user.id, siteId);
  if (!site) return bad("Board not found", 404);

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
  const searchName = payload.name.trim().toLowerCase();
  let playerIndex = players.findIndex(p => p.name.toLowerCase() === searchName);
  
  if (playerIndex >= 0) {
    // Update existing
    players[playerIndex].wagered = (players[playerIndex].wagered || 0) + amount;
    if (players[playerIndex].score !== undefined) players[playerIndex].score += amount;
  } else {
    // Create new
    players.push({
      name: payload.name.trim(),
      wagered: amount,
      prize: 0
    });
  }

  // Re-sort players (standard logic: by wagered descending)
  players.sort((a, b) => (b.wagered || 0) - (a.wagered || 0));

  // Save the updated site
  const r = await saveSite(env, user, { players, siteId: site.id }, site.id, request);
  if (r.error) return bad(r.error, 400);

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
