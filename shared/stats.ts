// Shared analytics counter helpers. Used by the leaderboard Worker and the
// queue consumer so click/view/copy increments are processed reliably.
import { withTransaction } from "./db.js";

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function extractDomain(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "").slice(0, 120);
  } catch {
    return null;
  }
}

const FIELDS = new Set(["views", "copies", "clicks"]);

export interface BumpParams {
  siteId: string;
  field: "views" | "copies" | "clicks";
  referer?: string | null;
}

/**
 * Fire-and-forget increment for daily site stats, hourly heatmap, and referrer
 * tracking. Idempotent on retries because the upserts use ON CONFLICT.
 */
export async function bumpStat(siteId: string, field: string, refererHeader?: string | null): Promise<void> {
  if (!siteId || !FIELDS.has(field)) return;
  const day = todayUTC();
  const viewsInc = field === "views" ? 1 : 0;
  const copiesInc = field === "copies" ? 1 : 0;
  const clicksInc = field === "clicks" ? 1 : 0;

  try {
    await withTransaction(async (tx) => {
      await tx.query(
        `INSERT INTO site_stats (site_id, day, views, copies, clicks) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (site_id, day) DO UPDATE SET
           views = site_stats.views + $3,
           copies = site_stats.copies + $4,
           clicks = site_stats.clicks + $5`,
        [siteId, day, viewsInc, copiesInc, clicksInc]
      );

      if (field === "views") {
        const now = new Date();
        const hour = now.getUTCHours();
        const dow = now.getUTCDay();
        await tx.query(
          `INSERT INTO site_stats_hourly (site_id, day, hour, day_of_week, views) VALUES ($1, $2, $3, $4, 1)
           ON CONFLICT (site_id, day, hour) DO UPDATE SET views = site_stats_hourly.views + 1`,
          [siteId, day, hour, dow]
        );

        const domain = extractDomain(refererHeader || null);
        if (domain) {
          await tx.query(
            `INSERT INTO site_referrers (site_id, day, domain, count) VALUES ($1, $2, $3, 1)
             ON CONFLICT (site_id, day, domain) DO UPDATE SET count = site_referrers.count + 1`,
            [siteId, day, domain]
          );
        }
      }
    });
  } catch (err) {
    console.error("[bumpStat]: operation failed", err);
    throw err;
  }
}
