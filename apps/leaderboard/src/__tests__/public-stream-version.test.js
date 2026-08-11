import { describe, it, expect, mock } from "bun:test";

const dbUrl = import.meta.resolve("../../../../shared/db.js");
const dbUrlTs = import.meta.resolve("../../../../shared/db.ts");
const one = mock(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1));
  return { m: "2026-01-01T00:00:00.000Z" };
});
const dbMock = () => ({
  one,
  exec: mock(() => Promise.resolve()),
  query: mock(() => Promise.resolve([])),
  getSql: () => null,
  withTransaction: async (fn) => fn({ one: () => Promise.resolve(null), exec: () => Promise.resolve(), query: () => Promise.resolve([]) }),
});
mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);

import { clearPublicStreamVersionCache, getPublicStreamVersion } from "../site.js";

describe("public stream version cache", () => {
  it("coalesces concurrent version queries and reuses the value within its window", async () => {
    clearPublicStreamVersionCache();
    one.mockClear();

    const values = await Promise.all(
      Array.from({ length: 8 }, () => getPublicStreamVersion("same-site"))
    );

    expect(values).toEqual(Array(8).fill("2026-01-01T00:00:00.000Z"));
    expect(one).toHaveBeenCalledTimes(1);
    await getPublicStreamVersion("same-site");
    expect(one).toHaveBeenCalledTimes(1);
  });
});
