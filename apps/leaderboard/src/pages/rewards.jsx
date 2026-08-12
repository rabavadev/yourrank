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

// Every credits screen is two levels deep, so each one says where it sits and
// how to get back up rather than relying on the rail alone.
const CRUMB_LABELS = { channel: "Kick channel", rules: "Credit rules", shop: "Shop", viewers: "Viewers", redemptions: "Redemptions", history: "Credit activity" };

function crumbsFor(tab) {
  const trail = [{ label: "Dashboard", href: "/dashboard" }, { label: "Credits", href: "/dashboard/rewards/redemptions" }];
  return tab === "redemptions" ? trail.map((c, i) => (i ? { label: c.label } : c)) : [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

function RewardsPage({ tab, activeNav = tab, boardContext = "selector", footer = "rewards", user }) {
  const body = PAGES[tab] || channelPage;
  return <DashboardShell activeNav={activeNav} boardContext={boardContext} crumbs={crumbsFor(tab)} footer={footer} rootId="cr-dash" user={user}>
    <div>
      <div id="cr-loading" class="ui-loading" hidden><div class="ui-loading__spinner"></div></div>
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
export function RewardsHistoryPage({ user } = {}) { return <RewardsPage tab="history" activeNav="history" user={user} />; }

const rewardsConfigBase = { styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css"], scripts: ['<script src="/assets/credits.js?v=4" type="module"></script>', '<script src="/assets/shell-nav.js?v=1" defer></script>'], nav: false, footer: false, wide: true };
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Connect Kick · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRulesConfig = { ...rewardsConfigBase, title: "Credit rules · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Credits · YourRank", canonical: "https://yourrank.site/dashboard/audience/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Shop redemptions · Credits · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Credit activity · Credits · YourRank", canonical: "https://yourrank.site/dashboard/audience/activity" };
