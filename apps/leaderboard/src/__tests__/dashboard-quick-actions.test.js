import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";
import { effectivePlan } from "@yourrank/shared/plans";
import { activityEmptyAction, giveawayAction } from "../assets/dashboard/overview-state.js";

const siteJs = readFileSync(new URL("../assets/dashboard/site.js", import.meta.url), "utf8");
const utilsJs = readFileSync(new URL("../assets/dashboard/utils.js", import.meta.url), "utf8");
const overviewJs = readFileSync(new URL("../assets/dashboard/overview.js", import.meta.url), "utf8");
const dashboardJs = readFileSync(new URL("../assets/dashboard.js", import.meta.url), "utf8");
const boardShellJs = readFileSync(new URL("../assets/dashboard/board-shell.js", import.meta.url), "utf8");
const performanceJs = readFileSync(new URL("../assets/dashboard/performance.js", import.meta.url), "utf8");
const dashboardCss = readFileSync(new URL("../assets/dashboard-v4.css", import.meta.url), "utf8");
const workerIndex = readFileSync(new URL("../index.js", import.meta.url), "utf8");

function dashboardHtml(activePath = "/dashboard") {
  return PAGES.dashboard.Component({ activePath }).toString();
}

describe("dashboard overview quick actions", () => {
  it("puts the main tasks one click from the Overview", () => {
    const html = dashboardHtml();
    expect(html).toContain('ov-setup');
    expect(html).toContain('id="ovSetupMessage"');
    expect(html).toContain('id="ovSetupAction"');
    expect(html).toContain('<ul class="ov-setup-list" id="ovSetupList" aria-label="Setup steps"></ul>');
    expect(html).toContain('id="ovActiveGiveaway"');
    expect(html).toContain('id="ovCreditsUsed"');
    expect(html).not.toContain("Times shared");
    expect(html).toContain('id="ovActivityList"');
    expect(html).toContain('id="ovTopPlayers"');
    expect(html).not.toContain('class="ov-summary"');
    expect(html).toContain('id="ovPublishedStatus"');
    expect(html).toContain('id="ovPublicSiteAction"');
    expect(html).toContain("View public site ↗");
    expect(html).toContain('href="/dashboard/leaderboard/setup"');
    expect(html).toContain('class="ov-card-empty" id="ovActivityEmpty"');
    expect(html).toContain('id="ovCreditsCard" hidden');
    expect(html).toContain('id="ovPendingOrdersCard" hidden');
    expect(html).toContain('href="/dashboard/rewards/redemptions"');
    expect(html).toContain('id="ovKpiRow"');
  });

  it("models Home setup as an accessible four-step launch checklist", () => {
    const html = dashboardHtml();
    const setupDefinition = overviewJs.slice(overviewJs.indexOf("const SETUP_STEPS"), overviewJs.indexOf("function isBoardSetup"));
    const setupKeys = [...setupDefinition.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
    expect(setupKeys).toEqual(["brand", "players", "configure", "publish"]);
    expect(setupDefinition).not.toContain('key: "kick"');
    expect(html).toContain('id="ovLblGiveaway">Active giveaway</span>');
    expect(html).toContain('id="ovLblCredits">Credits used</span>');
    expect(html).toContain('id="ovCreditsCard" hidden');
    expect(overviewJs).toContain("state.CREDITS?.usage?.pendingRedemptions");
    expect(overviewJs).toContain('pendingOrders === 1 ? "Review order" : "Review orders"');
    expect(html).toContain('id="ovKpiRow"');
  });

  it("keeps the giveaway KPI action aligned with every active-count state", () => {
    expect(giveawayAction(0)).toEqual({ label: "Start a giveaway", href: "/dashboard/giveaways" });
    expect(giveawayAction(1)).toEqual({ label: "Active now", href: "/dashboard/giveaways" });
    expect(giveawayAction(12)).toEqual({ label: "Active now", href: "/dashboard/giveaways" });
  });

  it("matches the empty activity action to publication state", () => {
    expect(activityEmptyAction(false)).toEqual({ label: "Publish your site", href: "/dashboard/leaderboard/setup" });
    expect(activityEmptyAction(true)).toEqual({ label: "Share your site", href: "/dashboard/leaderboard/share" });
  });

  it("keeps Home orientation-only by removing score mutation controls", () => {
    const html = dashboardHtml();
    expect(html).not.toContain("ov-inc-btn");
    expect(html).not.toContain("+100");
    expect(html).not.toContain("+500");
    expect(html).not.toContain("+1k");
    expect(overviewJs).not.toContain("markDirty");
    expect(overviewJs).not.toContain("querySelectorAll(\".ov-inc-btn\")");
  });

  it("routes unverified users to email confirmation without a duplicate Overview banner", () => {
    expect(overviewJs).toContain("status.published && !status.emailVerified");
    expect(overviewJs).toContain("const needsVerification = !status.emailVerified");
    expect(overviewJs).toContain("const readyToPublish = steps.brand && steps.players && steps.configure");
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
    expect(boardShellJs).toContain('`/dashboard/leaderboards?board=${encodeURIComponent(siteId)}`');
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

  it("matches the server's effective-plan OBS overlay gate", () => {
    expect(dashboardHtml("/dashboard/leaderboard/share")).toContain('id="embedObsLock"');
    expect(siteJs).toContain('const overlayAccess = state.ME?.plan !== "free"');
    expect(siteJs).toContain('obsLink.textContent = overlayAccess ? obsUrl : ""');
    expect(siteJs).toContain("obsBox.hidden = !overlayAccess");
    expect(siteJs).toContain("obsLock.hidden = overlayAccess");
    expect(dashboardHtml("/dashboard/leaderboard/share")).toContain("Stream overlays are available on Starter and higher plans.");
    expect(dashboardHtml("/dashboard/leaderboard/share")).toContain('href="/dashboard/settings/billing?from=overlay"');
    expect(dashboardHtml("/dashboard/leaderboard/share")).toContain('>Upgrade your plan</a> to add this leaderboard to OBS, Streamlabs, or another streaming app.');
    expect(siteJs).toContain("if (overlayAccess && obsCopy && !obsCopy._wired)");
    expect(siteJs).not.toContain("obsLock.innerHTML");
    expect(workerIndex).toContain('const paid = r.plan !== "free"');
    const future = Date.now() + 86_400_000;
    for (const [plan, expected] of [["free", false], ["starter", true], ["pro", true], ["agency", true], ["lifetime", false]]) {
      expect(effectivePlan({ plan, status: "active", plan_expires_at: future }) !== "free").toBe(expected);
    }
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
      "Leaderboard", "Engage", "Games", "Credits", "Telegram", "Analytics", "Site settings", "Settings",
    ]) expect(html).toContain(`>${label}</a>`);
    for (const label of ["Giveaways", "Raffles", "Predictions", "Drops"]) {
      expect(html).not.toContain(`>${label}</a>`);
    }
    expect(html).toContain(">Audience</div>");
    expect(html).not.toContain(">Integrations</a>");
    expect(html).toContain(">Sites</a>");
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
    expect(games).not.toContain('aria-label="Leaderboard pages"');
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
