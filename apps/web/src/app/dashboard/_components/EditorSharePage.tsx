import { headers } from "next/headers";
import { apiGet } from "@/lib/api";
import type { SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { CopyButton } from "./CopyButton";

interface EditorSharePageProps {
  siteId?: string;
}

export async function EditorSharePage({ siteId }: EditorSharePageProps) {
  const path = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const result = await apiGet<SiteResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const site = result.data;
  const host = (await headers()).get("host") || "yourrank.site";
  const publicUrl = `https://${host}/${site.slug}`;
  const predictionUrl = `https://${host}/overlay/prediction?site=${encodeURIComponent(site.slug)}`;
  const alertsUrl = `https://${host}/overlay/alerts?site=${encodeURIComponent(site.slug)}`;

  return (
    <>
      <PageHeader title="Overlay & share" description={`${site.data.brand.name || site.slug}`} />
      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Public board</h3>
          <p className="mt-1 text-sm text-ink-soft">Share this link with viewers so they can visit your live board.</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              readOnly
              value={publicUrl}
              className="block flex-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none"
            />
            <CopyButton text={publicUrl} />
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
            >
              Open
            </a>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Stream overlays</h3>
          <p className="mt-1 text-sm text-ink-soft">Add these as Browser Sources in OBS to show on-stream widgets.</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-ink">Prediction</span>
              <input readOnly value={predictionUrl} className="block flex-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none" />
              <CopyButton text={predictionUrl} />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-ink">Alerts</span>
              <input readOnly value={alertsUrl} className="block flex-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none" />
              <CopyButton text={alertsUrl} />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
