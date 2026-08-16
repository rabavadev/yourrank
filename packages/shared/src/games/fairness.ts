// ============================================================================
//  YourRank Originals — provably-fair commit/reveal RNG.
//
//  Commit:  the server generates a random `serverSeed`, publishes only
//           `serverSeedHash = sha256(serverSeed)`. The viewer knows (and can
//           change) the `clientSeed`. Every round consumes one `nonce`.
//  Reveal:  when the viewer rotates their seed, the previous `serverSeed` is
//           revealed, and every past round can be recomputed with
//           `verifyRound()` and checked against the published hash.
//
//  Stream:  hmacSha256(serverSeed, `${clientSeed}:${nonce}:${cursor}`) gives 32
//           bytes = 8 uniform floats (4 bytes each, big-endian base-256).
//           `cursor` increments per 8 floats, so a round can draw as many
//           floats as it needs deterministically.
//
//  Web Crypto only (Cloudflare Workers runtime) — never Node `crypto`.
// ============================================================================

import type { GameKey, Rng } from "./types.js";
import { isGameKey } from "./types.js";
import { resolveMines, minesFloatsNeeded, type MinesParams } from "./mines.js";
import { resolvePlinko, plinkoFloatsNeeded, type PlinkoParams } from "./plinko.js";
import { resolveDice, diceFloatsNeeded, type DiceParams } from "./dice.js";
import { resolveLimbo, limboFloatsNeeded, type LimboParams } from "./limbo.js";

const FLOATS_PER_BLOCK = 8;
const BYTES_PER_FLOAT = 4;

export interface SeedMaterial {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 32 random bytes, hex. Never leaves the server while the seed is active. */
export function newServerSeed(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
}

/** 16 random bytes, hex. Public; the viewer may replace it with their own. */
export function newClientSeed(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
}

/** The public commitment for a server seed. */
export function serverSeedHash(serverSeed: string): Promise<string> {
  return sha256Hex(serverSeed);
}

async function hmacSha256(key: string, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return new Uint8Array(sig);
}

/** Convert 4 bytes to a uniform float in [0, 1) — base-256 fixed point. */
function floatFromBytes(bytes: Uint8Array, offset: number): number {
  let value = 0;
  for (let i = 0; i < BYTES_PER_FLOAT; i++) {
    value += bytes[offset + i] / Math.pow(256, i + 1);
  }
  return value;
}

/**
 * Derive `count` deterministic uniform floats in [0, 1) for a round.
 * Identical inputs always produce an identical array — this is the whole
 * fairness guarantee, and what `verifyRound` replays.
 */
export async function randomFloats(seed: SeedMaterial, count: number): Promise<number[]> {
  if (!Number.isInteger(count) || count < 0) throw new Error("count must be a non-negative integer");
  const floats: number[] = [];
  const blocks = Math.ceil(count / FLOATS_PER_BLOCK);
  for (let cursor = 0; cursor < blocks; cursor++) {
    const bytes = await hmacSha256(seed.serverSeed, `${seed.clientSeed}:${seed.nonce}:${cursor}`);
    for (let i = 0; i < FLOATS_PER_BLOCK && floats.length < count; i++) {
      floats.push(floatFromBytes(bytes, i * BYTES_PER_FLOAT));
    }
  }
  return floats;
}

/** Wrap a pre-derived float array as a sequential RNG for the pure resolvers. */
export function rngFromFloats(floats: readonly number[]): Rng {
  let index = 0;
  return {
    next(): number {
      if (index >= floats.length) throw new Error("rng exhausted: not enough derived floats");
      return floats[index++];
    },
    nextInt(maxExclusive: number): number {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error("nextInt requires a positive integer bound");
      }
      return Math.min(Math.floor(this.next() * maxExclusive), maxExclusive - 1);
    },
    used(): number {
      return index;
    },
  };
}

/** Derive the stream and wrap it in one step. */
export async function createRng(seed: SeedMaterial, count: number): Promise<Rng> {
  return rngFromFloats(await randomFloats(seed, count));
}

/**
 * Fisher-Yates shuffle driven by the injected RNG. Consumes `items.length - 1`
 * floats. Returns a new array; the input is not mutated.
 */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Round verification
// ---------------------------------------------------------------------------

export interface VerifiableRound {
  game: GameKey;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  params: Record<string, unknown>;
  /** Outcome recorded by the server at bet time, for comparison. */
  outcome?: unknown;
}

export interface VerificationResult {
  ok: boolean;
  /** True when sha256(serverSeed) matches the hash published before play. */
  hashMatches: boolean;
  /** True when the recomputed outcome equals the stored one (if provided). */
  outcomeMatches: boolean;
  outcome: unknown;
  multiplier: number;
  error?: string;
}

/** How many uniform floats a round of `game` consumes. */
export function floatsNeeded(game: GameKey, params: Record<string, unknown>): number {
  switch (game) {
    case "mines":
      return minesFloatsNeeded(params as unknown as MinesParams);
    case "plinko":
      return plinkoFloatsNeeded(params as unknown as PlinkoParams);
    case "dice":
      return diceFloatsNeeded();
    case "limbo":
      return limboFloatsNeeded();
  }
}

function resolveByGame(game: GameKey, rng: Rng, params: Record<string, unknown>) {
  switch (game) {
    case "mines":
      return resolveMines(rng, params as unknown as MinesParams);
    case "plinko":
      return resolvePlinko(rng, params as unknown as PlinkoParams);
    case "dice":
      return resolveDice(rng, params as unknown as DiceParams);
    case "limbo":
      return resolveLimbo(rng, params as unknown as LimboParams);
  }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

/**
 * Recompute a past round from its revealed seeds. Anyone (including the
 * viewer, offline) can run this against the data returned by
 * `GET /api/games/history` plus a revealed server seed.
 */
export async function verifyRound(round: VerifiableRound): Promise<VerificationResult> {
  if (!isGameKey(round.game)) {
    return { ok: false, hashMatches: false, outcomeMatches: false, outcome: null, multiplier: 0, error: "unknown game" };
  }
  const hashMatches = (await sha256Hex(round.serverSeed)) === round.serverSeedHash;
  try {
    const rng = await createRng(
      { serverSeed: round.serverSeed, clientSeed: round.clientSeed, nonce: round.nonce },
      floatsNeeded(round.game, round.params)
    );
    const { outcome, multiplier } = resolveByGame(round.game, rng, round.params);
    const outcomeMatches =
      round.outcome === undefined || stableStringify(outcome) === stableStringify(round.outcome);
    return { ok: hashMatches && outcomeMatches, hashMatches, outcomeMatches, outcome, multiplier };
  } catch (e) {
    return {
      ok: false,
      hashMatches,
      outcomeMatches: false,
      outcome: null,
      multiplier: 0,
      error: (e as Error)?.message || "verification failed",
    };
  }
}
