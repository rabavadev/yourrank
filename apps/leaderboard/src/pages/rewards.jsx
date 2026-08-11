/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
import {
  channelPage,
  rewardsPage,
  mapsPage,
  shopPage,
  viewersPage,
  redemptionsPage,
  historyPage,
} from "./credits-pages.js";

const PAGES = { channel: channelPage, rewards: rewardsPage, maps: mapsPage, shop: shopPage, viewers: viewersPage, redemptions: redemptionsPage, history: historyPage };
const navIcon = (path) => `<span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg></span>`;
const NAV = [
  ["Overview", "/dashboard", navIcon('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>')],
  ["Leaderboard", "/dashboard/editor", navIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>')],
  ["Page", "/dashboard/editor/design", navIcon('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>')],
  ["Rewards & Shop", "/dashboard/rewards/redemptions", navIcon('<circle cx="9" cy="9" r="6"/><path d="M8 21h12a2 2 0 0 0 2-2v-4"/><path d="m19 16 3-3-3-3"/>')],
  ["Games", "/dashboard/games", navIcon('<circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/>')],
  ["Analytics", "/dashboard/analytics/activity", navIcon('<path d="M3 3v18h18"/><path d="m7 12 4-4 4 4 5-5"/>')],
  ["History", "/dashboard/editor/history", navIcon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>')],
  ["Settings", "/dashboard/settings", navIcon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82"/>')],
];

function shell(activeTab, body) {
  const nav = NAV.map(([label, href, icon]) => `<a class="lb-nav${label === "Rewards & Shop" ? " is-on" : ""}" href="${href}"${label === "Rewards & Shop" ? ' aria-current="page"' : ""}>${icon}${label}</a>`).join("");
  return `<div id="cr-dash" class="v2-dash v3-dash"><div class="toast" id="status" role="status" aria-live="polite"></div><div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="Dashboard sections"><div class="lb-side-head"><div class="lb-side-board"><div class="lb-board-row-head"><div><span class="label">Active board</span><div class="lb-active-name" id="activeBoardName">…</div><div class="lb-active-meta" id="activeBoardMeta"></div></div></div><a class="btn btn--sm btn--ghost lb-board-add" href="/dashboard">+ New board</a></div></div><button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button><nav class="lb-side-group lb-side-nav" aria-label="Dashboard">${nav}</nav><div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live page ↗</a><div class="lb-usage" id="planUsage"><div class="lb-usage-head"><span class="lb-usage-lbl" id="planBadge">FREE PLAN</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">Redemptions <span id="usageAmount">0</span> / <span id="usageLimit">0</span></div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div></div></aside>
<div class="lb-main"><header class="lb-topbar" id="lbTopbar"><a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard"><span class="lb-brand-mark">Y</span><span class="lb-brand-txt">YourRank</span></a><div class="lb-topbar-hud"><div class="lb-board-select-wrap"><span class="lb-board-select-lbl">Board:</span><select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch board"></select></div></div><div class="lb-topbar-actions"><span class="lb-status" id="lbTopbarStatus">—</span><span class="lb-avatar" id="userAvatar" aria-label="Account">Y</span></div></header><div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button></div><main class="lb-bento" id="cr-main"><div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div><div id="cr-app" data-cr-tab="${activeTab}" hidden>${body}</div><div id="cr-empty" class="empty" hidden></div></main></div></div></div>`;
}

function RewardsPage({ tab }) { return <div dangerouslySetInnerHTML={{ __html: shell(tab, PAGES[tab] || channelPage) }} />; }
export function RewardsChannelPage() { return <RewardsPage tab="channel" />; }
export function RewardsRewardsPage() { return <RewardsPage tab="rewards" />; }
export function RewardsMapsPage() { return <RewardsPage tab="maps" />; }
export function RewardsShopPage() { return <RewardsPage tab="shop" />; }
export function RewardsViewersPage() { return <RewardsPage tab="viewers" />; }
export function RewardsRedemptionsPage() { return <RewardsPage tab="redemptions" />; }
export function RewardsHistoryPage() { return <RewardsPage tab="history" />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v2.css", "/assets/dashboard-v3.css", "/assets/ui.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>'], nav: false, footer: false, wide: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Channel · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRewardsConfig = { ...rewardsConfigBase, title: "Mappings · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rewards" };
export const rewardsMapsConfig = { ...rewardsConfigBase, title: "Mappings · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/maps" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop Items · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Redemptions · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Ledger · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/history" };
