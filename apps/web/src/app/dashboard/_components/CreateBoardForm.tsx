"use client";

import { useActionState } from "react";
import { createBoard, type CreateBoardResult } from "../actions";

export function CreateBoardForm() {
  const [state, action, pending] = useActionState<CreateBoardResult, FormData>(createBoard, {
    ok: false,
  });

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Site name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Summer Race 2026"
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-ink">
            URL slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="summer-race-2026"
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>
        <div>
          <label htmlFor="casino" className="block text-sm font-medium text-ink">
            Partner or sponsor
          </label>
          <input
            id="casino"
            name="casino"
            type="text"
            placeholder="Your brand or sponsor"
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-ink">
            Promo code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="Optional"
            className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && state.slug && (
        <p className="text-sm text-emerald-700">Created <b>{state.slug}</b>. It is now your active site.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create site"}
      </button>
    </form>
  );
}
