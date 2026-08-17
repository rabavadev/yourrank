import { describe, expect, it, spyOn } from "bun:test";
import {
  logPostbackIntake,
  purgeExpiredReplayHashes,
  recordReplayHash,
  unsignedPostbacksEnabled,
} from "../postback.js";

describe("postback sunset policy", () => {
  it("keeps unsigned postbacks enabled unless explicitly disabled", () => {
    expect(unsignedPostbacksEnabled()).toBe(true);
    expect(unsignedPostbacksEnabled("true")).toBe(true);
    expect(unsignedPostbacksEnabled("false")).toBe(false);
    expect(unsignedPostbacksEnabled("0")).toBe(false);
  });

  it("emits structured signed-versus-unsigned intake telemetry", () => {
    const info = spyOn(console, "info").mockImplementation(() => {});
    logPostbackIntake("pb_legacy", { id: "key-1", userId: "user-1" }, false);

    const event = JSON.parse(String(info.mock.calls[0][0]));
    expect(event).toMatchObject({
      event: "postback_intake",
      path: "pb_legacy",
      signed: false,
      owner_id: "user-1",
      key_id: "key-1",
    });
    info.mockRestore();
  });
});

describe("postback replay guard", () => {
  it("claims a fresh hash when the insert returns a row", async () => {
    const calls: unknown[][] = [];
    const claimed = await recordReplayHash("user-1", "hash-1", 60, {
      execImpl: async (...args) => {
        calls.push(args);
        return [{ id: "replay-1" }];
      },
    });

    expect(claimed).toBe(true);
    expect(calls[0][0]).toContain("ON CONFLICT (user_id, replay_hash) DO UPDATE");
    expect(calls[0][1]).toEqual(["user-1", "hash-1", 60]);
  });

  it("rejects a live duplicate when the claim returns no row", async () => {
    const rejected = await recordReplayHash("user-1", "hash-1", 60, {
      execImpl: async () => [],
    });

    expect(rejected).toBe(false);
  });

  it("reclaims an expired hash through the same atomic statement", async () => {
    let sql = "";
    const reclaimed = await recordReplayHash("user-1", "hash-1", 120, {
      execImpl: async (query) => {
        sql = query;
        return [{ id: "replay-1" }];
      },
    });

    expect(reclaimed).toBe(true);
    expect(sql).toContain("WHERE postback_replay_guard.expires_at <= now()");
  });

  it("purges expired hashes in bounded batches", async () => {
    const calls: unknown[][] = [];
    const batches = [[{ id: "1" }, { id: "2" }], [{ id: "3" }], []];
    const deleted = await purgeExpiredReplayHashes(2, {
      execImpl: async (...args) => {
        calls.push(args);
        return batches.shift() || [];
      },
    });

    expect(deleted).toBe(3);
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toContain("LIMIT $1");
    expect(calls[0][1]).toEqual([2]);
    expect(calls[1][1]).toEqual([2]);
  });
});
