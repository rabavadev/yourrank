import { describe, expect, it } from "bun:test";
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
});
