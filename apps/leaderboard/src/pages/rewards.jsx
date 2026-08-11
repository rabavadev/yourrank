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

function RewardsPage({ tab }) {
  const body = PAGES[tab] || channelPage;
  return <DashboardShell activeNav="rewards" boardContext="selector" footer="rewards" rootId="cr-dash">
    <div data-cr-tab={tab}>
      <div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>
      <div id="cr-app" hidden dangerouslySetInnerHTML={{ __html: body }}></div>
      <div id="cr-empty" class="empty" hidden><p>Loading your credits dashboard…</p></div>
    </div>
  </DashboardShell>;
}

export function RewardsChannelPage() { return <RewardsPage tab="channel" />; }
export function RewardsRewardsPage() { return <RewardsPage tab="rewards" />; }
export function RewardsMapsPage() { return <RewardsPage tab="maps" />; }
export function RewardsShopPage() { return <RewardsPage tab="shop" />; }
export function RewardsViewersPage() { return <RewardsPage tab="viewers" />; }
export function RewardsRedemptionsPage() { return <RewardsPage tab="redemptions" />; }
export function RewardsHistoryPage() { return <RewardsPage tab="history" />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>', '<script src="/assets/shell-nav.js?v=1" defer></script>'], nav: false, footer: false, wide: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Channel · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRewardsConfig = { ...rewardsConfigBase, title: "Credit rules · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rewards" };
export const rewardsMapsConfig = { ...rewardsConfigBase, title: "Credit rules · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/maps" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Redemptions · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Credit activity · Rewards & Shop · YourRank", canonical: "https://yourrank.site/dashboard/rewards/history" };
