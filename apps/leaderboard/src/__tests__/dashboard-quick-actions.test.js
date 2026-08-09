import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");

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
    expect(utilsJs).toContain('navigator.clipboard.writeText');
    expect(overviewJs).toContain('copyToClipboard');
    expect(overviewJs).toContain('location.origin + "/" + state.SLUG');
  });

  it("organises navigation into Overview / Editor / Boards / Settings", () => {
    const html = dashboardHtml();
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('data-nav="board"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('data-nav="boards"');
    expect(html).toContain('class="lb-side-group"');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
    expect(html).toContain('>Overview</a>');
    expect(html).toContain('>Editor</a>');
    expect(html).toContain('>All boards</span>');
  });

  it("leads with the Board editor and always shows All boards", () => {
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
    // All boards nav is always visible; the count is updated by JS.
    expect(html).toContain('id="allBoardsNav"');
    expect(html).not.toContain('data-nav="boards" hidden');
  });
});
