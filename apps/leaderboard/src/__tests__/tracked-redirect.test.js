import { describe, expect, it } from "bun:test";
import { deferClickWrite, trackedDestination } from "../tracked-redirect.js";

describe("tracked redirects", () => {
  it("returns the redirect without waiting for click tracking", async () => {
    let resolveWrite;
    const write = new Promise((resolve) => { resolveWrite = resolve; });
    let deferred;
    const ctx = { waitUntil(promise) { deferred = promise; } };

    const started = Date.now();
    deferClickWrite(ctx, () => write);
    const response = trackedDestination("https://yourrank.site", "board", "https://partner.example/join", "click-1");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("yr_click=click-1");
    expect(Date.now() - started).toBeLessThan(100);
    expect(deferred).toBeDefined();

    resolveWrite();
    await deferred;
  });

  it("swallows deferred write failures without affecting the redirect", async () => {
    let deferred;
    deferClickWrite({ waitUntil(promise) { deferred = promise; } }, async () => {
      throw new Error("database unavailable");
    });
    const response = trackedDestination("https://yourrank.site", "board", null, "click-2");
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://yourrank.site/board");
    await deferred;
  });
});
