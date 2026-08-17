import { apiGet } from "@/lib/api";
import type { CreditsStatusResponse, SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { RewardsRedemptionsForm } from "./RewardsRedemptionsForm";

interface RewardsRedemptionsPageProps {
  siteId?: string;
}

export async function RewardsRedemptionsPage({ siteId }: RewardsRedemptionsPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) return <ErrorState message={siteResult.error} />;

  const statusResult = await apiGet<CreditsStatusResponse>(`/api/credits/status?siteId=${encodeURIComponent(siteResult.data.siteId)}`);
  if (!statusResult.ok) return <ErrorState message={statusResult.error} />;

  return (
    <>
      <PageHeader title="Redemptions" description={`${siteResult.data.data.brand.name || siteResult.data.slug}`} />
      <Card>
        <RewardsRedemptionsForm siteId={siteResult.data.siteId} redemptions={statusResult.data.redemptions} />
      </Card>
    </>
  );
}
