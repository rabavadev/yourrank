import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.js";

const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");

describe("board-limit upsell", () => {
  it("keeps a visible New board action with an accessible upsell target", () => {
    expect(PAGES.dashboard).toContain('id="newBoard"');
    expect(PAGES.dashboard).toContain('id="boardLimitUpsell" role="status" hidden');
    expect(PAGES.dashboard).toContain('id="boardLimitCta"');
    expect(dashboardJs).toContain("newBtn.hidden = false");
    expect(dashboardJs).toContain('newBtn.setAttribute("aria-controls", atLimit ? "boardLimitUpsell" : "newBoardForm")');
  });

  it("offers Pro, Agency, or support according to the current plan", () => {
    expect(dashboardJs).toContain("Pro unlocks up to 3 independent boards.");
    expect(dashboardJs).toContain("Agency supports up to 99 independent leaderboards.");
    expect(dashboardJs).toContain('cta: "Contact support"');
  });
});
