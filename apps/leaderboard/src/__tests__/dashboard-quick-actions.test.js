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
    expect(html).toContain('aria-label="Onboarding checklist"');
    expect(html).toContain('id="ovStepBrandBtn"');
    expect(html).toContain('id="ovStepPlayersBtn"');
    expect(html).toContain('id="ov_copyLink"');
  });

  it("copies the live page URL from the Overview", () => {
    expect(overviewJs).toContain('navigator.clipboard.writeText');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("organises navigation into Home / Board / Analytics / Settings", () => {
    const html = dashboardHtml();
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('data-nav="board"');
    expect(html).toContain('data-nav="performance"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
    expect(html).not.toContain('<span class="lb-side-grp">');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
    // Performance nav is now labelled Analytics.
    expect(html).toContain('>Analytics</button>');
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
    expect(html).toContain('data-egroup="history"');
    // Boards nav starts hidden; JS reveals it only when the user has 2+ boards.
    expect(html).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
  });
});
