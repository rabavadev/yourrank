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
    const uploads = [];
    const bucket = {
      async createMultipartUpload() {
        return {
          async uploadPart(_part, body) {
            chunks.push(new TextDecoder().decode(body));
            uploads.push(body.byteLength);
            return { partNumber: _part, etag: "etag" };
          },
          async complete() {},
          async abort() { throw new Error("should not abort"); },
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
    expect(lines.slice(1).map((line) => line.table || (line.trailer && "trailer"))).toEqual(["user", "sites", "trailer"]);
    expect(lines.at(-1).trailer.complete).toBe(true);
    expect(lines.at(-1).trailer.rowCounts).toMatchObject({ user: 1, sites: 1 });
    expect(uploads.length).toBe(1);
  });

  it("never emits session tokens and safely paginates OR-filtered collections", async () => {
    const lines = [];
    const bucket = {
      async createMultipartUpload() {
        return {
          async uploadPart(_part, body) { lines.push(...new TextDecoder().decode(body).trim().split("\n")); return { partNumber: _part, etag: "etag" }; },
          async complete() {},
          async abort() {},
        };
      },
    };
    const referralRows = Array.from({ length: 501 }, (_, i) => ({ id: `ref-${i}`, referrer_id: "user-1", referred_id: `other-${i}`, reward_days: 1, created_at: "2026-01-01" }));
    const adminRows = Array.from({ length: 501 }, (_, i) => ({ id: `audit-${i}`, admin_id: "user-1", target_user_id: `other-${i}`, action: "view", details: {}, created_at: "2026-01-01" }));
    const read = async (sql, params = []) => {
      if (sql.includes("FROM users")) return [{ id: "user-1" }];
      if (sql.includes("FROM sites")) return [];
      if (sql.includes("COUNT(*)")) return [{ count: "501" }];
      if (sql.includes("FROM sessions")) return [{ token: "secret-session-token", created_at: "2026-01-01", expires_at: "2026-02-01", twofa_verified: false }];
      if (sql.includes("FROM referral_rewards")) {
        return params.length > 1 ? referralRows.slice(500) : referralRows.slice(0, 500);
      }
      if (sql.includes("FROM admin_audit")) {
        return params.length > 1 ? adminRows.slice(500) : adminRows.slice(0, 500);
      }
      return [];
    };
    const write = async (sql) => sql.includes("RETURNING id") ? [{ id: "job-1" }] : [];
    await processAccountExport(
      { exportId: "job-1", userId: "user-1" },
      { ACCOUNT_EXPORTS: bucket },
      { queryImpl: read, execImpl: write, logAuditImpl: async () => {} }
    );
    const parsed = lines.map((line) => JSON.parse(line));
    const session = parsed.find((line) => line.table === "sessions");
    expect(session.row).toEqual({ created_at: "2026-01-01", expires_at: "2026-02-01", twofa_verified: false });
    expect(JSON.stringify(parsed)).not.toContain("secret-session-token");
    expect(parsed.filter((line) => line.table === "referralRewards")).toHaveLength(501);
    expect(parsed.filter((line) => line.table === "adminAudit")).toHaveLength(501);
  });

  it("aborts an incomplete multipart upload when export processing fails", async () => {
    let aborted = false;
    const bucket = {
      async createMultipartUpload() {
        return {
          async uploadPart() { return { partNumber: 1, etag: "etag" }; },
          async complete() {},
          async abort() { aborted = true; },
        };
      },
    };
    const read = async (sql) => {
      if (sql.includes("FROM users")) return [{ id: "user-1" }];
      if (sql.includes("FROM sites")) return [];
      if (sql.includes("COUNT(*)")) return [{ count: "0" }];
      if (sql.includes("FROM players")) throw new Error("database unavailable");
      return [];
    };
    const write = async (sql) => sql.includes("RETURNING id") ? [{ id: "job-1" }] : [];
    await processAccountExport(
      { exportId: "job-1", userId: "user-1" },
      { ACCOUNT_EXPORTS: bucket },
      { queryImpl: read, execImpl: write, logAuditImpl: async () => {} }
    );
    expect(aborted).toBe(true);
  });

  it("uploads fixed-size multipart parts except for the final part", async () => {
    const partSizes = [];
    const bucket = {
      async createMultipartUpload() {
        return {
          async uploadPart(partNumber, body) {
            partSizes.push([partNumber, body.byteLength]);
            return { partNumber, etag: "etag" };
          },
          async complete() {},
          async abort() {},
        };
      },
    };
    const read = async (sql) => {
      if (sql.includes("FROM users")) return [{ id: "user-1", email: "x".repeat(8 * 1024 * 1024) }];
      if (sql.includes("FROM sites")) return [];
      if (sql.includes("COUNT(*)")) return [{ count: "0" }];
      return [];
    };
    const write = async (sql) => sql.includes("RETURNING id") ? [{ id: "job-1" }] : [];
    await processAccountExport(
      { exportId: "job-1", userId: "user-1" },
      { ACCOUNT_EXPORTS: bucket },
      { queryImpl: read, execImpl: write, logAuditImpl: async () => {} }
    );
    expect(partSizes.length).toBeGreaterThan(1);
    expect(partSizes.slice(0, -1).every(([, size]) => size === 8 * 1024 * 1024)).toBe(true);
  });
});
