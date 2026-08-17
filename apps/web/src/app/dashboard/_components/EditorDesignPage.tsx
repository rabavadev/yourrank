import { apiGet } from "@/lib/api";
import type { SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { BrandForm } from "./BrandForm";

interface EditorDesignPageProps {
  siteId?: string;
}

export async function EditorDesignPage({ siteId }: EditorDesignPageProps) {
  const path = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const result = await apiGet<SiteResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const site = result.data;

  return (
    <>
      <PageHeader
        title="Theme & overlays"
        description={`${site.data.brand.name || site.slug}`}
      />
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Brand & copy</h3>
        <div className="mt-4">
          <BrandForm siteId={site.siteId} brand={site.data.brand} />
        </div>
      </Card>
    </>
  );
}
