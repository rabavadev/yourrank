import { apiGet } from "@/lib/api";
import type { CreditsStatusResponse, CreditRewardMapping, ShopItem, Redemption, SiteViewer } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { Badge } from "./Badge";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import type { SiteResponse } from "@/lib/types";

interface RewardsPageProps {
  siteId?: string;
}

export async function RewardsPage({ siteId }: RewardsPageProps) {
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

  const { channel, mappings, shopItems, redemptions, viewerAuth } = result.data;

  const mappingColumns = [
    { key: "title", header: "Reward", accessor: "kick_reward_title" as keyof CreditRewardMapping },
    { key: "cost", header: "Cost", accessor: "kick_reward_cost" as keyof CreditRewardMapping, render: (m: CreditRewardMapping) => m.kick_reward_cost.toLocaleString() },
    { key: "credits", header: "Credits", accessor: "credits" as keyof CreditRewardMapping, render: (m: CreditRewardMapping) => m.credits.toLocaleString() },
    { key: "active", header: "Status", render: (m: CreditRewardMapping) => m.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Paused</Badge> },
  ];

  const shopColumns = [
    { key: "name", header: "Item", accessor: "name" as keyof ShopItem },
    { key: "cost", header: "Cost", accessor: "cost" as keyof ShopItem, render: (s: ShopItem) => s.cost.toLocaleString() },
    { key: "stock", header: "Stock", accessor: "stock" as keyof ShopItem },
    { key: "active", header: "Status", render: (s: ShopItem) => s.active ? <Badge variant="success">Active</Badge> : <Badge variant="neutral">Paused</Badge> },
  ];

  const statusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s === "fulfilled" || s === "approved") return "success" as const;
    if (s === "pending") return "warning" as const;
    if (s === "cancelled" || s === "rejected") return "danger" as const;
    return "neutral" as const;
  };

  const redemptionColumns = [
    { key: "item", header: "Item", accessor: "item_name" as keyof Redemption },
    { key: "viewer", header: "Viewer", render: (r: Redemption) => `${r.kick_username} (${r.kick_user_id})` },
    { key: "cost", header: "Cost", accessor: "cost" as keyof Redemption, render: (r: Redemption) => r.cost.toLocaleString() },
    { key: "status", header: "Status", render: (r: Redemption) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
    { key: "created", header: "Created", render: (r: Redemption) => new Date(r.created_at).toLocaleString() },
  ];

  return (
    <>
      <PageHeader title="Rewards & shop" description={`${site.data.brand.name || site.slug} · channel: ${channel.name || "Not linked"}`} />

      <div className="mb-6 flex flex-wrap gap-2">
        {viewerAuth.kick && <Badge variant="info">Kick auth</Badge>}
        {viewerAuth.discord && <Badge variant="info">Discord auth</Badge>}
        {viewerAuth.public && <Badge variant="info">Public viewer accounts</Badge>}
      </div>

      <div className="grid gap-6">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Kick reward mappings</h3>
          <div className="mt-4">
            <DataTable<CreditRewardMapping>
              columns={mappingColumns}
              rows={mappings}
              getRowKey={(m) => m.id}
              empty={<EmptyState title="No reward mappings" description="Connect your Kick channel and define reward-to-credit rules." />}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Shop items</h3>
          <div className="mt-4">
            <DataTable<ShopItem>
              columns={shopColumns}
              rows={shopItems}
              getRowKey={(s) => s.id}
              empty={<EmptyState title="No shop items" description="Add items viewers can redeem with credits." />}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Redemptions</h3>
          <div className="mt-4">
            <DataTable<Redemption>
              columns={redemptionColumns}
              rows={redemptions.slice(0, 50)}
              getRowKey={(r) => r.id}
              empty={<EmptyState title="No redemptions yet" description="Redemptions appear when viewers spend credits in the shop." />}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
