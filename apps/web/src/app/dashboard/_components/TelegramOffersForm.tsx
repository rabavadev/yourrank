"use client";

import { useActionState } from "react";
import type { TelegramOffer } from "@/lib/types";
import { createOffer, toggleOffer, type TelegramResult } from "../telegram-actions";
import { Card } from "./Card";
import { DataTable } from "./DataTable";

interface TelegramOffersFormProps {
  offers: TelegramOffer[];
}

export function TelegramOffersForm({ offers }: TelegramOffersFormProps) {
  const [createState, createAction, createPending] = useActionState<TelegramResult, FormData>(createOffer, { ok: false });
  const [toggleState, toggleAction, togglePending] = useActionState<TelegramResult, FormData>(toggleOffer, { ok: false });

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Add offer</h3>
        <form action={createAction} className="mt-4 max-w-2xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="casino" className="block text-sm font-medium text-ink">Casino / sponsor</label>
              <input id="casino" name="casino" type="text" required className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            </div>
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-ink">Label</label>
              <input id="label" name="label" type="text" required className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="referral_url" className="block text-sm font-medium text-ink">Referral URL</label>
              <input id="referral_url" name="referral_url" type="url" required className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            </div>
            <div>
              <label htmlFor="promo_code" className="block text-sm font-medium text-ink">Promo code</label>
              <input id="promo_code" name="promo_code" type="text" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            </div>
            <div>
              <label htmlFor="bonus_text" className="block text-sm font-medium text-ink">Bonus text</label>
              <input id="bonus_text" name="bonus_text" type="text" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
            </div>
          </div>
          <button
            type="submit"
            disabled={createPending}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {createPending ? "Adding…" : "Add offer"}
          </button>
          {createState.error && <p className="text-sm text-red-600">{createState.error}</p>}
          {createState.ok && <p className="text-sm text-emerald-700">Offer added.</p>}
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Your offers</h3>
        <DataTable
          rows={offers}
          getRowKey={(o) => o.id}
          empty={<p className="py-8 text-center text-sm text-ink-soft">No offers yet.</p>}
          columns={[
            { key: "label", header: "Label", accessor: "label" },
            { key: "casino", header: "Casino", accessor: "casino" },
            { key: "clicks", header: "Clicks", accessor: "clicks" },
            { key: "unique_clicks", header: "Unique", accessor: "unique_clicks" },
            { key: "slug", header: "Link", render: (o) => <span className="font-mono text-xs text-ink-soft">{o.slug}</span> },
            {
              key: "active",
              header: "Active",
              render: (o) => (o.is_active ? "Yes" : "No"),
            },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (o) => (
                <form action={toggleAction} className="contents">
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="is_active" value={o.is_active ? "" : "on"} />
                  <button
                    type="submit"
                    disabled={togglePending}
                    className="rounded-md px-2 py-1 text-xs font-medium text-cobalt hover:bg-cobalt/10 disabled:opacity-50"
                  >
                    {togglePending ? "…" : (o.is_active ? "Disable" : "Enable")}
                  </button>
                </form>
              ),
            },
          ]}
        />
        {toggleState.error && <p className="mt-3 text-sm text-red-600">{toggleState.error}</p>}
        {toggleState.ok && <p className="mt-3 text-sm text-emerald-700">Offer updated.</p>}
      </Card>
    </div>
  );
}
