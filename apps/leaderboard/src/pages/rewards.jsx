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

const TITLES = {
  channel: "Channel",
  rewards: "Rewards",
  maps: "Reward maps",
  shop: "Shop",
  viewers: "Viewers",
  redemptions: "Redemptions",
  history: "History",
};

const PAGES_BY_TAB = {
  channel: channelPage,
  rewards: rewardsPage,
  maps: mapsPage,
  shop: shopPage,
  viewers: viewersPage,
  redemptions: redemptionsPage,
  history: historyPage,
};

const TABS = [
  { key: "channel", label: "Channel" },
  { key: "rewards", label: "Rewards" },
  { key: "maps", label: "Reward maps" },
  { key: "shop", label: "Shop" },
  { key: "viewers", label: "Viewers" },
  { key: "redemptions", label: "Redemptions" },
  { key: "history", label: "History" },
];

function RewardsShell({ activeTab, title, children }) {
  return (
    <div class="v2-dash">
      <div class="lb-shell">
        <aside class="lb-side" id="lbSide" aria-label="Rewards sections" role="dialog" aria-modal="false">
          <div class="lb-side-head">
            <a class="gm-brand" href="/dashboard">
              <span class="gm-brand-mark">YR</span>
              <span class="gm-brand-word">YourRank</span>
            </a>
          </div>
          <nav class="lb-side-group" aria-label="Rewards">
            {TABS.map((t) => (
              <a
                class={`lb-nav${activeTab === t.key ? " is-on" : ""}`}
                href={`/dashboard/rewards/${t.key}`}
                aria-current={activeTab === t.key ? "page" : undefined}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
          <div class="lb-side-foot">
            <a class="btn btn--sm" href="/dashboard">Back to dashboard</a>
          </div>
        </aside>
        <div class="lb-main">
          <div class="lb-phead">
            <button class="lb-menu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button>
          </div>
          <header class="lb-topbar">
            <h1 class="lb-topbar-title" id="lbTopbarTitle" tabindex="-1">{title}</h1>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}

function RewardsContent({ tab }) {
  const html = PAGES_BY_TAB[tab] || channelPage;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function RewardsPage({ tab }) {
  const title = `${TITLES[tab] || "Rewards"} · Rewards`;
  return (
    <RewardsShell activeTab={tab} title={title}>
      <RewardsContent tab={tab} />
    </RewardsShell>
  );
}

export function RewardsChannelPage() { return <RewardsPage tab="channel" />; }
export function RewardsRewardsPage() { return <RewardsPage tab="rewards" />; }
export function RewardsMapsPage() { return <RewardsPage tab="maps" />; }
export function RewardsShopPage() { return <RewardsPage tab="shop" />; }
export function RewardsViewersPage() { return <RewardsPage tab="viewers" />; }
export function RewardsRedemptionsPage() { return <RewardsPage tab="redemptions" />; }
export function RewardsHistoryPage() { return <RewardsPage tab="history" />; }

const rewardsConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v2.css", "/assets/ui.css"],
  scripts: ['<script src="/assets/credits.js?v=3" type="module"></script>'],
  nav: true,
  footer: false,
  wide: true,
};

export const rewardsChannelConfig = { ...rewardsConfigBase, title: "Channel · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/channel" };
export const rewardsRewardsConfig = { ...rewardsConfigBase, title: "Rewards · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/rewards" };
export const rewardsMapsConfig = { ...rewardsConfigBase, title: "Reward maps · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/maps" };
export const rewardsShopConfig = { ...rewardsConfigBase, title: "Shop · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/shop" };
export const rewardsViewersConfig = { ...rewardsConfigBase, title: "Viewers · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/viewers" };
export const rewardsRedemptionsConfig = { ...rewardsConfigBase, title: "Redemptions · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/redemptions" };
export const rewardsHistoryConfig = { ...rewardsConfigBase, title: "History · Rewards · YourRank", canonical: "https://yourrank.site/dashboard/rewards/history" };
