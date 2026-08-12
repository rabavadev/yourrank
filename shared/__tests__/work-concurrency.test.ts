import { describe, expect, it } from "bun:test";
import { mapWithConcurrency } from "../work-concurrency.js";

describe("mapWithConcurrency", () => {
  it("never exceeds the configured concurrency and isolates worker failures", async () => {
    let active = 0;
    let peak = 0;
    const seen: number[] = [];
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active--;
      if (value === 3) {
        seen.push(value);
        return null;
      }
      seen.push(value);
      return value * 2;
    });

    expect(peak).toBeLessThanOrEqual(2);
    expect(results).toEqual([2, 4, null, 8, 10]);
    expect(seen).toHaveLength(5);
  });
});
