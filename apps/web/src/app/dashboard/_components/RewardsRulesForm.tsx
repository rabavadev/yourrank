"use client";

import { useActionState } from "react";
import { saveCreditsReward, deleteCreditsReward, type CreditsResult } from "../credits-actions";
import type { CreditRewardMapping } from "@/lib/types";

interface RewardsRulesFormProps {
  siteId: string;
  mappings: CreditRewardMapping[];
}

export function RewardsRulesForm({ siteId, mappings }: RewardsRulesFormProps) {
  const [saveState, saveAction, savePending] = useActionState<CreditsResult, FormData>(saveCreditsReward, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<CreditsResult, FormData>(deleteCreditsReward, { ok: false });

  return (
    <div className="space-y-6">
      <form action={saveAction} className="rounded-lg border border-line bg-surface-soft p-4">
        <input type="hidden" name="siteId" value={siteId} />
        <h4 className="text-sm font-semibold text-ink">Add / update reward mapping</h4>
        <p className="text-xs text-ink-soft">Map a Kick channel reward to a credit amount.</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input name="kickRewardId" type="text" placeholder="Reward ID" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="kickRewardTitle" type="text" placeholder="Title" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="kickRewardCost" type="number" min={0} placeholder="Kick cost" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <input name="credits" type="number" min={1} placeholder="Credits" required className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          <button type="submit" disabled={savePending} className="rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50">
            {savePending ? "Saving…" : "Save mapping"}
          </button>
        </div>
        {saveState.error && <p className="mt-2 text-sm text-red-600">{saveState.error}</p>}
        {saveState.ok && <p className="mt-2 text-sm text-emerald-700">Mapping saved.</p>}
      </form>

      <div className="rounded-xl border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface-soft text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Reward ID</th>
              <th className="px-4 py-3 font-semibold">Kick cost</th>
              <th className="px-4 py-3 font-semibold">Credits</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {mappings.map((m) => (
              <tr key={m.id} className="bg-surface hover:bg-canvas">
                <td className="px-4 py-3 text-ink">{m.kick_reward_title}</td>
                <td className="px-4 py-3 text-ink-soft font-mono text-xs">{m.kick_reward_id}</td>
                <td className="px-4 py-3 text-ink-soft">{m.kick_reward_cost.toLocaleString()}</td>
                <td className="px-4 py-3 text-ink">{m.credits.toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-soft">{m.active ? "Active" : "Paused"}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteAction}>
                    <input type="hidden" name="siteId" value={siteId} />
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" disabled={deletePending} className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings.length === 0 && <p className="px-4 py-3 text-sm text-ink-soft">No reward mappings yet.</p>}
        {deleteState.error && <p className="px-4 py-3 text-sm text-red-600">{deleteState.error}</p>}
        {deleteState.ok && <p className="px-4 py-3 text-sm text-emerald-700">Deleted.</p>}
      </div>
    </div>
  );
}
