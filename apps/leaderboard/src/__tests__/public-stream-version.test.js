import { describe, it, expect, mock } from "bun:test";

const one = mock(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1));
  return { m: "2026-01-01T00:00:00.000Z" };
});
import { clearPublicStreamVersionCache, getPublicStreamVersion } from "../site.js";

describe("public stream version cache", () => {
  it("coalesces concurrent version queries and reuses the value within its window", async () => {
    clearPublicStreamVersionCache();
    one.mockClear();

    const values = await Promise.all(
      Array.from({ length: 8 }, () => getPublicStreamVersion("same-site", { one }))
    );

    expect(values).toEqual(Array(8).fill("2026-01-01T00:00:00.000Z"));
    expect(one).toHaveBeenCalledTimes(1);
    await getPublicStreamVersion("same-site", { one });
    expect(one).toHaveBeenCalledTimes(1);
  });
});
