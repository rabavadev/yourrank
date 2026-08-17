"use client";

import { useActionState } from "react";
import type { TelegramBroadcast, TelegramBot } from "@/lib/types";
import { createBroadcast, deleteBroadcast, type TelegramResult } from "../telegram-actions";
import { Card } from "./Card";
import { DataTable } from "./DataTable";
import { TimezoneOffsetField } from "./TimezoneOffsetField";

interface TelegramBroadcastsFormProps {
  broadcasts: TelegramBroadcast[];
  bots: TelegramBot[];
}

export function TelegramBroadcastsForm({ broadcasts, bots }: TelegramBroadcastsFormProps) {
  const [createState, createAction, createPending] = useActionState<TelegramResult, FormData>(createBroadcast, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<TelegramResult, FormData>(deleteBroadcast, { ok: false });

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">New broadcast</h3>
        <form action={createAction} className="mt-4 max-w-2xl space-y-4">
          <div>
            <label htmlFor="bot_id" className="block text-sm font-medium text-ink">Bot</label>
            <select
              id="bot_id"
              name="bot_id"
              required
              disabled={bots.length === 0}
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt disabled:opacity-50"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>{b.username || b.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-ink">Message</label>
            <textarea
              id="body"
              name="body"
              rows={4}
              required
              maxLength={4096}
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
          </div>
          <div>
            <label htmlFor="media_url" className="block text-sm font-medium text-ink">Image URL (optional)</label>
            <input id="media_url" name="media_url" type="url" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="scheduled_at" className="block text-sm font-medium text-ink">Schedule for (optional, local time)</label>
            <input id="scheduled_at" name="scheduled_at" type="datetime-local" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            <TimezoneOffsetField name="scheduledAtOffset" />
          </div>
          <button
            type="submit"
            disabled={createPending || bots.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {createPending ? "Scheduling…" : "Schedule broadcast"}
          </button>
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          {createState.ok && <p className="text-sm text-emerald-700">Broadcast scheduled.</p>}
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Upcoming / recent broadcasts</h3>
        <DataTable
          rows={broadcasts}
          getRowKey={(b) => b.id}
          empty={<p className="py-8 text-center text-sm text-ink-soft">No broadcasts yet.</p>}
          columns={[
            { key: "bot", header: "Bot", accessor: "bot_username" },
            { key: "body", header: "Message", render: (b) => <span className="line-clamp-2 max-w-xs text-ink-soft">{b.body}</span> },
            { key: "status", header: "Status", accessor: "status" },
            { key: "scheduled", header: "Scheduled", render: (b) => b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "—" },
            { key: "counts", header: "Sent / Total", render: (b) => `${b.sent_count} / ${b.total_count}` },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (b) =>
                b.status === "scheduled" ? (
                  <form action={deleteAction} className="contents">
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      disabled={deletePending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletePending ? "…" : "Cancel"}
                    </button>
                  </form>
                ) : null,
            },
          ]}
        />
        {deleteState.error && <p className="mt-3 text-sm text-red-600">{deleteState.error}</p>}
        {deleteState.ok && <p className="mt-3 text-sm text-emerald-700">Broadcast canceled.</p>}
      </Card>
    </div>
  );
}
