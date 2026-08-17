import { BoardsPage } from "../_components/BoardsPage";
import { EditorPlayersPage } from "../_components/EditorPlayersPage";
import { EditorDesignPage } from "../_components/EditorDesignPage";
import { EditorSetupPage } from "../_components/EditorSetupPage";
import { EditorSharePage } from "../_components/EditorSharePage";
import { EditorHistoryPage } from "../_components/EditorHistoryPage";
import { GamesPage } from "../_components/GamesPage";
import { GiveawaysPage } from "../_components/GiveawaysPage";
import { RewardsChannelPage } from "../_components/RewardsChannelPage";
import { RewardsRulesPage } from "../_components/RewardsRulesPage";
import { RewardsShopPage } from "../_components/RewardsShopPage";
import { RewardsRedemptionsPage } from "../_components/RewardsRedemptionsPage";
import { RewardsHistoryPage } from "../_components/RewardsHistoryPage";
import { AudienceViewersPage } from "../_components/AudienceViewersPage";
import { TelegramPage } from "../_components/TelegramPage";
import { TelegramBotsPage } from "../_components/TelegramBotsPage";
import { TelegramCommandsPage } from "../_components/TelegramCommandsPage";
import { TelegramOffersPage } from "../_components/TelegramOffersPage";
import { TelegramBroadcastsPage } from "../_components/TelegramBroadcastsPage";
import { AnalyticsActivityPage } from "../_components/AnalyticsActivityPage";
import { AnalyticsReferralsPage } from "../_components/AnalyticsReferralsPage";
import { AnalyticsEventsPage } from "../_components/AnalyticsEventsPage";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ siteId?: string }>;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { slug } = await params;
  const { siteId } = await searchParams;

  const key = slug.join("/");

  switch (key) {
    case "boards":
      return <BoardsPage />;
    case "editor/setup":
      return <EditorSetupPage siteId={siteId} />;
    case "editor/players":
      return <EditorPlayersPage siteId={siteId} />;
    case "editor/design":
      return <EditorDesignPage siteId={siteId} />;
    case "editor/share":
      return <EditorSharePage siteId={siteId} />;
    case "editor/history":
      return <EditorHistoryPage siteId={siteId} />;
    case "games":
      return <GamesPage siteId={siteId} />;
    case "giveaways":
      return <GiveawaysPage />;
    case "rewards":
    case "rewards/channel":
      return <RewardsChannelPage siteId={siteId} />;
    case "rewards/rules":
      return <RewardsRulesPage siteId={siteId} />;
    case "rewards/shop":
      return <RewardsShopPage siteId={siteId} />;
    case "rewards/redemptions":
      return <RewardsRedemptionsPage siteId={siteId} />;
    case "rewards/history":
      return <RewardsHistoryPage siteId={siteId} />;
    case "audience/viewers":
      return <AudienceViewersPage siteId={siteId} />;
    case "telegram":
      return <TelegramPage />;
    case "telegram/bots":
      return <TelegramBotsPage />;
    case "telegram/commands":
      return <TelegramCommandsPage />;
    case "telegram/offers":
      return <TelegramOffersPage />;
    case "telegram/broadcasts":
      return <TelegramBroadcastsPage />;
    case "analytics/activity":
      return <AnalyticsActivityPage siteId={siteId} />;
    case "analytics/referrals":
      return <AnalyticsReferralsPage />;
    case "analytics/events":
      return <AnalyticsEventsPage />;
    default:
      return <div className="text-ink-soft">This dashboard section is not yet available in the new workspace.</div>;
  }
}
