import type { BroadcastSegment } from "./validation.js";

/**
 * Build a WHERE clause for bot_subscribers based on a broadcast segment.
 * Returns { clause: string, values: unknown[] } where the clause is meant
 * to be appended after `WHERE bs.bot_id = $1 AND NOT bs.is_blocked`.
 */
export function buildSegmentWhere(segment: BroadcastSegment | null | undefined, paramOffset = 0): { clause: string; values: unknown[] } {
  const parts: string[] = [];
  const values: unknown[] = [];

  if (!segment) return { clause: "", values };

  const n = (idx: number) => `$${idx + paramOffset}`;

  if (segment.language) {
    values.push(segment.language);
    parts.push(`bs.language = ${n(values.length)}`);
  }
  if (segment.minLastSeenDays !== null && segment.minLastSeenDays !== undefined) {
    values.push(segment.minLastSeenDays);
    parts.push(`bs.last_seen >= now() - make_interval(days => ${n(values.length)})`);
  }
  if (segment.maxLastSeenDays !== null && segment.maxLastSeenDays !== undefined) {
    values.push(segment.maxLastSeenDays);
    parts.push(`bs.last_seen <= now() - make_interval(days => ${n(values.length)})`);
  }
  if (segment.firstSeenWithinDays !== null && segment.firstSeenWithinDays !== undefined) {
    values.push(segment.firstSeenWithinDays);
    parts.push(`bs.first_seen >= now() - make_interval(days => ${n(values.length)})`);
  }
  if (segment.usernameContains) {
    values.push(`%${segment.usernameContains}%`);
    parts.push(`bs.tg_username ILIKE ${n(values.length)}`);
  }

  return { clause: parts.length ? parts.join(" AND ") : "", values };
}

export function normalizeSegment(segment: BroadcastSegment | null | undefined): string {
  if (!segment) return "all";
  // Drop empty/null keys to keep JSON compact.
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(segment)) {
    if (v !== null && v !== undefined && v !== "") cleaned[k] = v;
  }
  return Object.keys(cleaned).length ? JSON.stringify(cleaned) : "all";
}

export function parseSegment(raw: string | null | undefined): BroadcastSegment | null {
  if (!raw || raw === "all") return null;
  try {
    const parsed = JSON.parse(raw) as BroadcastSegment;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}
