"use client";

import { useActionState } from "react";
import type { TelegramBot, TelegramSubscriberStats } from "@/lib/types";
import { createBot, deleteBot, syncBotCommands, updateBotWelcome, type TelegramResult } from "../telegram-actions";
import { Card } from "./Card";
import { DataTable } from "./DataTable";

interface TelegramBotsFormProps {
  bots: TelegramBot[];
  stats: TelegramSubscriberStats;
}

export function TelegramBotsForm({ bots, stats }: TelegramBotsFormProps) {
  const [createState, createAction, createPending] = useActionState<TelegramResult, FormData>(createBot, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<TelegramResult, FormData>(deleteBot, { ok: false });
  const [syncState, syncAction, syncPending] = useActionState<TelegramResult, FormData>(syncBotCommands, { ok: false });
  const [welcomeState, welcomeAction, welcomePending] = useActionState<TelegramResult, FormData>(updateBotWelcome, { ok: false });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Subscribers", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "New 7d", value: stats.new_7d },
          { label: "New 30d", value: stats.new_30d },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-2xl font-bold text-ink">{s.value}</div>
            <div className="text-xs text-ink-soft">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Add a bot</h3>
        <form action={createAction} className="mt-4 max-w-xl space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-ink">Bot token from @BotFather</label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="123456:ABC-DEF..."
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
          </div>
          <div>
            <label htmlFor="welcome_message" className="block text-sm font-medium text-ink">Welcome message (optional)</label>
            <textarea
              id="welcome_message"
              name="welcome_message"
              rows={3}
              maxLength={500}
              placeholder="Sent when someone starts the bot"
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
          </div>
          <button
            type="submit"
            disabled={createPending}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {createPending ? "Connecting…" : "Connect bot"}
          </button>
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          {createState.ok && <p className="text-sm text-emerald-700">Bot connected.</p>}
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Your bots</h3>
        <DataTable
          rows={bots}
          getRowKey={(b) => b.id}
          empty={<p className="py-8 text-center text-sm text-ink-soft">No bots connected yet.</p>}
          columns={[
            { key: "username", header: "Bot", accessor: "username" },
            { key: "status", header: "Status", accessor: "status" },
            { key: "welcome", header: "Welcome", render: (b) => <span className="text-ink-soft">{b.welcome_message || "—"}</span> },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (b) => (
                <div className="flex justify-end gap-2">
                  <form action={syncAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      disabled={syncPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-cobalt hover:bg-cobalt/10 disabled:opacity-50"
                    >
                      {syncPending ? "…" : "Sync commands"}
                    </button>
                  </form>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      disabled={deletePending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletePending ? "…" : "Delete"}
                    </button>
                  </form>
                </div>
              ),
            },
          ]}
        />
        {syncState.error && <p className="mt-3 text-sm text-red-600">{syncState.error}</p>}
        {syncState.ok && <p className="mt-3 text-sm text-emerald-700">Commands synced.</p>}
        {deleteState.error && <p className="mt-3 text-sm text-red-600">{deleteState.error}</p>}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Default welcome message</h3>
        <form action={welcomeAction} className="mt-4 max-w-xl space-y-4">
          <input type="hidden" name="id" value={bots[0]?.id} />
          <textarea
            name="welcome_message"
            rows={3}
            maxLength={500}
            defaultValue={bots[0]?.welcome_message || ""}
            disabled={bots.length === 0}
            className="block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={welcomePending || bots.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {welcomePending ? "Saving…" : "Save welcome"}
          </button>
          {welcomeState.error && <p className="text-sm text-red-600">{welcomeState.error}</p>}
          {welcomeState.ok && <p className="text-sm text-emerald-700">Welcome message saved.</p>}
        </form>
      </Card>
    </div>
  );
}
