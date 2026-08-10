// ============================================================================
//  Mock harness — DEVELOPMENT ONLY.
//
//  This exists so the per-game sessions can build against realistic responses
//  while the backend lands. Two rules keep it from becoming a liability:
//
//   1. It is never a fallback. `createGamesApi` never reaches for it; the only
//      way to get a MockGamesApi is to open the demo route, which is compiled
//      into its own chunk and only reachable behind `?demo=1` on a non-
//      production host. A failing production request stays a failure.
//   2. It is not a game engine. It fabricates *shapes*, using a seeded PRNG so
//      a demo session is reproducible. Nothing here may ever be imported by a
//      real game to decide an outcome — the server decides outcomes.
// ============================================================================
import type {
  BetRequest,
  BetResult,
  FairnessResponse,
  GameId,
  GamesConfig,
  HistoryEntry,
  HistoryResponse,
  MinesCashoutRequest,
  MinesRevealRequest,
} from "../types.js";
import { GamesApiError } from "./errors.js";
import type { GamesApi } from "./client.js";

/** Deterministic PRNG (mulberry32) so a demo run replays identically. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface MockOptions {
  seed?: number;
  balance?: number;
  latencyMs?: number;
  /** Force every call to fail with this code — for exercising error states. */
  failWith?: ConstructorParameters<typeof GamesApiError>[0];
  enabledGames?: GameId[];
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_CONFIG: GamesConfig = {
  enabled: true,
  currency: "credits",
  games: [
    { id: "mines", enabled: true, name: "Mines", minBet: 1, maxBet: 1000, options: { grid: 25, minMines: 1, maxMines: 24 } },
    { id: "plinko", enabled: true, name: "Plinko", minBet: 1, maxBet: 1000, maxMultiplier: 1000, options: { rows: [8, 12, 16] } },
    { id: "dice", enabled: true, name: "Dice", minBet: 1, maxBet: 1000, maxMultiplier: 9900 },
  ],
  limits: { maxBet: 1000, dailyWagerLimit: 20000, cooldownMs: 250 },
};

export class MockGamesApi implements GamesApi {
  private rng: () => number;
  private balance: number;
  private readonly latencyMs: number;
  private readonly options: MockOptions;
  private history: HistoryEntry[] = [];
  private openRound: { id: string; game: GameId; amount: number; revealed: number } | null = null;
  private nonce = 0;

  constructor(options: MockOptions = {}) {
    this.options = options;
    this.rng = mulberry32(options.seed ?? 1337);
    this.balance = options.balance ?? 2500;
    this.latencyMs = options.latencyMs ?? 260;
  }

  private async delay(): Promise<void> {
    if (this.options.failWith) throw new GamesApiError(this.options.failWith, 500);
    const sleep = this.options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
    // Jitter, so demo UI is exercised against variable latency rather than a
    // suspiciously constant one.
    await sleep(this.latencyMs * (0.6 + this.rng() * 0.8));
  }

