import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.js";

const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    expect(PAGES.dashboard).toContain('class="lb-qa" aria-label="Quick actions"');
    expect(PAGES.dashboard).toContain('data-jump="board"><span class="lb-qa-t">Add players</span>');
    expect(PAGES.dashboard).toContain('<span class="lb-qa-t">Set the prize</span>');
    expect(PAGES.dashboard).toContain('data-jump="design"><span class="lb-qa-t">Pick a design</span>');
    expect(PAGES.dashboard).toContain('id="ov_copyLink"');
  });

  it("copies the live page URL from the Overview", () => {
    expect(overviewJs).toContain('navigator.clipboard.writeText(url)');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("groups technical sections under an Advanced nav label", () => {
    expect(PAGES.dashboard).toContain('<span class="lb-side-grp">Advanced</span>');
    expect(PAGES.dashboard).toContain('data-nav="integrations"><span class="lb-nav-ic" aria-hidden="true">🔌</span>Overlay &amp; domain');
  });
});
