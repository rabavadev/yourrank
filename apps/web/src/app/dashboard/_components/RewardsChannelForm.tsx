"use client";

import { useActionState } from "react";
import { connectCreditsChannel, toggleCreditsViewerAuth, type CreditsResult } from "../credits-actions";
import type { CreditsChannel } from "@/lib/types";

interface RewardsChannelFormProps {
  siteId: string;
  channel: CreditsChannel;
  viewerAuth: { kick: boolean; discord: boolean; public: boolean };
  usage: Record<string, number>;
  limits: Record<string, number>;
}

export function RewardsChannelForm({ siteId, channel, viewerAuth, usage, limits }: RewardsChannelFormProps) {
  const [connectState, connectAction, connectPending] = useActionState<CreditsResult, FormData>(connectCreditsChannel, { ok: false });
  const [authState, authAction, authPending] = useActionState<CreditsResult, FormData>(toggleCreditsViewerAuth, { ok: false });

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Kick channel</h3>
        {channel.name ? (
          <div className="mt-3 rounded-lg border border-line bg-surface-soft p-4">
            <p className="text-sm text-ink"><span className="font-medium">{channel.name}</span> <span className="text-ink-soft">({channel.externalId})</span></p>
            <p className="mt-1 text-xs text-ink-soft">Linked {channel.linkedAt ? new Date(channel.linkedAt).toLocaleDateString() : "—"}</p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">No channel linked yet.</p>
        )}

        <form action={connectAction} className="mt-4 flex max-w-md flex-col gap-3">
          <input type="hidden" name="siteId" value={siteId} />
          <div>
            <label className="block text-sm font-medium text-ink">Channel ID</label>
            <input name="externalId" type="text" required placeholder="123456" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Channel name</label>
            <input name="name" type="text" placeholder="yourchannel" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none" />
          </div>
          <button
            type="submit"
            disabled={connectPending}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {connectPending ? "Connecting…" : "Connect channel"}
          </button>
          {connectState.error && <p className="text-sm text-red-600">{connectState.error}</p>}
          {connectState.ok && <p className="text-sm text-emerald-700">Channel connected.</p>}
        </form>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Viewer auth</h3>
        <p className="mt-1 text-sm text-ink-soft">Choose how viewers can sign in to earn and spend credits.</p>
        <form action={authAction} className="mt-4 space-y-3">
          <input type="hidden" name="siteId" value={siteId} />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="kick" type="checkbox" defaultChecked={viewerAuth.kick} className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt" />
            Kick account
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="discord" type="checkbox" defaultChecked={viewerAuth.discord} className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt" />
            Discord
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input name="public" type="checkbox" defaultChecked={viewerAuth.public} className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt" />
            Public viewer accounts
          </label>
          <button
            type="submit"
            disabled={authPending}
            className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
          >
            {authPending ? "Saving…" : "Save auth settings"}
          </button>
          {authState.error && <p className="text-sm text-red-600">{authState.error}</p>}
          {authState.ok && <p className="text-sm text-emerald-700">Auth settings saved.</p>}
        </form>
      </section>

 <section>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Usage</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(usage).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-line bg-surface-soft p-3 text-sm">
              <div className="text-ink-soft">{key}</div>
              <div className="text-lg font-semibold text-ink">{value} <span className="text-xs font-normal text-ink-soft">/ {limits[key] ?? "∞"}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
