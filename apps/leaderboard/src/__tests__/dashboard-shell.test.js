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
  it("links every major product surface from the rail", () => {
    const html = renderPage(RewardsViewersPage);
    for (const href of [
      "/dashboard/editor/players",
      "/dashboard/editor/design",
      "/dashboard/games",
      "/dashboard/giveaways",
      "/dashboard/rewards/redemptions",
      "/dashboard/audience/viewers",
      "/bot/dashboard",
      "/dashboard/boards",
      "/dashboard/settings",
      "/help",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it("marks the open credit surface as current", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain('data-nav="viewers" aria-current="page"');
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
    expect(html).toContain('class="ov-setup-row" id="ovStepBrand" href="/dashboard/editor/setup"');
    expect(html).toContain("Your leaderboard");
  });

  it("lists all three peer products in the switcher", () => {
    const html = renderPage(RewardsViewersPage);
    // Sites, Telegram, and Credits & Shop are peer products; the switcher always
    // shows all three so the operator can move between them from anywhere.
    expect(html).toContain('class="lb-product-link" href="/dashboard"');
    expect(html).toContain('class="lb-product-link" href="/bot/dashboard"');
    expect(html).toContain('class="lb-product-link is-on" href="/dashboard/rewards/redemptions"');
    // Settings is a rail destination, not a product, so it is not repeated here.
    expect(html).not.toContain('class="lb-product-link" href="/dashboard/settings"');
  });

  it("keeps every signed-in feature visible from every dashboard page", () => {
    const html = renderPage(RewardsViewersPage);
    for (const href of [
      "/dashboard/editor/players",
      "/dashboard/editor/design",
      "/dashboard/games",
      "/dashboard/giveaways",
      "/dashboard/rewards/redemptions",
      "/dashboard/audience/viewers",
      "/bot/dashboard",
      "/dashboard/boards",
      "/dashboard/settings",
      "/help",
    ]) expect(html).toContain(`href="${href}"`);
  });

  it("uses plain-language navigation labels", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain(">Theme &amp; overlays</a>");
    expect(html).toContain(">Rewards &amp; shop</a>");
    expect(html).toContain(">Help &amp; support</a>");
    expect(html).toContain('data-nav="account"');
  });

  it("keeps every signed-in feature visible from account settings", () => {
    const html = renderPage(UnifiedSettingsPage);
    for (const href of [
      "/dashboard",
      "/dashboard/editor/players",
      "/dashboard/editor/design",
      "/dashboard/games",
      "/dashboard/giveaways",
      "/dashboard/rewards/redemptions",
      "/dashboard/audience/viewers",
      "/bot/dashboard",
      "/dashboard/boards",
      "/dashboard/settings",
      "/help",
    ]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('data-nav="account" aria-current="page"');
    expect((html.match(/<h1\b/g) || []).length).toBe(1);
    expect(html).not.toContain('data-nav="back"');
  });

  it("puts a breadcrumb trail on every leaf page", () => {
    const viewers = renderPage(RewardsViewersPage);
    expect(viewers).toContain('<nav class="v3-crumbs" aria-label="Breadcrumb">');
    expect(viewers).toContain('<a href="/dashboard/rewards/redemptions">Rewards &amp; Shop</a>');
    expect(viewers).toContain('<span aria-current="page">Viewers</span>');

    const settings = renderPage(UnifiedSettingsPage);
    expect(settings).toContain('<span aria-current="page">Account settings</span>');
  });

  it("trails dashboard sections and editor steps from the route", () => {
    const editor = PAGES.dashboard.Component({ activePath: "/dashboard/editor/design" }).toString();
    expect(editor).toContain('<a href="/dashboard/editor">Leaderboard</a>');
    expect(editor).toContain('<span aria-current="page">Theme &amp; styling</span>');
    expect(editor).toContain('href="/dashboard/editor/design" data-nav="board" data-hash="design" aria-current="page"');

    // Overview is the top level, so it gets no trail.
    expect(PAGES.dashboard.Component({ activePath: "/dashboard" }).toString())
      .not.toContain('class="v3-crumbs"');
  });

  it("marks exactly one visible editor feature as current", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/editor/players", user }).toString();
    expect(html).toContain('href="/dashboard/editor/players" data-nav="board" data-hash="players" aria-current="page"');
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
