import { getCurrentUser, type UserRecord } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let user: UserRecord | null = null;
  let error: string | null = null;

  try {
    user = await getCurrentUser();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen bg-canvas p-8">
      <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
      {error && (
        <p className="mt-4 rounded-lg bg-surface p-4 text-red-600 shadow">
          Error loading user: {error}
        </p>
      )}
      {user ? (
        <div className="mt-6 rounded-lg bg-surface p-6 shadow">
          <p className="text-ink">
            <span className="font-semibold">User:</span> {user.display_name ?? user.email}
          </p>
          <p className="text-ink-soft">{user.email}</p>
          <p className="mt-2 text-sm text-ink-soft">Plan: {user.plan}</p>
        </div>
      ) : (
        <p className="mt-4 text-ink-soft">
          {error ? "Could not load session." : "Not signed in."}
        </p>
      )}
    </main>
  );
}
