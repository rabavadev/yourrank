// ============================================================================
//  Dice — one uniform float becomes a roll in [0, 100).
//
//  The viewer picks a `target` and a `direction`:
//    over  → wins when roll >  target,  chance = (100 - target) / 100
//    under → wins when roll <  target,  chance = target / 100
//
//  multiplier = (1 - houseEdge) / chance, so the expected return is exactly
//  `1 - houseEdge` for every target (before the 2-decimal truncation).
//
//  The comparison uses the FULL-PRECISION roll, so the win chance is exactly
//  the stated one; `rollDisplay` is only a rounded value for the UI.
// ============================================================================

import type { GameResult, ParamsResult, Rng } from "./types.js";
import { edgeFactor, floorMultiplier } from "./types.js";

export const DICE_MIN_TARGET = 1;
export const DICE_MAX_TARGET = 98;
export const DICE_DIRECTIONS = ["over", "under"] as const;

export type DiceDirection = (typeof DICE_DIRECTIONS)[number];

export interface DiceParams {
  /** Integer 1..98 (percent). */
  target: number;
  direction: DiceDirection;
  houseEdgeBps: number;
}

export interface DiceOutcome {
  target: number;
  direction: DiceDirection;
  /** Full-precision roll in [0, 100) — the value the comparison used. */
  roll: number;
  /** Roll rounded to 2 decimals, for display. */
  rollDisplay: number;
  win: boolean;
}

export function diceFloatsNeeded(): number {
  return 1;
}

export function diceWinChance(target: number, direction: DiceDirection): number {
  return direction === "over" ? (100 - target) / 100 : target / 100;
}

export function diceMultiplier(target: number, direction: DiceDirection, houseEdgeBps: number): number {
  const chance = diceWinChance(target, direction);
  if (chance <= 0) return 0;
  return floorMultiplier(edgeFactor(houseEdgeBps) / chance);
}

export function validateDiceParams(raw: unknown, houseEdgeBps: number): ParamsResult<DiceParams> {
  const p = (raw ?? {}) as DiceParams;
  const target = Number(p.target);
  if (!Number.isInteger(target) || target < DICE_MIN_TARGET || target > DICE_MAX_TARGET) {
    return { ok: false, error: `target must be an integer between ${DICE_MIN_TARGET} and ${DICE_MAX_TARGET}` };
  }
  if (!DICE_DIRECTIONS.includes(p.direction)) return { ok: false, error: "direction must be over or under" };
  return { ok: true, params: { target, direction: p.direction, houseEdgeBps } };
}

export function resolveDice(rng: Rng, params: DiceParams): GameResult<DiceOutcome> {
  const { target, direction, houseEdgeBps } = params;
  const roll = rng.next() * 100;
  const win = direction === "over" ? roll > target : roll < target;
  const multiplier = win ? diceMultiplier(target, direction, houseEdgeBps) : 0;
  return {
    outcome: { target, direction, roll, rollDisplay: Math.floor(roll * 100) / 100, win },
    multiplier,
  };
}
