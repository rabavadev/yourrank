import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.js";

const boardsJs = readFileSync(new URL("../assets/dashboard/boards.js", import.meta.url), "utf8");

describe("board-limit upsell", () => {
  it("keeps a visible New board action with an accessible upsell target", () => {
    expect(PAGES.dashboard).toContain('id="newBoard"');
    expect(PAGES.dashboard).toContain('id="boardLimitUpsell" role="status" hidden');
    expect(PAGES.dashboard).toContain('id="boardLimitCta"');
    expect(boardsJs).toContain("newBtn.hidden = false");
    expect(boardsJs).toContain('newBtn.setAttribute("aria-controls", atLimit ? "boardLimitUpsell" : "newBoardForm")');
  });

  it("offers Pro, Agency, or support according to the current plan", () => {
    expect(boardsJs).toContain("Pro unlocks up to 3 independent boards.");
    expect(boardsJs).toContain("Agency supports up to 99 independent leaderboards.");
    expect(boardsJs).toContain('cta: "Contact support"');
  });
});
