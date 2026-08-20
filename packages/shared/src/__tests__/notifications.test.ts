import { afterEach, describe, expect, it, mock } from "bun:test";
import { detectTop3Changes, escapeTgMarkdown, getRankChangedPlayerNames, notifyReset, notifySubscribedPlayers } from "../notifications.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("notification delivery", () => {
  it("rejects when Discord rejects a reset notification", async () => {
    globalThis.fetch = mock(async () => new Response("provider unavailable", { status: 503 }));
    const db = {
      one: async () => ({ discord_webhook_url_enc: "https://discord.example/webhook" }),
    };

    await expect(notifyReset(db, {}, "site-1", "Board", [], "monthly"))
      .rejects.toThrow("Discord delivery failed: Discord 503");
  });

  it("escapes interpolated Telegram Markdown", () => {
    expect(escapeTgMarkdown("Board_[one].")).toBe("Board\\_\\[one\\]\\.");
  });

  it("skips subscription reads when no ranks changed", async () => {
    const query = mock(async () => []);
    const db = {
      one: async () => null,
      query,
    };

    await notifySubscribedPlayers(
      db,
      {},
      "site-1",
      "Board",
      [{ name: "Alice", wagered: 100 }, { name: "Bob", wagered: 50 }],
      [{ name: "Alice", wagered: 100 }, { name: "Bob", wagered: 50 }]
    );

    expect(query).not.toHaveBeenCalled();
  });

  it("selects exactly the players whose notification eligibility changed", () => {
    const oldPlayers = [
      { name: "Alice", wagered: 100 },
      { name: "Bob", wagered: 90 },
      { name: "Cara", wagered: 80 },
    ];
    const newPlayers = [
      { name: "Bob", wagered: 110 },
      { name: "Alice", wagered: 100 },
      { name: "Cara", wagered: 80 },
      { name: "Drew", wagered: 70 },
    ];

    expect(getRankChangedPlayerNames(oldPlayers, newPlayers)).toEqual(["Bob", "Alice", "Drew"]);
  });

  it("uses competition ranks and the selected ranking field", () => {
    const changes = detectTop3Changes(
      [{ name: "Alice", wagered: 100, score: 1 }, { name: "Bob", wagered: 90, score: 2 }, { name: "Cara", wagered: 80, score: 3 }],
      [{ name: "Alice", wagered: 100, score: 10 }, { name: "Bob", wagered: 90, score: 10 }, { name: "Cara", wagered: 80, score: 1 }, { name: "Drew", wagered: 70, score: 1 }],
      "score",
    );
    expect(changes).toEqual([{ name: "Drew", rank: 3, wagered: 70 }]);
    expect(getRankChangedPlayerNames(
      [{ name: "Alice", wagered: 1, score: 10 }, { name: "Bob", wagered: 2, score: 10 }, { name: "Cara", wagered: 3, score: 1 }],
      [{ name: "Alice", wagered: 1, score: 20 }, { name: "Bob", wagered: 2, score: 20 }, { name: "Cara", wagered: 3, score: 1 }],
      "score",
    )).toEqual([]);
  });

  it("matches rank changes by normalized player identity", () => {
    expect(getRankChangedPlayerNames(
      [{ name: " Alice ", wagered: 100 }, { name: "Bob", wagered: 50 }],
      [{ name: "alice", wagered: 100 }, { name: "Bob", wagered: 75 }],
    )).toEqual([]);
  });

  it("continues notifying other subscribers when one send fails", async () => {
    const sent: string[] = [];
    const db = {
      one: async () => null,
      query: async () => [
        { player_name: "Alice", bot_id: "b-1", tg_user_id: 1 },
        { player_name: "Bob", bot_id: "b-1", tg_user_id: 2 },
        { player_name: "Cara", bot_id: "b-1", tg_user_id: 3 },
      ],
    };

    await notifySubscribedPlayers(
      db,
      {},
      "site-1",
      "Board",
      [{ name: "Alice", wagered: 100 }, { name: "Bob", wagered: 90 }, { name: "Cara", wagered: 80 }],
      [{ name: "Bob", wagered: 110 }, { name: "Alice", wagered: 100 }, { name: "Cara", wagered: 70 }],
      async (_db, message) => {
        sent.push(message.playerName);
        if (message.playerName === "Bob") throw new Error("send failed");
      }
    );

    expect(sent.sort()).toEqual(["Alice", "Bob", "Cara"]);
  });
});
