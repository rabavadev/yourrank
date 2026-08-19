import { describe, expect, it, mock } from "bun:test";
import {
  handleAddTournamentEntry,
  handleBlockTournamentEntry,
  handleOpenTournamentSignups,
  handleRandomPickTournamentEntries,
  handleRemoveTournamentEntry,
  handleRestoreTournamentEntry,
} from "../handlers/tournaments.js";

const USER = { id: "owner-1", email: "owner@example.com" };
const TOURNAMENT = {
  id: "tournament-1",
  site_id: "site-1",
  site_user_id: "owner-1",
  signup_state: "open",
  entry_cap: null,
};

function request(path, body) {
  return new Request(`http://localhost${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function deps({ oneValues = [], queryValues = [], txOneValues = [], txQueryValues = [], authorized = true } = {}) {
  const one = mock(async () => oneValues.shift());
  const query = mock(async () => queryValues.shift() || []);
  const txOne = mock(async () => txOneValues.shift());
  const txQuery = mock(async () => txQueryValues.shift() || []);
  return {
    one,
    query,
    requireUser: mock(async () => ({ user: USER, res: null })),
    requireSiteCapabilityImpl: mock(async () => (
      authorized ? { res: null } : { res: new Response("Forbidden", { status: 403 }) }
    )),
    withTransaction: mock(async (fn) => fn({ one: txOne, query: txQuery, unsafe: mock(async () => []) })),
    logAudit: mock(async () => {}),
    rateLimit: mock(async () => ({ ok: true })),
    clientIp: mock(() => "127.0.0.1"),
    _mocks: { one, query, txOne, txQuery },
  };
}

describe("tournament entry lifecycle", () => {
  it("opens signups and records the state transition", async () => {
    const d = deps({
      oneValues: [TOURNAMENT, { id: TOURNAMENT.id, signup_state: "open" }],
    });
    const response = await handleOpenTournamentSignups(request("/api/tournaments/tournament-1/signups/open"), {}, d);
    expect(response.status).toBe(200);
    expect((await response.json()).tournament.signup_state).toBe("open");
    expect(d.requireSiteCapabilityImpl).toHaveBeenCalled();
  });

  it("puts entries on the waitlist and locks at the cap", async () => {
    const first = deps({
      oneValues: [TOURNAMENT],
      txOneValues: [
        { id: TOURNAMENT.id, signup_state: "open", entry_cap: 1 },
        undefined,
        { count: 0 },
        { id: "entry-1", tournament_id: TOURNAMENT.id, display_name: "Alice", status: "pending" },
      ],
    });
    const firstResponse = await handleAddTournamentEntry(
      request("/api/tournaments/tournament-1/entries", { displayName: "Alice", source: "chat" }),
      {},
      first
    );
    expect(firstResponse.status).toBe(200);
    expect((await firstResponse.json()).entry.status).toBe("pending");

    const second = deps({
      oneValues: [TOURNAMENT],
      txOneValues: [
        { id: TOURNAMENT.id, signup_state: "open", entry_cap: 1 },
        undefined,
        { count: 1 },
        { id: "tournament-1" },
        { id: "entry-2", tournament_id: TOURNAMENT.id, display_name: "Bob", status: "waitlist" },
      ],
    });
    const secondResponse = await handleAddTournamentEntry(
      request("/api/tournaments/tournament-1/entries", { displayName: "Bob", source: "chat" }),
      {},
      second
    );
    expect(secondResponse.status).toBe(200);
    expect((await secondResponse.json()).entry.status).toBe("waitlist");
    expect(second._mocks.txOne).toHaveBeenCalledTimes(5);
  });

  it("keeps blocked names from re-entering", async () => {
    const d = deps({
      oneValues: [TOURNAMENT],
      txOneValues: [
        { id: TOURNAMENT.id, signup_state: "open", entry_cap: null },
        { id: "entry-1", display_name: "Alice", status: "blocked" },
      ],
    });
    const response = await handleAddTournamentEntry(
      request("/api/tournaments/tournament-1/entries", { displayName: "Alice", source: "chat" }),
      {},
      d
    );
    expect(response.status).toBe(409);
    expect((await response.json()).error).toContain("blocked");
  });

  it("supports non-destructive remove, block, and restore transitions", async () => {
    for (const [handler, nextStatus] of [
      [handleRemoveTournamentEntry, "removed"],
      [handleBlockTournamentEntry, "blocked"],
    ]) {
      const d = deps({
        oneValues: [TOURNAMENT],
        txOneValues: [
          { id: TOURNAMENT.id, signup_state: "open", entry_cap: null },
          { id: "entry-1", status: "pending" },
          { id: "entry-1", status: nextStatus },
        ],
      });
      const response = await handler(request("/api/tournaments/tournament-1/entries/entry-1/action"), {}, d);
      expect(response.status).toBe(200);
      expect((await response.json()).entry.status).toBe(nextStatus);
    }

    const d = deps({
      oneValues: [TOURNAMENT],
      txOneValues: [
        { id: TOURNAMENT.id, signup_state: "open", entry_cap: null },
        { id: "entry-1", display_name: "Alice", status: "blocked" },
        { count: 0 },
        { id: "entry-1", status: "pending" },
      ],
    });
    const response = await handleRestoreTournamentEntry(
      request("/api/tournaments/tournament-1/entries/entry-1/restore"),
      {},
      d
    );
    expect(response.status).toBe(200);
    expect((await response.json()).entry.status).toBe("pending");
  });

  it("returns exactly N distinct server-selected entries", async () => {
    const picked = [
      { id: "entry-1", display_name: "Alice" },
      { id: "entry-2", display_name: "Bob" },
    ];
    const d = deps({
      oneValues: [TOURNAMENT],
      txOneValues: [{ count: 3 }],
      txQueryValues: [picked, picked.map((entry) => ({ ...entry, status: "selected" }))],
    });
    const response = await handleRandomPickTournamentEntries(
      request("/api/tournaments/tournament-1/entries/random-pick", { count: 2 }),
      {},
      d
    );
    expect(response.status).toBe(200);
    const entries = (await response.json()).entries;
    expect(entries).toHaveLength(2);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(2);
    expect(d._mocks.txQuery.mock.calls[0][0]).toContain("ORDER BY random()");
  });

  it("rejects a non-owner from mutating another site's entries", async () => {
    const d = deps({ oneValues: [TOURNAMENT], authorized: false });
    const response = await handleRemoveTournamentEntry(
      request("/api/tournaments/tournament-1/entries/entry-1/remove"),
      {},
      d
    );
    expect(response.status).toBe(403);
    expect(d._mocks.txOne).not.toHaveBeenCalled();
  });
});
