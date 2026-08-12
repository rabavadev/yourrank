/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { NAV_LINKS, activeKey, profileMenuHtml } from "../../../../shared/shell-nav.js";
import { raw } from "hono/html";
import { crumbsHtml, navListHtml } from "../../../../shared/dashboard-chrome.js";

const CREDITS_NAV_KEYS = new Set(["credits", "channel", "redemptions", "shop", "rules", "viewers", "history"]);

// Lucide "settings" gear. The previous inline copy had malformed arc commands
// ("2 0 0 1-2 2" — a missing radius), which browsers reject with "<path>
// attribute d: Expected arc flag" and then drop the whole icon.
const GEAR_ICON = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

const DASHBOARD_NAV = [
  ["home", "Overview", "/dashboard", '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>'],
  { type: "group", label: "BOARD" },
  ["board", "Editor", "/dashboard/editor", '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'],
  ["games", "Public page", "/dashboard/games", '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="M3 10h18"/><path d="M9 10v9"/>'],
  ["settings", "Board settings", "/dashboard/settings/board", null],
  { type: "group", label: "CREDITS" },
  ["credits", "Credits", "/dashboard/rewards/redemptions", '<path d="M6 2v4"/><path d="M18 2v4"/><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M4 10h16"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>'],
  ["shop", "Shop", "/dashboard/rewards/shop", null],
  ["rules", "Credit rules", "/dashboard/rewards/rules", null],
  ["viewers", "Viewers", "/dashboard/audience/viewers", null],
  ["history", "Credit activity", "/dashboard/audience/activity", null],
  ["channel", "Kick channel", "/dashboard/rewards/channel", null],
  { type: "group", label: "GROW" },
  ["performance", "Analytics", "/dashboard/analytics/activity", '<path d="M3 3v18h18"/><path d="m7 12 4-4 4 4 5-5"/>', "activity"],
  ["account", "Account settings", "/dashboard/settings", GEAR_ICON]
];

const ACCOUNT_NAV = [
  ["account", "Account settings", "/dashboard/settings", GEAR_ICON],
  ["back", "Back to dashboard", "/dashboard", null],
];

function SidebarBoard({ boardContext }) {
  if (boardContext === "none") {
    return <div class="lb-side-head"><span class="label">Account</span><div class="lb-active-name" id="accUserName">…</div></div>;
  }
  return <div class="lb-side-head"><div class="lb-side-board">
    <div class="lb-board-row-head"><div><span class="label" id="activeBoardLabel">Active board</span><div class="lb-active-name" id="activeBoardName">…</div><div class="lb-active-meta" id="activeBoardMeta"></div></div>
    </div>
    {boardContext === "full" && <><button class="lb-linkbtn lb-board-manage" id="manageBoardsBtn" type="button">Manage boards</button>
      <div class="board-upsell" id="boardLimitUpsell" role="status" hidden><div><b id="boardLimitTitle">Need another leaderboard?</b><p class="hint" id="boardLimitText"></p></div><a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/settings">Upgrade plan</a></div>
      <div class="lb-board-form" id="newBoardForm" hidden><div class="field field-flex"><label for="nb_name">Board name</label><input id="nb_name" placeholder="Summer Race 2026" /></div><div class="field field-flex"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="summer-race-2026" /></div><div class="field field-flex"><label for="nb_casino">Sponsor / prize source</label><input id="nb_casino" placeholder="Your brand or sponsor" /></div><div class="field field-flex"><label for="nb_code">Referral or promo code</label><input id="nb_code" placeholder="OPTIONAL" /></div><div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div></div>
    </>}
  </div></div>;
}

// Cross-product switcher. The leaderboard sections above are this app; these
// links leave it (Telegram bots, help), so only the ones that aren't already a
// sidebar destination are listed.
const PRODUCT_NAV_KEYS = new Set(["bot", "help"]);

