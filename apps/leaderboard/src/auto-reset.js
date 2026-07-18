// Auto-reset scheduler: closes out and archives boards whose countdown has expired
// when the streamer has enabled auto-reset. Runs from the scheduled Worker event.
import { query, exec, one } from "../../../shared/db.js";
import { createArchive, getPlayers } from "./site.js";
import { notifyReset } from "../../../shared/notifications.js";

const CLEAR_OPTIONS = new Set(["wagers", "players", "none"]);

function nextEndsAt(period, currentEndsAt) {
  const d = currentEndsAt ? new Date(currentEndsAt) : new Date();
  switch (period) {
    case "Weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "Season":
      d.setUTCMonth(d.getUTCMonth() + 3);
      break;
    case "Monthly":
    default:
      d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return d.toISOString();
}

export async function runAutoReset(env) {
  const rows = await query(
    `SELECT id, user_id, slug, name, period, ends_at, auto_reset_clear
       FROM sites
      WHERE published = true
        AND auto_reset_enabled = true
        AND ends_at IS NOT NULL
        AND ends_at <= now()
        AND (auto_reset_last_run_at IS NULL OR auto_reset_last_run_at < ends_at)
      ORDER BY ends_at ASC
      LIMIT 100`,
    []
  );

  for (const site of rows || []) {
    try {
      const players = await getPlayers(env, site.id);
      const top3 = players.slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0)).slice(0, 3);
      const label = `Auto-reset · ${new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
      const clear = CLEAR_OPTIONS.has(site.auto_reset_clear) ? site.auto_reset_clear : "wagers";

      const result = await createArchive(env, site.user_id, { label, clear, siteId: site.id });
      if (result.error) {
        console.error(`[auto-reset] archive failed for site ${site.id}: ${result.error}`);
        continue;
      }

      const nextEnds = nextEndsAt(site.period, site.ends_at);
      await exec(
        `UPDATE sites SET ends_at = $1, auto_reset_last_run_at = now(), updated_at = now() WHERE id = $2`,
        [nextEnds, site.id]
      );

      // Fire Discord/Telegram reset notifications if configured.
      await notifyReset({ one }, env, site.id, site.name, top3, site.period || "Monthly").catch((err) => {
        console.error(`[auto-reset] notify failed for site ${site.id}:`, err);
      });

      console.log(`[auto-reset] archived site ${site.slug} (${site.id}), next reset ${nextEnds}`);
    } catch (err) {
      console.error(`[auto-reset] failed for site ${site.id}:`, err);
    }
  }
}
