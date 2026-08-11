/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { profileMenuHtml } from "../../../../shared/shell-nav.js";

const DASHBOARD_NAV = [
  ["home", "Overview", "/dashboard", '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'],
  ["board", "Leaderboard", "/dashboard/editor", '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', "players"],
  ["board", "Page", "/dashboard/editor/design", '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>', "design"],
  ["rewards", "Rewards & Shop", "/dashboard/rewards/channel", '<circle cx="9" cy="9" r="6"/><path d="M8 21h12a2 2 0 0 0 2-2v-4"/><path d="m19 16 3-3-3-3"/>'],
  ["games", "Games", "/dashboard/games", '<circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/><path d="m7.38 12 5.74-9.94"/><path d="M9.69 16 3.95 6.06"/><path d="M14.31 16H2.83"/><path d="m16.62 12-5.74 9.94"/>'],
  ["performance", "Analytics", "/dashboard/analytics/activity", '<path d="M3 3v18h18"/><path d="m7 12 4-4 4 4 5-5"/>', "activity"],
  ["board", "History", "/dashboard/editor/history", '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', "history"],
  ["settings", "Settings", "/dashboard/settings", '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83 2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 0 0 1 2 2v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'],
];

const ACCOUNT_NAV = [
  ["profile", "Profile", "/account/profile", '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
  ["plan", "Plan & billing", "/account/plan", '<rect width="20" height="14" x="2" y="5" rx="2" ry="2"/><line x1="2" x2="22" y1="10" y2="10"/>'],
  ["postbacks", "Postbacks", "/account/postbacks", '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'],
  ["connected", "Connected accounts", "/account/connected", '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'],
  ["data", "Danger zone", "/account/data", '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>'],
];

function Icon({ path }) {
  return <span class="lb-nav-ic" aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>` }} />;
}

function SidebarBoard({ boardContext }) {
  if (boardContext === "none") {
    return <div class="lb-side-head"><span class="label">Account</span><div class="lb-active-name" id="accUserName">…</div></div>;
  }
  return <div class="lb-side-head"><div class="lb-side-board">
    <div class="lb-board-row-head"><div><span class="label" id="activeBoardLabel">Active board</span><div class="lb-active-name" id="activeBoardName">…</div><div class="lb-active-meta" id="activeBoardMeta"></div></div>
      {boardContext === "full" && <button class="btn btn--sm lb-board-new-side" id="newBoardSide" type="button" title="New board" aria-label="New board">+</button>}
    </div>
    {boardContext === "full" && <><button class="btn btn--sm btn--ghost lb-board-add" id="addBoardBtn" type="button">+ New board</button><button class="lb-linkbtn lb-board-manage" id="manageBoardsBtn" type="button">Manage boards</button>
      <div class="board-upsell" id="boardLimitUpsell" role="status" hidden><div><b id="boardLimitTitle">Need another leaderboard?</b><p class="hint" id="boardLimitText"></p></div><a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/settings">Upgrade plan</a></div>
      <div class="lb-board-form" id="newBoardForm" hidden><div class="field field-flex"><label for="nb_name">Board name</label><input id="nb_name" placeholder="Summer Race 2026" /></div><div class="field field-flex"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="summer-race-2026" /></div><div class="field field-flex"><label for="nb_casino">Sponsor / prize source</label><input id="nb_casino" placeholder="Your brand or sponsor" /></div><div class="field field-flex"><label for="nb_code">Referral or promo code</label><input id="nb_code" placeholder="OPTIONAL" /></div><div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div></div>
    </>}
  </div></div>;
}

function SidebarFooter({ boardContext, footer }) {
  if (footer === "account") return null;
  return <div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live page ↗</a>
    {footer === "rewards" ? <div class="lb-usage" id="planUsage"><div class="lb-usage-head"><span class="lb-usage-lbl" id="planBadge">FREE PLAN</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">Redemptions <span id="usageAmount">0</span> / <span id="usageLimit">0</span></div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div> : <><div class="lb-usage" id="planUsage" hidden><div class="lb-usage-head"><span class="lb-usage-lbl">VIP PRO</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">API Usage <span id="usageAmount">0</span> / <span id="usageLimit">0</span> req</div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div><span class="label" id="planBadge">FREE PLAN</span></>}
  </div>;
}

export function DashboardShell({ activeNav = "home", activeHash = "", boardContext = "full", footer = "dashboard", title = "", rootId, initiallyHidden = false, children }) {
  const navItems = boardContext === "none" ? ACCOUNT_NAV : DASHBOARD_NAV;
  const activePath = boardContext === "none" ? `/account/${activeNav}` : activeNav === "rewards" ? "/dashboard/rewards/channel" : "/dashboard";
  const shellId = rootId || (boardContext === "none" ? "account-dash" : "dash");
  return <div class="v3-dash" id={shellId} hidden={initiallyHidden}>
    <div class="toast" id="status" role="status" aria-live="polite"></div>
    <div class="lb-shell">
      <aside class="lb-side" id="lbSide" aria-label={boardContext === "none" ? "Account sections" : "Dashboard sections"}>
        <SidebarBoard boardContext={boardContext} />
        <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
        <nav class="lb-side-group lb-side-nav" data-area="all" aria-label={boardContext === "none" ? "Account" : "Dashboard"}>
          {navItems.map(([key, label, href, path, hash]) => <a class={"lb-nav" + (activeNav === key && (!hash || activeHash === hash) ? " is-on" : "")} href={href} data-nav={key} data-hash={hash} aria-current={activeNav === key && (!hash || activeHash === hash) ? "page" : undefined}><Icon path={path} />{label}</a>)}
        </nav>
        <SidebarFooter boardContext={boardContext} footer={footer} />
      </aside>
      <div class="lb-main">
        <header class="lb-topbar" id="lbTopbar">
          <a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">Y</span><span class="lb-brand-txt">YourRank</span></a>
          {boardContext !== "none" && <div class="lb-topbar-hud"><div class="lb-board-select-wrap"><span class="lb-board-select-lbl" aria-hidden="true">Board:</span><select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch board"></select>{boardContext === "full" && <button class="btn btn--sm lb-board-new" id="newBoard" type="button" title="New board" aria-label="New board">+</button>}</div></div>}
          <div class="lb-topbar-actions">{title && <h1 class="lb-topbar-title" id="lbTopbarTitle" tabindex="-1">{title}</h1>}{boardContext !== "none" && <><span class="lb-status" id="lbTopbarStatus">—</span>{boardContext === "full" && <label class="lb-pub-toggle" title="When checked, saving makes the board public at /your-slug"><input type="checkbox" id="pubToggle" checked /> <span class="lb-pub-lbl">Publish site</span></label>}</>}<div class="gm-profile-host" dangerouslySetInnerHTML={{ __html: profileMenuHtml({ activePath, standalone: true, dynamicIdentity: true }) }}></div></div>
        </header>
        {boardContext !== "full" && <div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button></div>}
        <main class="lb-bento" id={boardContext === "selector" ? "cr-main" : undefined}>{children}</main>
      </div>
    </div>
  </div>;
}
