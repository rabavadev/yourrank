import { BoardsPage } from "../_components/BoardsPage";
import { EditorPlayersPage } from "../_components/EditorPlayersPage";
import { EditorDesignPage } from "../_components/EditorDesignPage";
import { EditorSetupPage } from "../_components/EditorSetupPage";
import { EditorSharePage } from "../_components/EditorSharePage";
import { EditorHistoryPage } from "../_components/EditorHistoryPage";
import { GamesPage } from "../_components/GamesPage";
import { GiveawaysPage } from "../_components/GiveawaysPage";
import { RewardsPage } from "../_components/RewardsPage";
import { AudienceViewersPage } from "../_components/AudienceViewersPage";
import { TelegramPage } from "../_components/TelegramPage";

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
      return <RewardsPage siteId={siteId} />;
    case "audience/viewers":
      return <AudienceViewersPage siteId={siteId} />;
    case "telegram":
      return <TelegramPage />;
    default:
      return <div className="text-ink-soft">This dashboard section is not yet available in the new workspace.</div>;
  }
}
