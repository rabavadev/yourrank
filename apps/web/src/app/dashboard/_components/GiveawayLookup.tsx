"use client";

import { useActionState } from "react";
import { lookupGiveawayChatroom, type GiveawayLookupResult } from "../actions";
import { Card } from "./Card";

export function GiveawayLookup() {
  const [state, action, pending] = useActionState<GiveawayLookupResult, FormData>(lookupGiveawayChatroom, {
    ok: false,
  });

  return (
    <Card>
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="channel" className="block text-sm font-medium text-ink">
            Kick channel name
          </label>
          <input
            id="channel"
            name="channel"
            type="text"
            required
            placeholder="e.g. yourchannel"
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
        >
          {pending ? "Looking up…" : "Find chatroom"}
        </button>
      </form>

      {state?.ok && state.chatroomId && (
        <div className="mt-6 rounded-lg border border-line bg-surface-soft p-4">
          <h4 className="text-sm font-semibold text-ink">Chatroom found</h4>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-soft">Channel</dt>
              <dd className="font-medium text-ink">{state.channel}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Chatroom ID</dt>
              <dd className="font-medium text-ink">{state.chatroomId}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">User</dt>
              <dd className="font-medium text-ink">{state.user ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Live</dt>
              <dd className="font-medium text-ink">{state.isLive ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Viewers</dt>
              <dd className="font-medium text-ink">{state.viewers?.toLocaleString() ?? "—"}</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}
