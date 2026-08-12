import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const siteJs = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");

function dashboardHtml() {
  return PAGES.dashboard.Component().toString();
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
    expect(html).toContain('>Players</a>');
    expect(html).toContain('>Design</a>');
    expect(html).toContain('>Settings</a>');
    expect(html).toContain('>BOARD</div>');
    expect(html).toContain('>Redemptions</a>');
    expect(html).toContain('>Credit rules</a>');
    expect(html).toContain('>REWARDS</div>');
    expect(html).toContain('>AUDIENCE</div>');
  });

  it("leads with the Board editor and still exposes editor sub-sections", () => {
    const html = dashboardHtml();
    expect(html).toContain('<section class="lb-page" data-page="board">');
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
