import { apiGet } from "@/lib/api";
import type { CreditsActivityResponse, SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";

interface RewardsHistoryPageProps {
  siteId?: string;
}

export async function RewardsHistoryPage({ siteId }: RewardsHistoryPageProps) {
  const sitePath = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const siteResult = await apiGet<SiteResponse>(sitePath);
  if (!siteResult.ok) return <ErrorState message={siteResult.error} />;

  const activityResult = await apiGet<CreditsActivityResponse>(`/api/credits/activity?siteId=${encodeURIComponent(siteResult.data.siteId)}`);
  if (!activityResult.ok) return <ErrorState message={activityResult.error} />;

  const events = activityResult.data.events || [];

  return (
    <>
      <PageHeader title="History" description={`${siteResult.data.data.brand.name || siteResult.data.slug}`} />
      <Card>
        {events.length === 0 ? (
          <p className="text-sm text-ink-soft">No credit activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-soft text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Viewer</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {events.map((e) => (
                  <tr key={e.id} className="bg-surface hover:bg-canvas">
                    <td className="px-4 py-3 text-ink-soft">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-soft">{e.kickUsername || "—"}</td>
                    <td className="px-4 py-3 text-ink">{e.type}</td>
                    <td className="px-4 py-3 text-ink">{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-soft">{e.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
