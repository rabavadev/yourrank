// The editor used to notify each surface by hand, and a second markDirty() that
// shadowed the preview-aware one silently killed the live preview. These assert
// the notification contract every surface now derives from.
import { describe, it, expect, beforeAll } from "bun:test";

let createDashboardState;

beforeAll(async () => {
  // state.js reads the request-id meta tag at module scope.
  globalThis.document = { querySelector: () => null };
  ({ createDashboardState } = await import("../assets/dashboard/state.js"));
});

describe("dashboard state store", () => {
  it("notifies subscribers with the keys that changed", () => {
    const { setState, subscribe } = createDashboardState();
    const seen = [];
    const off = subscribe((keys) => seen.push(keys));
    setState({ SLUG: "acme", PUBLISHED: true });
    off();
    expect(seen).toEqual([["SLUG", "PUBLISHED"]]);
  });

  it("does not notify when nothing changed", () => {
    const { setState, subscribe } = createDashboardState();
    setState({ SLUG: "acme" });
    const seen = [];
    const off = subscribe((keys) => seen.push(keys));
    setState({ SLUG: "acme" });
    off();
    expect(seen).toEqual([]);
  });

  it("announces every edit as a draft change, not just the first", () => {
    const { state, subscribe, markDirty } = createDashboardState();
    const drafts = [];
    const off = subscribe((keys) => { if (keys.includes("draft")) drafts.push(state._dirty); });
    markDirty();
    markDirty();
    markDirty();
    off();
    expect(drafts).toEqual([true, true, true]);
  });

  it("flips _dirty once per transition so the unload guard is added and removed once", () => {
    const { state, subscribe, markDirty, clearDirty } = createDashboardState();
    clearDirty();
    const flips = [];
    const off = subscribe((keys) => { if (keys.includes("_dirty")) flips.push(state._dirty); });
    markDirty();
    markDirty();
    clearDirty();
    clearDirty();
    off();
    expect(flips).toEqual([true, false]);
  });

  it("keeps notifying the other subscribers when one throws", () => {
    const { setState, subscribe } = createDashboardState();
    const seen = [];
    const offBad = subscribe(() => { throw new Error("boom"); });
    const offGood = subscribe(() => seen.push("ok"));
    setState({ SLUG: "other" });
    offBad();
    offGood();
    expect(seen).toEqual(["ok"]);
  });

  it("unsubscribes", () => {
    const { setState, subscribe } = createDashboardState();
    let calls = 0;
    const off = subscribe(() => calls++);
    off();
    setState({ SLUG: "third" });
    expect(calls).toBe(0);
  });
});
