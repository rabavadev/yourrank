import { apiGet } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";
import { Card } from "../dashboard/_components/Card";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireCurrentUser("/admin");
  const result = await apiGet<AdminOverview>("/api/admin/overview");

  if (!result.ok) {
    return <p className="text-sm text-red-600">{result.error}</p>;
  }

  const { users, pro, leads, revenue } = result.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Admin</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Users", value: users },
          { label: "Paid", value: pro },
          { label: "Leads", value: leads },
          { label: "Revenue", value: `$${Math.round(Number(revenue) || 0)}` },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl font-bold text-ink">{s.value}</div>
            <div className="text-xs text-ink-soft">{s.label}</div>
          </Card>
        ))}
      </div>
      <div className="flex gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-surface-soft"
        >
          Users
        </Link>
      </div>
    </div>
  );
}
