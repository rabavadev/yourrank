"use client";

import { useActionState } from "react";
import { saveGameSettings, type SaveGameSettingsResult } from "../actions";
import type { GameSetting } from "@/lib/types";

interface GameSettingFormProps {
  siteId: string;
  setting: GameSetting;
}

export function GameSettingForm({ siteId, setting }: GameSettingFormProps) {
  const [state, action, pending] = useActionState<SaveGameSettingsResult, FormData>(saveGameSettings, {
    ok: false,
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="siteId" value={siteId} />
      <input type="hidden" name="game" value={setting.game} />
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold capitalize text-ink">{setting.game}</h4>
        <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={setting.enabled}
            className="h-4 w-4 rounded border-line text-cobalt focus:ring-cobalt"
          />
          Enabled
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor={`minBet-${setting.game}`} className="block text-xs font-medium text-ink-soft">Min bet</label>
          <input id={`minBet-${setting.game}`} name="minBet" type="number" step="0.01" min="0" defaultValue={setting.minBet} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor={`maxBet-${setting.game}`} className="block text-xs font-medium text-ink-soft">Max bet</label>
          <input id={`maxBet-${setting.game}`} name="maxBet" type="number" step="0.01" min="0" defaultValue={setting.maxBet} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor={`houseEdge-${setting.game}`} className="block text-xs font-medium text-ink-soft">House edge (bps)</label>
          <input id={`houseEdge-${setting.game}`} name="houseEdgeBps" type="number" min="0" defaultValue={setting.houseEdgeBps} className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
        <div>
          <label htmlFor={`dailyLossCap-${setting.game}`} className="block text-xs font-medium text-ink-soft">Daily loss cap</label>
          <input id={`dailyLossCap-${setting.game}`} name="dailyLossCap" type="number" step="0.01" min="0" defaultValue={setting.dailyLossCap ?? ""} placeholder="None" className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt" />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Saved {setting.game} settings.</p>}
      <button type="submit" disabled={pending} className="inline-flex items-center justify-center rounded-lg bg-cobalt px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cobalt/90 disabled:opacity-50">
        {pending ? "Saving…" : "Save game settings"}
      </button>
    </form>
  );
}
