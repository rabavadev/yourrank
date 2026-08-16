// Originals games HTTP handlers: authentication, authorization and — most
// importantly — that no response ever leaks future information (the active
// server seed, or the mine layout of an open round).
//
// The DB-level money guarantees (atomic debit, idempotency, concurrency) are
// covered against a real Postgres in packages/shared/src/__tests__/games-wagering.test.ts.
//
// Run: bun test src/__tests__/games-handlers.test.js

import { describe, it, expect, beforeEach } from "bun:test";

let currentViewer = { id: "viewer-1" };

// In-memory games store. Each test tweaks `state` to script a scenario.
const state = {
  player: { id: "sv-1", balance: 1000, blocked: false },
  settings: { game: "mines", enabled: true, minBet: 1, maxBet: 500, houseEdgeBps: 100, dailyLossCap: null },
  betResult: null,
  round: null,
  settled: [],
};

const MINE_POSITIONS = [3, 9, 17];

function openMinesRound(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    game: "mines",
    bet: 100,
    state: "open",
    payout: 0,
    multiplier: 0,
    house_edge_bps: 100,
    server_seed_hash: "hash",
    client_seed: "client",
    nonce: 1,
    params: { gridSize: 25, mines: 3, houseEdgeBps: 100 },
    outcome: { gridSize: 25, mines: 3, minePositions: MINE_POSITIONS },
    revealed: [],
    created_at: "2026-01-01T00:00:00Z",
    settled_at: null,
    ...overrides,
  };
}

const testDependencies = {
  getPublicSite: async (_env, slug) => {
    if (slug === "missing") return null;
    return { id: "site-1", data: { slug }, plan: "pro", suspended: false };
  },
  requireViewer: async () => (currentViewer
    ? { viewer: currentViewer, cookie: null, res: null }
    : { viewer: null, cookie: null, res: new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 }) }),
  rateLimit: async () => ({ ok: true }),
  getSiteGamesConfig: async () => ({
    siteId: "site-1",
    gamesEnabled: true,
    games: [
      { game: "mines", enabled: true, minBet: 1, maxBet: 500, houseEdgeBps: 100, dailyLossCap: null },
      { game: "dice", enabled: false, minBet: 1, maxBet: 500, houseEdgeBps: 100, dailyLossCap: null },
    ],
  }),
  getGameSettings: async () => state.settings,
  getSiteViewer: async () => state.player,
  ensureSeed: async () => ({ serverSeedHash: "hash", clientSeed: "client", nonce: 0 }),
  getFairness: async () => ({ serverSeedHash: "hash", clientSeed: "client", nonce: 4 }),
  listRevealedSeeds: async () => [
    { serverSeed: "old-seed", serverSeedHash: "old-hash", clientSeed: "old-client", finalNonce: 3 },
  ],
  rotateSeed: async () => ({
    ok: true,
    result: {
      revealed: { serverSeed: "old-seed", serverSeedHash: "old-hash", clientSeed: "old-client", finalNonce: 3 },
      current: { serverSeedHash: "new-hash", clientSeed: "new-client", nonce: 0 },
    },
  }),
  placeBet: async () => state.betResult,
  setRoundOutcome: async () => {},
  settleRound: async (roundId, multiplier, payout) => {
    state.settled.push({ roundId, multiplier, payout });
    return { ok: true, payout, multiplier, balance: 900 + payout };
  },
  getOwnedRound: async () => state.round,
  revealTile: async (_id, _sv, tile) => [...(state.round.revealed || []), tile],
  listHistory: async () => [state.round],
};

const {
  handleGamesConfig: handleGamesConfigImpl,
  handleGamesBet: handleGamesBetImpl,
  handleGamesMinesReveal: handleGamesMinesRevealImpl,
  handleGamesMinesCashout: handleGamesMinesCashoutImpl,
  handleGamesHistory: handleGamesHistoryImpl,
  handleGamesFairness: handleGamesFairnessImpl,
  handleGamesFairnessRotate: handleGamesFairnessRotateImpl,
} = await import("../handlers/games.js");

const handleGamesConfig = (request, env) => handleGamesConfigImpl(request, env, testDependencies);
const handleGamesBet = (request, env) => handleGamesBetImpl(request, env, testDependencies);
const handleGamesMinesReveal = (request, env) => handleGamesMinesRevealImpl(request, env, testDependencies);
const handleGamesMinesCashout = (request, env) => handleGamesMinesCashoutImpl(request, env, testDependencies);
const handleGamesHistory = (request, env) => handleGamesHistoryImpl(request, env, testDependencies);
const handleGamesFairness = (request, env) => handleGamesFairnessImpl(request, env, testDependencies);
const handleGamesFairnessRotate = (request, env) => handleGamesFairnessRotateImpl(request, env, testDependencies);

