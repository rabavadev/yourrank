/** @jsxImportSource preact */
// Round feedback, scaled to the size of the win. A 1.1× and a 50× must not get
// the same celebration or both stop meaning anything — the tier from bet.ts
// drives copy, colour and how long the overlay stays up.
import { useEffect } from "preact/hooks";
import { formatCredits, winTier } from "../bet.js";
import { haptic } from "../haptics.js";
import { sound } from "../sound.js";
import type { BetResult } from "../types.js";
import { MultiplierDisplay } from "./MultiplierDisplay.js";

export interface ResultToastProps {
  /** The settled round, or null when there is nothing to show. */
  result: BetResult | null;
  currency?: string;
  onDismiss: () => void;
  /** Escape hatch for tests and for games that own their own celebration. */
  autoDismissMs?: number;
}

const CAPTIONS = {
  loss: "No win",
  push: "Break even",
  small: "You won",
  big: "Big win",
  huge: "Massive win",
} as const;

const HOLD_MS = { loss: 1400, push: 1600, small: 1800, big: 2400, huge: 3200 } as const;

export function ResultToast({ result, currency = "credits", onDismiss, autoDismissMs }: ResultToastProps) {
  const tier = result ? (result.status === "lost" ? "loss" : winTier(result.multiplier)) : "loss";

  useEffect(() => {
    if (!result) return;
    sound.play(tier === "huge" || tier === "big" ? "bigwin" : tier === "loss" ? "lose" : "win");
    haptic(tier === "huge" ? "bigwin" : tier === "loss" ? "error" : "win");
    const hold = autoDismissMs ?? HOLD_MS[tier];
    const t = setTimeout(onDismiss, hold);
    return () => clearTimeout(t);
  }, [result, tier, autoDismissMs, onDismiss]);

  if (!result) return null;

  return (
    <div class="gx-toast-layer">
      {/* status, not alert: a win is not an error and must not interrupt what a
          screen-reader user is currently reading. */}
      <div class="gx-toast" data-tier={tier} role="status" aria-live="polite" onClick={onDismiss}>
        <span class="gx-toast__caption">{CAPTIONS[tier]}</span>
        <MultiplierDisplay value={result.multiplier} size="lg" tier={tier} />
        <span class="gx-toast__payout">
          {result.payout > 0 ? `+${formatCredits(result.payout)} ${currency}` : `−${formatCredits(result.amount)} ${currency}`}
        </span>
      </div>
    </div>
  );
}
