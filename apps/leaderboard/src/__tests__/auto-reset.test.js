import { describe, expect, it } from "bun:test";
import { restoreAutoResetMarker } from "../auto-reset-claim.js";

describe("auto-reset claim rollback", () => {
  it("restores the previous last-run marker instead of clearing history", async () => {
    let call;
    await restoreAutoResetMarker(async (...args) => {
      call = args;
    }, "site-1", "2026-08-01T00:00:00.000Z");
    expect(call[0]).toContain("auto_reset_last_run_at = $2");
    expect(call[0]).not.toContain("auto_reset_last_run_at = NULL");
    expect(call[1]).toEqual(["site-1", "2026-08-01T00:00:00.000Z"]);
  });
});
