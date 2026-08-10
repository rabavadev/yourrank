/** @jsxImportSource preact */
// Live credit balance. The number is always the server's `balance` field; the
// count-up only controls how fast the display travels to it, so a viewer who
// refreshes mid-animation still sees the authoritative figure.
import { useEffect, useState } from "preact/hooks";
import { formatCredits } from "../bet.js";
import { useCountUp } from "../motion.js";
import { CoinIcon } from "./icons.js";

export interface BalanceDisplayProps {
  balance: number;
  currency?: string;
  /** Payout of the round that just settled — shown as a brief "+N". */
  lastDelta?: number | null;
  class?: string;
}

export function BalanceDisplay({ balance, currency = "credits", lastDelta = null, class: cls = "" }: BalanceDisplayProps) {
  const shown = useCountUp(balance);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!lastDelta || lastDelta <= 0) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1400);
    return () => clearTimeout(t);
  }, [lastDelta]);

  return (
    <div class={`gx-balance${flash ? " gx-balance--flash" : ""} ${cls}`.trim()}>
      <CoinIcon />
      <span class="gx-balance__label">{currency}</span>
      {/* aria-live on the value only: the whole pill re-announcing every tick
          of the count-up would be unusable with a screen reader. */}
      <span class="gx-balance__value" aria-live="polite" aria-atomic="true">
        <span class="gx-sr">Balance: </span>
        {formatCredits(shown)}
      </span>
      {flash && lastDelta ? <span class="gx-balance__delta">+{formatCredits(lastDelta)}</span> : null}
    </div>
  );
}
