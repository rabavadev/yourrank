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

const CRUMB_LABELS = {
  channel: "Kick connection",
  rules: "Earning rules",
  shop: "Shop",
  viewers: "Viewer balances",
  redemptions: "Prize orders",
  history: "Activity",
};

const CREDIT_TABS = new Set(["rules", "channel", "viewers"]);

function crumbsFor(tab) {
  const trail = [{ label: "Rewards", href: "/dashboard/rewards/redemptions" }];
  if (tab === "redemptions") return trail.map((c) => ({ label: c.label }));
  if (CREDIT_TABS.has(tab)) {
    trail.push({ label: "Credits", href: "/dashboard/rewards/rules" });
    trail.push({ label: CRUMB_LABELS[tab] || tab });
    return trail;
  }
  return [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

const REWARDS_TABS = [
  { key: "redemptions", label: "Prize orders", href: "/dashboard/rewards/redemptions" },
  { key: "shop", label: "Shop", href: "/dashboard/rewards/shop" },
  { key: "credits", label: "Credits", href: "/dashboard/rewards/rules" },
  { key: "history", label: "Activity", href: "/dashboard/audience/activity" },
];

const CREDIT_SUBTABS = [
  { key: "rules", label: "Earning rules", href: "/dashboard/rewards/rules" },
  { key: "channel", label: "Kick connection", href: "/dashboard/rewards/channel" },
  { key: "viewers", label: "Viewer balances", href: "/dashboard/audience/viewers" },
];

function primaryKey(tab) {
  return CREDIT_TABS.has(tab) ? "credits" : tab;
}

function SubTabs({ tab }) {
  const primary = primaryKey(tab);
  return (
    <div class="cr-rewards-nav">
      <nav class="v3-tabs cr-rewards-primary-tabs" aria-label="Rewards pages">
        {REWARDS_TABS.map((t) => (
          <a
            class={"v3-tab" + (t.key === primary ? " is-on" : "")}
            href={t.href}
            aria-current={t.key === primary ? "page" : undefined}
          >
            {t.label}
          </a>
        ))}
      </nav>
      {CREDIT_TABS.has(tab) ? (
        <nav class="v3-tabs cr-rewards-secondary-tabs" aria-label="Credits pages">
          {CREDIT_SUBTABS.map((t) => (
            <a
              class={"v3-tab" + (t.key === tab ? " is-on" : "")}
              href={t.href}
              aria-current={t.key === tab ? "page" : undefined}
            >
              {t.label}
            </a>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function RewardsPage({ tab, activeNav = tab, boardContext = "selector", footer = "rewards", user }) {
  const body = PAGES[tab] || channelPage;
  return <DashboardShell activeNav={activeNav} boardContext={boardContext} crumbs={crumbsFor(tab)} footer={footer} rootId="cr-dash" user={user}>
    <div class="cr-workspace-content">
      <SubTabs tab={tab} />
      <div id="cr-loading" class="ui-loading" role="status" aria-live="polite" aria-busy="true" hidden><div class="ui-loading__spinner"></div><span class="sr-only">Loading rewards…</span></div>
      <div id="cr-app" data-cr-tab={tab} hidden dangerouslySetInnerHTML={{ __html: body }}></div>
      <div id="cr-empty" class="empty" hidden><p>Loading rewards…</p></div>
    </div>
  </DashboardShell>;
}

export function RewardsChannelPage({ user } = {}) { return <RewardsPage tab="channel" activeNav="channel" boardContext="selector" footer="rewards" user={user} />; }
export function RewardsRulesPage({ user } = {}) { return <RewardsPage tab="rules" activeNav="rules" user={user} />; }
export function RewardsShopPage({ user } = {}) { return <RewardsPage tab="shop" activeNav="shop" user={user} />; }
export function RewardsViewersPage({ user } = {}) { return <RewardsPage tab="viewers" activeNav="viewers" user={user} />; }
export function RewardsRedemptionsPage({ user } = {}) { return <RewardsPage tab="redemptions" activeNav="redemptions" user={user} />; }
export function RewardsHistoryPage({ user } = {}) { return <RewardsPage tab="history" activeNav="history" user={user} />; }

const rewardsConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css", "/assets/dashboard-v4.css"],
  scripts: [
    '<script src="/assets/credits.js?v=4" type="module"></script>',
    '<script src="/assets/rewards-ux.js?v=1" type="module"></script>',
    '<script src="/assets/shell-nav.js?v=2" defer></script>',
  ],
  nav: false,
  footer: false,
  wide: true,
};
export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Kick connection · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRulesConfig = { ...rewardsConfigBase, title: "Earning rules · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rules" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewer balances · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/audience/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Prize orders · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "Activity · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/audience/activity" };

export const rewardsChannelPage = { config: rewardsChannelConfig, Component: RewardsChannelPage };
export const rewardsRulesPage = { config: rewardsRulesConfig, Component: RewardsRulesPage };
export const rewardsShopPage = { config: rewardsShopConfig, Component: RewardsShopPage };
export const rewardsViewersPage = { config: rewardsViewersConfig, Component: RewardsViewersPage };
export const rewardsRedemptionsPage = { config: rewardsRedemptionsConfig, Component: RewardsRedemptionsPage };
export const rewardsHistoryPage = { config: rewardsHistoryConfig, Component: RewardsHistoryPage };
