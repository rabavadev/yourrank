// Originals engine: fairness determinism, verifiability, and RTP sanity.
//
// Run: bun test packages/shared/src/__tests__/games-engine.test.ts

import { describe, it, expect } from "bun:test";
import {
  randomFloats,
  createRng,
  rngFromFloats,
  shuffle,
  sha256Hex,
  serverSeedHash,
  verifyRound,
  newServerSeed,
  newClientSeed,
} from "../games/fairness.js";
import {
  resolveMines,
  cashoutMultiplier,
  minesMultiplierTable,
  MINES_GRID_SIZE,
} from "../games/mines.js";
import { resolvePlinko, plinkoTableRtp, plinkoPayoutTable } from "../games/plinko.js";
import { resolveDice, diceMultiplier } from "../games/dice.js";
import { resolveLimbo } from "../games/limbo.js";
import { resolveRound, validateParams } from "../games/index.js";
import { DEFAULT_HOUSE_EDGE_BPS, edgeFactor, payoutForBet } from "../games/types.js";

const EDGE = DEFAULT_HOUSE_EDGE_BPS;
const TARGET_RTP = edgeFactor(EDGE); // 0.99

const SEED = {
  serverSeed: "a".repeat(64),
  clientSeed: "player-seed",
  nonce: 7,
};

describe("fairness stream", () => {
  it("is deterministic for identical seed material", async () => {
    const a = await randomFloats(SEED, 20);
    const b = await randomFloats(SEED, 20);
    expect(a).toEqual(b);
    expect(a).toHaveLength(20);
  });

  it("changes when any of serverSeed / clientSeed / nonce changes", async () => {
    const base = await randomFloats(SEED, 4);
    expect(await randomFloats({ ...SEED, nonce: 8 }, 4)).not.toEqual(base);
    expect(await randomFloats({ ...SEED, clientSeed: "other" }, 4)).not.toEqual(base);
    expect(await randomFloats({ ...SEED, serverSeed: "b".repeat(64) }, 4)).not.toEqual(base);
  });

  it("produces floats in [0, 1) that are roughly uniform", async () => {
    const floats = await randomFloats({ ...SEED, nonce: 1 }, 4000);
    expect(Math.min(...floats)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...floats)).toBeLessThan(1);
    const mean = floats.reduce((s, f) => s + f, 0) / floats.length;
    expect(Math.abs(mean - 0.5)).toBeLessThan(0.02);
  });

  it("keeps earlier floats stable as the requested count grows (block cursor)", async () => {
    const short = await randomFloats(SEED, 8);
    const long = await randomFloats(SEED, 40);
    expect(long.slice(0, 8)).toEqual(short);
  });

  it("commits with sha256 and generates distinct seeds", async () => {
    const seed = newServerSeed();
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
    expect(await serverSeedHash(seed)).toBe(await sha256Hex(seed));
    expect(newClientSeed()).not.toBe(newClientSeed());
  });

  it("shuffle is a permutation and is seed-deterministic", async () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const one = shuffle(items, await createRng(SEED, 24));
    const two = shuffle(items, await createRng(SEED, 24));
    expect(one).toEqual(two);
    expect([...one].sort((a, b) => a - b)).toEqual(items);
    expect(items[0]).toBe(0); // input not mutated
  });

  it("rng throws instead of silently reusing exhausted entropy", () => {
    const rng = rngFromFloats([0.1]);
    expect(rng.next()).toBe(0.1);
    expect(() => rng.next()).toThrow();
  });
});

