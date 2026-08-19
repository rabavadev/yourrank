import { describe, it, expect } from "bun:test";
import { RewardsViewersPage } from "../pages/rewards.jsx";
import { UnifiedSettingsPage } from "../pages/account.jsx";
import { PAGES } from "../pages.jsx";

const user = { display_name: "Pro user", plan: "pro" };

function renderPage(Component) {
  return Component({ reqId: "test-request", user }).toString();
}

function stripTags(value) {
  let text = "";
  let inTag = false;
  for (const char of value) {
    if (char === "<") {
      inTag = true;
    } else if (char === ">") {
      inTag = false;
    } else if (!inTag) {
      text += char;
    }
  }
  return text;
}

function visibleHeadings(html, { group = "", performancePanel = "" } = {}) {
  const tokenRe = /<\/?[^>]+>/g;
  const stack = [];
  const headings = [];
  let match;
  while ((match = tokenRe.exec(html))) {
    const token = match[0];
    const closing = /^<\//.test(token);
    if (!closing) {
      const tag = token.match(/^<([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      if (!tag || token.startsWith("<!")) continue;
      const ownGroup = token.match(/\bdata-egroup="([^"]+)"/)?.[1] || "";
      const ownPanel = token.match(/\bdata-perf-panel="([^"]+)"/)?.[1] || "";
      const inactivePage = /\bclass="[^"]*\blb-page\b[^"]*"/.test(token)
        && !/\bclass="[^"]*\bis-on\b[^"]*"/.test(token);
      const hidden = (/\bhidden(?:\s|=|>)/.test(token) && !/\bid="dash"/.test(token)) || inactivePage;
      const parent = stack[stack.length - 1];
      const entry = {
        tag,
        group: ownGroup || parent?.group || "",
        performancePanel: ownPanel || parent?.performancePanel || "",
        hidden: hidden || Boolean(parent?.hidden),
        textStart: match.index + token.length,
      };
      stack.push(entry);
      if (/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag) || /\/>$/.test(token)) {
        stack.pop();
      }
      continue;
    }
    const tag = token.match(/^<\/([a-z0-9-]+)/i)?.[1]?.toLowerCase();
    if (!tag) continue;
    let entry;
    while (stack.length) {
      entry = stack.pop();
      if (entry.tag === tag) break;
    }
    if (!entry || !/^h[1-6]$/.test(entry.tag)) continue;
    const text = stripTags(html.slice(entry.textStart, match.index)).replace(/\s+/g, " ").trim();
    if (entry.hidden || (group && entry.group && entry.group !== group) || (performancePanel && entry.performancePanel && entry.performancePanel !== performancePanel)) continue;
    headings.push({ tag: entry.tag, text });
  }
  return headings;
}

