// Tournament & Elimination Brackets Handlers.
import { requireUser as defaultRequireUser, ok, bad, readJson } from "../auth.js";
import { getByUser as defaultGetByUser, getBoardById as defaultGetBoardById } from "../site.js";
import {
  one as defaultOne,
  query as defaultQuery,
  withTransaction as defaultWithTransaction,
} from "../../../../shared/db.js";
import { logAudit as defaultLogAudit } from "../../../../shared/audit.js";

/**
 * GET /api/tournaments — List tournaments for site
 */
export async function handleGetTournaments(request, env, deps = {}) {
  const {
    one = defaultOne,
    query = defaultQuery,
  } = deps;

  const url = new URL(request.url);
  const siteSlugOrId = url.searchParams.get("site") || url.searchParams.get("siteId");
  if (!siteSlugOrId) return bad("Site identifier is required.");

  const site = await one("SELECT id, name FROM sites WHERE slug=$1 OR id::text=$1", [siteSlugOrId]);
  if (!site) return bad("Site not found.", 404);

  const tournaments = await query(
    `SELECT id, title, game_name, bracket_size, status, winner_name, created_at
       FROM tournaments
      WHERE site_id=$1
      ORDER BY created_at DESC LIMIT 20`,
    [site.id]
  );

  return ok({ tournaments: tournaments || [] });
}

/**
 * POST /api/tournaments — Streamer creates a single-elimination tournament bracket
 */
export async function handleCreateTournament(request, env, deps = {}) {
  const {
    requireUser = defaultRequireUser,
    getByUser = defaultGetByUser,
    getBoardById = defaultGetBoardById,
    withTransaction = defaultWithTransaction,
    logAudit = defaultLogAudit,
  } = deps;

  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  const title = String(body?.title || "").trim() || "Community Tournament";
  const gameName = String(body?.gameName || "Game").trim();
  const bracketSize = [4, 8, 16, 32].includes(parseInt(body?.bracketSize, 10)) ? parseInt(body?.bracketSize, 10) : 8;

  const rawParticipants = Array.isArray(body?.participants) ? body.participants : [];
  const participants = rawParticipants.slice(0, bracketSize).map((p, i) => String(p || `Player ${i + 1}`).trim());
  while (participants.length < bracketSize) {
    participants.push(`Player ${participants.length + 1}`);
  }

  const url = new URL(request.url);
  const siteId = body?.siteId || url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);

  const totalRounds = Math.log2(bracketSize);

  const result = await withTransaction(async (tx) => {
    const tourn = await tx.one(
      `INSERT INTO tournaments (site_id, title, game_name, bracket_size, status, participants_json)
       VALUES ($1, $2, $3, $4, 'active', $5)
       RETURNING id, title, game_name, bracket_size, status, created_at`,
      [site.id, title, gameName, bracketSize, JSON.stringify(participants)]
    );

    // Generate matches for Round 1
    const round1MatchCount = bracketSize / 2;
    for (let m = 0; m < round1MatchCount; m++) {
      const p1 = participants[m * 2];
      const p2 = participants[m * 2 + 1];
      await tx.unsafe(
        `INSERT INTO tournament_matches (tournament_id, round_number, match_index, player1_name, player2_name, status)
         VALUES ($1, 1, $2, $3, $4, 'pending')`,
        [tourn.id, m, p1, p2]
      );
    }

    // Generate empty matches for subsequent rounds
    let currentMatchCount = round1MatchCount / 2;
    for (let r = 2; r <= totalRounds; r++) {
      for (let m = 0; m < currentMatchCount; m++) {
        await tx.unsafe(
          `INSERT INTO tournament_matches (tournament_id, round_number, match_index, player1_name, player2_name, status)
           VALUES ($1, $2, $3, 'TBD', 'TBD', 'pending')`,
          [tourn.id, r, m]
        );
      }
      currentMatchCount = currentMatchCount / 2;
    }

    return tourn;
  });

  await logAudit({
    actorId: user.id,
    action: "tournament_create",
    entityType: "tournament",
    entityId: result.id,
    request,
    details: { title, gameName, bracketSize },
  });

  return ok({ tournament: result, message: `🏆 Tournament ${title} created with ${bracketSize} players!` });
}