describe("verifyRound", () => {
  const cases: Array<{ game: "mines" | "plinko" | "dice" | "limbo"; params: Record<string, unknown> }> = [
    { game: "mines", params: { gridSize: 25, mines: 5, houseEdgeBps: EDGE } },
    { game: "plinko", params: { rows: 16, risk: "medium", houseEdgeBps: EDGE } },
    { game: "dice", params: { target: 50, direction: "over", houseEdgeBps: EDGE } },
    { game: "limbo", params: { target: 2, houseEdgeBps: EDGE } },
  ];

  for (const { game, params } of cases) {
    it(`reproduces a ${game} round from the revealed seed`, async () => {
      const serverSeed = newServerSeed();
      const hash = await serverSeedHash(serverSeed);
      const seed = { serverSeed, clientSeed: "verify-me", nonce: 3 };
      const { outcome, multiplier } = await resolveRound(game, seed, params as never);

      const result = await verifyRound({
        game,
        serverSeed,
        serverSeedHash: hash,
        clientSeed: seed.clientSeed,
        nonce: seed.nonce,
        params,
        outcome,
      });
      expect(result.hashMatches).toBe(true);
      expect(result.outcomeMatches).toBe(true);
      expect(result.ok).toBe(true);
      expect(result.multiplier).toBe(multiplier);
    });
  }

  it("fails when the published hash does not match the revealed seed", async () => {
    const result = await verifyRound({
      game: "dice",
      serverSeed: newServerSeed(),
      serverSeedHash: "deadbeef",
      clientSeed: "c",
      nonce: 1,
      params: { target: 50, direction: "over", houseEdgeBps: EDGE },
    });
    expect(result.hashMatches).toBe(false);
    expect(result.ok).toBe(false);
  });

  it("fails when the stored outcome was tampered with", async () => {
    const serverSeed = newServerSeed();
    const hash = await serverSeedHash(serverSeed);
    const result = await verifyRound({
      game: "limbo",
      serverSeed,
      serverSeedHash: hash,
      clientSeed: "c",
      nonce: 1,
      params: { target: 2, houseEdgeBps: EDGE },
      outcome: { target: 2, crashPoint: 999, win: true },
    });
    expect(result.hashMatches).toBe(true);
    expect(result.outcomeMatches).toBe(false);
    expect(result.ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Monte Carlo RTP. Seeded, so these are deterministic — no flaky tests.
// ---------------------------------------------------------------------------

const ROUNDS = 20_000;
const BET = 1_000_000; // large bet so integer truncation is negligible

async function monteCarlo(
  game: "plinko" | "dice" | "limbo",
  params: Record<string, unknown>,
  rounds = ROUNDS
): Promise<number> {
  const serverSeed = "rtp-server-seed";
  let staked = 0;
  let returned = 0;
  for (let nonce = 0; nonce < rounds; nonce++) {
    const { multiplier } = await resolveRound(
      game,
      { serverSeed, clientSeed: "rtp", nonce },
      params as never
    );
    staked += BET;
    returned += payoutForBet(BET, multiplier);
  }
  return returned / staked;
}

describe("RTP", () => {
  it("dice pays ~1 - edge across targets", async () => {
    for (const [target, direction] of [
      [10, "under"],
      [50, "over"],
      [90, "under"],
    ] as const) {
      const rtp = await monteCarlo("dice", { target, direction, houseEdgeBps: EDGE }, 8000);
      expect(Math.abs(rtp - TARGET_RTP)).toBeLessThan(0.05);
    }
  }, 60_000);

  it("limbo pays ~1 - edge", async () => {
    const rtp = await monteCarlo("limbo", { target: 2, houseEdgeBps: EDGE }, 12_000);
    expect(Math.abs(rtp - TARGET_RTP)).toBeLessThan(0.05);
  }, 60_000);

  it("plinko payout tables have exactly the configured RTP", () => {
    for (const rows of [8, 12, 16]) {
      for (const risk of ["low", "medium", "high"] as const) {
        const rtp = plinkoTableRtp(rows, risk, EDGE);
        expect(rtp).toBeLessThanOrEqual(TARGET_RTP + 1e-9);
        expect(TARGET_RTP - rtp).toBeLessThan(0.01);
        expect(Math.min(...plinkoPayoutTable(rows, risk, EDGE))).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("plinko simulation matches its table", async () => {
    const rtp = await monteCarlo("plinko", { rows: 12, risk: "medium", houseEdgeBps: EDGE }, 8000);
    expect(Math.abs(rtp - TARGET_RTP)).toBeLessThan(0.05);
  }, 60_000);

  it("mines: every cashout depth has the same expected value", () => {
    const mines = 3;
    const safeTiles = MINES_GRID_SIZE - mines;
    for (let k = 1; k <= safeTiles; k++) {
      // P(surviving k picks) * multiplier(k) == 1 - edge
      let survive = 1;
      for (let i = 0; i < k; i++) survive *= (safeTiles - i) / (MINES_GRID_SIZE - i);
      const ev = survive * cashoutMultiplier(MINES_GRID_SIZE, mines, k, EDGE);
      expect(ev).toBeLessThanOrEqual(TARGET_RTP + 1e-9);
      expect(TARGET_RTP - ev).toBeLessThan(0.02);
    }
  });

  it("mines simulated play-to-k RTP tracks the ladder", async () => {
    const mines = 3;
    const k = 4;
    let staked = 0;
    let returned = 0;
    for (let nonce = 0; nonce < 5000; nonce++) {
      const { outcome } = await resolveRound(
        "mines",
        { serverSeed: "mines-rtp", clientSeed: "rtp", nonce },
        { gridSize: MINES_GRID_SIZE, mines, houseEdgeBps: EDGE }
      );
      const positions = (outcome as { minePositions: number[] }).minePositions;
      // Strategy: always pick tiles 0..k-1, cash out at k.
      const survived = ![0, 1, 2, 3].slice(0, k).some((t) => positions.includes(t));
      staked += BET;
      if (survived) returned += payoutForBet(BET, cashoutMultiplier(MINES_GRID_SIZE, mines, k, EDGE));
    }
    expect(Math.abs(returned / staked - TARGET_RTP)).toBeLessThan(0.06);
  }, 60_000);
});

describe("game resolvers", () => {
  it("mines places exactly `mines` distinct tiles and never leaks a multiplier", async () => {
    const rng = await createRng(SEED, 24);
    const { outcome, multiplier } = resolveMines(rng, { gridSize: 25, mines: 5, houseEdgeBps: EDGE });
    expect(multiplier).toBe(0); // pays only on cashout
    expect(new Set(outcome.minePositions).size).toBe(5);
    expect(outcome.minePositions.every((t) => t >= 0 && t < 25)).toBe(true);
  });

  it("mines ladder is monotonic and starts above 1", () => {
    const table = minesMultiplierTable(25, 3, EDGE);
    expect(table[0]).toBeGreaterThan(1);
    for (let i = 1; i < table.length; i++) expect(table[i]).toBeGreaterThan(table[i - 1]);
  });

  it("dice multiplier is inverse to win chance", () => {
    expect(diceMultiplier(50, "over", EDGE)).toBeCloseTo(1.98, 2);
    expect(diceMultiplier(98, "over", EDGE)).toBeGreaterThan(diceMultiplier(50, "over", EDGE));
  });

  it("dice/limbo/plinko outcomes are consistent with their multipliers", async () => {
    const dice = resolveDice(await createRng(SEED, 1), { target: 50, direction: "over", houseEdgeBps: EDGE });
    expect(dice.outcome.win).toBe(dice.multiplier > 0);
    const limbo = resolveLimbo(await createRng(SEED, 1), { target: 2, houseEdgeBps: EDGE });
    expect(limbo.outcome.win).toBe(limbo.multiplier > 0);
    const plinko = resolvePlinko(await createRng(SEED, 16), { rows: 16, risk: "high", houseEdgeBps: EDGE });
    expect(plinko.outcome.path).toHaveLength(16);
    expect(plinko.outcome.bucket).toBe(plinko.outcome.path.reduce((a, b) => a + b, 0));
  });
});

describe("param validation", () => {
  it("rejects out-of-range params", () => {
    expect(validateParams("mines", { mines: 0 }, EDGE).ok).toBe(false);
    expect(validateParams("mines", { mines: 25 }, EDGE).ok).toBe(false);
    expect(validateParams("plinko", { rows: 7, risk: "low" }, EDGE).ok).toBe(false);
    expect(validateParams("plinko", { rows: 8, risk: "insane" }, EDGE).ok).toBe(false);
    expect(validateParams("dice", { target: 99, direction: "over" }, EDGE).ok).toBe(false);
    expect(validateParams("dice", { target: 50, direction: "sideways" }, EDGE).ok).toBe(false);
    expect(validateParams("limbo", { target: 1 }, EDGE).ok).toBe(false);
    expect(validateParams("limbo", { target: 1001 }, EDGE).ok).toBe(false);
  });

  it("forces the site's house edge into the stored params", () => {
    const result = validateParams("dice", { target: 50, direction: "over", houseEdgeBps: 0 }, 250);
    expect(result.ok).toBe(true);
    if (result.ok) expect((result.params as { houseEdgeBps: number }).houseEdgeBps).toBe(250);
  });
});
