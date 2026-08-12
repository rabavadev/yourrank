import { describe, expect, it } from "bun:test";
import { processQueueMessages } from "./worker.js";
import { processAccountExport } from "./account-export.js";

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

describe("account export artifacts", () => {
  it("writes a manifest with exactly the synchronous export collections", async () => {
    const chunks = [];
    const bucket = {
      createMultipartUpload() {
        return {
          async uploadPart(_part, body) { chunks.push(new TextDecoder().decode(body)); return { partNumber: _part, etag: "etag" }; },
          async complete() {},
        };
      },
    };
    const read = async (sql) => {
      if (sql.includes("FROM users")) return [{ id: "user-1", email: "u@example.com" }];
      if (sql.includes("FROM sites")) return [{ id: "site-1", slug: "board" }];
      if (sql.includes("COUNT(*)")) return [{ count: "0" }];
      return [];
    };
    const write = async (sql) => sql.includes("RETURNING id") ? [{ id: "job-1" }] : [];
    await processAccountExport(
      { exportId: "job-1", userId: "user-1" },
      { ACCOUNT_EXPORTS: bucket },
      { queryImpl: read, execImpl: write, logAuditImpl: async () => {} }
    );
    const lines = chunks.join("").trim().split("\n").map((line) => JSON.parse(line));
    expect(lines[0].manifest.tables).toEqual([
      "exportedAt", "user", "sites", "players", "archives", "subscriptions",
      "payments", "sessions", "offers", "shortLinks", "conversions", "bots",
      "botCommands", "broadcasts", "botSubscribers", "postbackKeys",
      "featureOverrides", "onboardingEmails", "referralRewards", "auditLog",
      "adminAudit", "supportMessages", "siteStatsHourly", "siteReferrers",
    ]);
    expect(lines.slice(1).map((line) => line.table)).toEqual(["user", "sites"]);
  });
});
