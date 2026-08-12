import { describe, it, expect } from "bun:test";
import { RewardsViewersPage } from "../pages/rewards.jsx";
import { UnifiedSettingsPage } from "../pages/account.jsx";
import { PAGES } from "../pages.jsx";

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

  it("passes the caller user through the settings page", () => {
    const html = renderPage(UnifiedSettingsPage);
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
    // Settings is a rail destination now, so it is not repeated here either.
    expect(html).not.toContain('class="lb-product-link" href="/dashboard/settings"');
    expect(html).toContain('class="lb-product-link" href="/bot/dashboard"');
  });

  it("separates account settings from the selected board's settings", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain('href="/dashboard/settings/board"');
    expect(html).toContain('href="/dashboard/settings"');
    expect(html).not.toContain('href="/account/');
  });

  it("gives the account settings page a way back to the dashboard", () => {
    const html = renderPage(UnifiedSettingsPage);
    expect(html).toContain('data-nav="back"');
    expect(html).toContain('data-nav="account" aria-current="page"');
  });

  it("puts a breadcrumb trail on every leaf page", () => {
    const viewers = renderPage(RewardsViewersPage);
    expect(viewers).toContain('<nav class="v3-crumbs" aria-label="Breadcrumb">');
    expect(viewers).toContain('<a href="/dashboard">Dashboard</a>');
    expect(viewers).toContain('<a href="/dashboard/rewards/redemptions">Credits</a>');
    expect(viewers).toContain('<span aria-current="page">Viewers</span>');

    const settings = renderPage(UnifiedSettingsPage);
    expect(settings).toContain('<span aria-current="page">Account settings</span>');
  });

  it("trails dashboard sections and editor steps from the route", () => {
    const editor = PAGES.dashboard.Component({ activePath: "/dashboard/editor/design" }).toString();
    expect(editor).toContain('<a href="/dashboard/editor">Editor</a>');
    expect(editor).toContain('<span aria-current="page">Design</span>');

    // Overview is the top level, so it gets no trail.
    expect(PAGES.dashboard.Component({ activePath: "/dashboard" }).toString())
      .not.toContain('class="v3-crumbs"');
  });
});
