/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { profileMenuHtml } from "@yourrank/shared/shell-nav";
import { dashboardNavItems as sharedDashboardNavItems } from "@yourrank/shared/dashboard-nav";
import { raw } from "hono/html";
import { crumbsHtml, navListHtml } from "@yourrank/shared/dashboard-chrome";
import { brandMarkSvg } from "@yourrank/shared/brand-assets";

const CREDITS_NAV_KEYS = new Set(["credits", "channel", "redemptions", "shop", "rules", "viewers", "history", "rewards", "audience"]);

const DESIGN_CONTRACT = `<!--
THESIS: A creator run-sheet workspace turns dashboard state into the next clear action; it refuses the generic dark tile wall.
OWN-WORLD: Devin-reference operating system — quiet near-white fields, an ink production rail, electric-violet actions, restrained geometry, and precise hairline rules.
STORY: A non-technical streamer sees what is live, what needs attention, acts immediately, and can reach every feature from one rail.
FIRST VIEWPORT: Fixed branded rail at left; operational topbar above one launch run-sheet, a divided KPI band, and a compact 8/4 activity and players workspace.
FORM: Devin-reference identity layered onto the Creator Run-Sheet workspace, seed 562938e8; the devin.ai reference governs material and hierarchy while YourRank content and branding remain original.
FINISH: Every shipped surface is reviewed at desktop and mobile, documented in DESIGN.md, and held to the shared accessibility and responsive floor.
-->`;

export function dashboardNavItems() {
  return sharedDashboardNavItems();
}

export function mapActiveNav(nav) {
  if (nav === "board" || nav === "games") return "board";
  if (nav === "giveaways") return "giveaways";
  if (nav === "redemptions" || nav === "shop" || nav === "rules" || nav === "channel" || nav === "rewards" || nav === "viewers" || nav === "activity" || nav === "performance" || nav === "audience" || nav === "history") return nav === "performance" ? "performance" : "redemptions";
  if (nav === "boards") return "boards";
  if (nav === "settings" || nav === "account") return "settings";
  if (nav === "help") return "help";
  return nav || "home";
}

function SidebarBoard({ boardContext }) {
  if (boardContext === "none") return null;

  return <div class="lb-ws-switcher" id="wsSwitcher">
    <div class="lb-ws-card" id="wsCard" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
      <div class="lb-ws-avatar" id="wsAvatar">Y</div>
      <div class="lb-ws-meta">
        <span class="lb-ws-name" id="activeBoardName">Loading site…</span>
        <span class="lb-ws-plan" id="wsPlanBadge">Current site</span>
      </div>
      <svg class="lb-ws-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </div>
    <div class="lb-ws-menu" id="wsMenu" hidden>
      <a class="lb-ws-action" id="manageBoardsBtn" href="/dashboard/leaderboards">Manage sites</a>
      <a class="lb-ws-action" href="/dashboard/settings/board">Site settings</a>
    </div>
    {boardContext === "full" && <><div class="board-upsell" id="boardLimitUpsell" role="status" hidden><div><b id="boardLimitTitle">Need another site?</b><p class="hint" id="boardLimitText"></p></div><a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/settings">Upgrade plan</a></div>
      <div class="lb-board-form" id="newBoardForm" hidden><div class="field field-flex"><label for="nb_name">Site name</label><input id="nb_name" placeholder="Summer Race 2026" /></div><div class="field field-flex"><label for="nb_slug">Web address</label><input id="nb_slug" placeholder="summer-race-2026" /></div><div class="field field-flex"><label for="nb_casino">Partner or sponsor</label><input id="nb_casino" placeholder="Your brand or sponsor" /></div><div class="field field-flex"><label for="nb_code">Promo code</label><input id="nb_code" placeholder="Optional" /></div><div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create site</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div></div>
    </>}
  </div>;
}

function SidebarFooter({ boardContext, profile }) {
  return <>
    {boardContext !== "none" && <div class="lb-side-foot">
      <a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View public page ↗</a>
    </div>}
    <div class="lb-side-profile">{raw(profile)}</div>
  </>;
}

