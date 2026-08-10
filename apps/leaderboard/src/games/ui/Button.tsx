/** @jsxImportSource preact */
// The one button the games use. It exists because a loading button that swaps
// its label to "Loading…" changes width and shifts the layout under the
// viewer's thumb mid-tap: this keeps the label and overlays a spinner instead.
import type { ComponentChildren, JSX } from "preact";

export interface ButtonProps extends Omit<JSX.IntrinsicElements["button"], "size" | "loading" | "ref"> {
  variant?: "primary" | "win" | "ghost" | "neutral";
  size?: "md" | "lg";
  block?: boolean;
  loading?: boolean;
  children?: ComponentChildren;
}

export function Button({
  variant = "neutral",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  class: cls = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "gx-btn",
    variant !== "neutral" ? `gx-btn--${variant}` : "",
    size === "lg" ? "gx-btn--lg" : "",
    block ? "gx-btn--block" : "",
    String(cls),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      {...rest}
      class={classes}
      disabled={Boolean(disabled) || loading}
      aria-busy={loading ? "true" : undefined}
    >
      {loading ? <span class="gx-btn__spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}
