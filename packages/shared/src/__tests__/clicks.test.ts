import { describe, expect, it } from "bun:test";
import { insertClick } from "../clicks.js";

describe("click uniqueness lock", () => {
  it("passes the IP hash to the lock as hex text", async () => {
    const statements: Array<[string, unknown[]]> = [];
    const tx = {
      async one(text: string, params: unknown[]) {
        statements.push([text, params]);
        return { lock_acquired: false };
      },
      async query(text: string, params: unknown[]) {
        statements.push([text, params]);
        return [];
      },
    };
    await insertClick(
      "link-1",
      Buffer.from("ab".repeat(32), "hex"),
      null,
      null,
      null,
      null,
      null,
      { withTransactionImpl: async (callback: (value: typeof tx) => Promise<void>) => callback(tx) as any }
    );
    expect(statements[0][0]).toContain("encode($2, 'hex')");
    expect(statements[0][1][1]).toBeInstanceOf(Buffer);
  });
});
