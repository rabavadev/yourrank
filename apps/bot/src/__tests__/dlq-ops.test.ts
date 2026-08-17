import { afterEach, describe, expect, it } from "bun:test";
import { buildHonoApp } from "../hono-app.js";
import { replayDlq } from "../dlq-ops.js";

const validEvent = {
  type: "click",
  shortLinkId: "link-1",
  ipHash: "a".repeat(64),
  tgUserId: null,
  clickRef: "click-1",
  timestamp: 1,
};

const row = (body: unknown = validEvent) => ({
  message_id: "message-1",
  queue_name: "yourrank-events",
  event_type: "click",
  body,
  replay_attempts: 0,
});

afterEach(() => {
  delete process.env.ADMIN_API_KEY;
});

describe("DLQ replay operations", () => {
  it("replays a valid row and marks it replayed", async () => {
    const execs: unknown[][] = [];
    const sent: unknown[] = [];
    const result = await replayDlq({
      sendImpl: async (body) => { sent.push(body); },
    }, {
      queryImpl: async () => [row()],
      execImpl: async (...args) => {
        execs.push(args);
        return execs.length === 1 ? [{ replay_attempts: 1 }] : [];
      },
    });

    expect(result).toEqual({
      replayed: { count: 1, ids: ["message-1"] },
      invalid: { count: 0, ids: [] },
      skipped: { count: 0, ids: [] },
      failed: { count: 0, ids: [] },
    });
    expect(sent).toEqual([validEvent]);
    expect(execs).toHaveLength(2);
    expect(execs[0][1]).toEqual(["message-1"]);
    expect(execs[1][1]).toEqual(["message-1"]);
  });

  it("counts invalid bodies without sending them", async () => {
    let claimed = false;
    const sent: unknown[] = [];
    const logs: unknown[][] = [];
    const originalError = console.error;
    console.error = (...args) => { logs.push(args); };
    let result;
    try {
      result = await replayDlq({
        sendImpl: async (body) => { sent.push(body); },
      }, {
        queryImpl: async () => [row({ type: "not-a-queue-event" })],
        execImpl: async () => {
          claimed = true;
          return [{ replay_attempts: 1 }];
        },
      });
    } finally {
      console.error = originalError;
    }

    expect(result).toEqual({
      replayed: { count: 0, ids: [] },
      invalid: { count: 1, ids: ["message-1"] },
      skipped: { count: 0, ids: [] },
      failed: { count: 0, ids: [] },
    });
    expect(claimed).toBe(true);
    expect(sent).toEqual([]);
    expect(JSON.parse(String(logs[0][0]))).toMatchObject({
      ctx: "dlq-replay",
      outcome: "invalid",
      message_id: "message-1",
    });
    expect(JSON.parse(String(logs[0][0])).error).toContain("Invalid");
  });

  it("does not select rows at or above maxAttempts", async () => {
    let sql = "";
    let params: unknown[] | undefined;
    const result = await replayDlq({
      limit: 10,
      maxAttempts: 3,
      sendImpl: async () => {},
    }, {
      queryImpl: async (query, queryParams) => {
        sql = query;
        params = queryParams;
        return [];
      },
      execImpl: async () => [],
    });

    expect(sql).toContain("replay_attempts < $2");
    expect(result).toEqual({
      replayed: { count: 0, ids: [] },
      invalid: { count: 0, ids: [] },
      skipped: { count: 0, ids: [] },
      failed: { count: 0, ids: [] },
    });
    expect(params).toEqual([10, 3]);
  });

  it("skips a row when another replay claims it first", async () => {
    const sent: unknown[] = [];
    const result = await replayDlq({
      sendImpl: async (body) => { sent.push(body); },
    }, {
      queryImpl: async () => [row()],
      execImpl: async () => [],
    });

    expect(result).toEqual({
      replayed: { count: 0, ids: [] },
      invalid: { count: 0, ids: [] },
      skipped: { count: 1, ids: ["message-1"] },
      failed: { count: 0, ids: [] },
    });
    expect(sent).toEqual([]);
  });

  it("leaves a claimed row pending when sending fails", async () => {
    const execs: unknown[][] = [];
    const logs: unknown[][] = [];
    const originalError = console.error;
    console.error = (...args) => { logs.push(args); };
    let result;
    try {
      result = await replayDlq({
        sendImpl: async () => { throw new Error("queue unavailable"); },
      }, {
        queryImpl: async () => [row()],
        execImpl: async (...args) => {
          execs.push(args);
          return [{ replay_attempts: 1 }];
        },
      });
    } finally {
      console.error = originalError;
    }

    expect(result).toEqual({
      replayed: { count: 0, ids: [] },
      invalid: { count: 0, ids: [] },
      skipped: { count: 0, ids: [] },
      failed: { count: 1, ids: ["message-1"] },
    });
    expect(execs).toHaveLength(1);
    expect(JSON.parse(String(logs[0][0]))).toMatchObject({
      ctx: "dlq-replay",
      outcome: "failed",
      message_id: "message-1",
      error: "queue unavailable",
    });
  });

  it("serves replay through the authenticated admin route", async () => {
    process.env.ADMIN_API_KEY = "test-admin-key";
    const sent: unknown[] = [];
    const app = buildHonoApp({
      dlqDb: {
        queryImpl: async () => [row()],
        execImpl: async () => [{ replay_attempts: 1 }],
      },
    });
    const response = await app.request("https://bot.example/api/dlq/replay", {
      method: "POST",
      headers: {
        "x-api-key": "test-admin-key",
        "content-type": "application/json",
      },
      body: JSON.stringify({ limit: 1 }),
    }, {
      RL_FAIL_OPEN: "true",
      EVENTS_QUEUE: { send: async (body) => { sent.push(body); } },
    });

    expect(response.status).toBe(200);
    expect(await response.json() as any).toEqual({
      replayed: { count: 1, ids: ["message-1"] },
      invalid: { count: 0, ids: [] },
      skipped: { count: 0, ids: [] },
      failed: { count: 0, ids: [] },
    });
    expect(sent).toEqual([validEvent]);
  });
});
