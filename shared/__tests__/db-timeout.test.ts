import { describe, it, expect } from "bun:test";
import { queryWithTimeout } from "../db.ts";

const dbUrl = process.env.ANALYTICS_TEST_DATABASE_URL ||
  process.env.GAMES_TEST_DATABASE_URL ||
  process.env.DATABASE_URL;
const describeDb = dbUrl ? describe : describe.skip;

if (dbUrl && !process.env.DATABASE_URL) process.env.DATABASE_URL = dbUrl;

describeDb("queryWithTimeout", () => {
  it("executes a parameterized read on the real driver path", async () => {
    const rows = await queryWithTimeout<{ value: number }>(
      "SELECT $1::int AS value",
      [7],
    );
    expect(Number(rows[0]?.value)).toBe(7);
  });

  it("cancels a query that exceeds the transaction-local bound", async () => {
    try {
      await queryWithTimeout("SELECT pg_sleep(0.05), $1::int AS value", [7], 5);
      throw new Error("expected statement timeout");
    } catch (error: any) {
      expect(error?.code).toBe("57014");
    }
  });
});
