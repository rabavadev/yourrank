"use strict";
// Activation funnel tracking (Phase 5.3)
// Instruments: signup → bot connected → first tracked click
// Surfaces drop-off at each stage.
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackActivation = trackActivation;
exports.getFunnelMetrics = getFunnelMetrics;
/**
 * Track an activation funnel event.
 * Logs structured JSON for observability (Workers Logs / Logpush).
 * Can be extended to write to a analytics store if needed.
 */
function trackActivation(worker, userId, stage, metadata) {
    const event = {
        userId,
        stage,
        timestamp: Date.now(),
        metadata,
    };
    console.log(JSON.stringify({
        level: "info",
        worker,
        msg: "activation_funnel",
        ...event,
        ts: new Date().toISOString(),
    }));
}
/**
 * Query activation funnel metrics from the database.
 * Returns counts at each stage for a given time period.
 */
async function getFunnelMetrics(sql, daysBack = 30) {
    const rows = await sql.unsafe(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE created_at > now() - interval '${daysBack} days') as signups,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN bots b ON b.owner_id = u.id WHERE u.created_at > now() - interval '${daysBack} days') as bot_connected,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN sites s ON s.user_id = u.id JOIN clicks c ON c.site_id = s.id WHERE u.created_at > now() - interval '${daysBack} days') as first_click,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN payments p ON p.user_id = u.id WHERE u.created_at > now() - interval '${daysBack} days') as first_conversion
  `);
    const row = rows[0];
    const signups = Number(row.signups) || 0;
    const botConnected = Number(row.bot_connected) || 0;
    const firstClick = Number(row.first_click) || 0;
    const firstConversion = Number(row.first_conversion) || 0;
    return {
        signups,
        botConnected,
        firstClick,
        firstConversion,
        conversionRate: signups > 0 ? `${((firstConversion / signups) * 100).toFixed(1)}%` : "0%",
    };
}
