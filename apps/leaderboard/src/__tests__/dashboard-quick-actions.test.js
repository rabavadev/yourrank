import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const siteJs = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");
const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");
const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const creditsJs = readFileSync(new URL("../assets/credits.js", import.meta.url), "utf8");
const performanceJs = readFileSync(new URL("../assets/dashboard/performance.js", import.meta.url), "utf8");
const dashboardCss = readFileSync(new URL("../assets/dashboard-v3.css", import.meta.url), "utf8");

function dashboardHtml(activePath = "/dashboard") {
  return PAGES.dashboard.Component({ activePath }).toString();
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
    expect(html).toContain('class="ov-summary"');
    expect(html).toContain('id="ovPrimaryAction"');
    expect(html).toContain('href="#publish"');
    expect(html).toContain('class="ov-card-empty" id="ovActivityEmpty"');
  });

  it("routes unverified users to email confirmation without a duplicate Overview banner", () => {
    expect(overviewJs).toContain("status.published && !status.emailVerified");
    expect(overviewJs).toContain("const needsVerification = !status.emailVerified");
    expect(overviewJs).toContain("const readyToPublish = steps.brand && steps.players");
    expect(overviewJs).toContain("const verificationIsNext = pendingVerification || (readyToPublish && needsVerification)");
    expect(overviewJs).toContain('verificationIsNext ? "/verify-email"');
    expect(overviewJs).toContain('verificationIsNext ? "Confirm email"');
    expect(siteJs).toContain("s.emailVerified || Boolean(document.querySelector");
    expect(siteJs).toContain("export function wirePublishAction");
    expect(siteJs).toContain("requestPublicationChange");
  });

  it("preserves the selected site across Sites and Credits", () => {
    expect(dashboardJs).toContain('target.searchParams.set("siteId", state.ACTIVE_SITE_ID)');
    expect(dashboardJs).toContain('target.searchParams.set("board", state.ACTIVE_SITE_ID)');
    expect(dashboardJs).toContain('target.pathname.startsWith("/dashboard/editor/")');
    expect(dashboardJs).toContain('target.pathname.startsWith("/dashboard/analytics/")');
    expect(creditsJs).toContain('`/dashboard?board=${encodeURIComponent(siteId)}`');
    expect(creditsJs).toContain('target.pathname.startsWith("/dashboard/editor/")');
    expect(creditsJs).toContain('target.searchParams.set("board", siteId)');
    expect(creditsJs).toContain('target.searchParams.set("siteId", siteId)');
  });

  it("reports public site availability truthfully from Credits", () => {
    expect(creditsJs).toContain("Boolean(board.published) && user.emailVerified !== false");
    expect(creditsJs).toContain('live ? "Public" : pendingVerification ? "Email verification needed" : "Private"');
    expect(creditsJs).toContain('pendingVerification ? "/verify-email"');
    expect(creditsJs).toContain('pendingVerification ? "Verify email to publish" : "Publish your site"');
  });

  it("keeps tablet navigation closable", () => {
    expect(dashboardCss).toMatch(/@media \(max-width: 980px\)[\s\S]*?\.v3-dash \.lb-side-close \{[\s\S]*?display: inline-flex;[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
  });

  it("keeps account plan panels readable on the dark dashboard", () => {
    expect(dashboardCss).toMatch(/\.v3-dash \.plan-usage-row \{[\s\S]*?background: var\(--v3-chrome-3\);/);
    expect(dashboardCss).toMatch(/\.v3-dash \.plan-pending,[\s\S]*?\.v3-dash \.plan-cancel \{[\s\S]*?background: var\(--v3-chrome-3\);/);
  });

  it("announces the active audience insight tab", () => {
    expect(performanceJs).toContain('node.setAttribute("aria-current", "page")');
    expect(performanceJs).toContain('node.removeAttribute("aria-current")');
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
    expect(html).toContain('data-nav="account"');
    expect(html).toContain('lb-side-group');
    // Icons are real inline SVGs, not emoji.
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
    expect(html).toContain('>Overview</a>');
    for (const label of [
      "Racers &amp; scores", "Theme &amp; overlays", "Mini-games &amp; history",
      "Live giveaways", "Rewards &amp; shop", "Viewer points &amp; stats",
      "Telegram bot",
      "Sites &amp; integrations", "Account &amp; billing",
      "Help &amp; support",
    ]) expect(html).toContain(`>${label}</a>`);
    expect(html).toContain('>LEADERBOARD</div>');
    expect(html).toContain('>COMMUNITY &amp; REWARDS</div>');
    expect(html).toContain('>SETTINGS &amp; SITES</div>');
  });

  it("serves only the section the URL addresses", () => {
    const overview = dashboardHtml();
    // The whole app used to ship in one document and be revealed by JS, so
    // `/dashboard` carried the editor form and seven <h1>s.
    expect(overview).toContain('data-page="home"');
    expect(overview).not.toContain('data-page="board"');
    expect(overview).not.toContain('id="designPreview"');
    expect(overview).not.toContain('id="savebar"');
    expect((overview.match(/<h1/g) || []).length).toBe(1);
    const games = dashboardHtml("/dashboard/games");
    expect(games).toContain('data-page="games"');
    expect(games).not.toContain('data-page="home"');
  });

  it("keeps every site editor section directly available", () => {
    const html = dashboardHtml("/dashboard/editor");
    expect(html).toContain('data-page="board"');
    expect(html).toContain('id="savebar"');
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
