// ============================================================================
//  YourRank Originals — shared engine types.
//
//  Every game resolver is PURE: it takes an injected RNG plus validated params
//  and returns an outcome. No I/O, no DB, no Math.random, no Date.now.
// ============================================================================

/** Sequential source of uniform floats in [0, 1). Deterministic per round. */
export interface Rng {
  /** Next uniform float in [0, 1). Throws when the derived stream is exhausted. */
  next(): number;
  /** Next integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
  /** How many floats have been consumed so far (useful for verification). */
  used(): number;
}

/** Game keys supported by the Originals engine. */
export type GameKey = "mines" | "plinko" | "dice" | "limbo";

export const GAME_KEYS: readonly GameKey[] = ["mines", "plinko", "dice", "limbo"];

export function isGameKey(value: unknown): value is GameKey {
  return typeof value === "string" && (GAME_KEYS as readonly string[]).includes(value);
}

/** Default house edge for every game: 1.00% (100 basis points). */
export const DEFAULT_HOUSE_EDGE_BPS = 100;

/** Hard cap so a misconfigured site can never run a predatory edge. */
export const MAX_HOUSE_EDGE_BPS = 1000;

export function edgeFactor(houseEdgeBps: number): number {
  const bps = clampEdge(houseEdgeBps);
  return 1 - bps / 10_000;
}

export function clampEdge(houseEdgeBps: number): number {
  if (!Number.isFinite(houseEdgeBps)) return DEFAULT_HOUSE_EDGE_BPS;
  return Math.min(Math.max(Math.trunc(houseEdgeBps), 0), MAX_HOUSE_EDGE_BPS);
}

/** Multipliers are truncated (never rounded up) to 2 decimals in the house's favour. */
export function floorMultiplier(multiplier: number): number {
  if (!Number.isFinite(multiplier) || multiplier <= 0) return 0;
  return Math.floor(multiplier * 100) / 100;
}

/** Credits are integers; a payout is always truncated. */
export function payoutForBet(bet: number, multiplier: number): number {
  if (!Number.isFinite(bet) || bet <= 0) return 0;
  return Math.floor(bet * floorMultiplier(multiplier));
}

export interface GameResult<TOutcome> {
  /** Server-computed outcome. Stored before anything reaches the client. */
  outcome: TOutcome;
  /**
   * Payout multiplier for the round. `0` means the round lost.
   * Multi-step games (Mines) return `0` here; the settled multiplier comes
   * from `cashoutMultiplier` when the viewer cashes out.
   */
  multiplier: number;
}

export interface ParamsError {
  ok: false;
  error: string;
}

export interface ParamsOk<T> {
  ok: true;
  params: T;
}

export type ParamsResult<T> = ParamsOk<T> | ParamsError;
