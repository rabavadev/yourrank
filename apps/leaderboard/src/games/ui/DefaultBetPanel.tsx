/** @jsxImportSource preact */
// The bet panel a game gets when it has no options of its own: amount in,
// single bet out. It is also the reference implementation of the wiring a game
// with custom controls copies — place the bet, hand the server's result to the
// store, and render nothing that the server did not return.
import { useState } from "preact/hooks";
import { clampToBounds } from "../bet.js";
import type { BetBounds } from "../bet.js";
import { GamesApiError } from "../api/errors.js";
import type { GameProps } from "../registry.js";
import { BetPanel } from "./BetPanel.js";

export function DefaultBetPanel({ store, config }: GameProps) {
  const bounds: BetBounds = {
    min: config.minBet,
    max: Math.min(config.maxBet, store.config.value?.limits.maxBet ?? config.maxBet),
    balance: store.balance.value,
  };
  const [amount, setAmount] = useState(() => clampToBounds(config.minBet, bounds));
  const [error, setError] = useState<string | null>(null);

  const submit = async (value: number) => {
    setError(null);
    store.betting.value = true;
    try {
      const result = await store.api.placeBet({ game: config.id, amount: value });
      store.applyResult(result);
    } catch (err) {
      setError(err instanceof GamesApiError ? err.message : "That bet didn't go through. Try again.");
    } finally {
      store.betting.value = false;
    }
  };

  return (
    <BetPanel
      bounds={bounds}
      amount={amount}
      onAmountChange={setAmount}
      onSubmit={(value) => void submit(value)}
      currency={store.currency.value}
      actionLabel="Place bet"
      loading={store.betting.value}
      error={error}
    />
  );
}
