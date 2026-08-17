// One-Click CSV Data Exports for Streamers.
import { requireUser as defaultRequireUser, bad } from "../auth.js";
import { getByUser as defaultGetByUser, getBoardById as defaultGetBoardById } from "../site.js";
import { requireSiteCapability } from "../site-authorization.js";
import {
  query as defaultQuery,
} from "@yourrank/shared/db";

function csvEscape(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function buildCsvResponse(rows, headers, filename) {
  const headerLine = headers.map(csvEscape).join(",");
  const dataLines = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
  const csvContent = `${headerLine}\r\n${dataLines}`;

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/**
 * GET /api/export/raffle-winners.csv — Export raffle winners report
 */
export async function handleExportRaffleWinnersCsv(request, env, deps = {}) {
  const {
    requireUser = defaultRequireUser,
    getByUser = defaultGetByUser,
    getBoardById = defaultGetBoardById,
    query = defaultQuery,
  } = deps;

  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);
  const authorization = await requireSiteCapability(request, env, user, site, "canRoleManageBilling");
  if (authorization.res) return authorization.res;

  const raffles = await query(
    `SELECT r.title, r.ticket_cost, r.status, r.winner_name, r.drawn_at, r.created_at,
            (SELECT count(*) FROM raffle_tickets WHERE raffle_id=r.id) AS total_tickets
       FROM raffles r
      WHERE r.site_id=$1
      ORDER BY r.created_at DESC`,
    [site.id]
  );

  const headers = ["Raffle Title", "Ticket Cost (Pts)", "Status", "Winner Username", "Total Tickets Sold", "Drawn Date", "Created Date"];
  const rows = (raffles || []).map((r) => [
    r.title,
    r.ticket_cost,
    r.status,
    r.winner_name || "N/A",
    r.total_tickets || 0,
    r.drawn_at ? new Date(r.drawn_at).toISOString() : "Not Drawn",
    new Date(r.created_at).toISOString(),
  ]);

  return buildCsvResponse(rows, headers, `raffle-winners-${site.slug || "export"}.csv`);
}

/**
 * GET /api/export/drop-claims.csv — Export flash drop claims report
 */
export async function handleExportDropClaimsCsv(request, env, deps = {}) {
  const {
    requireUser = defaultRequireUser,
    getByUser = defaultGetByUser,
    getBoardById = defaultGetBoardById,
    query = defaultQuery,
  } = deps;

  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);
  const authorization = await requireSiteCapability(request, env, user, site, "canRoleManageBilling");
  if (authorization.res) return authorization.res;

  const claims = await query(
    `SELECT cd.code, cd.points_reward, v.username, cdc.claimed_at
       FROM code_drop_claims cdc
       JOIN code_drops cd ON cd.id = cdc.code_drop_id
       JOIN viewers v ON v.id = cdc.viewer_id
      WHERE cd.site_id=$1
      ORDER BY cdc.claimed_at DESC`,
    [site.id]
  );

  const headers = ["Drop Code", "Points Awarded", "Viewer Username", "Claimed Timestamp"];
  const rows = (claims || []).map((c) => [
    c.code,
    c.points_reward,
    c.username,
    new Date(c.claimed_at).toISOString(),
  ]);

  return buildCsvResponse(rows, headers, `drop-claims-${site.slug || "export"}.csv`);
}

/**
 * GET /api/export/predictions.csv — Export predictions & payouts report
 */
export async function handleExportPredictionsCsv(request, env, deps = {}) {
  const {
    requireUser = defaultRequireUser,
    getByUser = defaultGetByUser,
    getBoardById = defaultGetBoardById,
    query = defaultQuery,
  } = deps;

  const { user, res } = await requireUser(request, env);
  if (res) return res;

  const url = new URL(request.url);
  const siteId = url.searchParams.get("siteId");
  const site = siteId ? await getBoardById(env, user.id, siteId) : await getByUser(env, user.id);
  if (!site) return bad("Site not found", 404);
  const authorization = await requireSiteCapability(request, env, user, site, "canRoleManageBilling");
  if (authorization.res) return authorization.res;

  const predictions = await query(
    `SELECT p.title, p.status, p.winning_option_id, p.total_pool, p.settled_at, p.created_at,
            (SELECT count(DISTINCT site_viewer_id) FROM prediction_bets WHERE prediction_id=p.id) AS total_bettors
       FROM predictions p
      WHERE p.site_id=$1
      ORDER BY p.created_at DESC`,
    [site.id]
  );

  const headers = ["Prediction Question", "Status", "Winning Outcome", "Total Pool (Pts)", "Total Bettors", "Settled Date", "Created Date"];
  const rows = (predictions || []).map((p) => [
    p.title,
    p.status,
    p.winning_option_id ? p.winning_option_id.toUpperCase() : "N/A",
    p.total_pool || 0,
    p.total_bettors || 0,
    p.settled_at ? new Date(p.settled_at).toISOString() : "Not Settled",
    new Date(p.created_at).toISOString(),
  ]);

  return buildCsvResponse(rows, headers, `predictions-${site.slug || "export"}.csv`);
}
