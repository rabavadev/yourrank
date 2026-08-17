import { apiGet } from "@/lib/api";
import type { BoardsListResponse, Board } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { Badge } from "./Badge";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { CreateBoardForm } from "./CreateBoardForm";
import { SetActiveButton } from "./SetActiveButton";

export async function BoardsPage() {
  const result = await apiGet<BoardsListResponse>("/api/site/list");

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { boards, limits, plan } = result.data;
  const atLimit = boards.length >= limits.boards;

  return (
    <>
      <PageHeader
        title="Sites"
        description={`${boards.length} of ${limits.boards} sites on the ${plan.toUpperCase()} plan.`}
      />

      <Card className="mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Create a new site</h3>
        <div className="mt-4">
          <CreateBoardForm />
        </div>
        {atLimit && (
          <p className="mt-4 text-sm text-amber-700">
            You have reached your site limit. Upgrade your plan to create more.
          </p>
        )}
      </Card>

      {boards.length === 0 ? (
        <EmptyState
          title="No sites yet"
          description="Create your first site to start building a public leaderboard or rewards hub."
        />
      ) : (
        <Card>
          <DataTable<Board>
            columns={[
              { key: "name", header: "Name", accessor: "name" },
              { key: "slug", header: "URL", accessor: "slug" },
              { key: "players", header: "Racers", accessor: "players" },
              {
                key: "published",
                header: "Status",
                render: (b) =>
                  b.published ? (
                    <Badge variant="success">Published</Badge>
                  ) : (
                    <Badge variant="neutral">Draft</Badge>
                  ),
              },
              {
                key: "role",
                header: "Role",
                render: (b) => <span className="capitalize">{b.userRole}</span>,
              },
              {
                key: "actions",
                header: "",
                render: (b) => (
                  <div className="flex items-center gap-3">
                    <SetActiveButton siteId={b.id} />
                    <a href={`/dashboard/editor/players?siteId=${b.id}`} className="text-sm font-medium text-cobalt hover:underline">
                      Edit
                    </a>
                    <a href={`/${b.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-ink-soft hover:text-ink">
                      View
                    </a>
                  </div>
                ),
              },
            ]}
            rows={boards}
            getRowKey={(b) => b.id}
          />
        </Card>
      )}
    </>
  );
}
