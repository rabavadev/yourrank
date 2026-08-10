// ============================================================================
//  Limbo — one uniform float becomes a crash point; the viewer wins their
//  chosen `target` multiplier when the crash point reaches it.
//
//    u          = 1 - float                  (uniform in (0, 1])
//    crashPoint = (1 - houseEdge) / u        (floored to 2 dp, min 1.00)
//    win        = crashPoint >= target       →  payout multiplier = target
//
//  P(win) = P(u <= (1 - edge) / target) = (1 - edge) / target, so
//  EV = target * (1 - edge) / target = 1 - edge for every target.
// ============================================================================

import type { GameResult, ParamsResult, Rng } from "./types.js";
import { edgeFactor, floorMultiplier } from "./types.js";

export const LIMBO_MIN_TARGET = 1.01;
export const LIMBO_MAX_TARGET = 1000;

export interface LimboParams {
  /** Target multiplier, 1.01 .. 1000, 2 decimals. */
  target: number;
  houseEdgeBps: number;
}

export interface LimboOutcome {
  target: number;
  crashPoint: number;
  win: boolean;
}

export function limboFloatsNeeded(): number {
  return 1;
}

export function limboWinChance(target: number, houseEdgeBps: number): number {
  if (target <= 0) return 0;
  return Math.min(edgeFactor(houseEdgeBps) / target, 1);
}

export function validateLimboParams(raw: unknown, houseEdgeBps: number): ParamsResult<LimboParams> {
  const p = (raw ?? {}) as LimboParams;
  const target = Math.floor(Number(p.target) * 100) / 100;
  if (!Number.isFinite(target) || target < LIMBO_MIN_TARGET || target > LIMBO_MAX_TARGET) {
    return { ok: false, error: `target must be between ${LIMBO_MIN_TARGET} and ${LIMBO_MAX_TARGET}` };
  }
  return { ok: true, params: { target, houseEdgeBps } };
}

export function resolveLimbo(rng: Rng, params: LimboParams): GameResult<LimboOutcome> {
  const { target, houseEdgeBps } = params;
  const u = 1 - rng.next(); // (0, 1]
  const crashPoint = Math.max(1, floorMultiplier(edgeFactor(houseEdgeBps) / u));
  const win = crashPoint >= target;
  return { outcome: { target, crashPoint, win }, multiplier: win ? floorMultiplier(target) : 0 };
}
