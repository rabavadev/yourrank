import { apiGet } from "@/lib/api";
import type { SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { EditorHistoryForm } from "./EditorHistoryForm";

interface EditorHistoryPageProps {
  siteId?: string;
}

export async function EditorHistoryPage({ siteId }: EditorHistoryPageProps) {
  const path = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const result = await apiGet<SiteResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const site = result.data;

  return (
    <>
      <PageHeader title="Past winners" description={`${site.data.brand.name || site.slug}`} />
      <Card>
        <EditorHistoryForm site={site} />
      </Card>
    </>
  );
}
