// ============================================================================
//  Mines — multi-step game.
//
//  The mine layout is fixed at BET TIME, derived entirely from
//  (serverSeed, clientSeed, nonce). The round stays `open` while the viewer
//  reveals tiles one at a time; it settles on cashout (payout) or on hitting a
//  mine (payout 0). The server only ever tells the client about tiles it has
//  actually asked for — unrevealed mine positions are never serialised into a
//  response for an open round.
// ============================================================================

import type { GameResult, ParamsResult, Rng } from "./types.js";
import { edgeFactor, floorMultiplier } from "./types.js";
import { shuffle } from "./fairness.js";

export const MINES_GRID_SIZE = 25;
export const MINES_MIN = 1;
export const MINES_MAX = 24;

export interface MinesParams {
  /** Number of tiles on the grid. Fixed at 25 (5x5) for v1. */
  gridSize?: number;
  /** Number of mines hidden on the grid, 1..gridSize-1. */
  mines: number;
  /** Stored with the round so the cashout ladder is reproducible. */
  houseEdgeBps: number;
}

export interface MinesOutcome {
  gridSize: number;
  mines: number;
  /** Sorted tile indices holding a mine. SECRET while the round is open. */
  minePositions: number[];
}

export function minesFloatsNeeded(params: MinesParams): number {
  const gridSize = params?.gridSize ?? MINES_GRID_SIZE;
  return Math.max(gridSize - 1, 0);
}

export function validateMinesParams(raw: unknown, houseEdgeBps: number): ParamsResult<MinesParams> {
  const p = (raw ?? {}) as MinesParams;
  const gridSize = p.gridSize ?? MINES_GRID_SIZE;
  if (gridSize !== MINES_GRID_SIZE) return { ok: false, error: "gridSize must be 25" };
  const mines = Number(p.mines);
  if (!Number.isInteger(mines) || mines < MINES_MIN || mines > MINES_MAX) {
    return { ok: false, error: `mines must be an integer between ${MINES_MIN} and ${MINES_MAX}` };
  }
  return { ok: true, params: { gridSize, mines, houseEdgeBps } };
}

/**
 * Pure resolver: places the mines. `multiplier` is 0 because a Mines round is
 * only worth something once the viewer cashes out — see `cashoutMultiplier`.
 */
export function resolveMines(rng: Rng, params: MinesParams): GameResult<MinesOutcome> {
  const gridSize = params.gridSize ?? MINES_GRID_SIZE;
  const mines = params.mines;
  const tiles = Array.from({ length: gridSize }, (_, i) => i);
  const minePositions = shuffle(tiles, rng).slice(0, mines).sort((a, b) => a - b);
  return { outcome: { gridSize, mines, minePositions }, multiplier: 0 };
}

/**
 * Fair multiplier after `revealed` safe tiles:
 *
 *   P(surviving k picks) = C(n-m, k) / C(n, k)
 *   fair                 = 1 / P
 *   multiplier           = (1 - houseEdge) * fair      (truncated to 2 dp)
 *
 * So the expected return of any cashout strategy is exactly `1 - houseEdge`
 * (before truncation, which is a further sliver in the house's favour).
 */
export function cashoutMultiplier(
  gridSize: number,
  mines: number,
  revealed: number,
  houseEdgeBps: number
): number {
  if (!Number.isInteger(revealed) || revealed <= 0) return 0;
  const safeTiles = gridSize - mines;
  if (revealed > safeTiles) return 0;
  let fair = 1;
  for (let i = 0; i < revealed; i++) {
    // 1 / P(survive) telescopes into a product of (n - i) / (n - m - i).
    fair *= (gridSize - i) / (safeTiles - i);
  }
  return floorMultiplier(edgeFactor(houseEdgeBps) * fair);
}

/** Full cashout ladder (index 0 = 1 tile revealed). Safe to show the client. */
export function minesMultiplierTable(gridSize: number, mines: number, houseEdgeBps: number): number[] {
  const safeTiles = gridSize - mines;
  const table: number[] = [];
  for (let revealed = 1; revealed <= safeTiles; revealed++) {
    table.push(cashoutMultiplier(gridSize, mines, revealed, houseEdgeBps));
  }
  return table;
}
