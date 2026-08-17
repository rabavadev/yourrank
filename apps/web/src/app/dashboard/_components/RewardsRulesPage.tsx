import { apiGet } from "@/lib/api";
import type { CreditsStatusResponse, SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { RewardsRulesForm } from "./RewardsRulesForm";

interface RewardsRulesPageProps {
  siteId?: string;
}

export async function RewardsRulesPage({ siteId }: RewardsRulesPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) return <ErrorState message={siteResult.error} />;

  const statusResult = await apiGet<CreditsStatusResponse>(`/api/credits/status?siteId=${encodeURIComponent(siteResult.data.siteId)}`);
  if (!statusResult.ok) return <ErrorState message={statusResult.error} />;

  return (
    <>
      <PageHeader title="Reward rules" description={`${siteResult.data.data.brand.name || siteResult.data.slug}`} />
      <Card>
        <RewardsRulesForm siteId={siteResult.data.siteId} mappings={statusResult.data.mappings} />
      </Card>
    </>
  );
}