export function DashboardShell({ activeNav = "home", boardContext = "full", footer = "dashboard", title = "", crumbs = null, rootId, initiallyHidden = false, user, children }) {
  const activePath = boardContext === "none" ? "/dashboard/settings" : CREDITS_NAV_KEYS.has(activeNav) ? "/dashboard/rewards/redemptions" : "/dashboard";
  const shellId = rootId || (boardContext === "none" ? "account-dash" : "dash");
  const profile = profileMenuHtml({ activePath, user, standalone: true, dynamicIdentity: true });

  return <div class="v3-dash" id={shellId} data-auth-workspace="true" data-identity="devin-reference" hidden={initiallyHidden}>
    {raw(DESIGN_CONTRACT)}
    <div class="toast" id="status" role="status" aria-live="polite"></div>
    <div class="lb-shell">
      <aside class="lb-side" id="lbSide" aria-label="Dashboard features">
        <div class="lb-side-brandrow">
          <a class="lb-side-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">{raw(brandMarkSvg())}</span><span class="lb-side-brandcopy"><b>YourRank</b><small>Creator workspace</small></span></a>
          <button class="lb-side-collapse" type="button" aria-label="Collapse navigation" aria-pressed="false" aria-controls="lbSide" data-collapse-side><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
          <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
        </div>
        <SidebarBoard boardContext={boardContext} />
        {raw(navListHtml(
          dashboardNavItems(),
          mapActiveNav(activeNav),
          "Dashboard"
        ))}
        <SidebarFooter boardContext={boardContext} profile={profile} />
      </aside>
      <div class="lb-main">
        <header class="lb-topbar" id="lbTopbar">
          <button class="lb-menu lb-topbar-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">{raw(brandMarkSvg())}</span><span class="lb-brand-txt">YourRank</span></a>
          {boardContext !== "none" ? (
            <div class="lb-topbar-hud">
              <div class="lb-site-command">
                <div class="lb-board-select-wrap">
                  <span class="lb-board-select-lbl">Site</span>
                  <div class="lb-board-select-row">
                    <select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch site"></select>
                    <span class="lb-site-path" id="lbTopbarSitePath">Loading address…</span>
                  </div>
                </div>
                {boardContext === "full" && (
                  <button class="lb-board-new" id="newBoard" type="button" title="Create another site" aria-label="Create another site">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div class="lb-topbar-hud">
              <div class="lb-account-hud">
                <span class="lb-hud-icon" aria-hidden="true">
                  {footer === "help" ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 0-2.83 0l-.06.06a1.65 1.65 0 0 1-1.82.33 1.65 1.65 0 0 1-1-1.51V21a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V9a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15z"/></svg>
                  )}
                </span>
                <div class="lb-hud-details">
                  <span class="lb-board-select-lbl">{footer === "help" ? "Help & support" : "Account settings"}</span>
                  <span class="lb-account-title">{title || "Settings"}</span>
                </div>
              </div>
            </div>
          )}
          <div class="lb-topbar-actions">
            <button class="lb-topbar-cmd" type="button" id="topbarCmdTrigger" aria-label="Search (⌘K or Ctrl+K)" title="Press ⌘K or Ctrl+K to search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>Search…</span>
              <kbd>⌘K</kbd>
            </button>
            {boardContext !== "none" && (
              <div class="lb-availability">
                <span class="lb-status" id="lbTopbarStatus">Checking</span>
                {boardContext === "full" && (
                  <>
                    <input type="checkbox" id="pubToggle" hidden tabindex="-1" aria-hidden="true" />
                    <button class="lb-publish-action" id="publishAction" type="button">
                      <span id="lbPublishLabel">Publish site</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>
        <div class="lb-bento" id={boardContext === "selector" ? "cr-main" : undefined}>{crumbs ? raw(crumbsHtml(crumbs)) : null}{children}</div>
      </div>
    </div>
  </div>;
}