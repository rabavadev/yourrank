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
import { DashboardShell } from "./dashboard-shell.jsx";

const PAGES = { channel: channelPage, rewards: rewardsPage, maps: mapsPage, shop: shopPage, viewers: viewersPage, redemptions: redemptionsPage, history: historyPage };

function RewardsPage({ tab, activeNav = tab, boardContext = "selector", footer = "rewards", user }) {
  const body = PAGES[tab] || channelPage;
  return <DashboardShell activeNav={activeNav} boardContext={boardContext} footer={footer} rootId="cr-dash" user={user}>
    <div>
      <div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>
      <div id="cr-app" data-cr-tab={tab} hidden dangerouslySetInnerHTML={{ __html: body }}></div>
      <div id="cr-empty" class="empty" hidden><p>Loading your credits dashboard…</p></div>
    </div>
  </DashboardShell>;
}

export function RewardsChannelPage({ user } = {}) { return <RewardsPage tab="channel" activeNav="settings" boardContext="selector" footer="rewards" user={user} />; }
export function RewardsRewardsPage({ user } = {}) { return <RewardsPage tab="rewards" activeNav="maps" user={user} />; }
export function RewardsMapsPage({ user } = {}) { return <RewardsPage tab="maps" activeNav="maps" user={user} />; }
export function RewardsShopPage({ user } = {}) { return <RewardsPage tab="shop" activeNav="shop" user={user} />; }
export function RewardsViewersPage({ user } = {}) { return <RewardsPage tab="viewers" activeNav="viewers" user={user} />; }
export function RewardsRedemptionsPage({ user } = {}) { return <RewardsPage tab="redemptions" activeNav="redemptions" user={user} />; }
export function RewardsHistoryPage({ user } = {}) { return <RewardsPage tab="history" activeNav="history" user={user} />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>', '<script src="/assets/shell-nav.js?v=1" defer></script>'], nav: false, footer: false, wide: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Integrations · Settings · YourRank", canonical: "https://yourrank.site/dashboard/settings/integrations" };
export const rewardsRewardsConfig = { ...rewardsConfigBase, title: "Credit rules · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsMapsConfig = { ...rewardsConfigBase, title: "Credit rules · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Audience · YourRank", canonical: "https://yourrank.site/dashboard/audience/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Redemptions · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Credit activity · Audience · YourRank", canonical: "https://yourrank.site/dashboard/audience/activity" };
