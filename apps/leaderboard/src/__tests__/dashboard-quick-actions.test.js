import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const siteJs = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");
const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");
const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const boardShellJs = readFileSync(new URL("../assets/dashboard/board-shell.js", import.meta.url), "utf8");
const performanceJs = readFileSync(new URL("../assets/dashboard/performance.js", import.meta.url), "utf8");
const dashboardCss = readFileSync(new URL("../assets/dashboard-v4.css", import.meta.url), "utf8");

function dashboardHtml(activePath = "/dashboard") {
  return PAGES.dashboard.Component({ activePath }).toString();
}

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    const html = dashboardHtml();
    expect(html).toContain('ov-setup');
    expect(html).toContain('id="ovSetupMessage"');
    expect(html).toContain('id="ovSetupAction"');
    expect(html).not.toContain('id="ovStepBrand"');
    expect(html).not.toContain('id="ovStepPlayers"');
    expect(html).not.toContain('id="ovStepPublish"');
    expect(html).toContain('id="ovActivityList"');
    expect(html).toContain('id="ovTopPlayers"');
    expect(html).not.toContain('class="ov-summary"');
    expect(html).toContain('id="ovPublishedStatus"');
    expect(html).not.toContain('id="ovPrimaryAction"');
    expect(html).toContain('href="/dashboard/leaderboard/setup"');
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
    expect(dashboardJs).toContain('target.pathname.startsWith("/dashboard/leaderboard/")');
    expect(dashboardJs).toContain('target.pathname.startsWith("/dashboard/analytics/")');
    expect(boardShellJs).toContain('`/dashboard?board=${encodeURIComponent(siteId)}`');
    expect(boardShellJs).toContain('target.pathname.startsWith("/dashboard/leaderboard/")');
    expect(boardShellJs).toContain('target.searchParams.set("board", siteId)');
    expect(boardShellJs).toContain('target.searchParams.set("siteId", siteId)');
  });

  it("reports public site availability truthfully from Credits", () => {
    expect(boardShellJs).toContain("Boolean(board.published) && user.emailVerified !== false");
    expect(boardShellJs).toContain('live ? "Published" : pendingVerification ? "Verification needed" : "Not published"');
    expect(boardShellJs).toContain('pendingVerification ? "/verify-email"');
    expect(boardShellJs).toContain('publicLink.textContent = "View site ↗"');
    expect(boardShellJs).toContain('publicLink.textContent = pendingVerification ? "Verify email" : "Publish site"');
    expect(siteJs).toContain('draft: "Not published", unpublished: "Not published", pending: "Verification needed", published: "Published"');
    expect(siteJs).toContain('s.published ? "Unpublish site" : "Publish site"');
    expect(siteJs).toContain('nextPublished ? "Publishing…" : "Unpublishing…"');
  });

  it("keeps tablet navigation closable", () => {
    expect(dashboardCss).toMatch(/@media \(max-width: 980px\)[\s\S]*?\.v3-dash\[data-auth-workspace\] \.lb-side-close \{[\s\S]*?display: inline-flex;[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
  });

  it("keeps account plan panels readable on the dark dashboard", () => {
    expect(dashboardCss).toMatch(/\.v3-dash\[data-auth-workspace\] \.plan-usage-row \{[\s\S]*?background: var\(--v4-surface\);/);
    expect(dashboardCss).toMatch(/\.v3-dash\[data-auth-workspace\] \.plan-pending,[\s\S]*?\.v3-dash\[data-auth-workspace\] \.plan-cancel \{[\s\S]*?background: var\(--v4-surface-soft\);/);
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

  it("organises navigation into a focused creator section list", () => {
    const html = dashboardHtml();
    expect(html).toContain('data-nav="home"');
    expect(html).toContain('data-nav="board"');
    expect(html).toContain('data-nav="settings"');
    expect(html).toContain('lb-side-group');
    expect(html).not.toContain('aria-hidden="true">🔌</span>');
    expect(html).toContain('>Home</a>');
    for (const label of [
      "Leaderboard", "Giveaways", "Raffles", "Predictions", "Drops", "Games", "Rewards", "Telegram", "Analytics", "Integrations", "Sites", "Settings",
    ]) expect(html).toContain(`>${label}</a>`);
    expect(html).toContain(">Engage</div>");
    expect(html).not.toContain('>Help</a>');
  });

  it("serves only the section the URL addresses", () => {
    const overview = dashboardHtml();
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
    const html = dashboardHtml("/dashboard/leaderboard");
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
