import { apiGet } from "@/lib/api";
import type { StatsResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";

interface AnalyticsActivityPageProps {
  siteId?: string;
}

export async function AnalyticsActivityPage({ siteId }: AnalyticsActivityPageProps) {
  const path = siteId ? `/api/site/stats?siteId=${encodeURIComponent(siteId)}` : "/api/site/stats";
  const result = await apiGet<StatsResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { today, last7, last30, visitors, scrollDepth, days } = result.data.stats;

  return (
    <>
      <PageHeader title="Activity" description="Views, clicks, and conversions over the last 30 days" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today" {...today} />
        <StatCard label="Last 7 days" {...last7} />
        <StatCard label="Last 30 days" {...last30} />
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Visitors</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">New</span><span className="font-medium text-ink">{visitors.new}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Returning</span><span className="font-medium text-ink">{visitors.returning}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Sessions</span><span className="font-medium text-ink">{visitors.sessions}</span></div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Daily breakdown</h3>
          <a
            href={`/api/site/stats/export${siteId ? `?siteId=${encodeURIComponent(siteId)}` : ""}`}
            className="text-sm font-medium text-cobalt hover:underline"
          >
            Download CSV
          </a>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-soft text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-semibold">Day</th>
                <th className="px-3 py-2 font-semibold">Views</th>
                <th className="px-3 py-2 font-semibold">Copies</th>
                <th className="px-3 py-2 font-semibold">Clicks</th>
                <th className="px-3 py-2 font-semibold">Conversions</th>
                <th className="px-3 py-2 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {days.slice().reverse().map((d) => (
                <tr key={d.day} className="bg-surface hover:bg-canvas">
                  <td className="px-3 py-2 text-ink-soft">{d.day}</td>
                  <td className="px-3 py-2 text-ink">{d.views}</td>
                  <td className="px-3 py-2 text-ink">{d.copies}</td>
                  <td className="px-3 py-2 text-ink">{d.clicks}</td>
                  <td className="px-3 py-2 text-ink">{d.conversions}</td>
                  <td className="px-3 py-2 text-ink">{d.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {days.length === 0 && <p className="py-4 text-sm text-ink-soft">No activity yet.</p>}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Scroll depth</h3>
        <div className="mt-3 grid grid-cols-5 gap-2 text-sm">
          {[0, 25, 50, 75, 100].map((pct) => (
            <div key={pct} className="rounded-lg border border-line bg-surface-soft p-3 text-center">
              <div className="text-lg font-semibold text-ink">{scrollDepth[pct] ?? 0}</div>
              <div className="text-xs text-ink-soft">{pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function StatCard({ label, views, copies, clicks, conversions, revenue }: { label: string; views: number; copies: number; clicks: number; conversions: number; revenue: number }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">{label}</h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div><div className="text-lg font-semibold text-ink">{views}</div><div className="text-xs text-ink-soft">views</div></div>
        <div><div className="text-lg font-semibold text-ink">{copies}</div><div className="text-xs text-ink-soft">copies</div></div>
        <div><div className="text-lg font-semibold text-ink">{clicks}</div><div className="text-xs text-ink-soft">clicks</div></div>
      </div>
      <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm">
        <span className="text-ink-soft">Conversions: <span className="font-medium text-ink">{conversions}</span></span>
        <span className="text-ink-soft">Revenue: <span className="font-medium text-ink">{revenue}</span></span>
      </div>
    </Card>
  );
}
