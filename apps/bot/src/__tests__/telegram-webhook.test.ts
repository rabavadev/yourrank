import { describe, expect, it, mock } from "bun:test";
import type { Update } from "grammy/types";
import { gateAndDeferTelegramUpdate } from "../telegram-webhook.js";

function update(update_id: number): Update {
  return { update_id } as Update;
}

describe("Telegram webhook admission", () => {
  it("processes a claimed update once and ignores a redelivery", async () => {
    const claimedIds: string[] = [];
    const processed: number[] = [];
    const claim = async (botId: string, updateId: number) => {
      const key = `${botId}:${updateId}`;
      if (claimedIds.includes(key)) return false;
      claimedIds.push(key);
      return true;
    };
    const pending: Promise<unknown>[] = [];
    const waitUntil = (promise: Promise<unknown>) => pending.push(promise);

    expect(await gateAndDeferTelegramUpdate({
      botId: "bot-a",
      update: update(7),
      claim,
      process: async () => { processed.push(7); },
      waitUntil,
    })).toBe("claimed");
    expect(await gateAndDeferTelegramUpdate({
      botId: "bot-a",
      update: update(7),
      claim,
      process: async () => { processed.push(7); },
      waitUntil,
    })).toBe("duplicate");
    await Promise.all(pending);
    expect(processed).toEqual([7]);
  });

  it("scopes the same update_id independently per bot", async () => {
    const seen = new Set<string>();
    const processed: string[] = [];
    const claim = async (botId: string, updateId: number) => {
      const key = `${botId}:${updateId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    };
    const pending: Promise<unknown>[] = [];
    const waitUntil = (promise: Promise<unknown>) => pending.push(promise);

    for (const botId of ["bot-a", "bot-b"]) {
      await gateAndDeferTelegramUpdate({
        botId,
        update: update(9),
        claim,
        process: async () => { processed.push(botId); },
        waitUntil,
      });
    }
    await Promise.all(pending);
    expect(processed).toEqual(["bot-a", "bot-b"]);
  });

  it("acknowledges before deferred handler work completes", async () => {
    let resolveHandler!: () => void;
    const handler = new Promise<void>((resolve) => { resolveHandler = resolve; });
    let deferred!: Promise<unknown>;
    await gateAndDeferTelegramUpdate({
      botId: "bot-a",
      update: update(11),
      claim: async () => true,
      process: () => handler,
      waitUntil: (promise) => { deferred = promise; },
    });
    expect(deferred).toBeDefined();
    let completed = false;
    deferred.then(() => { completed = true; });
    await Promise.resolve();
    expect(completed).toBe(false);
    resolveHandler();
    await deferred;
  });

  it("logs deferred handler failures without rejecting the webhook task", async () => {
    const error = mock();
    let deferred!: Promise<unknown>;
    await gateAndDeferTelegramUpdate({
      botId: "bot-a",
      update: update(13),
      claim: async () => true,
      process: async () => { throw new Error("handler failed"); },
      waitUntil: (promise) => { deferred = promise; },
      logger: { error },
    });
    await deferred;
    expect(error).toHaveBeenCalled();
  });

  it("propagates a dedup database failure so the route can return 503", async () => {
    await expect(gateAndDeferTelegramUpdate({
      botId: "bot-a",
      update: update(15),
      claim: async () => { throw new Error("database unavailable"); },
      process: async () => {},
      waitUntil: () => {},
    })).rejects.toThrow("database unavailable");
  });
});
