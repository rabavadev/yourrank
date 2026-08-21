// One publication vocabulary for the whole dashboard.
//
// Three surfaces used to invent their own words for the same thing: the topbar
// badge, the editor footer (keyed off PUBLISHED_AT, so a live site could read
// "Not published yet"), and the savebar. None of them could say "live, with
// unpublished draft changes" at all. publicationCopy() derives every label from
// the board status plus the dirty flag so the surfaces cannot drift apart again.
import { beforeAll, describe, expect, it } from "bun:test";

let publicationCopy;

beforeAll(async () => {
  globalThis.document = {
    cookie: "",
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
  };
  globalThis.location = { href: "http://localhost/dashboard/leaderboard" };
  globalThis.sessionStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
  };
  ({ publicationCopy } = await import("../assets/dashboard/site.js"));
});

const notLive = () => publicationCopy({ published: false, pending: false }, false);
const pendingVerification = () => publicationCopy({ published: false, pending: true }, false);
const live = () => publicationCopy({ published: true, pending: false }, false);
const liveWithDraft = () => publicationCopy({ published: true, pending: false }, true);

describe("dashboard publication vocabulary", () => {
  it("describes a site that was never published", () => {
    expect(notLive()).toEqual({
      statusLabel: "Not live",
      footerLabel: "Not live yet",
      saveLabel: "Save changes",
      saveHint: "Unsaved changes",
      draftChanges: false,
    });
  });

  it("describes a live site with everything published", () => {
    expect(live()).toEqual({
      statusLabel: "Live",
      footerLabel: "All changes published",
      saveLabel: "Save changes",
      saveHint: "Unsaved changes",
      draftChanges: false,
    });
  });

  it("describes a live site holding unpublished draft changes", () => {
    // The state the old copy could not express at all.
    expect(liveWithDraft()).toEqual({
      statusLabel: "Live",
      footerLabel: "Changes not published",
      saveLabel: "Publish changes",
      saveHint: "Changes not published",
      draftChanges: true,
    });
  });

  it("keeps verification a distinct state rather than a flavour of live", () => {
    expect(pendingVerification().statusLabel).toBe("Verification needed");
    expect(pendingVerification().draftChanges).toBe(false);
  });

  it("never calls a live site unpublished", () => {
    // The original bug: the editor footer read "Not published yet" for a site
    // that was serving traffic, because it keyed off PUBLISHED_AT.
    for (const copy of [live(), liveWithDraft()]) {
      expect(copy.statusLabel).toBe("Live");
      expect(copy.footerLabel).not.toBe("Not live yet");
      expect(copy.footerLabel).not.toMatch(/not published yet/i);
    }
  });

  it("gives each state its own wording so surfaces cannot disagree", () => {
    const states = [notLive(), pendingVerification(), live(), liveWithDraft()];
    expect(new Set(states.map((s) => JSON.stringify(s))).size).toBe(states.length);
    // Only the dirty-and-live case asks the operator to publish.
    expect(states.filter((s) => s.saveLabel === "Publish changes")).toEqual([liveWithDraft()]);
    // Only the dirty-and-live case raises the draft badge.
    expect(states.filter((s) => s.draftChanges)).toEqual([liveWithDraft()]);
  });
});
