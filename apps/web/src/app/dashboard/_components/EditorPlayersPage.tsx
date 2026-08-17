import { apiGet } from "@/lib/api";
import type { SiteResponse, Player } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Badge } from "./Badge";

interface EditorPlayersPageProps {
  siteId?: string;
}

export async function EditorPlayersPage({ siteId }: EditorPlayersPageProps) {
  const path = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const result = await apiGet<SiteResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const site = result.data;
  const players = site.data.players || [];

  const formatNumber = (n: number | null | undefined) =>
    n == null ? "—" : n.toLocaleString();

  return (
    <>
      <PageHeader
        title="Racers & scores"
        description={`${site.data.brand.name || site.slug} · ${players.length} racer${players.length === 1 ? "" : "s"}`}
      />

      <Card>
        <DataTable<Player>
          columns={[
            { key: "rank", header: "Rank", render: (_, i) => <span className="font-mono text-ink-soft">#{i + 1}</span> },
            { key: "name", header: "Name", accessor: "name" },
            { key: "wagered", header: "Wagered", accessor: "wagered", render: (p) => formatNumber(p.wagered) },
            { key: "prize", header: "Prize", accessor: "prize", render: (p) => formatNumber(p.prize) },
            { key: "score", header: "Score", accessor: "score", render: (p) => formatNumber(p.score) },
            { key: "hands", header: "Hands", accessor: "hands", render: (p) => formatNumber(p.hands) },
            { key: "netProfit", header: "Net", accessor: "net_profit", render: (p) => formatNumber(p.net_profit) },
            { key: "winRate", header: "Win %", accessor: "win_rate", render: (p) => formatNumber(p.win_rate) },
            {
              key: "change",
              header: "Change",
              render: (p) => {
                const change = p.change ?? 0;
                return change > 0 ? (
                  <Badge variant="success">+{change}</Badge>
                ) : change < 0 ? (
                  <Badge variant="danger">{change}</Badge>
                ) : (
                  <span className="text-ink-soft">—</span>
                );
              },
            },
          ]}
          rows={players}
          getRowKey={(p, i) => `${p.name}-${i}`}
          empty={
            <EmptyState
              title="No racers yet"
              description="Add racers to this board so viewers can follow the standings."
              action={
                <a
                  href={`/dashboard/editor/players?siteId=${site.siteId}`}
                  className="text-sm font-medium text-cobalt hover:underline"
                >
                  Refresh
                </a>
              }
            />
          }
        />
      </Card>
    </>
  );
}
