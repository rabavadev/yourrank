// ============================================================================
//  Plinko — a ball falls through `rows` pegs, going left or right at each peg,
//  and lands in one of `rows + 1` buckets.
//
//  Bucket probabilities are binomial: p_i = C(rows, i) / 2^rows.
//  The payout table is generated (not hand-tuned) so that the expected return
//  is exactly `1 - houseEdge`:
//
//      raw_i  = (1 / p_i) ^ alpha            (alpha = volatility per risk tier)
//      mult_i = (1 - edge) * raw_i / SUM_i (p_i * raw_i)
//
//  alpha = 1 would pay every bucket its fair odds (flat, boring); alpha < 1
//  compresses the extremes. Higher risk = higher alpha = fatter tails.
// ============================================================================

import type { GameResult, ParamsResult, Rng } from "./types.js";
import { edgeFactor, floorMultiplier } from "./types.js";

export const PLINKO_MIN_ROWS = 8;
export const PLINKO_MAX_ROWS = 16;
export const PLINKO_RISKS = ["low", "medium", "high"] as const;

export type PlinkoRisk = (typeof PLINKO_RISKS)[number];

const RISK_ALPHA: Record<PlinkoRisk, number> = {
  low: 0.35,
  medium: 0.6,
  high: 0.85,
};

export interface PlinkoParams {
  rows: number;
  risk: PlinkoRisk;
  /** Stored with the round so a verifier reproduces the exact payout table. */
  houseEdgeBps: number;
}

export interface PlinkoOutcome {
  rows: number;
  risk: PlinkoRisk;
  /** One entry per row: 0 = left, 1 = right. */
  path: number[];
  /** Bucket index 0..rows (number of rights taken). */
  bucket: number;
}

export function plinkoFloatsNeeded(params: PlinkoParams): number {
  return Number(params?.rows) || 0;
}

export function validatePlinkoParams(raw: unknown, houseEdgeBps: number): ParamsResult<PlinkoParams> {
  const p = (raw ?? {}) as PlinkoParams;
  const rows = Number(p.rows);
  if (!Number.isInteger(rows) || rows < PLINKO_MIN_ROWS || rows > PLINKO_MAX_ROWS) {
    return { ok: false, error: `rows must be an integer between ${PLINKO_MIN_ROWS} and ${PLINKO_MAX_ROWS}` };
  }
  const risk = p.risk;
  if (!PLINKO_RISKS.includes(risk)) return { ok: false, error: "risk must be low, medium or high" };
  return { ok: true, params: { rows, risk, houseEdgeBps } };
}

function binomialCoefficient(n: number, k: number): number {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

/** Bucket probabilities, index 0..rows. */
export function bucketProbabilities(rows: number): number[] {
  const total = Math.pow(2, rows);
  return Array.from({ length: rows + 1 }, (_, i) => binomialCoefficient(rows, i) / total);
}

/**
 * Payout table for a row count / risk tier. Expected value equals
 * `1 - houseEdge` up to the 2-decimal truncation applied to each entry.
 */
export function plinkoPayoutTable(rows: number, risk: PlinkoRisk, houseEdgeBps: number): number[] {
  const probs = bucketProbabilities(rows);
  const alpha = RISK_ALPHA[risk];
  const raw = probs.map((p) => Math.pow(1 / p, alpha));
  const expected = probs.reduce((sum, p, i) => sum + p * raw[i], 0);
  const scale = edgeFactor(houseEdgeBps) / expected;
  return raw.map((r) => floorMultiplier(r * scale));
}

/** Theoretical RTP of the (truncated) payout table — used by the RTP tests. */
export function plinkoTableRtp(rows: number, risk: PlinkoRisk, houseEdgeBps: number): number {
  const probs = bucketProbabilities(rows);
  const table = plinkoPayoutTable(rows, risk, houseEdgeBps);
  return probs.reduce((sum, p, i) => sum + p * table[i], 0);
}

export function resolvePlinko(rng: Rng, params: PlinkoParams): GameResult<PlinkoOutcome> {
  const { rows, risk, houseEdgeBps } = params;
  const path: number[] = [];
  let bucket = 0;
  for (let i = 0; i < rows; i++) {
    const right = rng.next() < 0.5 ? 0 : 1;
    path.push(right);
    bucket += right;
  }
  const multiplier = plinkoPayoutTable(rows, risk, houseEdgeBps)[bucket];
  return { outcome: { rows, risk, path, bucket }, multiplier };
}
