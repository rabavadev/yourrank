"use client";

import { useActionState } from "react";
import { createArchive, deleteArchive, type CreateArchiveResult, type DeleteArchiveResult } from "../actions";
import type { SiteResponse } from "@/lib/types";

interface EditorHistoryFormProps {
  site: SiteResponse;
}

export function EditorHistoryForm({ site }: EditorHistoryFormProps) {
  const [createState, createAction, createPending] = useActionState<CreateArchiveResult, FormData>(createArchive, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<DeleteArchiveResult, FormData>(deleteArchive, { ok: false });

  return (
    <div className="space-y-6">
      <form action={createAction} className="rounded-lg border border-line bg-surface-soft p-4">
        <input type="hidden" name="siteId" value={site.siteId} />
        <h4 className="text-sm font-semibold text-ink">Archive this period</h4>
        <p className="text-xs text-ink-soft">Save the current top 3 as a past-winner entry.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            name="label"
            type="text"
            placeholder="e.g. August 2026"
            required
            className="block flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
          <button
            type="submit"
            disabled={createPending}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {createPending ? "Archiving…" : "Archive"}
          </button>
        </div>
        {createState?.error && <p className="mt-2 text-sm text-red-600">{createState.error}</p>}
        {createState?.ok && <p className="mt-2 text-sm text-emerald-700">Archived {createState.label}.</p>}
      </form>

      {site.archives.length === 0 && site.data.pastWinners.length === 0 ? (
        <p className="text-sm text-ink-soft">No past winners yet. Archive a period once it ends.</p>
      ) : (
        <div className="rounded-xl border border-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-soft text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-semibold">Label</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Winner</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {site.archives.map((archive) => (
                <tr key={archive.label} className="bg-surface hover:bg-canvas">
                  <td className="px-4 py-3 text-ink font-medium">{archive.label}</td>
                  <td className="px-4 py-3 text-ink-soft">{archive.createdAt ? new Date(archive.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-ink-soft">{archive.winnerName || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteAction}>
                      <input type="hidden" name="siteId" value={site.siteId} />
                      <input type="hidden" name="label" value={archive.label} />
                      <button
                        type="submit"
                        disabled={deletePending}
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deleteState?.error && <p className="px-4 py-3 text-sm text-red-600">{deleteState.error}</p>}
          {deleteState?.ok && <p className="px-4 py-3 text-sm text-emerald-700">Deleted.</p>}
        </div>
      )}
    </div>
  );
}
