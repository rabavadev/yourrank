"use client";

import { useActionState } from "react";
import { updateRedemption, type CreditsResult } from "../credits-actions";
import type { Redemption } from "@/lib/types";

interface RewardsRedemptionsFormProps {
  siteId: string;
  redemptions: Redemption[];
}

export function RewardsRedemptionsForm({ siteId, redemptions }: RewardsRedemptionsFormProps) {
  const [state, action, pending] = useActionState<CreditsResult, FormData>(updateRedemption, { ok: false });

  return (
    <div className="rounded-xl border border-line">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-surface-soft text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-semibold">Item</th>
            <th className="px-4 py-3 font-semibold">Viewer</th>
            <th className="px-4 py-3 font-semibold">Cost</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {redemptions.map((r) => (
            <tr key={r.id} className="bg-surface hover:bg-canvas">
              <td className="px-4 py-3 text-ink font-medium">{r.item_name}</td>
              <td className="px-4 py-3 text-ink-soft">{r.kick_username} <span className="text-xs">({r.kick_user_id})</span></td>
              <td className="px-4 py-3 text-ink">{r.cost.toLocaleString()}</td>
              <td className="px-4 py-3 text-ink-soft capitalize">{r.status}</td>
              <td className="px-4 py-3 text-ink-soft">{new Date(r.created_at).toLocaleString()}</td>
              <td className="px-4 py-3">
                {r.status === "pending" && (
                  <form action={action} className="flex items-center gap-2">
                    <input type="hidden" name="siteId" value={siteId} />
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" required className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:border-cobalt focus:outline-none">
                      <option value="">Choose…</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" disabled={pending} className="rounded-lg bg-cobalt px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50">
                      {pending ? "…" : "Update"}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {redemptions.length === 0 && <p className="px-4 py-3 text-sm text-ink-soft">No redemptions yet.</p>}
      {state.error && <p className="px-4 py-3 text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="px-4 py-3 text-sm text-emerald-700">Redemption updated.</p>}
    </div>
  );
}
