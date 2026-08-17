"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/types";
import { adminUserAction, type AdminUserActionResult } from "../actions";
import { DataTable } from "../../dashboard/_components/DataTable";

interface AdminUsersFormProps {
  users: AdminUser[];
  filters: { q: string; status: string; plan: string };
  currentPage: number;
  totalPages: number;
}

export function AdminUsersForm({ users, filters, currentPage, totalPages }: AdminUsersFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AdminUserActionResult, FormData>(adminUserAction, { ok: false });

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    const q = String(formData.get("q") || "").trim();
    const status = String(formData.get("status") || "");
    const plan = String(formData.get("plan") || "");
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    if (plan && plan !== "all") params.set("plan", plan);
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <form action={applyFilters} className="flex flex-wrap gap-3">
        <input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search email or ID"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
        />
        <select
          name="status"
          defaultValue={filters.status}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          name="plan"
          defaultValue={filters.plan}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="agency">Agency</option>
          <option value="lifetime">Lifetime</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90"
        >
          Filter
        </button>
      </form>

      <DataTable
        rows={users}
        getRowKey={(u) => u.id}
        empty={<p className="py-8 text-center text-sm text-ink-soft">No users match.</p>}
        columns={[
          { key: "email", header: "Email", accessor: "email" },
          { key: "plan", header: "Plan", accessor: "plan" },
          { key: "status", header: "Status", accessor: "status" },
          { key: "boards", header: "Boards", accessor: "board_count" },
          { key: "created", header: "Created", render: (u) => new Date(u.created_at).toLocaleDateString() },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (u) => (
              <form action={action} className="contents">
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="action"
                  required
                  className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
                >
                  <option value="">Action…</option>
                  {u.status !== "suspended" && <option value="suspend">Suspend</option>}
                  {u.status === "suspended" && <option value="unsuspend">Unsuspend</option>}
                  <option value="free">Set free</option>
                  <option value="starter">Set starter</option>
                  <option value="pro">Set pro</option>
                  <option value="agency">Set agency</option>
                  <option value="reset-link">Reset link</option>
                </select>
                <input
                  name="reason"
                  type="text"
                  placeholder="Reason (suspend only)"
                  className="ml-2 w-32 rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="ml-2 rounded-md bg-cobalt px-2 py-1 text-xs font-semibold text-white hover:bg-cobalt/90 disabled:opacity-50"
                >
                  {pending ? "…" : "Run"}
                </button>
              </form>
            ),
          },
        ]}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-700">Action completed.</p>}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => router.push(`/admin/users?page=${currentPage - 1}`)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-ink hover:bg-surface-soft disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-ink-soft">Page {currentPage} of {totalPages}</span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => router.push(`/admin/users?page=${currentPage + 1}`)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-ink hover:bg-surface-soft disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
