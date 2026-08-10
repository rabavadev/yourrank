// Haptic feedback for phones. Most viewers arrive from a mobile stream, where a
// short buzz on a result reads better than another on-screen flash. Silently
// absent on desktop and on iOS Safari, which exposes no Vibration API.
export type HapticPattern = "tap" | "impact" | "win" | "bigwin" | "error";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  impact: 18,
  win: [12, 40, 24],
  bigwin: [20, 40, 20, 40, 60],
  error: [30, 60, 30],
};

let enabled = true;

/** Follows the sound preference: a viewer who muted everything wants quiet. */
export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function haptic(pattern: HapticPattern): void {
  if (!enabled) return;
  const nav = globalThis.navigator as Navigator | undefined;
  if (!nav || typeof nav.vibrate !== "function") return;
  try {
    nav.vibrate(PATTERNS[pattern]);
  } catch {
    // Vibration is a nicety; a rejection must never bubble into game code.
  }
}
