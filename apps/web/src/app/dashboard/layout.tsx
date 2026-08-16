import { getCurrentUser } from "@/lib/session";
import { DashboardNav } from "./DashboardNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-canvas">
      <DashboardNav user={user} />

      <div className="ml-[272px] flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-line bg-surface/90 px-8 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-ink">Creator workspace</h1>
          {user ? (
            <a
              href="/api/auth/logout"
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              Sign out
            </a>
          ) : (
            <a href="/login" className="text-sm font-medium text-cobalt hover:underline">
              Sign in
            </a>
          )}
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
