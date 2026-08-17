"use client";

import { useActionState } from "react";
import { setActiveBoard, type SetActiveResult } from "../actions";

interface SetActiveButtonProps {
  siteId: string;
}

export function SetActiveButton({ siteId }: SetActiveButtonProps) {
  const [state, action, pending] = useActionState<SetActiveResult | null, FormData>(setActiveBoard, null);

  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="siteId" value={siteId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-cobalt hover:underline disabled:opacity-50"
      >
        {pending ? "Activating…" : "Set active"}
      </button>
      {state?.ok && <span className="text-xs text-emerald-700">Active</span>}
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
