/** @jsxImportSource preact */
// Original inline SVG icons — no icon pack, no third-party assets. Sized in em
// so they scale with whatever text they sit next to.
import type { JSX } from "preact";

type IconProps = { size?: number; class?: string };

const base = (size: number): JSX.SVGAttributes<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 1.8,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false",
});

export function CoinIcon({ size = 16, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v8.4M14.4 9.6a2.6 2.6 0 0 0-2.4-1.4c-1.5 0-2.4.8-2.4 1.9 0 2.6 5 1.2 5 3.8 0 1.1-1 2-2.6 2a2.7 2.7 0 0 1-2.5-1.5" />
    </svg>
  );
}

export function LockIcon({ size = 20, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" />
    </svg>
  );
}

export function AlertIcon({ size = 20, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.9M12 16.2h.01" />
    </svg>
  );
}

export function SoundOnIcon({ size = 18, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" />
      <path d="M15.6 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />
    </svg>
  );
}

export function SoundOffIcon({ size = 18, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <path d="M4 9.5h3.2L12 5.6v12.8L7.2 14.5H4z" />
      <path d="M16 10l4 4M20 10l-4 4" />
    </svg>
  );
}

export function ClockIcon({ size = 20, class: cls }: IconProps) {
  return (
    <svg {...base(size)} class={cls}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.6V12l2.8 1.8" />
    </svg>
  );
}
