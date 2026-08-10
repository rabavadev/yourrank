/** @jsxImportSource preact */
// The bet controls every game shares. All arithmetic lives in bet.ts; this is
// the accessible shell around it: a number field, quick adjusters, one primary
// action, and one error line that never collapses (a message that appears by
// growing the panel pushes the action button out from under the thumb).
import type { ComponentChildren } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { applyQuickAction, clampToBounds, formatCredits, normalizeAmount, validateBet } from "../bet.js";
import type { BetBounds, QuickAction } from "../bet.js";
import { haptic } from "../haptics.js";
import { sound } from "../sound.js";
import { AlertIcon } from "./icons.js";
import { Button } from "./Button.js";

export interface BetPanelProps {
  bounds: BetBounds;
  amount: number;
  onAmountChange: (amount: number) => void;
  onSubmit: (amount: number) => void;
  currency?: string;
  /** Label of the primary action — "Bet", "Roll", "Drop"… */
  actionLabel?: string;
  /** In-flight round: the action shows a spinner and inputs lock. */
  loading?: boolean;
  /** Game-level lock (round open, streamer disabled the game, signed out…). */
  disabled?: boolean;
  /** Server-side error to show under the field, e.g. from a rejected bet. */
  error?: string | null;
  /** Slot for per-game controls (mine count, risk, target…). */
  children?: ComponentChildren;
  /** Optional secondary action, e.g. Mines' "Cash out". */
  secondary?: ComponentChildren;
}

const QUICK: Array<{ action: QuickAction; label: string; aria: string }> = [
  { action: "half", label: "½", aria: "Halve bet" },
  { action: "double", label: "2×", aria: "Double bet" },
  { action: "max", label: "max", aria: "Bet maximum" },
];

export function BetPanel({
  bounds,
  amount,
  onAmountChange,
  onSubmit,
  currency = "credits",
  actionLabel = "Bet",
  loading = false,
  disabled = false,
  error = null,
  children,
  secondary,
}: BetPanelProps) {
  // The field keeps its own string so a viewer can clear it and type freely;
  // the committed numeric value is what the parent (and validation) sees.
  const [raw, setRaw] = useState(String(amount));
  useEffect(() => setRaw(String(amount)), [amount]);

  const validation = useMemo(() => validateBet(amount, bounds, currency), [amount, bounds, currency]);
  const message = error ?? (raw === "" ? null : validation.message);
  const locked = disabled || loading;
  const canSubmit = validation.valid && !locked;

  const commit = (next: number) => {
    const value = clampToBounds(next, bounds);
    onAmountChange(value);
  };

  const quick = (action: QuickAction) => {
    sound.play("click");
    haptic("tap");
    commit(applyQuickAction(amount, action, bounds));
  };

  const submit = () => {
    if (!canSubmit) return;
    sound.play("bet");
    haptic("impact");
    onSubmit(amount);
  };

  return (
    <form
      class="gx-bet gx-surface"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <div class="gx-bet__head">
          <label class="gx-bet__label" for="gx-bet-amount">
            Bet amount
          </label>
          <span class="gx-bet__limits">
            {formatCredits(bounds.min)}–{formatCredits(bounds.max)}
          </span>
        </div>

        <div class="gx-bet__input-row" data-invalid={message && !validation.valid ? "true" : "false"}>
          <button type="button" class="gx-chip gx-chip--step" disabled={locked} aria-label="Decrease bet" onClick={() => quick("decrement")}>
            −
          </button>
          <input
            id="gx-bet-amount"
            class="gx-bet__input"
            type="number"
            inputMode="numeric"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={raw}
            disabled={locked}
            aria-invalid={validation.valid ? "false" : "true"}
            aria-describedby="gx-bet-error"
            onInput={(e) => {
              const next = (e.target as HTMLInputElement).value;
              setRaw(next);
              onAmountChange(normalizeAmount(Number(next)));
            }}
            onBlur={() => commit(Number(raw))}
          />
          <span class="gx-bet__currency" aria-hidden="true">
            {currency}
          </span>
          <button type="button" class="gx-chip gx-chip--step" disabled={locked} aria-label="Increase bet" onClick={() => quick("increment")}>
            +
          </button>
        </div>

        <div class="gx-bet__quick">
          {QUICK.map((q) => (
            <button
              key={q.action}
              type="button"
              class="gx-chip"
              disabled={locked}
              aria-label={q.aria}
              onClick={() => quick(q.action)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <p class="gx-bet__error" id="gx-bet-error" role="status" aria-live="polite">
          {message ? (
            <>
              <AlertIcon size={14} />
              {message}
            </>
          ) : null}
        </p>
      </div>

      {children}

      <Button type="submit" variant="primary" size="lg" block loading={loading} disabled={!canSubmit}>
        {actionLabel}
      </Button>
      {secondary}
    </form>
  );
}
