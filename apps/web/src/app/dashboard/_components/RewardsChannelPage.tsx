import { apiGet } from "@/lib/api";
import type { CreditsStatusResponse, SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { RewardsChannelForm } from "./RewardsChannelForm";

interface RewardsChannelPageProps {
  siteId?: string;
}

export async function RewardsChannelPage({ siteId }: RewardsChannelPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) return <ErrorState message={siteResult.error} />;

  const statusResult = await apiGet<CreditsStatusResponse>(`/api/credits/status?siteId=${encodeURIComponent(siteResult.data.siteId)}`);
  if (!statusResult.ok) return <ErrorState message={statusResult.error} />;

  const { channel, viewerAuth, usage, limits } = statusResult.data;

  return (
    <>
      <PageHeader title="Channel" description={`${siteResult.data.data.brand.name || siteResult.data.slug} · credits & redemptions`} />
      <Card>
        <RewardsChannelForm
          siteId={siteResult.data.siteId}
          channel={channel}
          viewerAuth={viewerAuth}
          usage={usage}
          limits={limits}
        />
      </Card>
    </>
  );
}
