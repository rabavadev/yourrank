// Bet-amount arithmetic and validation. Pure functions, no rendering, no
// network: BetPanel is a thin shell over these so the rules are testable and
// identical in every game.
//
// These checks are UX only. The backend re-validates every bet and is the sole
// authority on whether a round is allowed; failing a check here just saves the
// viewer a round-trip and gives them a clear message.

export interface BetBounds {
  min: number;
  max: number;
  balance: number;
}

export type BetIssue = "below_min" | "above_max" | "insufficient" | "not_a_number";

export interface BetValidation {
  valid: boolean;
  issue: BetIssue | null;
  message: string | null;
}

/** Credits are whole numbers — no fractional wagers anywhere in the product. */
export function normalizeAmount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export function clampToBounds(value: number, bounds: BetBounds): number {
  const ceiling = Math.min(bounds.max, bounds.balance);
  const amount = normalizeAmount(value);
  if (ceiling < bounds.min) return bounds.min;
  return Math.min(Math.max(amount, bounds.min), ceiling);
}

export function validateBet(value: number, bounds: BetBounds, currency = "credits"): BetValidation {
  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, issue: "not_a_number", message: "Enter a bet amount." };
  }
  const amount = normalizeAmount(value);
  if (amount < bounds.min) {
    return { valid: false, issue: "below_min", message: `Minimum bet is ${formatCredits(bounds.min)} ${currency}.` };
  }
  if (amount > bounds.max) {
    return { valid: false, issue: "above_max", message: `Maximum bet is ${formatCredits(bounds.max)} ${currency}.` };
  }
  if (amount > bounds.balance) {
    return { valid: false, issue: "insufficient", message: `You only have ${formatCredits(bounds.balance)} ${currency}.` };
  }
  return { valid: true, issue: null, message: null };
}

export type QuickAction = "half" | "double" | "max" | "min" | "increment" | "decrement";

/**
 * Quick-adjust buttons. Every result is clamped into the allowed range, so a
 * viewer holding "2×" past the cap lands exactly on the cap instead of on an
 * invalid amount they then have to fix.
 */
export function applyQuickAction(current: number, action: QuickAction, bounds: BetBounds, step = 1): number {
  const amount = normalizeAmount(current);
  switch (action) {
    case "half":
      return clampToBounds(Math.floor(amount / 2), bounds);
    case "double":
      return clampToBounds(amount * 2, bounds);
    case "max":
      return clampToBounds(Math.min(bounds.max, bounds.balance), bounds);
    case "min":
      return clampToBounds(bounds.min, bounds);
    case "increment":
      return clampToBounds(amount + step, bounds);
    case "decrement":
      return clampToBounds(amount - step, bounds);
    default:
      return clampToBounds(amount, bounds);
  }
}

/** Thousands separators, no decimals — credits are integers. */
export function formatCredits(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-US");
}

/** `2.00×` — fixed two decimals so the number doesn't jitter width while animating. */
export function formatMultiplier(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0.00×";
  return `${value.toFixed(2)}×`;
}

/** Win tiers drive feedback intensity: a 1.02× nudge must not feel like a jackpot. */
export type WinTier = "loss" | "push" | "small" | "big" | "huge";

export function winTier(multiplier: number): WinTier {
  if (!Number.isFinite(multiplier) || multiplier <= 0) return "loss";
  if (multiplier < 1) return "loss";
  if (multiplier === 1) return "push";
  if (multiplier < 3) return "small";
  if (multiplier < 10) return "big";
  return "huge";
}
