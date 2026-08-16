import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

interface PlaceholderPageProps {
  params: Promise<{ slug: string[] }>;
}

function titleFromSlug(slug: string[]): string {
  return slug
    .map((s) => s.replace(/-/g, " "))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" · ");
}

export default async function PlaceholderPage({ params }: PlaceholderPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const title = titleFromSlug(slug);

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-ink-soft">
        This dashboard section has not been migrated to the new workspace yet.
      </p>

      {!user && (
        <p className="mt-4 text-ink-soft">
          <a href="/login" className="font-medium text-cobalt hover:underline">
            Sign in
          </a>{" "}
          to continue.
        </p>
      )}

      <div className="mt-6">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90"
        >
          Back to Overview
        </a>
      </div>
    </section>
  );
}
