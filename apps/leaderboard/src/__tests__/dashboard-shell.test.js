import { describe, it, expect } from "bun:test";
import { RewardsViewersPage } from "../pages/rewards.jsx";
import { AccountProfilePage } from "../pages/account.jsx";

const user = { display_name: "Pro user", plan: "pro" };

function renderPage(Component) {
  return Component({ reqId: "test-request", user }).toString();
}

describe("server-rendered dashboard profile", () => {
  it("passes the caller user through a Rewards/Audience page", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain("gm-badge--paid\">Pro</span>");
    expect(html).not.toContain("gm-badge--free\">Free</span>");
  });

  it("passes the caller user through an Account page", () => {
    const html = renderPage(AccountProfilePage);
    expect(html).toContain("gm-badge--paid\">Pro</span>");
    expect(html).not.toContain("gm-badge--free\">Free</span>");
  });
});

describe("signed-in shell navigation", () => {
  it("links every credit surface from the rail", () => {
    const html = renderPage(RewardsViewersPage);
    for (const href of [
      "/dashboard/rewards/redemptions",
      "/dashboard/rewards/shop",
      "/dashboard/rewards/rules",
      "/dashboard/audience/viewers",
      "/dashboard/audience/activity",
      "/dashboard/rewards/channel",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("marks the open credit surface as current", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain('data-nav="viewers" aria-current="page"');
  });

  it("keeps one main landmark and a topbar drawer trigger", () => {
    const html = renderPage(RewardsViewersPage);
    // The page shell already wraps the content in <main id="main-content">, so
    // the dashboard body must not add a second main landmark.
    expect(html).not.toContain("<main");
    expect(html).toContain('class="lb-menu lb-topbar-menu" id="lbMenu"');
  });

  it("does not repeat leaderboard sections in the product switcher", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).not.toContain('class="lb-product-link" href="/dashboard"');
    expect(html).toContain('class="lb-product-link" href="/bot/dashboard"');
  });
});
