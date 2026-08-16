import { getCurrentUser, type UserRecord } from "@/lib/session";
import { LogoutButton } from "../LogoutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let user: UserRecord | null = null;
  let error: string | null = null;

  try {
    user = await getCurrentUser();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return (
      <section className="max-w-2xl">
        <h2 className="text-2xl font-bold text-ink">Account & billing</h2>
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error loading account: {error}
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="max-w-2xl">
        <h2 className="text-2xl font-bold text-ink">Account & billing</h2>
        <p className="mt-4 text-ink-soft">
          Not signed in.{" "}
          <a href="/login?next=/dashboard/settings" className="font-medium text-cobalt hover:underline">
            Sign in
          </a>
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-bold text-ink">Account & billing</h2>

      <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Profile</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
          <dt className="text-sm font-medium text-ink-soft">Email</dt>
          <dd className="text-sm text-ink">{user.email}</dd>

          <dt className="text-sm font-medium text-ink-soft">Display name</dt>
          <dd className="text-sm text-ink">{user.display_name ?? "—"}</dd>

          <dt className="text-sm font-medium text-ink-soft">Plan</dt>
          <dd className="text-sm text-ink">{user.plan}</dd>

          {user.plan_expires_at && (
            <>
              <dt className="text-sm font-medium text-ink-soft">Plan expires</dt>
              <dd className="text-sm text-ink">
                {new Date(user.plan_expires_at).toLocaleDateString()}
              </dd>
            </>
          )}
        </dl>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Session</h3>
        <p className="mt-2 text-sm text-ink-soft">
          You are signed in as <span className="text-ink">{user.email}</span>.
        </p>
        <div className="mt-4">
          <LogoutButton className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-soft">
            Sign out
          </LogoutButton>
        </div>
      </div>
    </section>
  );
}
