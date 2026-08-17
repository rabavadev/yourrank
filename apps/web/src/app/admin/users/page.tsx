import { apiGet } from "@/lib/api";
import type { AdminUsersResponse } from "@/lib/types";
import { AdminUsersForm } from "./AdminUsersForm";
import { Card } from "../../dashboard/_components/Card";
import { requireCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string; q?: string; status?: string; plan?: string }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { page, q, status, plan } = await searchParams;
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (plan) params.set("plan", plan);
  const query = params.toString();
  await requireCurrentUser(`/admin/users${query ? `?${query}` : ""}`);

  const result = await apiGet<AdminUsersResponse>(`/api/admin/users?${query}`);

  if (!result.ok) {
    return <p className="text-sm text-red-600">{result.error}</p>;
  }

  const { users, page: currentPage, pageSize, total, filters } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
      <Card>
        <AdminUsersForm users={users} filters={filters} currentPage={currentPage} totalPages={totalPages} />
      </Card>
    </div>
  );
}