  async getConfig(): Promise<GamesConfig> {
    await this.delay();
    const only = this.options.enabledGames;
    if (!only) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, games: DEFAULT_CONFIG.games.map((g) => ({ ...g, enabled: only.includes(g.id) })) };
  }

  async placeBet(req: Omit<BetRequest, "slug">): Promise<BetResult> {
    await this.delay();
    if (req.amount > this.balance) throw new GamesApiError("insufficient_credits", 400);
    this.balance -= req.amount;
    const roundId = `mock-${++this.nonce}`;

    if (req.game === "mines") {
      this.openRound = { id: roundId, game: "mines", amount: req.amount, revealed: 0 };
      return this.result(roundId, "mines", "open", req.amount, 1, 0, { revealed: [], grid: 25 });
    }

    const multiplier = this.rollMultiplier();
    const payout = Math.floor(req.amount * multiplier);
    this.balance += payout;
    const outcome =
      req.game === "plinko"
        ? { bucket: Math.floor(this.rng() * 13), rows: 12 }
        : { roll: Math.round(this.rng() * 10000) / 100, target: 50 };
    const res = this.result(roundId, req.game, payout > 0 ? "won" : "lost", req.amount, multiplier, payout, outcome);
    this.pushHistory(res);
    return res;
  }

  async minesReveal(req: Omit<MinesRevealRequest, "slug">): Promise<BetResult> {
    await this.delay();
    const round = this.openRound;
    if (!round || round.id !== req.roundId) throw new GamesApiError("round_not_found", 404);
    round.revealed += 1;
    const hitMine = this.rng() < 0.18;
    if (hitMine) {
      this.openRound = null;
      const res = this.result(round.id, "mines", "lost", round.amount, 0, 0, {
        tile: req.tile,
        mine: true,
        mines: [req.tile],
      });
      this.pushHistory(res);
      return res;
    }
    const multiplier = Math.round((1 + round.revealed * 0.32) * 100) / 100;
    return this.result(round.id, "mines", "open", round.amount, multiplier, 0, {
      tile: req.tile,
      mine: false,
      revealedCount: round.revealed,
    });
  }

  async minesCashout(req: Omit<MinesCashoutRequest, "slug">): Promise<BetResult> {
    await this.delay();
    const round = this.openRound;
    if (!round || round.id !== req.roundId) throw new GamesApiError("round_not_found", 404);
    const multiplier = Math.round((1 + round.revealed * 0.32) * 100) / 100;
    const payout = Math.floor(round.amount * multiplier);
    this.balance += payout;
    this.openRound = null;
    const res = this.result(round.id, "mines", "cashed_out", round.amount, multiplier, payout, {
      revealedCount: round.revealed,
    });
    this.pushHistory(res);
    return res;
  }

  async getHistory(params: { game?: GameId; limit?: number } = {}): Promise<HistoryResponse> {
    await this.delay();
    const rows = params.game ? this.history.filter((h) => h.game === params.game) : this.history;
    return { entries: rows.slice(0, params.limit ?? 20), nextCursor: null };
  }

  async getFairness(): Promise<FairnessResponse> {
    await this.delay();
    return {
      serverSeedHash: "mock-server-seed-hash-0000000000000000",
      clientSeed: "mock-client-seed",
      nonce: this.nonce,
    };
  }

  async rotateFairness(clientSeed?: string): Promise<FairnessResponse> {
    await this.delay();
    this.nonce = 0;
    return {
      serverSeedHash: "mock-server-seed-hash-1111111111111111",
      clientSeed: clientSeed || "mock-client-seed-2",
      nonce: 0,
      previous: {
        serverSeed: "mock-revealed-server-seed",
        serverSeedHash: "mock-server-seed-hash-0000000000000000",
        clientSeed: "mock-client-seed",
        nonce: this.nonce,
      },
    };
  }

  /** Test/demo affordance: read the mock's notion of the viewer's balance. */
  get currentBalance(): number {
    return this.balance;
  }

  private rollMultiplier(): number {
    const r = this.rng();
    if (r < 0.52) return 0;
    if (r < 0.86) return Math.round((0.9 + this.rng() * 1.4) * 100) / 100;
    if (r < 0.985) return Math.round((2.5 + this.rng() * 6) * 100) / 100;
    return Math.round((12 + this.rng() * 90) * 100) / 100;
  }

  private result(
    roundId: string,
    game: GameId,
    status: BetResult["status"],
    amount: number,
    multiplier: number,
    payout: number,
    outcome: Record<string, unknown>
  ): BetResult {
    return {
      roundId,
      game,
      status,
      amount,
      multiplier,
      payout,
      balance: this.balance,
      outcome,
      createdAt: new Date().toISOString(),
    };
  }

  private pushHistory(res: BetResult): void {
    this.history.unshift({
      roundId: res.roundId,
      game: res.game,
      amount: res.amount,
      multiplier: res.multiplier,
      payout: res.payout,
      status: res.status,
      createdAt: res.createdAt,
    });
    this.history = this.history.slice(0, 50);
  }
}

/**
 * The single entry point to mock data. Named so that a reviewer seeing it in a
 * non-demo file knows immediately that something is wrong.
 */
export function createMockGamesApi(options?: MockOptions): GamesApi {
  return new MockGamesApi(options);
}
