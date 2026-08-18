/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { NAV_LINKS, activeKey, profileMenuHtml } from "@yourrank/shared/shell-nav";
import { raw } from "hono/html";
import { crumbsHtml, navListHtml } from "@yourrank/shared/dashboard-chrome";
import { brandMarkSvg } from "@yourrank/shared/brand-assets";

const CREDITS_NAV_KEYS = new Set(["credits", "channel", "redemptions", "shop", "rules", "viewers", "history", "rewards", "audience"]);

const DESIGN_CONTRACT = `<!--
THESIS: A creator run-sheet workspace turns dashboard state into the next clear action; it refuses the generic dark tile wall.
OWN-WORLD: Scoreboard Editorial — chalk-paper canvas, ink production rail, cobalt actions, amber rank cues, mint completed states, and precise hairline rules.
STORY: A non-technical streamer sees what is live, what needs attention, acts immediately, and can reach every feature from one rail.
FIRST VIEWPORT: Fixed branded rail at left; operational topbar above one launch run-sheet, a divided KPI band, and a compact 8/4 activity and players workspace.
FORM: Scoreboard Editorial identity layered onto the Creator Run-Sheet workspace, seed 562938e8.
BOUNDARY: Identity styling is scoped to data-auth-workspace and data-identity=scoreboard-editorial; public viewer and marketing surfaces remain unchanged.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

const NAV_ICONS = {
  details: '<path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/>',
  players: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  design: '<path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.5a2.5 2.5 0 0 1-2.5-2.5V6a3 3 0 0 0-3-3z"/><circle cx="7.5" cy="10.5" r=".5"/><circle cx="10.5" cy="7.5" r=".5"/><circle cx="7.5" cy="15.5" r=".5"/>',
  games: '<path d="M6 11h4M8 9v4"/><path d="M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7v4.6A4.7 4.7 0 0 0 6.7 19h10.6a4.7 4.7 0 0 0 4.7-4.7V9.7A4.7 4.7 0 0 0 17.3 5z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  boards: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  viewers: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  shop: '<path d="M3 9l2-5h14l2 5"/><path d="M5 13v7h14v-7M9 20v-5h6v5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  rules: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  channel: '<path d="M8 12a4 4 0 0 1 4-4h3a4 4 0 0 1 0 8h-3"/><path d="M16 12a4 4 0 0 1-4 4H9a4 4 0 0 1 0-8h3"/>',
  giveaways: '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01"/>'
};

const GEAR_ICON = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

// Streamlined, intent-focused navigation architecture (Linear / Stripe studio model)
const DASHBOARD_NAV = [
  ["home", "Overview", "/dashboard", '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'],
  { type: "group", label: "LEADERBOARD" },
  ["board", "Racers & scores", "/dashboard/editor/players", NAV_ICONS.players, "players"],
  ["board", "Theme & overlays", "/dashboard/editor/design", NAV_ICONS.design, "design"],
  ["games", "Mini-games & history", "/dashboard/games", NAV_ICONS.games],
  { type: "group", label: "COMMUNITY & REWARDS" },
  ["giveaways", "Live giveaways", "/dashboard/giveaways", NAV_ICONS.giveaways],
  ["redemptions", "Rewards & shop", "/dashboard/rewards/redemptions", NAV_ICONS.shop],
  ["viewers", "Viewer points & stats", "/dashboard/audience/viewers", NAV_ICONS.viewers],
  ["telegram", "Telegram bot", "/bot/dashboard", NAV_ICONS.share],
  { type: "group", label: "SETTINGS & SITES" },
  ["boards", "Sites & integrations", "/dashboard/boards", NAV_ICONS.boards],
  ["account", "Account & billing", "/dashboard/settings", GEAR_ICON],
  ["help", "Help & support", "/help", NAV_ICONS.help]
];

export function dashboardNavItems() {
  return DASHBOARD_NAV.map((item) => item.type === "group"
    ? { group: item.label }
    : (() => {
      const [key, label, href, path, hash] = item;
      return { key, label, href, icon: path, hash };
    })());
}

export function mapActiveNav(nav, hash) {
  if (nav === "board") return "board";
  if (nav === "games") return "games";
  if (nav === "giveaways") return "giveaways";
  if (nav === "redemptions" || nav === "shop" || nav === "rules" || nav === "channel" || nav === "rewards") return "redemptions";
  if (nav === "viewers" || nav === "activity" || nav === "performance" || nav === "audience" || nav === "history") return "viewers";
  if (nav === "boards" || nav === "settings") return "boards";
  if (nav === "account") return "account";
  if (nav === "help") return "help";
  return nav || "home";
}

export function mapActiveHash(nav, hash) {
  if (nav === "board") {
    if (hash === "setup" || hash === "players") return "players";
    if (hash === "design" || hash === "share") return "design";
    return hash;
  }
  return hash;
}

function SidebarBoard({ boardContext }) {
  if (boardContext === "none") {
    return <div class="lb-ws-switcher" id="wsSwitcher">
      <div class="lb-ws-card" id="wsCard">
        <div class="lb-ws-avatar" id="wsAvatar">A</div>
        <div class="lb-ws-meta">
          <span class="lb-ws-name" id="accUserName">Your Account</span>
          <span class="lb-ws-plan">Active</span>
        </div>
      </div>
    </div>;
  }
  return <div class="lb-ws-switcher" id="wsSwitcher">
    <div class="lb-ws-card" id="wsCard" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
      <div class="lb-ws-avatar" id="wsAvatar">Y</div>
      <div class="lb-ws-meta">
        <span class="lb-ws-name" id="activeBoardName">Loading site…</span>
        <span class="lb-ws-plan" id="wsPlanBadge">Active Site</span>
      </div>
      <svg class="lb-ws-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </div>
    <div class="lb-ws-menu" id="wsMenu" hidden>
      <a class="lb-ws-action" id="manageBoardsBtn" href="/dashboard/boards">Manage all sites →</a>
      <a class="lb-ws-action" href="/dashboard/settings/board">Site settings →</a>
    </div>
    {boardContext === "full" && <><div class="board-upsell" id="boardLimitUpsell" role="status" hidden><div><b id="boardLimitTitle">Need another site?</b><p class="hint" id="boardLimitText"></p></div><a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/settings">Upgrade plan</a></div>
      <div class="lb-board-form" id="newBoardForm" hidden><div class="field field-flex"><label for="nb_name">Site name</label><input id="nb_name" placeholder="Summer Race 2026" /></div><div class="field field-flex"><label for="nb_slug">Web address</label><input id="nb_slug" placeholder="summer-race-2026" /></div><div class="field field-flex"><label for="nb_casino">Partner or sponsor</label><input id="nb_casino" placeholder="Your brand or sponsor" /></div><div class="field field-flex"><label for="nb_code">Promo code</label><input id="nb_code" placeholder="Optional" /></div><div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create site</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div></div>
    </>}
  </div>;
}

// Cross-product switcher. All three peer products are always listed so the
// operator can move between Sites, Telegram, and Credits & Shop from anywhere.
const PRODUCT_NAV_KEYS = new Set(["sites", "telegram", "credits"]);
const PRODUCT_MARKS = { sites: "S", telegram: "T", credits: "C" };

function ProductNav({ boardContext, footer }) {
  const activePath = boardContext === "none" ? "/dashboard/settings" : footer === "rewards" ? "/dashboard/rewards/redemptions" : "/dashboard";
  const active = activeKey(activePath);
  return <nav class="lb-product-nav" aria-label="YourRank products">
    <span class="label">Products</span>
    {NAV_LINKS.filter(({ key }) => PRODUCT_NAV_KEYS.has(key)).map(({ key, label, href }) => <a class={"lb-product-link" + (key === active ? " is-on" : "")} href={href} data-product-link={key} aria-current={key === active ? "page" : undefined} title={label}><span class="lb-product-mark" aria-hidden="true">{PRODUCT_MARKS[key]}</span><span class="lb-product-label">{label}</span></a>)}
  </nav>;
}

function SidebarFooter({ boardContext, footer, profile }) {
  return <>
    <ProductNav boardContext={boardContext} footer={footer} />
    {footer !== "account" && <div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">Open public page ↗</a>
      {footer === "rewards" ? <div class="lb-usage" id="planUsage"><div class="lb-usage-head"><span class="lb-usage-lbl" id="planBadge">FREE PLAN</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">Redemptions <span id="usageAmount">0</span> / <span id="usageLimit">0</span></div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill"></i></div></div> : <><div class="lb-usage" id="planUsage" hidden><div class="lb-usage-head"><span class="lb-usage-lbl" id="planBadge">FREE PLAN</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">Usage <span id="usageAmount">0</span> / <span id="usageLimit">0</span></div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill"></i></div></div></>}
    </div>}
    <div class="lb-side-profile">{raw(profile)}</div>
  </>;
}

export function DashboardShell({ activeNav = "home", activeHash = "", boardContext = "full", footer = "dashboard", title = "", crumbs = null, rootId, initiallyHidden = false, user, children }) {
  const activePath = boardContext === "none" ? "/dashboard/settings" : CREDITS_NAV_KEYS.has(activeNav) ? "/dashboard/rewards/redemptions" : "/dashboard";
  const shellId = rootId || (boardContext === "none" ? "account-dash" : "dash");
  const profile = profileMenuHtml({ activePath, user, standalone: true, dynamicIdentity: true });

  return <div class="v3-dash" id={shellId} data-auth-workspace="true" data-identity="scoreboard-editorial" hidden={initiallyHidden}>
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
          mapActiveNav(activeNav, activeHash),
          mapActiveHash(activeNav, activeHash),
          "Dashboard"
        ))}
        <SidebarFooter boardContext={boardContext} footer={footer} profile={profile} />
      </aside>
      <div class="lb-main">
        <header class="lb-topbar" id="lbTopbar">
          <button class="lb-menu lb-topbar-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">{raw(brandMarkSvg())}</span><span class="lb-brand-txt">YourRank</span></a>
          {boardContext !== "none" ? (
            <div class="lb-topbar-hud">
              <div class="lb-site-command">
                <span class="lb-site-command-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
                </span>
                <div class="lb-board-select-wrap">
                  <span class="lb-board-select-lbl">Current site</span>
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
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  )}
                </span>
                <div class="lb-hud-details">
                  <span class="lb-board-select-lbl">{footer === "help" ? "Help & Support" : "Account Settings"}</span>
                  <span class="lb-account-title">{title || "Account settings"}</span>
                </div>
              </div>
            </div>
          )}
          <div class="lb-topbar-actions">
            <button class="lb-topbar-cmd" type="button" id="topbarCmdTrigger" aria-label="Search commands (⌘K or Ctrl+K)" title="Press ⌘K or Ctrl+K to search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>Search commands…</span>
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
