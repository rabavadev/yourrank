import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");

function dashboardHtml() {
  return PAGES.dashboard.Component().toString();
}

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    const html = dashboardHtml();
    expect(html).toContain('class="lb-qa" aria-label="Quick actions"');
    expect(html).toContain('data-jump="board"><span class="lb-qa-t">Add players</span>');
    expect(html).toContain('<span class="lb-qa-t">Set the prize</span>');
    expect(html).toContain('data-jump="board"><span class="lb-qa-t">Pick a design</span>');
    expect(html).toContain('id="ov_copyLink"');
  });

  it("copies the live page URL from the Overview", () => {
    expect(overviewJs).toContain('navigator.clipboard.writeText(url)');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("organises navigation into Home / Board / Performance / Settings", () => {
    const html = dashboardHtml();
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('data-nav="board"');
    expect(html).toContain('data-nav="performance"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
    expect(html).not.toContain('<span class="lb-side-grp">');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
  });

  it("leads with the Board editor and hides Boards for solo users", () => {
    const html = dashboardHtml();
    expect(html).toContain('<section class="lb-page" data-page="board">');
    expect(html).toContain('class="design-grid"');
    expect(html).toContain('id="designPreview"');
    expect(html).toContain('class="editor-steps"');
    expect(html).toContain('data-egroup="setup"');
    expect(html).toContain('data-egroup="players"');
    expect(html).toContain('data-egroup="design"');
    expect(html).toContain('data-egroup="share"');
    // Boards nav starts hidden; JS reveals it only when the user has 2+ boards.
    expect(html).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
  });
});