function expectHeadingOutline(html, options) {
  const headings = visibleHeadings(html, options);
  expect(headings.filter(({ tag }) => tag === "h1"), options.activePath).toHaveLength(1);
  expect(headings[0]?.tag, options.activePath).toBe("h1");
  for (let i = 1; i < headings.length; i += 1) {
    const previous = Number(headings[i - 1].tag.slice(1));
    const current = Number(headings[i].tag.slice(1));
    expect(current).toBeLessThanOrEqual(previous + 1);
  }
  return headings;
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
      "/dashboard/leaderboard",
      "/dashboard/giveaways",
      "/dashboard/rewards",
      "/dashboard/telegram",
      "/dashboard/analytics",
      "/dashboard/settings/board",
      "/dashboard/settings",
    ]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('class="lb-site-settings"');
    expect(html).toContain('href="/help/support?area=credits');
    expect(html).toContain("Help &amp; feedback");
  });

  it("marks the open credit surface as current", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toMatch(/data-nav="redemptions"[^>]*aria-current="page"/);
    expect(html).toContain("lb-nav-child");
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
      expect(styles).toContain("/assets/dashboard-v4.css");
      expect(styles).not.toContain("/assets/dashboard-v3.css");
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
    expect(html).not.toContain('id="lbTopbarSitePath"');
    expect(html).not.toContain(">Web address</span>");
    expect(html).toContain('class="lb-availability"');
    expect(html).toContain('id="lbTopbarStatus"');
    expect(html).toContain('id="publishAction" type="button"');
    expect(html).toContain('id="pubToggle" hidden');
    expect(html).not.toContain('class="lb-pub-toggle"');
  });

  it("renders unknown dashboard routes in the canonical shell", () => {
    const html = PAGES.dashboardNotFound.Component({ user }).toString();
    expect(html).toContain('data-auth-workspace="true"');
    expect(html).toMatch(/This dashboard page doesn(?:&#39;|')t exist/);
    expect(html).toContain('href="/dashboard/leaderboard/setup"');
    expect(html).not.toContain("No leaderboard here");
    expect(PAGES.dashboardNotFound.config.scripts.join("")).not.toContain("dashboard.js");
  });

  it("keeps site controls out of the rail and limits the account menu", () => {
    const html = renderPage(RewardsViewersPage);
    const rail = html.slice(html.indexOf("<aside"), html.indexOf("</aside>"));
    expect(rail).not.toContain("wsSwitcher");
    expect(html).not.toContain('id="wsSwitcher"');
    expect(html).not.toContain('id="wsCard"');
    expect(html).not.toContain('id="wsMenu"');
    expect(html).not.toContain('id="manageBoardsBtn"');
    expect(html).toContain('id="sidebarBoardSelect"');
    expect((html.match(/class="gm-profile-link"/g) || []).length).toBe(2);
    expect((html.match(/class="gm-logout"/g) || []).length).toBe(1);
    expect(html).not.toContain("Account settings");
    expect(html).toContain("Appearance");
    expect(html).toContain("Help &amp; feedback");
    expect(html).toContain("Sign out");
    expect((html.match(/<svg\b/g) || []).length).toBeGreaterThanOrEqual(4);
    expect(html).not.toContain(">Account</a>");
  });

  it("composes the Overview as a 12-column run sheet", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard", user }).toString();
    expect(html).toContain('id="ovCommandGrid"');
    expect(html).toContain('id="ovOnboardingBento" hidden');
    expect(html).toContain('id="ovActiveBento"');
    expect(html).toContain('class="ov-summary-actions"');
    expect(html).toContain('id="ovSetupMessage"');
    expect(html).toContain('id="ovSetupAction"');
    expect(html).not.toContain('id="ovStepBrand"');
    expect(html).toContain("Your leaderboard");
  });

  it("does not duplicate peer products below the rail", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).not.toContain('class="lb-product-link"');
    expect(html).toContain('data-product-link="credits"');
  });

  it("keeps secondary site and help actions accessible without rail duplication", () => {
    const html = renderPage(RewardsViewersPage);
    expect(html).toContain('data-nav="site"');
    expect(html).toMatch(/href="\/dashboard\/settings\/board"[^>]*data-nav="site"/);
    expect(html).toContain('href="/help/support?area=credits');
    expect(html).toContain("Help &amp; feedback");
    expect(html).not.toContain('data-nav="boards"');
    expect(html).not.toContain('data-nav="help"');
  });

  it("uses plain-language navigation labels", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design", user }).toString();
    expect(html).toContain(">Appearance</a>");
    expect(html).toContain(">Leaderboard</a>");
    expect(html).toContain(">Rewards</a>");
    expect(html).toContain(">Telegram</a>");
    expect(html).toContain(">Analytics</a>");
    expect(html).toContain("Help &amp; feedback</a>");
    expect(html).toContain('data-nav="settings"');
  });

  it("keeps primary creator surfaces and account help accessible from settings", () => {
    const html = renderPage(UnifiedSettingsPage);
    for (const href of [
      "/dashboard",
      "/dashboard/leaderboard",
      "/dashboard/giveaways",
      "/dashboard/rewards",
      "/dashboard/telegram",
      "/dashboard/analytics",
      "/dashboard/settings",
    ]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain('href="/help/support?area=account');
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
    expect(viewers).toContain('<a href="/dashboard/rewards">Rewards</a>');
    expect(viewers).toContain('<span aria-current="page">Viewers</span>');

    const settings = renderPage(UnifiedSettingsPage);
    expect(settings).toContain('<span aria-current="page">Account</span>');
  });

  it("trails dashboard sections and editor steps from the route", () => {
    const editor = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/design" }).toString();
    expect(editor).toContain('<a href="/dashboard/leaderboard">Leaderboard</a>');
    expect(editor).toContain('<span aria-current="page">Appearance</span>');
    expect(editor).toContain('href="/dashboard/leaderboard/design" data-egroup="design"');

    // Overview is the top level, so it gets no trail.
    expect(PAGES.dashboard.Component({ activePath: "/dashboard" }).toString())
      .not.toContain('class="v3-crumbs"');
  });

  it("marks exactly one visible editor feature as current", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard/leaderboard/players", user }).toString();
    expect(html).toContain('href="/dashboard/leaderboard" data-nav="board" aria-current="page"');
    expect((html.match(/data-nav="board"[^>]*aria-current="page"/g) || []).length).toBe(1);
  });

  it("keeps operational data visible while launch setup is incomplete", () => {
    const html = PAGES.dashboard.Component({ activePath: "/dashboard", user }).toString();
    expect(html).toContain('id="ovOnboardingBento" hidden');
    expect(html).toContain('id="ovActiveBento"');
    expect(html).not.toContain('id="ovActiveBento" hidden');
    expect(html).toContain("0 of 4 done");
    expect(html).not.toContain('id="ovStepKickStatus"');
  });

  it("keeps one page heading and a contiguous outline on every dashboard view", () => {
    const routes = [
      ["/dashboard", {}],
      ["/dashboard/leaderboard", { group: "setup" }],
      ["/dashboard/leaderboard/players", { group: "players" }],
      ["/dashboard/leaderboard/design", { group: "design" }],
      ["/dashboard/leaderboard/share", { group: "share" }],
      ["/dashboard/analytics", { performancePanel: "activity" }],
      ["/dashboard/games", {}],
      ["/dashboard/settings/board", {}],
    ];
    for (const [activePath, options] of routes) {
      const html = PAGES.dashboard.Component({ activePath, user }).toString();
      expectHeadingOutline(html, { ...options, activePath });
    }
  });
});
