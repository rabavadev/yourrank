import { describe, expect, it } from "bun:test";
import { createLogger, runWithLogger } from "../request-id.js";
import { exec, query, releaseRequestDbClient } from "../db.js";

function fakeClient(
  unsafe: (text: string, params?: unknown[]) => Promise<any[]>,
  ends: number[],
) {
  return {
    unsafe,
    async end() {
      ends.push(1);
    },
  };
}

const logger = () => createLogger("test", "request");

describe("request-scoped database clients", () => {
  it("reuses one client for several statements in one scope", async () => {
    let creates = 0;
    const ends: number[] = [];
    const deps = {
      createSql: () => {
        creates++;
        return fakeClient(async () => [{ ok: true }], ends);
      },
    };

    await runWithLogger(logger(), async () => {
      await query("SELECT 1", [], deps);
      await query("SELECT 2", [], deps);
      await exec("UPDATE test SET ok = true", [], deps);
      expect(ends).toEqual([]);
      await releaseRequestDbClient();
      expect(ends).toHaveLength(1);
    });

    expect(creates).toBe(1);
  });

  it("never shares a client across separate scopes", async () => {
    let creates = 0;
    const deps = {
      createSql: () => {
        creates++;
        return fakeClient(async () => [], []);
      },
    };

    await runWithLogger(logger(), () => query("SELECT 1", [], deps));
    await runWithLogger(logger(), () => query("SELECT 2", [], deps));

    expect(creates).toBe(2);
  });

  it("discards a failed cached client before retrying", async () => {
    let creates = 0;
    const ended: number[] = [];
    const deps = {
      createSql: () => {
        creates++;
        if (creates === 1) {
          return fakeClient(async () => {
            throw new Error("connection reset by peer");
          }, ended);
        }
        return fakeClient(async () => [{ fresh: true }], ended);
      },
      sleepImpl: async () => {},
    };

    const rows = await runWithLogger(logger(), () => query("SELECT 1", [], deps));

    expect(rows).toEqual([{ fresh: true }]);
    expect(creates).toBe(2);
    expect(ended).toHaveLength(1);
  });

  it("creates and ends a private client without a request scope", async () => {
    const ends: number[] = [];
    const rows = await query("SELECT 1", [], {
      createSql: () => fakeClient(async () => [{ standalone: true }], ends),
    });

    expect(rows).toEqual([{ standalone: true }]);
    expect(ends).toHaveLength(1);
  });

  it("defers closing an in-flight client until its statement completes", async () => {
    const ends: number[] = [];
    let resolveQuery!: (rows: any[]) => void;
    const queryDone = new Promise<any[]>((resolve) => { resolveQuery = resolve; });
    const deps = {
      createSql: () => fakeClient(async () => queryDone, ends),
    };

    await runWithLogger(logger(), async () => {
      const pending = query("SELECT 1", [], deps);
      await Promise.resolve();
      await releaseRequestDbClient();
      expect(ends).toHaveLength(0);
      resolveQuery([{ done: true }]);
      await pending;
      expect(ends).toHaveLength(1);
    });
  });
});
