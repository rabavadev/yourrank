// ============================================================================
//  YourRank Originals — engine entry point.
//
//  The Worker only needs this module: validate params, resolve a round from
//  seed material, and settle. Everything here is deterministic and pure apart
//  from `resolveRound`, which awaits Web Crypto to derive the float stream.
// ============================================================================

import type { GameKey, ParamsResult, Rng } from "./types.js";
import { createRng, floatsNeeded, type SeedMaterial } from "./fairness.js";
import { resolveMines, validateMinesParams, type MinesParams } from "./mines.js";
import { resolvePlinko, validatePlinkoParams, type PlinkoParams } from "./plinko.js";
import { resolveDice, validateDiceParams, type DiceParams } from "./dice.js";
import { resolveLimbo, validateLimboParams, type LimboParams } from "./limbo.js";

export * from "./types.js";
export * from "./fairness.js";
export * from "./mines.js";
export * from "./plinko.js";
export * from "./dice.js";
export * from "./limbo.js";

export type GameParams = MinesParams | PlinkoParams | DiceParams | LimboParams;

/** Validate + normalise client-supplied params for a game. */
export function validateParams(
  game: GameKey,
  raw: unknown,
  houseEdgeBps: number
): ParamsResult<GameParams> {
  switch (game) {
    case "mines":
      return validateMinesParams(raw, houseEdgeBps);
    case "plinko":
      return validatePlinkoParams(raw, houseEdgeBps);
    case "dice":
      return validateDiceParams(raw, houseEdgeBps);
    case "limbo":
      return validateLimboParams(raw, houseEdgeBps);
  }
}

/** Pure dispatch to a game resolver with an already-derived RNG. */
export function resolveWithRng(
  game: GameKey,
  rng: Rng,
  params: GameParams
): { outcome: unknown; multiplier: number } {
  switch (game) {
    case "mines":
      return resolveMines(rng, params as MinesParams);
    case "plinko":
      return resolvePlinko(rng, params as PlinkoParams);
    case "dice":
      return resolveDice(rng, params as DiceParams);
    case "limbo":
      return resolveLimbo(rng, params as LimboParams);
  }
}

/**
 * Derive the round's float stream from the committed seed material and resolve
 * the outcome. `multiplier` is 0 for Mines (settled later via cashout).
 */
export async function resolveRound(
  game: GameKey,
  seed: SeedMaterial,
  params: GameParams
): Promise<{ outcome: unknown; multiplier: number }> {
  const rng = await createRng(seed, floatsNeeded(game, params as unknown as Record<string, unknown>));
  return resolveWithRng(game, rng, params);
}

/** True for games that stay `open` across multiple requests. */
export function isMultiStep(game: GameKey): boolean {
  return game === "mines";
}
