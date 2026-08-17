import { apiGet } from "@/lib/api";
import type { ConversionsResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";

export async function AnalyticsEventsPage() {
  const result = await apiGet<ConversionsResponse>("/api/account/conversions");

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const conversions = result.data.conversions || [];

  return (
    <>
      <PageHeader title="Events" description="Recent postback and conversion events" />
      <Card>
        {conversions.length === 0 ? (
          <p className="text-sm text-ink-soft">No conversions recorded yet. Postbacks will appear here once your affiliate network sends them.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-soft text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Offer</th>
                  <th className="px-4 py-3 font-semibold">Click ref</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {conversions.map((c, i) => (
                  <tr key={`${c.at}-${i}`} className="bg-surface hover:bg-canvas">
                    <td className="px-4 py-3 text-ink-soft">{c.at}</td>
                    <td className="px-4 py-3 text-ink">{c.event}</td>
                    <td className="px-4 py-3 text-ink-soft">{c.offer || "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">{c.click_ref || "—"}</td>
                    <td className="px-4 py-3 text-ink">{c.amount != null ? `${c.amount} ${c.currency || ""}`.trim() : "—"}</td>
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