function env() {
  const store = new Map();
  return {
    SESSIONS: {
      get: async (k) => store.get(k) ?? null,
      put: async (k, v) => { store.set(k, v); },
    },
    HYPERDRIVE: { connectionString: "postgresql://mock" },
  };
}

function post(path, body) {
  const req = new Request(`https://x.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return req;
}

const get = (path) => new Request(`https://x.test${path}`);

async function jsonOf(res) {
  return JSON.parse(await res.text());
}

beforeEach(() => {
  currentViewer = { id: "viewer-1" };
  state.player = { id: "sv-1", balance: 1000, blocked: false };
  state.settings = { game: "mines", enabled: true, minBet: 1, maxBet: 500, houseEdgeBps: 100, dailyLossCap: null };
  state.round = openMinesRound();
  state.settled = [];
  state.betResult = {
    ok: true,
    replayed: false,
    roundId: "11111111-1111-4111-8111-111111111111",
    nonce: 1,
    serverSeed: "SUPER-SECRET-SERVER-SEED",
    serverSeedHash: "hash",
    clientSeed: "client",
    state: "open",
    outcomeRecorded: false,
    balance: 900,
    houseEdgeBps: 100,
  };
});

describe("GET /api/games/config", () => {
  it("returns only enabled games with their limits", async () => {
    const res = await handleGamesConfig(get("/api/games/config?slug=board"), env());
    const body = await jsonOf(res);
    expect(res.status).toBe(200);
    expect(body.gamesEnabled).toBe(true);
    expect(body.games.map((g) => g.game)).toEqual(["mines"]);
    expect(body.games[0].maxBet).toBe(500);
  });

  it("requires a slug", async () => {
    const res = await handleGamesConfig(get("/api/games/config"), env());
    expect(res.status).toBe(400);
  });

  it("404s for an unknown board", async () => {
    const res = await handleGamesConfig(get("/api/games/config?slug=missing"), env());
    expect(res.status).toBe(404);
  });
});

describe("authorization", () => {
  it("rejects a bet with no viewer session", async () => {
    currentViewer = null;
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(401);
  });

  it("rejects a blocked viewer", async () => {
    state.player = { id: "sv-1", balance: 1000, blocked: true };
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(403);
  });

  it("rejects a viewer with no credits on this board", async () => {
    state.player = null;
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(400);
  });

  it("rejects a disabled game before touching the ledger", async () => {
    state.settings = { ...state.settings, enabled: false };
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(403);
    expect((await jsonOf(res)).error).toBe("game disabled");
  });

  it("rejects an unknown game key", async () => {
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "roulette", bet: 10, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(400);
  });

  it("requires an idempotency key", async () => {
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, params: { mines: 3 } }),
      env()
    );
    expect(res.status).toBe(400);
    expect((await jsonOf(res)).error).toBe("idempotencyKey required");
  });

  it("rejects a non-integer bet", async () => {
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 1.5, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(400);
  });

  it("surfaces a rejection from place_bet without settling anything", async () => {
    state.betResult = { ok: false, error: "insufficient balance" };
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 10, params: { mines: 3 }, idempotencyKey: "k".repeat(10) }),
      env()
    );
    expect(res.status).toBe(400);
    expect(state.settled).toHaveLength(0);
  });

  it("cannot act on another viewer's round", async () => {
    state.round = null; // getOwnedRound filters by site_viewer_id
    const res = await handleGamesMinesCashout(
      post("/api/games/mines/cashout", { slug: "board", roundId: "11111111-1111-4111-8111-111111111111" }),
      env()
    );
    expect(res.status).toBe(404);
  });
});

