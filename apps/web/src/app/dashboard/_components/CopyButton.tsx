"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-2"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
