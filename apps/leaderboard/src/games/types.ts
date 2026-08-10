// ============================================================================
//  YourRank Originals — API contract types.
//
//  The single place the client describes the games API. Every component and
//  the API client read these types; nothing else re-declares a response shape.
//
//  Contract owner: the games backend (apps/leaderboard/src/handlers/games.js).
//  The client CONSUMES these shapes — it never invents an outcome, a payout or
//  a random value. Anything a viewer sees on screen came out of a server
//  response that arrived in one of the types below.
// ============================================================================

export type GameId = "mines" | "plinko" | "dice";

/** GET /api/games/config?slug= */
export interface GamesConfig {
  /** Streamer disabled Originals entirely — render nothing. */
  enabled: boolean;
  /** Display name of the credit unit ("credits" unless the streamer renamed it). */
  currency: string;
  games: GameConfig[];
  limits: GlobalLimits;
}

export interface GameConfig {
  id: GameId;
  /** Cosmetic only — the backend is the authority on whether a game may be played. */
  enabled: boolean;
  name: string;
  minBet: number;
  maxBet: number;
  /** Largest multiplier the game can pay, used for the "max win" hint. */
  maxMultiplier?: number;
  /** Per-game knobs (mines: grid size / mine counts, plinko: rows, ...). */
  options?: Record<string, unknown>;
}

export interface GlobalLimits {
  /** Hard cap on a single bet across every game. */
  maxBet: number;
  /** Rolling wager cap, if the streamer set one. `null` = no cap. */
  dailyWagerLimit: number | null;
  /** Server-enforced cooldown between rounds, milliseconds. */
  cooldownMs: number;
}

/** Signed-in viewer, as the games shell knows them. */
export interface ViewerState {
  authenticated: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  balance: number;
}

/** POST /api/games/bet */
export interface BetRequest {
  slug: string;
  game: GameId;
  amount: number;
  /** Per-game payload (mines: `{ mines: 3 }`, dice: `{ target: 50, over: true }`). */
  options?: Record<string, unknown>;
}

export type RoundStatus = "open" | "won" | "lost" | "cashed_out" | "void";

/**
 * The server's decision about a round. `multiplier`/`payout` are the numbers
 * the UI renders; `outcome` carries whatever the game needs to *replay* that
 * decision as animation (Plinko's bucket index, Mines' revealed board, ...).
 */
export interface BetResult {
  roundId: string;
  game: GameId;
  status: RoundStatus;
  amount: number;
  multiplier: number;
  payout: number;
  /** Viewer balance AFTER the server applied this round. Authoritative. */
  balance: number;
  /** Game-specific, server-decided animation input. Never generated client-side. */
  outcome: Record<string, unknown>;
  fairness?: RoundFairness;
  createdAt: string;
}

export interface RoundFairness {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  /** Only present once the seed pair has been rotated and revealed. */
  serverSeed?: string;
}

/** POST /api/games/mines/reveal */
export interface MinesRevealRequest {
  slug: string;
  roundId: string;
  tile: number;
}

/** POST /api/games/mines/cashout */
export interface MinesCashoutRequest {
  slug: string;
  roundId: string;
}

/** GET /api/games/history */
export interface HistoryResponse {
  entries: HistoryEntry[];
  nextCursor: string | null;
}

export interface HistoryEntry {
  roundId: string;
  game: GameId;
  amount: number;
  multiplier: number;
  payout: number;
  status: RoundStatus;
  createdAt: string;
}

/** GET /api/games/fairness */
export interface FairnessResponse {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  previous?: {
    serverSeed: string;
    serverSeedHash: string;
    clientSeed: string;
    nonce: number;
  };
}

/** Machine-readable failures the UI has a dedicated state for. */
export type GamesErrorCode =
  | "unauthenticated"
  | "games_disabled"
  | "game_disabled"
  | "insufficient_credits"
  | "bet_too_small"
  | "bet_too_large"
  | "limit_reached"
  | "cooldown"
  | "round_not_found"
  | "rate_limited"
  | "timeout"
  | "network"
  | "server_error"
  | "bad_request";
