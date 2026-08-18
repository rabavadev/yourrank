import { describe, expect, it } from "bun:test";
import { expiryWarningQuery } from "../email.js";

describe("expiry warning query", () => {
  it("does not compare plan_tier against the removed lifetime value", () => {
    expect(expiryWarningQuery).not.toContain("'lifetime'");
    expect(expiryWarningQuery).toContain("plan_expires_at IS NOT NULL");
  });
});
