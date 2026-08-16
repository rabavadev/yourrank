import { describe, expect, it, mock } from "bun:test";
import { createQueueProducer, parseQueueEvent, type QueueEvent } from "../queue-producer.js";

const clickEvent: QueueEvent = {
  type: "click",
  shortLinkId: "link-1",
  ipHash: "a".repeat(64),
  tgUserId: 123,
  clickRef: "ref-1",
  timestamp: 1,
};

describe("parseQueueEvent", () => {
  it("accepts a minimized click payload", () => {
    expect(parseQueueEvent(clickEvent)).toEqual(clickEvent);
  });

  it("rejects raw click metadata", () => {
    expect(() => parseQueueEvent({
      ...clickEvent,
      ip: "203.0.113.10",
      userAgent: "browser",
      referer: "https://example.com/private-path",
    })).toThrow();
  });

  it("rejects unknown event types", () => {
    expect(() => parseQueueEvent({ type: "unexpected" })).toThrow();
  });
});

describe("createQueueProducer", () => {
  it("uses the fallback when enqueue fails", async () => {
    const fallbackEvents: QueueEvent[] = [];
    const producer = createQueueProducer(
      { send: async () => { throw new Error("queue unavailable"); } },
      async (event) => { fallbackEvents.push(event); }
    );

    await producer.send(clickEvent);

    expect(fallbackEvents).toEqual([clickEvent]);
  });

  it("attempts every fallback event when one batch delivery fails", async () => {
    const events = [
      { type: "notify", kind: "player-rank", siteId: "s-1", siteName: "Board", playerName: "A", oldRank: 2, newRank: 1, botId: "b-1", tgUserId: 1 },
      { type: "notify", kind: "player-rank", siteId: "s-1", siteName: "Board", playerName: "B", oldRank: 3, newRank: 2, botId: "b-1", tgUserId: 2 },
      { type: "notify", kind: "player-rank", siteId: "s-1", siteName: "Board", playerName: "C", oldRank: 4, newRank: 3, botId: "b-1", tgUserId: 3 },
    ] as const;
    const fallback = mock(async (event: (typeof events)[number]) => {
      if (event.playerName === "B") throw new Error("subscriber unavailable");
    });
    const queue = {
      send: async () => {},
      sendBatch: async () => { throw new Error("queue unavailable"); },
    };

    const producer = createQueueProducer(queue, fallback);
    await expect(producer.sendBatch([...events])).rejects.toThrow("subscriber unavailable");

    expect(fallback).toHaveBeenCalledTimes(3);
    expect(fallback.mock.calls.map(([event]) => event.playerName)).toEqual(["A", "B", "C"]);
  });
});
