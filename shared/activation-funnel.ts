// Activation funnel tracking (Phase 5.3)
// Instruments: signup → bot connected → first tracked click
// Surfaces drop-off at each stage.

export type FunnelStage = "signup" | "bot_connected" | "first_click" | "first_conversion";

interface FunnelEvent {
  userId: string;
  stage: FunnelStage;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Track an activation funnel event.
 * Logs structured JSON for observability (Workers Logs / Logpush).
 * Can be extended to write to a analytics store if needed.
 */
export function trackActivation(
  worker: string,
  userId: string,
  stage: FunnelStage,
  metadata?: Record<string, unknown>
): void {
  const event: FunnelEvent = {
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
export async function getFunnelMetrics(
  sql: { unsafe: (query: string, params?: unknown[]) => Promise<unknown[]> },
  daysBack: number = 30
): Promise<{
  signups: number;
  botConnected: number;
  firstClick: number;
  firstConversion: number;
  conversionRate: string;
}> {
  // Coerce to a non-negative integer and bind as a parameter — never interpolate
  // it into the SQL text — so this stays injection-safe if ever wired to input.
  const days = Math.max(0, Math.floor(Number(daysBack) || 0));
  const rows = await sql.unsafe(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE created_at > now() - make_interval(days => $1)) as signups,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN bots b ON b.owner_id = u.id WHERE u.created_at > now() - make_interval(days => $1)) as bot_connected,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN sites s ON s.user_id = u.id JOIN clicks c ON c.site_id = s.id WHERE u.created_at > now() - make_interval(days => $1)) as first_click,
      (SELECT COUNT(DISTINCT u.id) FROM users u JOIN payments p ON p.user_id = u.id WHERE u.created_at > now() - make_interval(days => $1)) as first_conversion
  `, [days]);

  const row = rows[0] as Record<string, string>;
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
