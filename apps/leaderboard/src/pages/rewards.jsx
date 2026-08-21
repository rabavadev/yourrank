/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {
  channelPage,
  overviewPage,
  rulesPage,
  shopPage,
  redemptionsPage,
  historyPage,
} from "./credits-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const PAGES = { channel: channelPage, overview: overviewPage, rules: rulesPage, shop: shopPage, redemptions: redemptionsPage, history: historyPage };

const CRUMB_LABELS = { channel: "Kick connection", overview: "Overview", rules: "Ways to earn", shop: "Shop", redemptions: "Orders", history: "Activity" };

function crumbsFor(tab) {
  // The Kick connection is configuration, not a rewards page: its trail points
  // back to Account → Connections, where connection management lives.
  if (tab === "channel") {
    return [
      { label: "Account", href: "/dashboard/settings" },
      { label: "Connections", href: "/dashboard/settings/connections" },
      { label: "Kick connection" },
    ];
  }
  const trail = [{ label: "Rewards", href: "/dashboard/rewards" }];
  return tab === "overview" ? trail.map((c) => ({ label: c.label })) : [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

export const REWARDS_TABS = [
  { key: "overview", label: "Overview", href: "/dashboard/rewards" },
  { key: "shop", label: "Shop", href: "/dashboard/rewards/shop" },
  { key: "rules", label: "Ways to earn", href: "/dashboard/rewards/rules" },
  { key: "redemptions", label: "Orders", href: "/dashboard/rewards/redemptions" },
  { key: "history", label: "Activity", href: "/dashboard/rewards/activity" },
];

// Kick connection stays reachable (onboarding, Account → Connections, deep
// links) but is not a peer tab of Overview/Shop/Orders; it only appears in the
// tab bar while you are on it, so the page still shows where you are.
const CHANNEL_TAB = { key: "channel", label: "Kick connection", href: "/dashboard/rewards/channel" };

function SubTabs({ tab }) {
  const tabs = tab === "channel" ? [...REWARDS_TABS, CHANNEL_TAB] : REWARDS_TABS;
  return (
    <nav class="v3-tabs" aria-label="Rewards pages" style="margin-bottom: 20px;">
      {tabs.map((t) => (
        <a
          class={"v3-tab" + (t.key === tab ? " is-on" : "")}
          href={t.href}
          aria-current={t.key === tab ? "page" : undefined}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}

function RewardsPage({ tab, activeNav = tab, boardContext = "selector", footer = "rewards", user }) {
  const body = PAGES[tab] || overviewPage;
  const activePath = tab === "overview" ? "/dashboard/rewards" : `/dashboard/rewards/${tab === "history" ? "activity" : tab}`;
  return <DashboardShell activeNav={activeNav} activePath={activePath} boardContext={boardContext} crumbs={crumbsFor(tab)} footer={footer} rootId="cr-dash" user={user}>
    <div class="cr-workspace-content">
      <SubTabs tab={tab} />
      <div id="cr-loading" class="ui-loading" role="status" aria-live="polite" aria-busy="true" hidden><div class="ui-loading__spinner"></div><span class="sr-only">Loading rewards…</span></div>
      <div id="cr-app" data-cr-tab={tab} hidden dangerouslySetInnerHTML={{ __html: body }}></div>
      <div id="cr-empty" class="empty cr-loading-state" hidden><div class="ui-loading__spinner" aria-hidden="true"></div><p>Loading your rewards dashboard…</p></div>
    </div>
  </DashboardShell>;
}

export function RewardsChannelPage({ user } = {}) { return <RewardsPage tab="channel" activeNav="channel" boardContext="selector" footer="rewards" user={user} />; }
export function RewardsOverviewPage({ user } = {}) { return <RewardsPage tab="overview" activeNav="overview" user={user} />; }
export function RewardsRulesPage({ user } = {}) { return <RewardsPage tab="rules" activeNav="rules" user={user} />; }
export function RewardsShopPage({ user } = {}) { return <RewardsPage tab="shop" activeNav="shop" user={user} />; }
export function RewardsRedemptionsPage({ user } = {}) { return <RewardsPage tab="redemptions" activeNav="redemptions" user={user} />; }
export function RewardsActivityPage({ user } = {}) { return <RewardsPage tab="history" activeNav="history" user={user} />; }
export function RewardsHistoryPage({ user } = {}) { return <RewardsActivityPage user={user} />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css", "/assets/dashboard-v4.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>', '<script src="/assets/shell-nav.js?v=2" defer></script>'], nav: false, footer: false, wide: true, bootWatchdog: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Kick connection · Account · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsOverviewConfig = { ...rewardsConfigBase, title: "Overview · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards" };
export const rewardsRulesConfig = { ...rewardsConfigBase, title: "Ways to earn · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Orders · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Activity · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/activity" };

export const rewardsChannelPage = { config: rewardsChannelConfig, Component: RewardsChannelPage };
export const rewardsOverviewPage = { config: rewardsOverviewConfig, Component: RewardsOverviewPage };
export const rewardsRulesPage = { config: rewardsRulesConfig, Component: RewardsRulesPage };
export const rewardsShopPage = { config: rewardsShopConfig, Component: RewardsShopPage };
export const rewardsRedemptionsPage = { config: rewardsRedemptionsConfig, Component: RewardsRedemptionsPage };
export const rewardsHistoryPage = { config: rewardsHistoryConfig, Component: RewardsHistoryPage };
