/** @jsxImportSource preact */
// Placeholder board shipped with the framework so the shell, the registry and
// the per-game code split are real and testable before any game exists. Each
// per-game session replaces its own games/<id>/index.tsx with the real board;
// nothing else in the framework changes.
import type { GameProps } from "../registry.js";

export function ComingSoon({ config }: GameProps) {
  return (
    <div class="gx-state" role="status">
      <span class="gx-state__icon" aria-hidden="true">
        ★
      </span>
      <h2 class="gx-state__title">{config.name} is coming soon</h2>
      <p class="gx-state__body">
        The board for this game is still being built. The bet panel, balance and history around it are live —
        they are exactly what {config.name} will plug into.
      </p>
    </div>
  );
}
