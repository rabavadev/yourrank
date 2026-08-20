/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {
  channelPage,
  rulesPage,
  shopPage,
  viewersPage,
  redemptionsPage,
  historyPage,
} from "./credits-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const PAGES = { channel: channelPage, rules: rulesPage, shop: shopPage, viewers: viewersPage, redemptions: redemptionsPage, history: historyPage };

const CRUMB_LABELS = { channel: "Kick connection", rules: "Credit rules", shop: "Shop", viewers: "Viewers", redemptions: "Orders", history: "Activity" };

function crumbsFor(tab) {
  const trail = [{ label: "Credits", href: "/dashboard/rewards" }];
  return tab === "redemptions" ? trail.map((c) => ({ label: c.label })) : [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

export const REWARDS_TABS = [
  { key: "channel", label: "Kick connection", href: "/dashboard/rewards/channel" },
  { key: "redemptions", label: "Orders", href: "/dashboard/rewards/redemptions" },
  { key: "shop", label: "Shop", href: "/dashboard/rewards/shop" },
  { key: "rules", label: "Credit rules", href: "/dashboard/rewards/rules" },
  { key: "viewers", label: "Viewers", href: "/dashboard/rewards/viewers" },
  { key: "history", label: "Activity", href: "/dashboard/rewards/activity" },
];

function SubTabs({ tab }) {
  return (
    <nav class="v3-tabs" aria-label="Credits pages" style="margin-bottom: 20px;">
      {REWARDS_TABS.map((t) => (
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
  const body = PAGES[tab] || channelPage;
  const activePath = `/dashboard/rewards/${tab === "history" ? "activity" : tab}`;
  return <DashboardShell activeNav={activeNav} activePath={activePath} boardContext={boardContext} crumbs={crumbsFor(tab)} footer={footer} rootId="cr-dash" user={user}>
    <div class="cr-workspace-content">
      <SubTabs tab={tab} />
      <div id="cr-loading" class="ui-loading" role="status" aria-live="polite" aria-busy="true" hidden><div class="ui-loading__spinner"></div><span class="sr-only">Loading credits and shop…</span></div>
      <div id="cr-app" data-cr-tab={tab} hidden dangerouslySetInnerHTML={{ __html: body }}></div>
      <div id="cr-empty" class="empty" hidden><p>Loading your credits dashboard…</p></div>
    </div>
  </DashboardShell>;
}

export function RewardsChannelPage({ user } = {}) { return <RewardsPage tab="channel" activeNav="channel" boardContext="selector" footer="rewards" user={user} />; }
export function RewardsRulesPage({ user } = {}) { return <RewardsPage tab="rules" activeNav="rules" user={user} />; }
export function RewardsShopPage({ user } = {}) { return <RewardsPage tab="shop" activeNav="shop" user={user} />; }
export function RewardsViewersPage({ user } = {}) { return <RewardsPage tab="viewers" activeNav="viewers" user={user} />; }
export function RewardsRedemptionsPage({ user } = {}) { return <RewardsPage tab="redemptions" activeNav="redemptions" user={user} />; }
export function RewardsActivityPage({ user } = {}) { return <RewardsPage tab="history" activeNav="history" user={user} />; }
export function RewardsHistoryPage({ user } = {}) { return <RewardsActivityPage user={user} />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css", "/assets/dashboard-v4.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>', '<script src="/assets/shell-nav.js?v=2" defer></script>'], nav: false, footer: false, wide: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Connect Kick · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRulesConfig = { ...rewardsConfigBase, title: "Credit rules · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Orders · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Credit activity · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/activity" };

export const rewardsChannelPage = { config: rewardsChannelConfig, Component: RewardsChannelPage };
export const rewardsRulesPage = { config: rewardsRulesConfig, Component: RewardsRulesPage };
export const rewardsShopPage = { config: rewardsShopConfig, Component: RewardsShopPage };
export const rewardsViewersPage = { config: rewardsViewersConfig, Component: RewardsViewersPage };
export const rewardsRedemptionsPage = { config: rewardsRedemptionsConfig, Component: RewardsRedemptionsPage };
export const rewardsHistoryPage = { config: rewardsHistoryConfig, Component: RewardsHistoryPage };
