import { apiGet } from "@/lib/api";
import type { CreditsStatusResponse, SiteViewer, SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { Badge } from "./Badge";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface AudienceViewersPageProps {
  siteId?: string;
}

export async function AudienceViewersPage({ siteId }: AudienceViewersPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) {
    return <ErrorState message={siteResult.error} />;
  }
  const site = siteResult.data;

  const result = await apiGet<CreditsStatusResponse>(`/api/credits/status?siteId=${encodeURIComponent(site.siteId)}`);
  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { viewers } = result.data;

  const columns = [
    { key: "username", header: "Viewer", render: (v: SiteViewer) => `${v.kick_username} (${v.kick_user_id})` },
    { key: "balance", header: "Balance", accessor: "balance" as keyof SiteViewer, render: (v: SiteViewer) => v.balance.toLocaleString() },
    { key: "earned", header: "Earned", accessor: "total_earned" as keyof SiteViewer, render: (v: SiteViewer) => v.total_earned.toLocaleString() },
    { key: "spent", header: "Spent", accessor: "total_spent" as keyof SiteViewer, render: (v: SiteViewer) => v.total_spent.toLocaleString() },
    { key: "fraud", header: "Fraud", accessor: "fraud_score" as keyof SiteViewer, render: (v: SiteViewer) => v.fraud_score },
    { key: "blocked", header: "Status", render: (v: SiteViewer) => v.blocked ? <Badge variant="danger">Blocked{v.block_reason ? `: ${v.block_reason}` : ""}</Badge> : <Badge variant="success">Active</Badge> },
  ];

  return (
    <>
      <PageHeader title="Viewer points" description={`${site.data.brand.name || site.slug} · ${viewers.length} viewer${viewers.length === 1 ? "" : "s"}`} />
      <Card>
        <DataTable<SiteViewer>
          columns={columns}
          rows={viewers}
          getRowKey={(v) => v.id}
          empty={<EmptyState title="No viewers" description="Viewer accounts and credit balances will appear once you have traffic." />}
        />
      </Card>
    </>
  );
}
