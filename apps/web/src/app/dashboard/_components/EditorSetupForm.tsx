"use client";

import { useActionState } from "react";
import { saveSite, type SaveSiteResult } from "../actions";
import type { SiteResponse, SiteSocial } from "@/lib/types";

interface EditorSetupFormProps {
  siteId: string;
  site: SiteResponse;
}

interface SocialFieldProps {
  social: SiteSocial;
}

function SocialField({ social }: SocialFieldProps) {
  const brand = social.brand || social.name.toLowerCase();
  const name = `socials.${social.name}`;
  return (
    <div className="rounded-lg border border-line bg-surface-soft p-4">
      <div className="flex items-center gap-2">
        <input
          id={`${name}.enabled`}
          name={`${name}.enabled`}
          type="checkbox"
          defaultChecked={social.enabled}
          className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt"
        />
        <label htmlFor={`${name}.enabled`} className="text-sm font-semibold text-ink capitalize">
          {social.name}
        </label>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input type="hidden" name={`${name}.name`} defaultValue={social.name} />
        <input type="hidden" name={`${name}.brand`} defaultValue={brand} />
        <div>
          <label htmlFor={`${name}.handle`} className="block text-xs font-medium text-ink-soft">Handle / label</label>
          <input id={`${name}.handle`} name={`${name}.handle`} type="text" defaultValue={social.handle} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor={`${name}.action`} className="block text-xs font-medium text-ink-soft">Action text</label>
          <input id={`${name}.action`} name={`${name}.action`} type="text" defaultValue={social.action} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${name}.url`} className="block text-xs font-medium text-ink-soft">URL</label>
          <input id={`${name}.url`} name={`${name}.url`} type="url" defaultValue={social.url} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
      </div>
    </div>
  );
}

import { DateTimeLocalField } from "./DateTimeLocalField";

export function EditorSetupForm({ siteId, site }: EditorSetupFormProps) {
  const [state, action, pending] = useActionState<SaveSiteResult, FormData>(saveSite, { ok: false });
  const brand = site.data.brand;
  const blurb = site.data.partner?.blurb ?? "";
  const autoReset = site.autoReset;
  const passwordProtected = site.passwordProtected ?? false;

  const socials = site.socials.length > 0 ? site.socials : [
    { name: "Discord", handle: "", action: "Join", url: "", brand: "discord", enabled: false },
    { name: "Kick", handle: "", action: "Follow", url: "", brand: "kick", enabled: false },
    { name: "Twitch", handle: "", action: "Follow", url: "", brand: "twitch", enabled: false },
    { name: "YouTube", handle: "", action: "Subscribe", url: "", brand: "youtube", enabled: false },
    { name: "X", handle: "", action: "Follow", url: "", brand: "x", enabled: false },
  ];

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="siteId" value={siteId} />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Brand & copy</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">Site name</label>
            <input id="name" name="name" type="text" defaultValue={brand.name} required className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-ink">Tagline</label>
            <input id="tagline" name="tagline" type="text" defaultValue={brand.tagline} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="casino" className="block text-sm font-medium text-ink">Partner / sponsor</label>
            <input id="casino" name="casino" type="text" defaultValue={brand.casino} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-ink">Promo code</label>
            <input id="code" name="code" type="text" defaultValue={brand.code} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="ctaUrl" className="block text-sm font-medium text-ink">Referral / CTA link</label>
            <input id="ctaUrl" name="ctaUrl" type="url" defaultValue={brand.ctaUrl} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="prizePool" className="block text-sm font-medium text-ink">Prize pool</label>
            <input id="prizePool" name="prizePool" type="text" defaultValue={brand.prizePool} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-ink">Period</label>
            <input id="period" name="period" type="text" defaultValue={brand.period} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div>
            <label htmlFor="resetNote" className="block text-sm font-medium text-ink">Reset note</label>
            <input id="resetNote" name="resetNote" type="text" defaultValue={brand.resetNote} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="blurb" className="block text-sm font-medium text-ink">Blurb</label>
            <textarea id="blurb" name="blurb" rows={3} defaultValue={blurb} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
          </div>
        </div>
      </div>

      <hr className="border-line" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Schedule & reset</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DateTimeLocalField name="endsAt" label="Ends at" defaultIso={site.data.endsAt} />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="autoReset.clear" className="block text-sm font-medium text-ink">Auto-reset clears</label>
              <select id="autoReset.clear" name="autoReset.clear" defaultValue={autoReset?.clear || "wagers"} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt">
                <option value="wagers">Wagers</option>
                <option value="players">Players</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <input id="autoReset.enabled" name="autoReset.enabled" type="checkbox" defaultChecked={autoReset?.enabled} className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt" />
              <label htmlFor="autoReset.enabled" className="ml-2 text-sm font-medium text-ink">Enabled</label>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-line" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Access</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input id="passwordProtected" name="passwordProtected" type="checkbox" defaultChecked={passwordProtected} className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt" />
            <label htmlFor="passwordProtected" className="ml-2 text-sm font-medium text-ink">Password protect this site</label>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink">Password</label>
            <input id="password" name="password" type="text" placeholder={passwordProtected ? "Leave blank to keep current" : "Set a password"} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt md:max-w-sm" />
          </div>
        </div>
      </div>

      <hr className="border-line" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">Social links</h3>
        <div className="mt-4 space-y-3">
          {socials.map((social) => (
            <SocialField key={social.name} social={social} />
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save site details"}
      </button>
    </form>
  );
}
