import { describe, expect, it } from "bun:test";
import { processQueueMessages } from "./worker.js";

function message(id) {
  return { id, acked: 0, retried: 0, ack() { this.acked++; }, retry() { this.retried++; } };
}

describe("queue batch processing", () => {
  it("bounds concurrency and retries only the failed message once", async () => {
    const messages = [message("1"), message("2"), message("3"), message("4"), message("5")];
    let active = 0;
    let peak = 0;
    const result = await processQueueMessages(messages, async (msg) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active--;
      if (msg.id === "3") throw new Error("failed");
    });

    expect(peak).toBeLessThanOrEqual(4);
    expect(result).toEqual({ processed: 4, failed: 1 });
    expect(messages.filter((msg) => msg.acked === 1)).toHaveLength(4);
    expect(messages.filter((msg) => msg.retried === 1)).toHaveLength(1);
    expect(messages.every((msg) => msg.acked + msg.retried === 1)).toBe(true);
  });
});
