import { describe, it, expect, mock, beforeEach } from "bun:test";

const dbUrl = import.meta.resolve("../db.js");
const dbUrlTs = import.meta.resolve("../db.ts");

const execCalls: { text: string; params: unknown[] }[] = [];
const mockExec = mock((text: string, params: unknown[]) => {
  execCalls.push({ text, params });
  return Promise.resolve([]);
});

const dbMock = () => ({
  exec: mockExec,
  query: mock(() => Promise.resolve([])),
  one: mock(() => Promise.resolve(undefined)),
  getSql: () => null,
  withTransaction: async (fn: any) => fn({ unsafe: mockExec, one: mockExec, query: mockExec }),
});

mock.module(dbUrl, dbMock);
mock.module(dbUrlTs, dbMock);

import { logAudit } from "../audit.js";

describe("logAudit", () => {
  beforeEach(() => {
    execCalls.length = 0;
    mockExec.mockClear?.();
  });

  it("writes an INSERT into audit_log with the actor/action/entity", async () => {
    const request = new Request("https://example.test/api/site", {
      headers: { "cf-connecting-ip": "1.2.3.4", "user-agent": "test-ua" },
    });
    await logAudit({
      actorId: "user-1",
      action: "board_create",
      entityType: "site",
      entityId: "site-1",
      request,
      details: { board_id: "site-1", board_slug: "myboard" },
    });

    expect(execCalls.length).toBe(1);
    expect(execCalls[0].text).toMatch(/INSERT INTO audit_log/);
    const params = execCalls[0].params;
    expect(params[0]).toBe("user-1");
    expect(params[1]).toBe("board_create");
    expect(params[2]).toBe("site");
    expect(params[3]).toBe("site-1");
    expect((params[4] as any).board_slug).toBe("myboard");
    expect(params[5]).toBe("1.2.3.4");
    expect(params[6]).toBe("test-ua");
  });

  it("drops unknown/dangerous keys like token, password, secret from details", async () => {
    await logAudit({
      actorId: "user-1",
      action: "board_update",
      entityType: "site",
      entityId: "site-1",
      details: {
        board_id: "site-1",
        board_slug: "myboard",
        password: "hunter2",
        token: "super-secret",
        secret: "api-key",
        api_key: "another-key",
        unexpected: "should-not-appear",
      },
    });

    expect(execCalls.length).toBe(1);
    const details = execCalls[0].params[4] as Record<string, unknown>;
    expect(details.board_id).toBe("site-1");
    expect(details.board_slug).toBe("myboard");
    expect(details.password).toBeUndefined();
    expect(details.token).toBeUndefined();
    expect(details.secret).toBeUndefined();
    expect(details.api_key).toBeUndefined();
    expect(details.unexpected).toBeUndefined();
  });

  it("allows whitelisted audit keys even when they contain sensitive-looking names", async () => {
    await logAudit({
      actorId: null,
      action: "payment_paid",
      entityType: "payment",
      entityId: "rk_123",
      details: { amount: 29, provider: "nowpayments", plan: "pro", status: "finished" },
    });

    const details = execCalls[0].params[4] as Record<string, unknown>;
    expect(details.amount).toBe(29);
    expect(details.provider).toBe("nowpayments");
    expect(details.plan).toBe("pro");
    expect(details.status).toBe("finished");
  });

  it("does not throw when the DB write fails", async () => {
    const failingExec = mock((text: string, params: unknown[]) => Promise.reject(new Error("audit table missing")));
    mock.module(dbUrl, () => ({
      exec: failingExec,
      query: mock(() => Promise.resolve([])),
      one: mock(() => Promise.resolve(undefined)),
    }));
    mock.module(dbUrlTs, () => ({
      exec: failingExec,
      query: mock(() => Promise.resolve([])),
      one: mock(() => Promise.resolve(undefined)),
    }));

    await expect(logAudit({ actorId: "user-1", action: "board_create" })).resolves.toBeUndefined();
  });
});
