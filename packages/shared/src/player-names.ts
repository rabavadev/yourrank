export const PLAYER_NAME_MAX_GRAPHEMES = 80;

export function normalizePlayerName(name: unknown): string {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/gu, " ");
}

export function truncatePlayerName(
  name: unknown,
  maxGraphemes = PLAYER_NAME_MAX_GRAPHEMES,
): string {
  const value = String(name ?? "").trim().replace(/\s+/gu, " ");
  if (maxGraphemes <= 0 || !value) return "";
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(value), (part) => part.segment)
      .slice(0, maxGraphemes)
      .join("");
  }
  return Array.from(value).slice(0, maxGraphemes).join("");
}