describe("information leakage", () => {
  it("a mines bet response contains no mine positions, outcome or server seed", async () => {
    const res = await handleGamesBet(
      post("/api/games/bet", { slug: "board", game: "mines", bet: 100, params: { mines: 3 }, idempotencyKey: "k".repeat(10) }),
      env()
    );
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).not.toContain("SUPER-SECRET-SERVER-SEED");
    expect(text).not.toContain("minePositions");
    const body = JSON.parse(text);
    expect(body.round.state).toBe("open");
    expect(body.round.outcome).toBeUndefined();
    expect(body.multiplierTable[0]).toBeGreaterThan(1);
    // The round must not be settled at bet time for a multi-step game.
    expect(state.settled).toHaveLength(0);
  });

  it("a safe reveal returns only the asked-for tile and the ladder", async () => {
    const res = await handleGamesMinesReveal(
      post("/api/games/mines/reveal", { slug: "board", roundId: state.round.id, tile: 0 }),
      env()
    );
    const text = await res.text();
    expect(text).not.toContain("minePositions");
    const body = JSON.parse(text);
    expect(body.hitMine).toBe(false);
    expect(body.revealed).toEqual([0]);
    expect(body.multiplier).toBeGreaterThan(1);
    expect(body.nextMultiplier).toBeGreaterThan(body.multiplier);
  });

  it("hitting a mine settles the round for zero and only then reveals the layout", async () => {
    const res = await handleGamesMinesReveal(
      post("/api/games/mines/reveal", { slug: "board", roundId: state.round.id, tile: MINE_POSITIONS[0] }),
      env()
    );
    const body = await jsonOf(res);
    expect(body.hitMine).toBe(true);
    expect(body.state).toBe("settled");
    expect(body.minePositions).toEqual(MINE_POSITIONS);
    expect(state.settled).toEqual([{ roundId: state.round.id, multiplier: 0, payout: 0 }]);
  });

  it("history hides the outcome of an open round", async () => {
    const res = await handleGamesHistory(get("/api/games/history?slug=board"), env());
    const text = await res.text();
    expect(text).not.toContain("minePositions");
    expect((await jsonOf(new Response(text))).rounds[0].outcome).toBeNull();
  });

  it("history exposes the outcome of a settled round", async () => {
    state.round = openMinesRound({ state: "settled", payout: 250, multiplier: 2.5 });
    const res = await handleGamesHistory(get("/api/games/history?slug=board"), env());
    const body = await jsonOf(res);
    expect(body.rounds[0].outcome.minePositions).toEqual(MINE_POSITIONS);
  });

  it("the fairness endpoint publishes the hash but never the active server seed", async () => {
    const res = await handleGamesFairness(get("/api/games/fairness?slug=board"), env());
    const body = await jsonOf(res);
    expect(body.current.serverSeedHash).toBe("hash");
    expect(body.current.serverSeed).toBeUndefined();
    expect(body.revealed[0].serverSeed).toBe("old-seed"); // retired seeds are public
  });

  it("rotation reveals the previous seed and commits a new hash", async () => {
    const res = await handleGamesFairnessRotate(post("/api/games/fairness/rotate", { slug: "board" }), env());
    const body = await jsonOf(res);
    expect(body.revealed.serverSeed).toBe("old-seed");
    expect(body.current.serverSeedHash).toBe("new-hash");
    expect(body.current.serverSeed).toBeUndefined();
  });
});

describe("mines cashout", () => {
  it("refuses a cashout before any tile is revealed", async () => {
    const res = await handleGamesMinesCashout(
      post("/api/games/mines/cashout", { slug: "board", roundId: state.round.id }),
      env()
    );
    expect(res.status).toBe(400);
    expect(state.settled).toHaveLength(0);
  });

  it("pays the ladder multiplier for the revealed count", async () => {
    state.round = openMinesRound({ revealed: [0, 1] });
    const res = await handleGamesMinesCashout(
      post("/api/games/mines/cashout", { slug: "board", roundId: state.round.id }),
      env()
    );
    const body = await jsonOf(res);
    expect(body.state).toBe("settled");
    expect(body.multiplier).toBeGreaterThan(1);
    expect(body.payout).toBe(Math.floor(100 * body.multiplier));
  });

  it("a repeated cashout returns the stored result instead of paying twice", async () => {
    state.round = openMinesRound({ state: "settled", revealed: [0, 1], payout: 128, multiplier: 1.28 });
    const res = await handleGamesMinesCashout(
      post("/api/games/mines/cashout", { slug: "board", roundId: state.round.id }),
      env()
    );
    const body = await jsonOf(res);
    expect(body.replayed).toBe(true);
    expect(body.payout).toBe(128);
    expect(state.settled).toHaveLength(0);
  });

  it("refuses to reveal a tile on a settled round", async () => {
    state.round = openMinesRound({ state: "settled" });
    const res = await handleGamesMinesReveal(
      post("/api/games/mines/reveal", { slug: "board", roundId: state.round.id, tile: 5 }),
      env()
    );
    expect(res.status).toBe(409);
  });
});

describe("single-step games", () => {
  it("settles a dice round immediately and returns the stored outcome", async () => {
    state.settings = { ...state.settings, game: "dice" };
    const res = await handleGamesBet(
      post("/api/games/bet", {
        slug: "board",
        game: "dice",
        bet: 100,
        params: { target: 50, direction: "over" },
        idempotencyKey: "k".repeat(10),
      }),
      env()
    );
    const text = await res.text();
    expect(text).not.toContain("SUPER-SECRET-SERVER-SEED");
    const body = JSON.parse(text);
    expect(body.round.state).toBe("settled");
    expect(typeof body.round.outcome.roll).toBe("number");
    expect(state.settled).toHaveLength(1);
    expect(state.settled[0].payout).toBe(body.round.payout);
  });

  it("rejects invalid game params", async () => {
    state.settings = { ...state.settings, game: "dice" };
    const res = await handleGamesBet(
      post("/api/games/bet", {
        slug: "board",
        game: "dice",
        bet: 100,
        params: { target: 500, direction: "over" },
        idempotencyKey: "k".repeat(10),
      }),
      env()
    );
    expect(res.status).toBe(400);
  });
});
