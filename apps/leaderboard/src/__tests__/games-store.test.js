import { describe, expect, test } from "bun:test";
import { createGamesStore } from "../games/state/store.ts";
import { GamesApiError } from "../games/api/errors.ts";

const CONFIG = {
  enabled: true,
  currency: "credits",
  games: [
    { id: "mines", name: "Mines", enabled: false, minBet: 1, maxBet: 100 },
    { id: "plinko", name: "Plinko", enabled: true, minBet: 1, maxBet: 500 },
    { id: "dice", name: "Dice", enabled: true, minBet: 1, maxBet: 500 },
  ],
  limits: { maxBet: 1000, dailyWagerLimit: null, cooldownMs: 0 },
};

function fakeApi(over = {}) {
  return {
    getConfig: async () => CONFIG,
    getHistory: async () => ({ entries: [] }),
    placeBet: async () => {
      throw new Error("not used");
    },
    ...over,
  };
}

const viewer = (over = {}) => ({ authenticated: true, balance: 100, ...over });

function result(over = {}) {
  return {
    roundId: "r1",
    game: "dice",
    amount: 10,
    multiplier: 2,
    payout: 20,
    balance: 110,
    status: "won",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("games store — config", () => {
  test("selects the first enabled game and exposes only enabled ones", async () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    await store.load();
    expect(store.enabledGames.value.map((g) => g.id)).toEqual(["plinko", "dice"]);
    expect(store.activeGame.value).toBe("plinko");
    expect(store.loading.value).toBe(false);
  });

  test("a requested game the streamer disabled is replaced, not rendered", async () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer(), initialGame: "mines" });
    await store.load();
    expect(store.activeGame.value).toBe("plinko");
  });

  test("a failed history fetch does not fail the shell", async () => {
    const store = createGamesStore({
      api: fakeApi({ getHistory: async () => { throw new GamesApiError("server_error", 500); } }),
      slug: "acme",
      viewer: viewer(),
    });
    await store.load();
    expect(store.error.value).toBeNull();
    expect(store.history.value).toEqual([]);
  });

  test("history is not requested for a signed-out viewer", async () => {
    let called = false;
    const store = createGamesStore({
      api: fakeApi({ getHistory: async () => { called = true; return { entries: [] }; } }),
      slug: "acme",
      viewer: viewer({ authenticated: false, balance: 0 }),
    });
    await store.load();
    expect(called).toBe(false);
  });

  test("a failed config surfaces the typed error", async () => {
    const store = createGamesStore({
      api: fakeApi({ getConfig: async () => { throw new GamesApiError("rate_limited", 429, "Slow down."); } }),
      slug: "acme",
      viewer: viewer(),
    });
    await store.load();
    expect(store.errorCode.value).toBe("rate_limited");
    expect(store.error.value).toBe("Slow down.");
    expect(store.loading.value).toBe(false);
    store.clearError();
    expect(store.error.value).toBeNull();
  });
});

describe("games store — results are the server's", () => {
  test("balance comes from the response, never from local arithmetic", () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    // A payout the client could never derive: only the server's balance counts.
    store.applyResult(result({ balance: 4242, payout: 20 }));
    expect(store.balance.value).toBe(4242);
    expect(store.viewer.value.balance).toBe(4242);
    expect(store.lastPayout.value).toBe(20);
  });

  test("a settled round is celebrated and prepended to history", () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    store.applyResult(result({ roundId: "a" }));
    store.applyResult(result({ roundId: "b", status: "lost", multiplier: 0, payout: 0, balance: 90 }));
    expect(store.history.value.map((h) => h.roundId)).toEqual(["b", "a"]);
    expect(store.pendingResult.value.roundId).toBe("b");
    store.dismissResult();
    expect(store.pendingResult.value).toBeNull();
  });

  test("an open round updates the balance but does not celebrate", () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    store.applyResult(result({ status: "open", balance: 90, payout: 0, multiplier: 1 }));
    expect(store.balance.value).toBe(90);
    expect(store.pendingResult.value).toBeNull();
    expect(store.history.value).toEqual([]);
  });

  test("history is capped so a long session cannot grow unbounded", () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    for (let i = 0; i < 40; i += 1) store.applyResult(result({ roundId: `r${i}` }));
    expect(store.history.value).toHaveLength(30);
    expect(store.history.value[0].roundId).toBe("r39");
  });

  test("selecting a game clears the previous error", () => {
    const store = createGamesStore({ api: fakeApi(), slug: "acme", viewer: viewer() });
    store.setError(new Error("nope"));
    expect(store.errorCode.value).toBe("server_error");
    store.selectGame("dice");
    expect(store.activeGame.value).toBe("dice");
    expect(store.error.value).toBeNull();
  });
});
