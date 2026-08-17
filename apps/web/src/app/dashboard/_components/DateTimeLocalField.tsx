"use client";

import { useEffect, useState } from "react";

function isoToLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimeLocalField({
  name,
  label,
  defaultIso,
}: {
  name: string;
  label: string;
  defaultIso: string | null | undefined;
}) {
  const [value, setValue] = useState("");
  const [offset, setOffset] = useState("");
  useEffect(() => {
    setValue(isoToLocalValue(defaultIso));
    setOffset(String(new Date().getTimezoneOffset()));
  }, [defaultIso]);

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input type="hidden" name={`${name}Offset`} value={offset} />
      <input
        id={name}
        name={name}
        type="datetime-local"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none focus:ring-1 focus:ring-cobalt"
      />
    </div>
  );
}
