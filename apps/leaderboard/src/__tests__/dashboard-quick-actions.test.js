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

  it("promotes postbacks into a top-level Automate nav group", () => {
    const html = dashboardHtml();
    // Attribution/postbacks is the core value prop and now lives in the primary nav.
    expect(html).toContain('<span class="lb-side-grp">Automate</span>');
    expect(html).toContain('href="/dashboard/attribution"');
    expect(html).toContain('>Postbacks</a>');
    // Integrations (overlay/domain/alerts) sits alongside it under Automate.
    expect(html).toContain('data-nav="integrations"');
    // The four-group IA: Board / Automate / Grow / Plan.
    expect(html).toContain('<span class="lb-side-grp">Board</span>');
    expect(html).toContain('<span class="lb-side-grp">Grow</span>');
    expect(html).toContain('<span class="lb-side-grp">Plan</span>');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
  });

  it("leads with a single Editor section and hides Boards for solo users", () => {
    const html = dashboardHtml();
    // The daily job (prize + players + design) lives in one Editor section...
    expect(html).toContain('data-nav="board" aria-current="page"><span class="lb-nav-ic" aria-hidden="true">');
    expect(html).toContain('</svg></span>Editor');
    // ...which is the section shown on load.
    expect(html).toContain('<section class="lb-page is-on" data-page="board">');
    // Boards nav starts hidden; JS reveals it only when the user has 2+ boards.
    expect(html).toContain('class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden');
    // Prize/players and the live preview share one split-screen grid.
    expect(html).toContain('class="design-grid"');
    expect(html).toContain('id="designPreview"');
  });
});