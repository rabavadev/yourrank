// Games API client: the client renders only what the server returns, so the
// interesting behaviour here is what it does when the server does NOT answer —
// it must never fabricate a result, and a retried bet must stay one bet.
import { describe, expect, test } from "bun:test";
import { createGamesApi, readCsrfToken } from "../games/api/client.ts";
import { GamesApiError } from "../games/api/errors.ts";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/** Records every call and replays a queued list of responses/throws. */
function fetchStub(steps) {
  const calls = [];
  const impl = async (path, init) => {
    calls.push({ path, init });
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    if (typeof step === "function") return step(path, init);
    return step;
  };
  impl.calls = calls;
  return impl;
}

const noSleep = async () => {};

function makeApi(fetchImpl, overrides = {}) {
  return createGamesApi({
    slug: "acme",
    fetchImpl,
    sleep: noSleep,
    idempotencyKey: () => "key-1",
    ...overrides,
  });
}

const BET_RESULT = {
  roundId: "r1",
  game: "dice",
  status: "won",
  amount: 10,
  multiplier: 2,
  payout: 20,
  balance: 510,
  outcome: { roll: 42 },
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("requests", () => {
  test("getConfig sends the slug and returns the server payload verbatim", async () => {
    const cfg = { enabled: true, currency: "credits", games: [], limits: { maxBet: 100 } };
    const f = fetchStub([jsonResponse(cfg)]);
    expect(await makeApi(f).getConfig()).toEqual(cfg);
    expect(f.calls[0].path).toBe("/api/games/config?slug=acme");
    expect(f.calls[0].init.method).toBe("GET");
    expect(f.calls[0].init.headers["idempotency-key"]).toBeUndefined();
  });

  test("placeBet posts json with csrf + idempotency headers and same-origin credentials", async () => {
    const f = fetchStub([jsonResponse(BET_RESULT)]);
    const result = await makeApi(f).placeBet({ game: "dice", amount: 10 });
    expect(result).toEqual(BET_RESULT);
    const { init } = f.calls[0];
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("same-origin");
    expect(init.headers["content-type"]).toBe("application/json");
    expect(init.headers["idempotency-key"]).toBe("key-1");
    expect(init.headers["x-csrf-token"]).toBeDefined();
    expect(JSON.parse(init.body)).toEqual({ slug: "acme", game: "dice", amount: 10 });
  });

  test("history query params are passed through", async () => {
    const f = fetchStub([jsonResponse({ entries: [] })]);
    await makeApi(f).getHistory({ game: "mines", limit: 5, cursor: "c1" });
    expect(f.calls[0].path).toContain("game=mines");
    expect(f.calls[0].path).toContain("limit=5");
    expect(f.calls[0].path).toContain("cursor=c1");
  });
});

describe("failures", () => {
  test("a 4xx is not retried and carries a typed code", async () => {
    const f = fetchStub([jsonResponse({ error: "Not enough credits." }, 402)]);
    const err = await makeApi(f)
      .placeBet({ game: "dice", amount: 10 })
      .catch((e) => e);
    expect(err).toBeInstanceOf(GamesApiError);
    expect(err.retryable).toBe(false);
    expect(err.message).toBe("Not enough credits.");
    expect(f.calls.length).toBe(1);
  });

  test("a 5xx is retried up to the limit and then throws — never a fake result", async () => {
    const f = fetchStub([jsonResponse({}, 500)]);
    const err = await makeApi(f, { retries: 2 })
      .getConfig()
      .catch((e) => e);
    expect(err).toBeInstanceOf(GamesApiError);
    expect(err.code).toBe("server_error");
    expect(f.calls.length).toBe(3);
  });

  test("a retried POST reuses one idempotency key so it stays one bet", async () => {
    const f = fetchStub([jsonResponse({}, 503), jsonResponse(BET_RESULT)]);
    const result = await makeApi(f).placeBet({ game: "dice", amount: 10 });
    expect(result).toEqual(BET_RESULT);
    expect(f.calls.length).toBe(2);
    expect(f.calls.map((c) => c.init.headers["idempotency-key"])).toEqual(["key-1", "key-1"]);
  });

  test("a transport failure surfaces as a timeout and is retried", async () => {
    const f = fetchStub([
      () => {
        throw new Error("boom");
      },
      jsonResponse(BET_RESULT),
    ]);
    expect(await makeApi(f).placeBet({ game: "dice", amount: 10 })).toEqual(BET_RESULT);
    expect(f.calls.length).toBe(2);
  });

  test("a caller abort is a cancellation, not a retry loop", async () => {
    const controller = new AbortController();
    controller.abort();
    const f = fetchStub([
      () => {
        throw new Error("aborted");
      },
    ]);
    const err = await makeApi(f, { retries: 0 })
      .getConfig(controller.signal)
      .catch((e) => e);
    expect(err.code).toBe("network");
  });

  test("a 200 with a non-object body is an error, not a silent empty state", async () => {
    const f = fetchStub([new Response("not json", { status: 200 })]);
    const err = await makeApi(f, { retries: 0 })
      .getConfig()
      .catch((e) => e);
    expect(err.code).toBe("server_error");
  });

  test("a 429 is retryable and reads as rate limited", async () => {
    const f = fetchStub([jsonResponse({}, 429)]);
    const err = await makeApi(f, { retries: 0 })
      .getConfig()
      .catch((e) => e);
    expect(err.code).toBe("rate_limited");
    expect(err.retryable).toBe(true);
  });
});

describe("readCsrfToken", () => {
  test("pulls the token out of the cookie header and tolerates its absence", () => {
    expect(readCsrfToken("a=1; __csrf=tok123; b=2")).toBe("tok123");
    expect(readCsrfToken("")).toBe("");
  });
});
