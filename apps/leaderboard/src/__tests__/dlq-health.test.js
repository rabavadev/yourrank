import { describe, expect, it } from "bun:test";
import { readDlqHealth } from "../dlq-health.js";

describe("DLQ health", () => {
  it("reports an empty backlog as healthy", async () => {
    const health = await readDlqHealth(async () => ({
      pending: 0,
      oldest_received_at: null,
    }));

    expect(health).toMatchObject({
      pending: 0,
      pending_capped: false,
      oldest_pending_age_seconds: null,
      degraded: false,
      error: null,
    });
  });

  it("reports an under-threshold backlog without degrading", async () => {
    const health = await readDlqHealth(async () => ({
      pending: 12,
      oldest_received_at: new Date("2026-08-25T01:00:00Z"),
    }), 100);

    expect(health).toMatchObject({
      pending: 12,
      oldest_pending_at: new Date("2026-08-25T01:00:00Z"),
      oldest_pending_age_seconds: expect.any(Number),
      pending_capped: false,
      degraded: false,
    });
  });

  it("degrades when the backlog reaches the threshold", async () => {
    const health = await readDlqHealth(async () => ({
      pending: 100,
      oldest_received_at: "2026-08-25T01:00:00Z",
    }), 100);

    expect(health.degraded).toBe(true);
  });

  it("keeps a query failure from breaking health", async () => {
    const logs = [];
    const originalError = console.error;
    console.error = (...args) => logs.push(args);
    let health;
    try {
      health = await readDlqHealth(async () => {
        throw new Error("database unavailable");
      });
    } finally {
      console.error = originalError;
    }

    expect(health).toEqual({
      pending: null,
      oldest_pending_at: null,
      oldest_pending_age_seconds: null,
      pending_capped: false,
      degraded: false,
      error: "probe_failed",
    });
    expect(JSON.parse(String(logs[0][0]))).toMatchObject({
      ctx: "dlq-health",
      outcome: "probe_failed",
      error: "database unavailable",
    });
  });
});
