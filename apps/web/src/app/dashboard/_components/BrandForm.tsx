"use client";

import { useActionState } from "react";
import { saveBrand, type SaveBrandResult } from "../actions";
import type { SiteBranding } from "@/lib/types";

interface BrandFormProps {
  siteId: string;
  brand: SiteBranding;
}

export function BrandForm({ siteId, brand }: BrandFormProps) {
  const [state, action, pending] = useActionState<SaveBrandResult, FormData>(saveBrand, {
    ok: false,
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">Site name</label>
          <input id="name" name="name" type="text" defaultValue={brand.name} required className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor="casino" className="block text-sm font-medium text-ink">Partner / sponsor</label>
          <input id="casino" name="casino" type="text" defaultValue={brand.casino} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-ink">Promo code</label>
          <input id="code" name="code" type="text" defaultValue={brand.code} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor="ctaUrl" className="block text-sm font-medium text-ink">Referral / CTA link</label>
          <input id="ctaUrl" name="ctaUrl" type="url" defaultValue={brand.ctaUrl} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor="prizePool" className="block text-sm font-medium text-ink">Prize pool</label>
          <input id="prizePool" name="prizePool" type="text" defaultValue={brand.prizePool} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor="period" className="block text-sm font-medium text-ink">Period</label>
          <input id="period" name="period" type="text" defaultValue={brand.period} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="tagline" className="block text-sm font-medium text-ink">Tagline</label>
          <input id="tagline" name="tagline" type="text" defaultValue={brand.tagline} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="blurb" className="block text-sm font-medium text-ink">Blurb</label>
          <textarea id="blurb" name="blurb" rows={3} defaultValue={brand.blurb} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save brand"}
      </button>
    </form>
  );
}
