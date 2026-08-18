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
  it("links the primary creator surfaces from the rail", () => {
    const html = renderPage(RewardsViewersPage);
    for (const href of [
      "/dashboard/leaderboard/players",
      "/dashboard/giveaways/chat",
      "/dashboard/rewards/redemptions",
      "/dashboard/telegram",
      "/dashboard/analytics/activity",
      "/dashboard/settings",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).toContain('href="/dashboard/leaderboards">Manage all sites');
    expect(html).toContain('href="/help?area=credits');
    expect(html).toContain("Help &amp; feedback");
  });

  it("marks the open credit surface as current", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toMatch(/data-nav="redemptions"[^>]*aria-current="page"/);
    expect(html).not.toContain("lb-nav-child");
    expect((html.match(/class="lb-nav[^"]* is-on/g) || []).length).toBe(1);
  });

  it("renders the collapsible creator workspace shell", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain("data-collapse-side");
    expect(html).toContain('aria-controls="lbSide"');
    expect(html).toContain('class="lb-side-profile"');
    expect(html).toContain("Creator workspace");
    expect(html).toContain("seed 562938e8");
  });

  it("loads the authenticated v4 layer after shared primitives", () => {
    for (const key of ["dashboard", "rewardsRedemptions", "settingsUnified", "helpHub", "helpSupport"]) {
      const styles = PAGES[key].config.styles;
      expect(styles.at(-1)).toBe("/assets/dashboard-v4.css");
    }
  });

  it("keeps one main landmark and a topbar drawer trigger", () => {
    const html = renderPage(RewardsViewersPage);
    // The page shell already wraps the content in <main id="main-content">, so
    // the dashboard body must not add a second main landmark.
    expect(html).not.toContain("<main");
    expect(html).toContain('class="lb-menu lb-topbar-menu" id="lbMenu"');
  });

  it("groups site context, availability, and publishing in one command bar", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard", user }).toString();
    expect(html).toContain('class="lb-site-command"');
    expect(html).toContain('id="sidebarBoardSelect" aria-label="Switch site"');
    expect(html).toContain('id="lbTopbarSitePath"');
    expect(html).toContain('class="lb-availability"');
    expect(html).toContain('id="lbTopbarStatus"');
    expect(html).toContain('id="publishAction" type="button"');
    expect(html).toContain('id="pubToggle" hidden');
    expect(html).not.toContain('class="lb-pub-toggle"');
  });

  it("composes the Overview as a 12-column run sheet", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard", user }).toString();
    expect(html).toContain('id="ovCommandGrid"');
    expect(html).toContain('id="ovOnboardingBento" hidden');
    expect(html).toContain('id="ovActiveBento"');
    expect(html).toContain('class="ov-summary-actions"');
    expect(html).toContain('class="ov-setup-row" id="ovStepBrand" href="/dashboard/leaderboard/setup"');
    expect(html).toContain("Your leaderboard");
  });

  it("does not duplicate peer products below the rail", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).not.toContain('class="lb-product-link"');
    expect(html).toContain('data-product-link="credits"');
  });

  it("keeps secondary site and help actions accessible without rail duplication", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain('href="/dashboard/leaderboards">Manage all sites');
    expect(html).toContain('href="/help?area=credits');
    expect(html).toContain("Help &amp; feedback");
    expect(html).not.toContain('data-nav="boards"');
    expect(html).not.toContain('data-nav="help"');
  });

  it("uses plain-language navigation labels", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design", user }).toString();
    expect(html).toContain(">Look</a>");
    expect(html).toContain(">Leaderboard</a>");
    expect(html).toContain(">Rewards</a>");
    expect(html).toContain(">Messaging</a>");
    expect(html).toContain(">Analytics</a>");
    expect(html).toContain("Help &amp; feedback</a>");
    expect(html).toContain('data-nav="settings"');
  });

  it("keeps primary creator surfaces and account help accessible from settings", () => {
    const html = renderPage(UnifiedSettingsPage);
    for (const href of [
      "/dashboard",
      "/dashboard/leaderboard/players",
      "/dashboard/giveaways/chat",
      "/dashboard/rewards/redemptions",
      "/dashboard/telegram",
      "/dashboard/analytics/activity",
      "/dashboard/settings",
    ]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('href="/help?area=account');
    expect(html).toContain("Help &amp; feedback");
    expect(html).not.toContain('data-nav="boards"');
    expect(html).not.toContain('data-nav="help"');
    expect(html).toContain('data-nav="settings" aria-current="page"');
    expect((html.match(/<h1\b/g) || []).length).toBe(1);
    expect(html).not.toContain('data-nav="back"');
  });

  it("puts a breadcrumb trail on every leaf page", () => {
    const viewers = renderPage(RewardsViewersPage);
    expect(viewers).toContain('<nav class="v3-crumbs" aria-label="Breadcrumb">');
    expect(viewers).toContain('<a href="/dashboard/rewards/redemptions">Rewards</a>');
    expect(viewers).toContain('<span aria-current="page">Viewers</span>');

    const settings = renderPage(UnifiedSettingsPage);
    expect(settings).toContain('<span aria-current="page">Account</span>');
  });

  it("trails dashboard sections and editor steps from the route", () => {
    const editor = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design" }).toString();
    expect(editor).toContain('<a href="/dashboard/leaderboard/players">My leaderboard</a>');
    expect(editor).toContain('<span aria-current="page">Look</span>');
    expect(editor).toContain('href="/dashboard/leaderboard/design" data-egroup="design"');

    // Overview is the top level, so it gets no trail.
    expect(PAGES.dashboard.Component({ activePath: "/dashboard" }).toString())
      .not.toContain('class="v3-crumbs"');
  });

  it("marks exactly one visible editor feature as current", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/players", user }).toString();
    expect(html).toContain('href="/dashboard/leaderboard/players" data-nav="board" aria-current="page"');
    expect((html.match(/data-nav="board"[^>]*aria-current="page"/g) || []).length).toBe(1);
  });

  it("keeps operational data visible while launch setup is incomplete", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard", user }).toString();
    expect(html).toContain('id="ovOnboardingBento" hidden');
    expect(html).toContain('id="ovActiveBento"');
    expect(html).not.toContain('id="ovActiveBento" hidden');
    expect(html).toContain("0 of 3 done");
    expect(html).not.toContain('id="ovStepKickStatus"');
  });
});
