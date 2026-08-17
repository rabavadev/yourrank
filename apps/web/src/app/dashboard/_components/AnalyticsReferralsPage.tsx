import { apiGet } from "@/lib/api";
import type { ReferralsResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { CopyButton } from "./CopyButton";

export async function AnalyticsReferralsPage() {
  const result = await apiGet<ReferralsResponse>("/api/referrals");

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const { code, link, count, totalDays, savedUsd } = result.data;

  return (
    <>
      <PageHeader title="Referrals" description="Invite other creators and earn free days" />
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Your referral link</h3>
        <p className="mt-1 text-sm text-ink-soft">When someone signs up via this link, both of you get bonus days.</p>
        <div className="mt-4 flex items-center gap-3">
          <input
            readOnly
            value={link}
            className="block flex-1 rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink focus:outline-none"
          />
          <CopyButton text={link} />
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
          >
            Open
          </a>
        </div>
        <p className="mt-2 text-xs text-ink-soft">Code: <code className="rounded bg-surface-soft px-1 py-0.5 font-mono">{code}</code></p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Signups</h3>
          <p className="mt-2 text-3xl font-semibold text-ink">{count}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Days earned</h3>
          <p className="mt-2 text-3xl font-semibold text-ink">{totalDays}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Approx. saved</h3>
          <p className="mt-2 text-3xl font-semibold text-ink">${savedUsd}</p>
        </Card>
      </div>
    </>
  );
}
