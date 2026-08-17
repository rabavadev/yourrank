import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { apiGet } from "@/lib/api";
import type { Admin2FAStatus } from "@/lib/types";
import { Admin2FAGate } from "./Admin2FAGate";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user?.is_admin) {
    redirect("/dashboard");
  }

  const status = await apiGet<Admin2FAStatus>("/api/admin/2fa/status");
  const twoFa = status.ok ? status.data : null;

  if (!twoFa?.verified) {
    return (
      <main className="min-h-screen bg-canvas p-6 md:p-12">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-ink">Admin access</h1>
          <p className="mt-1 text-sm text-ink-soft">Two-factor authentication is required.</p>
          <Admin2FAGate enabled={twoFa?.enabled ?? false} locked={twoFa?.locked ?? false} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        {children}
      </div>
    </main>
  );
}
