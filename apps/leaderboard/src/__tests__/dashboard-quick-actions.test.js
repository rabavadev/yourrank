import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const siteJs = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");

function dashboardHtml(activePath = "/dashboard") {
  return PAGES.dashboard.Component({ activePath }).toString();
}

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    const html = dashboardHtml();
    expect(html).toContain('ov-setup');
    expect(html).toContain('id="ovStepBrand"');
    expect(html).toContain('id="ovStepPlayers"');
    expect(html).toContain('id="ovStepPublish"');
    expect(html).toContain('id="ovActivityList"');
    expect(html).toContain('id="ovTopPlayers"');
    expect(html).toContain('id="ovStatusbar"');
  });

  it("copies the live page URL from the editor Share tab", () => {
    expect(utilsJs).toContain('navigator.clipboard.writeText');
    expect(siteJs).toContain('const shareCopy = $("shareCopy")');
    expect(siteJs).toContain('copyToClipboard(publicUrl)');
  });

  it("organises navigation into the v3 section list", () => {
    const html = dashboardHtml();
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('data-nav="board"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('lb-side-group');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
    expect(html).toContain('>Overview</a>');
    // Consolidated IA (audit item 15): one Editor destination, one Credits
    // parent; Players/Design/Past periods live as editor-internal tabs.
    expect(html).toContain('>Editor</a>');
    expect(html).toContain('>Board settings</a>');
    expect(html).toContain('>Account settings</a>');
    expect(html).toContain('>BOARD</div>');
    expect(html).toContain('>CREDITS</div>');
    expect(html).toContain('>Credits</a>');
    // Editor sub-sections remain reachable as internal tab links.
    const editor = dashboardHtml("/dashboard/editor");
    expect(editor).toContain('/dashboard/editor/players');
    expect(editor).toContain('/dashboard/editor/design');
    expect(html).not.toContain('>REWARDS</div>');
    expect(html).not.toContain('>AUDIENCE</div>');
  });

  it("serves only the section the URL addresses", () => {
    const overview = dashboardHtml();
    // The whole app used to ship in one document and be revealed by JS, so
    // `/dashboard` carried the editor form and seven <h1>s.
    expect(overview).toContain('data-page="home"');
    expect(overview).not.toContain('data-page="board"');
    expect(overview).not.toContain('id="designPreview"');
    expect(overview).not.toContain('id="savebar"');
    expect((overview.match(/<h1/g) || []).length).toBe(1);
    const games = dashboardHtml("/dashboard/games");
    expect(games).toContain('data-page="games"');
    expect(games).not.toContain('data-page="home"');
  });

  it("leads with the Board editor and still exposes editor sub-sections", () => {
    const html = dashboardHtml("/dashboard/editor");
    expect(html).toContain('data-page="board"');
    expect(html).toContain('id="savebar"');
    expect(html).toContain('class="design-grid"');
    expect(html).toContain('id="designPreview"');
    expect(html).toContain('class="editor-steps v3-tabs"');
    expect(html).toContain('data-egroup="setup"');
    expect(html).toContain('data-egroup="players"');
    expect(html).toContain('data-egroup="design"');
    expect(html).toContain('data-egroup="share"');
    expect(html).toContain('data-egroup="history"');
  });
});