function ProductNav({ boardContext, footer }) {
  const activePath = boardContext === "none" ? "/dashboard/settings" : footer === "rewards" ? "/dashboard/rewards/redemptions" : "/dashboard";
  const active = activeKey(activePath);
  return <nav class="lb-product-nav" aria-label="Product">
    <span class="label">Product</span>
    {NAV_LINKS.filter(({ key }) => PRODUCT_NAV_KEYS.has(key)).map(({ key, label, href }) => <a class={"lb-product-link" + (key === active ? " is-on" : "")} href={href} aria-current={key === active ? "page" : undefined}>{label}</a>)}
  </nav>;
}

function SidebarFooter({ boardContext, footer }) {
  return <>
    <ProductNav boardContext={boardContext} footer={footer} />
    {footer !== "account" && <div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live page ↗</a>
      {footer === "rewards" ? <div class="lb-usage" id="planUsage"><div class="lb-usage-head"><span class="lb-usage-lbl" id="planBadge">FREE PLAN</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">Redemptions <span id="usageAmount">0</span> / <span id="usageLimit">0</span></div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div> : <><div class="lb-usage" id="planUsage" hidden><div class="lb-usage-head"><span class="lb-usage-lbl">VIP PRO</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">API Usage <span id="usageAmount">0</span> / <span id="usageLimit">0</span> req</div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div><span class="label" id="planBadge">FREE PLAN</span></>}
    </div>}
  </>;
}

export function DashboardShell({ activeNav = "home", activeHash = "", boardContext = "full", footer = "dashboard", title = "", crumbs = null, rootId, initiallyHidden = false, user, children }) {
  const navItems = boardContext === "none" ? ACCOUNT_NAV : DASHBOARD_NAV;
  const activePath = boardContext === "none" ? "/dashboard/settings" : CREDITS_NAV_KEYS.has(activeNav) ? "/dashboard/rewards/redemptions" : "/dashboard";
  const shellId = rootId || (boardContext === "none" ? "account-dash" : "dash");
  const profile = profileMenuHtml({ activePath, user, standalone: true, dynamicIdentity: true });
  return <div class="v3-dash" id={shellId} hidden={initiallyHidden}>
    <div class="toast" id="status" role="status" aria-live="polite"></div>
    <div class="lb-shell">
      <aside class="lb-side" id="lbSide" aria-label={boardContext === "none" ? "Account sections" : "Dashboard sections"}>
        <SidebarBoard boardContext={boardContext} />
        <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
        {raw(navListHtml(
          navItems.map((item) => item.type === "group"
            ? { group: item.label }
            : (() => {
              const [key, label, href, path, hash] = item;
              return { key, label, href, icon: path, hash, child: key !== "credits" && CREDITS_NAV_KEYS.has(key) };
            })()),
          activeNav === "redemptions" ? "credits" : activeNav,
          activeHash,
          boardContext === "none" ? "Account" : "Dashboard"
        ))}
        <SidebarFooter boardContext={boardContext} footer={footer} />
      </aside>
      <div class="lb-main">
        <header class="lb-topbar" id="lbTopbar">
          <button class="lb-menu lb-topbar-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button>
          <a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">Y</span><span class="lb-brand-txt">YourRank</span></a>
          {boardContext !== "none" && <div class="lb-topbar-hud"><div class="lb-board-select-wrap"><span class="lb-board-select-lbl" aria-hidden="true">Board:</span><select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch board"></select>{boardContext === "full" && <button class="btn btn--sm lb-board-new" id="newBoard" type="button" title="New board" aria-label="New board">+</button>}</div></div>}
          <div class="lb-topbar-actions">{title && <h1 class="lb-topbar-title" id="lbTopbarTitle" tabindex="-1">{title}</h1>}{boardContext !== "none" && <><span class="lb-status" id="lbTopbarStatus">—</span>{boardContext === "full" && <label class="lb-pub-toggle" title="When checked, saving makes the board public at /your-slug"><input type="checkbox" id="pubToggle" checked /> <span class="lb-pub-lbl">Publish board</span></label>}</>}<div class="gm-profile-host" dangerouslySetInnerHTML={{ __html: profile }}></div></div>
        </header>
        <div class="lb-bento" id={boardContext === "selector" ? "cr-main" : undefined}>{crumbs ? raw(crumbsHtml(crumbs)) : null}{children}</div>
      </div>
    </div>
  </div>;
}
