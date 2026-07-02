// Per-site daily analytics. Cheap upsert counters in Postgres — no external service.
import { query, exec } from "./db.js";
const FIELDS = new Set(["views", "copies", "clicks"]);

export function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

// Fire-and-forget increment. Callers wrap in ctx.waitUntil so it never blocks a response.
export async function bumpStat(env, siteId, field) {
  if (!siteId || !FIELDS.has(field)) return; // field is from a fixed allow-list, safe to interpolate
  try {
    await exec(
      `INSERT INTO site_stats (site_id, day, ${field}) VALUES ($1, $2, 1)
       ON CONFLICT (site_id, day) DO UPDATE SET ${field} = site_stats.${field} + 1`,
      [siteId, todayUTC()]
    );
  } catch (err) { console.error("[bumpStat]: operation failed", err); }
}

// Last 30 days of rows plus rolled-up totals for the dashboard.
export async function getStats(env, siteId) {
  const since = new Date(Date.now() - 29 * 86400e3).toISOString().slice(0, 10);
  // day comes back as a DATE — normalise to a 'YYYY-MM-DD' string so the
  // client-side comparisons/lookups below keep matching.
  const rows = (await query(
    "SELECT to_char(day, 'YYYY-MM-DD') AS day, views, copies, clicks FROM site_stats WHERE site_id=$1 AND day>=$2 ORDER BY day ASC",
    [siteId, since]
  )) || [];
  const today = todayUTC();
  const since7 = new Date(Date.now() - 6 * 86400e3).toISOString().slice(0, 10);
  const sum = (from, f) => rows.reduce((n, r) => (r.day >= from ? n + (Number(r[f]) || 0) : n), 0);
  // Dense last-14-days series for the bar chart (missing days = 0).
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400e3).toISOString().slice(0, 10);
    const row = rows.find((r) => r.day === d);
    days.push({ day: d, views: Number(row?.views) || 0, copies: Number(row?.copies) || 0, clicks: Number(row?.clicks) || 0 });
  }
  return {
    today: { views: sum(today, "views"), copies: sum(today, "copies"), clicks: sum(today, "clicks") },
    last7: { views: sum(since7, "views"), copies: sum(since7, "copies"), clicks: sum(since7, "clicks") },
    last30: { views: sum(since, "views"), copies: sum(since, "copies"), clicks: sum(since, "clicks") },
    days,
  };
}
