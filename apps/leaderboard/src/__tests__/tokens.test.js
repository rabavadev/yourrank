// The product's palette is declared in four places (three CSS files plus the
// bot Worker's inlined CSS) because the two Workers ship their chrome
// differently. They had already drifted into three different accent colours,
// which is what makes the dashboard, the Telegram dashboard and the marketing
// site look like separate products. Until they can share one stylesheet, this
// test is the guard: the copies must agree.

import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

/** Canonical name → the variable each source declares it as. */
const TOKENS = {
  bg: { app: "--bg", v2: "--yr-bg", nav: "--gm-bg", bot: "--bg" },
  panel: { app: "--panel", v2: "--yr-panel", nav: "--gm-panel", bot: "--panel" },
  line: { app: "--line", v2: "--yr-line", nav: "--gm-line", bot: "--border" },
  line2: { app: "--line-2", v2: "--yr-line-2", nav: "--gm-line-2", bot: "--border-2" },
  ink: { app: "--ink", v2: "--yr-ink", nav: "--gm-ink", bot: "--fg" },
  inkSoft: { app: "--ink-soft", v2: "--yr-ink-soft", nav: "--gm-ink-soft", bot: "--dim" },
  inkMute: { app: "--ink-mute", v2: "--yr-ink-mute", nav: "--gm-ink-mute", bot: "--mute" },
  accent: { app: "--accent", v2: "--yr-accent", nav: "--gm-accent", bot: "--accent" },
  accentInk: { app: "--accent-ink", v2: "--yr-accent-ink", nav: "--gm-accent-ink", bot: "--accent-ink" },
};

// Only the first declaration matters: later ones are theme overrides
// (.gm-shell-nav--dark) that are meant to differ.
function declared(source, name) {
  const m = source.match(new RegExp(`${name}\\s*:\\s*([^;}]+)`));
  return m ? m[1].trim().toLowerCase() : null;
}

const sources = {
  app: read("apps/leaderboard/src/assets/app.css"),
  v2: read("apps/leaderboard/src/assets/dashboard-v2.css"),
  nav: read("apps/leaderboard/src/assets/shell-nav.css"),
  bot: read("shared/page-shell.ts"),
  publicShell: read("apps/leaderboard/src/assets/site-shell.css"),
  publicRuntime: read("apps/leaderboard/src/site-render.js"),
};

describe("design tokens", () => {
  for (const [token, names] of Object.entries(TOKENS)) {
    it(`${token} is the same colour in every stylesheet`, () => {
      const values = Object.entries(names).map(([source, name]) => {
        const value = declared(sources[source], name);
        expect(value, `${name} not declared in ${source}`).not.toBeNull();
        return [source, value];
      });
      const [, expected] = values[0];
      for (const [source, value] of values) {
        expect(`${source}=${value}`).toBe(`${source}=${expected}`);
      }
    });
  }

  it("uses the brand accent", () => {
    expect(declared(sources.app, "--accent")).toBe("#5b5bf5");
  });

  // The status fills (#16c784, #f59e0b) are ~2:1 on the light surfaces, so they
  // may only be used for backgrounds; the -text/-ink variants are what labels
  // use and they have to stay legible in both Workers.
  const STATUS_TEXT = {
    live: { app: "--yr-color-live-text", bot: "--green-ink" },
    warning: { app: "--yr-color-warning-text", bot: "--warn-ink" },
    danger: { app: "--yr-color-danger-text", bot: "--red-ink" },
  };

  function contrast(hexA, hexB) {
    const lum = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const [hi, lo] = [lum(hexA), lum(hexB)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  }

  for (const [name, names] of Object.entries(STATUS_TEXT)) {
    it(`${name} status text is legible and identical in both Workers`, () => {
      const value = declared(sources.app, names.app);
      expect(declared(sources.bot, names.bot)).toBe(value);
      // #f7f7f8 is the darkest light surface these run on.
      expect(contrast(value, "#f7f7f8")).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("uses the Kick brand token for the public accent fallback", () => {
    expect(declared(sources.publicShell, "--yr-accent")).toBe("var(--yr-color-brand-kick)");
    expect(sources.publicShell).toContain("--yr-color-brand-kick: #53fc18");
    expect(sources.publicRuntime).toContain('value: "var(--yr-color-brand-kick)"');
    expect(sources.publicRuntime).toContain('ink: "#000000"');
  });
});
