import { apiGet } from "@/lib/api";
import type { SiteResponse } from "@/lib/types";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { ErrorState } from "./ErrorState";
import { EditorSetupForm } from "./EditorSetupForm";

interface EditorSetupPageProps {
  siteId?: string;
}

export async function EditorSetupPage({ siteId }: EditorSetupPageProps) {
  const path = siteId ? `/api/site?siteId=${encodeURIComponent(siteId)}` : "/api/site";
  const result = await apiGet<SiteResponse>(path);

  if (!result.ok) {
    return <ErrorState message={result.error} />;
  }

  const site = result.data;

  return (
    <>
      <PageHeader title="Site details" description={`${site.data.brand.name || site.slug}`} />
      <Card>
        <EditorSetupForm siteId={site.siteId} site={site} />
      </Card>
    </>
  );
}
