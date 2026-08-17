import { apiGet } from "@/lib/api";
import type { GameSettingsResponse, GameSetting } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { GameSettingForm } from "./GameSettingForm";
import type { SiteResponse } from "@/lib/types";

interface GamesPageProps {
  siteId?: string;
}

export async function GamesPage({ siteId }: GamesPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) {
    return <ErrorState message={siteResult.error} />;
  }
  const site = siteResult.data;

  const result = await apiGet<GameSettingsResponse>(`/api/site/games/settings?siteId=${encodeURIComponent(site.siteId)}`);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { settings } = result.data;

  return (
    <>
      <PageHeader title="Mini-games" description={`${site.data.brand.name || site.slug} · configure odds and limits`} />
      {settings.length === 0 ? (
        <EmptyState title="No games" description="No mini-games are configured for this site yet." />
      ) : (
        <div className="grid gap-6">
          {settings.map((s: GameSetting) => (
            <Card key={s.game}>
              <GameSettingForm siteId={site.siteId} setting={s} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
