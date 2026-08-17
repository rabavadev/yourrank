"use client";

import { useActionState } from "react";
import { saveShopItem, deleteShopItem, type CreditsResult } from "../credits-actions";
import type { ShopItem } from "@/lib/types";

interface RewardsShopFormProps {
  siteId: string;
  items: ShopItem[];
}

export function RewardsShopForm({ siteId, items }: RewardsShopFormProps) {
  const [saveState, saveAction, savePending] = useActionState<CreditsResult, FormData>(saveShopItem, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<CreditsResult, FormData>(deleteShopItem, { ok: false });

  return (
    <div className="space-y-6">
      <form action={saveAction} className="rounded-lg border border-line bg-surface-soft p-4">
        <input type="hidden" name="siteId" value={siteId} />
        <h4 className="text-sm font-semibold text-ink">Add shop item</h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input name="name" type="text" placeholder="Item name" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="description" type="text" placeholder="Description" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="cost" type="number" min={1} placeholder="Credit cost" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="stock" type="number" min={0} placeholder="Stock (optional)" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <button type="submit" disabled={savePending} className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50">
            {savePending ? "Saving…" : "Add item"}
          </button>
        </div>
        {saveState.error && <p className="mt-2 text-sm text-red-600">{saveState.error}</p>}
        {saveState.ok && <p className="mt-2 text-sm text-emerald-700">Item saved.</p>}
      </form>

      <div className="rounded-xl border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-soft text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item) => (
              <tr key={item.id} className="bg-surface hover:bg-canvas">
                <td className="px-4 py-3 text-ink font-medium">{item.name}</td>
                <td className="px-4 py-3 text-ink-soft">{item.description || "—"}</td>
                <td className="px-4 py-3 text-ink">{item.cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-soft">{item.stock ?? "∞"}</td>
                <td className="px-4 py-3 text-ink-soft">{item.active ? "Active" : "Paused"}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteAction}>
                    <input type="hidden" name="siteId" value={siteId} />
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" disabled={deletePending} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="px-4 py-3 text-sm text-ink-soft">No shop items yet.</p>}
        {deleteState.error && <p className="px-4 py-3 text-sm text-red-600">{deleteState.error}</p>}
        {deleteState.ok && <p className="px-4 py-3 text-sm text-emerald-700">Deleted.</p>}
      </div>
    </div>
  );
}
