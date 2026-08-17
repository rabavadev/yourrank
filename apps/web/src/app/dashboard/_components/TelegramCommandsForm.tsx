"use client";

import { useActionState } from "react";
import type { TelegramBot, TelegramBotCommand } from "@/lib/types";
import { createCommand, deleteCommand, updateCommand, type TelegramResult } from "../telegram-actions";
import { Card } from "./Card";
import { DataTable } from "./DataTable";
import { EmptyState } from "./EmptyState";

interface TelegramCommandsFormProps {
  bots: TelegramBot[];
  commandsByBot: { bot: TelegramBot; commands: TelegramBotCommand[] }[];
}

export function TelegramCommandsForm({ bots, commandsByBot }: TelegramCommandsFormProps) {
  const [createState, createAction, createPending] = useActionState<TelegramResult, FormData>(createCommand, { ok: false });
  const [updateState, updateAction, updatePending] = useActionState<TelegramResult, FormData>(updateCommand, { ok: false });
  const [deleteState, deleteAction, deletePending] = useActionState<TelegramResult, FormData>(deleteCommand, { ok: false });

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Add command</h3>
        <form action={createAction} className="mt-4 max-w-2xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="botId" className="block text-sm font-medium text-ink">Bot</label>
              <select
                id="botId"
                name="botId"
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
              <label htmlFor="command" className="block text-sm font-medium text-ink">Command name</label>
              <input
                id="command"
                name="command"
                type="text"
                required
                placeholder="rules"
                className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
              />
            </div>
          </div>
          <div>
            <label htmlFor="response" className="block text-sm font-medium text-ink">Response</label>
            <textarea
              id="response"
              name="response"
              rows={3}
              required
              maxLength={1000}
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
          </div>
          <div>
            <label htmlFor="buttons" className="block text-sm font-medium text-ink">Buttons JSON (optional)</label>
            <textarea
              id="buttons"
              name="buttons"
              rows={2}
              placeholder='[{"label":"Open","url":"https://example.com"}]'
              className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
            />
          </div>
          <button
            type="submit"
            disabled={createPending || bots.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {createPending ? "Adding…" : "Add command"}
          </button>
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          {createState.ok && <p className="text-sm text-emerald-700">Command added.</p>}
        </form>
      </Card>

      {commandsByBot.length === 0 && (
        <EmptyState title="No bots" description="Connect a bot in the Bots tab before adding commands." />
      )}

      {commandsByBot.map(({ bot, commands }) => (
        <Card key={bot.id}>
          <h3 className="text-sm font-semibold text-ink">/{bot.username}</h3>
          <DataTable
            rows={commands}
            getRowKey={(c) => c.id}
            empty={<p className="py-4 text-sm text-ink-soft">No custom commands yet.</p>}
            columns={[
              { key: "command", header: "Command", accessor: "command" },
              { key: "response", header: "Response", render: (c) => <span className="line-clamp-2 max-w-xs text-ink-soft">{c.response}</span> },
              { key: "enabled", header: "Enabled", render: (c) => (c.is_enabled ? "Yes" : "No") },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (cmd) => (
                  <div className="flex justify-end gap-2">
                    <form action={updateAction} className="contents">
                      <input type="hidden" name="id" value={cmd.id} />
                      <input type="hidden" name="response" value={cmd.response} />
                      <input type="hidden" name="is_enabled" value={cmd.is_enabled ? "" : "on"} />
                      <button
                        type="submit"
                        disabled={updatePending}
                        className="rounded-md px-2 py-1 text-xs font-medium text-cobalt hover:bg-cobalt/10 disabled:opacity-50"
                      >
                        {updatePending ? "…" : (cmd.is_enabled ? "Disable" : "Enable")}
                      </button>
                    </form>
                    <form action={deleteAction} className="contents">
                      <input type="hidden" name="id" value={cmd.id} />
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
        </Card>
      ))}

      {updateState.error && <p className="text-sm text-red-600">{updateState.error}</p>}
      {updateState.ok && <p className="text-sm text-emerald-700">Command updated.</p>}
      {deleteState.error && <p className="text-sm text-red-600">{deleteState.error}</p>}
      {deleteState.ok && <p className="text-sm text-emerald-700">Command deleted.</p>}
    </div>
  );
}
