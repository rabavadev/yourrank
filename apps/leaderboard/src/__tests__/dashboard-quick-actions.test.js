import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.js";

const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    expect(PAGES.dashboard).toContain('class="lb-qa" aria-label="Quick actions"');
    expect(PAGES.dashboard).toContain('data-jump="board"><span class="lb-qa-t">Add players</span>');
    expect(PAGES.dashboard).toContain('<span class="lb-qa-t">Set the prize</span>');
    expect(PAGES.dashboard).toContain('data-jump="board"><span class="lb-qa-t">Pick a design</span>');
    expect(PAGES.dashboard).toContain('id="ov_copyLink"');
  });

  it("copies the live page URL from the Overview", () => {
    expect(overviewJs).toContain('navigator.clipboard.writeText(url)');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("groups technical sections under an Advanced nav label", () => {
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Advanced</span>');
    expect(PAGES.dashboard).toContain('data-nav="integrations"><span class="lb-nav-ic" aria-hidden="true">🔌</span>Integrations');
  });

  it("leads with a single Editor section and hides Boards for solo users", () => {
    // The daily job (prize + players + design) lives in one Editor section...
    expect(PAGES.dashboard).toContain('data-nav="board" aria-current="page"><span class="lb-nav-ic" aria-hidden="true">🏆</span>Editor');
    // ...which is the section shown on load.
    expect(PAGES.dashboard).toContain('<section class="lb-page is-on" data-page="board">');
    // Boards nav starts hidden; JS reveals it only when the user has 2+ boards.
    expect(PAGES.dashboard).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
    // Prize/players and the live preview share one split-screen grid.
    expect(PAGES.dashboard).toContain('class="design-grid"');
    expect(PAGES.dashboard).toContain('id="designPreview"');
  });
});