/**
 * POST /api/tournaments/:id/score — Streamer updates match score & advances winner
 */
export async function handleUpdateMatchScore(request, env, deps = {}) {
  const {
    requireUser = defaultRequireUser,
    one = defaultOne,
    withTransaction = defaultWithTransaction,
    logAudit = defaultLogAudit,
  } = deps;

  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const body = await readJson(request);
  const matchId = String(body?.matchId || "").trim();
  const p1Score = parseInt(body?.player1Score, 10) || 0;
  const p2Score = parseInt(body?.player2Score, 10) || 0;

  if (!matchId) return bad("matchId is required.");

  const match = await one(
    `SELECT tm.id, tm.tournament_id, tm.round_number, tm.match_index, tm.player1_name, tm.player2_name,
            t.site_id, t.bracket_size
       FROM tournament_matches tm
       JOIN tournaments t ON t.id = tm.tournament_id
       JOIN sites s ON s.id = t.site_id
      WHERE tm.id=$1 AND s.user_id=$2`,
    [matchId, user.id]
  );

  if (!match) return bad("Match not found or unauthorized.", 404);
  if (p1Score === p2Score) return bad("Scores cannot be tied. A winner must be decided.", 400);

  const winnerName = p1Score > p2Score ? match.player1_name : match.player2_name;
  const totalRounds = Math.log2(match.bracket_size);
  const isFinals = match.round_number === totalRounds;

  await withTransaction(async (tx) => {
    // 1. Update this match
    await tx.unsafe(
      `UPDATE tournament_matches
          SET player1_score=$1, player2_score=$2, winner_name=$3, status='completed'
        WHERE id=$4`,
      [p1Score, p2Score, winnerName, match.id]
    );

    // 2. Advance winner to next round or declare champion
    if (isFinals) {
      await tx.unsafe(
        "UPDATE tournaments SET winner_name=$1, status='completed', updated_at=now() WHERE id=$2",
        [winnerName, match.tournament_id]
      );
    } else {
      const nextRound = match.round_number + 1;
      const nextMatchIndex = Math.floor(match.match_index / 2);
      const isPlayer1Slot = match.match_index % 2 === 0;

      if (isPlayer1Slot) {
        await tx.unsafe(
          `UPDATE tournament_matches
              SET player1_name=$1
            WHERE tournament_id=$2 AND round_number=$3 AND match_index=$4`,
          [winnerName, match.tournament_id, nextRound, nextMatchIndex]
        );
      } else {
        await tx.unsafe(
          `UPDATE tournament_matches
              SET player2_name=$1
            WHERE tournament_id=$2 AND round_number=$3 AND match_index=$4`,
          [winnerName, match.tournament_id, nextRound, nextMatchIndex]
        );
      }
    }
  });

  await logAudit({
    actorId: user.id,
    action: "tournament_match_score",
    entityType: "tournament_match",
    entityId: match.id,
    request,
    details: { winnerName, p1Score, p2Score, isFinals },
  });

  return ok({
    matchId: match.id,
    winnerName,
    isFinals,
    message: isFinals ? `👑 Champion crowned: ${winnerName}!` : `🏆 ${winnerName} advanced to Round ${match.round_number + 1}!`,
  });
}

/**
 * GET /api/tournaments/:id/bracket — Get bracket tree for viewer & streamer
 */
export async function handleGetBracket(request, env, deps = {}) {
  const {
    one = defaultOne,
    query = defaultQuery,
  } = deps;

  const url = new URL(request.url);
  const tournamentId = url.pathname.split("/")[3] || url.searchParams.get("id");
  if (!tournamentId) return bad("tournamentId is required.");

  const tourn = await one("SELECT id, title, game_name, bracket_size, status, winner_name, created_at FROM tournaments WHERE id=$1", [tournamentId]);
  if (!tourn) return bad("Tournament not found.", 404);

  const matches = await query(
    `SELECT id, round_number, match_index, player1_name, player2_name, player1_score, player2_score, winner_name, status
       FROM tournament_matches
      WHERE tournament_id=$1
      ORDER BY round_number ASC, match_index ASC`,
    [tourn.id]
  );

  return ok({
    tournament: tourn,
    matches: matches || [],
  });
}
