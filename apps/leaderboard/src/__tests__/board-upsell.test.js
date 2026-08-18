import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const boardsJs = readFileSync(new URL("../assets/dashboard/boards.js", import.meta.url), "utf8");

function dashboardHtml() {
  return PAGES.dashboard.Component().toString();
}

describe("site-limit upsell", () => {
  it("keeps a visible New site action with an accessible upsell target", () => {
    const html = dashboardHtml();
    expect(html).toContain('id="newBoard"');
    expect(html).toContain('id="boardLimitUpsell" role="status" hidden');
    expect(html).toContain('id="boardLimitCta"');
    expect(boardsJs).toContain("newBtn.hidden = false");
    expect(boardsJs).toContain('newBtn.setAttribute("aria-controls", atLimit ? "boardLimitUpsell" : "newBoardForm")');
  });

  it("offers Pro, Agency, or support using creator-facing site language", () => {
    expect(boardsJs).toContain("Pro unlocks up to 3 sites.");
    expect(boardsJs).toContain("Agency supports up to 99 sites.");
    expect(boardsJs).toContain('cta: "Contact support"');
    expect(boardsJs).not.toContain("independent boards");
  });

  it("does not label the current site as editing or an unpublished site as a draft", () => {
    expect(boardsJs).toContain('board-table-badge\">Current');
    expect(boardsJs).toContain('b.published ? "Published" : "Unpublished"');
    expect(boardsJs).not.toContain('board-table-badge\">editing');
    expect(boardsJs).not.toContain('b.published ? "Published" : "Draft"');
  });
});
