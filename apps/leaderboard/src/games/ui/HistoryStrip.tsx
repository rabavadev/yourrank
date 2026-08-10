/** @jsxImportSource preact */
// Recent rounds, newest first. Purely a read-out of server history — it is not
// a record of what the client thinks happened.
import { formatMultiplier } from "../bet.js";
import type { HistoryEntry } from "../types.js";

export interface HistoryStripProps {
  entries: HistoryEntry[];
  limit?: number;
  loading?: boolean;
  class?: string;
}

export function HistoryStrip({ entries, limit = 20, loading = false, class: cls = "" }: HistoryStripProps) {
  const rows = entries.slice(0, limit);
  return (
    <div class={`gx-history ${cls}`.trim()} role="log" aria-label="Recent rounds" aria-live="polite">
      <span class="gx-history__label">Recent</span>
      {loading && rows.length === 0 ? (
        <span class="gx-history__empty">Loading…</span>
      ) : rows.length === 0 ? (
        <span class="gx-history__empty">No rounds yet.</span>
      ) : (
        rows.map((entry) => (
          <span
            key={entry.roundId}
            class="gx-history__item"
            data-win={entry.payout > 0 ? "true" : "false"}
            title={`${entry.game} · ${entry.payout > 0 ? "won" : "lost"} · ${new Date(entry.createdAt).toLocaleTimeString()}`}
          >
            {formatMultiplier(entry.multiplier)}
          </span>
        ))
      )}
    </div>
  );
}
