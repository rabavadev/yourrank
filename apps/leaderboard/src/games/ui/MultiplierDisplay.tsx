/** @jsxImportSource preact */
// Renders a multiplier the server returned. Tabular figures and a fixed two
// decimals keep the width stable while a game ticks it upward.
import { formatMultiplier, winTier } from "../bet.js";

export interface MultiplierDisplayProps {
  value: number;
  size?: "sm" | "md" | "lg";
  /** Override the tier when the game knows better (e.g. an open Mines round). */
  tier?: ReturnType<typeof winTier>;
  label?: string;
  class?: string;
}

export function MultiplierDisplay({ value, size = "md", tier, label, class: cls = "" }: MultiplierDisplayProps) {
  const resolved = tier ?? winTier(value);
  const text = formatMultiplier(value);
  return (
    <span class={`gx-mult gx-mult--${size} ${cls}`.trim()} data-tier={resolved} title={label}>
      <span class="gx-sr">{label ? `${label}: ` : ""}{text} multiplier</span>
      <span aria-hidden="true">{text.slice(0, -1)}</span>
      <span class="gx-mult__x" aria-hidden="true">
        ×
      </span>
    </span>
  );
}
