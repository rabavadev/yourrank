import { getCurrentUser, type UserRecord } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user: UserRecord | null = null;
  let error: string | null = null;

  try {
    user = await getCurrentUser();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return (
      <section className="max-w-3xl">
        <h2 className="text-2xl font-bold text-ink">Overview</h2>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error loading user: {error}
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="max-w-3xl">
        <h2 className="text-2xl font-bold text-ink">Overview</h2>
        <p className="mt-4 text-ink-soft">
          Not signed in.{" "}
          <a href="/login?next=/dashboard" className="font-medium text-cobalt hover:underline">
            Sign in
          </a>
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">Launch your first site</h2>
              <p className="mt-1 text-sm text-ink-soft">
                A site is your public leaderboard, rewards shop, and community hub.
              </p>
            </div>
            <a
              href="/dashboard/boards"
              className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-2"
            >
              Create a site
            </a>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: "Create a site", desc: "Name it and pick a URL." },
              { label: "Add racers or rewards", desc: "Set up players, rules, or shop items." },
              { label: "Share it live", desc: "Open your public page during the stream." },
            ].map((step, i) => (
              <li key={step.label} className="rounded-lg border border-line bg-surface-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-cobalt">
                  Step {i + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">{step.label}</p>
                <p className="mt-1 text-xs text-ink-soft">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Account</h3>
          <p className="mt-4 text-lg font-semibold text-ink">{user.display_name ?? user.email}</p>
          <p className="text-sm text-ink-soft">{user.email}</p>
          <div className="mt-4 inline-flex rounded-full bg-cobalt/10 px-3 py-1 text-xs font-semibold text-cobalt">
            {user.plan.toUpperCase()}
          </div>
          <div className="mt-6 border-t border-line pt-4">
            <a
              href="/dashboard/settings"
              className="text-sm font-medium text-cobalt hover:underline"
            >
              Account settings →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
