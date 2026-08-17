// The product's brand accent is the single most visible "is this one product?"
// signal. The operator console (leaderboard dashboard, bot dashboard) and the
// marketing site used to declare it in four separate places that drifted into
// three different colours, which is exactly what made the products look
// unrelated. The bot Worker no longer inlines its own palette — it shares
// /assets/dashboard-v3.css (via page-shell's `dashboardChrome`) — so there is
// now one operator stylesheet. This test guards the invariant that remains:
// the primary action colour is the SAME cobalt in every shared stylesheet, and
// the public viewer accent stays a separate, per-board axis.

import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

// The chosen product accent (see PRODUCT.md / DESIGN.md): electric cobalt.
// Distinct from the generic AI-dashboard indigo/purple this replaces.
const BRAND_ACCENT = "#315cff";

const sources = {
  app: read("apps/leaderboard/src/assets/app.css"),
  v3: read("apps/leaderboard/src/assets/dashboard-v3.css"),
  landing: read("apps/leaderboard/src/assets/landing.css"),
  ui: read("apps/leaderboard/src/assets/ui.css"),
  publicShell: read("apps/leaderboard/src/assets/site-shell.css"),
  publicRuntime: read("packages/shared/src/site-render.ts"),
};

// Only the first declaration matters: later ones may be theme overrides.
function declared(source, name) {
  const m = source.match(new RegExp(`${name}\\s*:\\s*([^;}]+)`));
  return m ? m[1].trim().toLowerCase() : null;
}

describe("design tokens", () => {
  it("declares one cobalt brand accent across the shared stylesheets", () => {
    // app.css and landing.css both drive the shared --accent custom property;
    // dashboard-v3.css maps its own --v3-accent. All three must be cobalt so
    // the operator console and marketing site read as one product.
    expect(declared(sources.app, "--accent")).toBe(BRAND_ACCENT);
    expect(declared(sources.landing, "--accent")).toBe(BRAND_ACCENT);
    expect(declared(sources.v3, "--v3-accent")).toBe(BRAND_ACCENT);
  });

  it("ui.css reads the accent through the brand token chain", () => {
    // ui.css primitives read var(--yr-accent, var(--accent, ...)) so they follow
    // the host product's accent (operator cobalt, or a board's own brand on
    // public pages) rather than hardcoding a colour. Guard the chain exists and
    // that no component reintroduces a hardcoded purple accent.
    expect(sources.ui).toContain("var(--yr-accent, var(--accent");
    expect(sources.ui.toLowerCase()).not.toContain("#7c3aed");
  });

  it("uses one set of status fills across the operator console and app shell", () => {
    // Success/warning/danger must read identically whether a component is styled
    // by app.css (--ok/--warn/--danger) or dashboard-v3.css (--v3-green/--v3-warn/
    // --v3-danger). They had drifted (two different greens/yellows); lock them.
    expect(declared(sources.app, "--ok")).toBe("#16c784");
    expect(declared(sources.v3, "--v3-green")).toBe("#16c784");
    expect(declared(sources.app, "--warn")).toBe("#f59e0b");
    expect(declared(sources.v3, "--v3-warn")).toBe("#f59e0b");
    expect(declared(sources.app, "--danger")).toBe("#f43f5e");
    expect(declared(sources.v3, "--v3-danger")).toBe("#f43f5e");
  });

  it("keeps white ink on the cobalt accent for legibility", () => {
    // White on #315CFF is ~5.9:1 — passes WCAG AA for the large/bold text that
    // primary buttons use. The ink must stay white wherever the accent is set.
    expect(declared(sources.app, "--accent-ink")).toBe("#ffffff");
    expect(declared(sources.v3, "--v3-accent-ink")).toBe("#fff");
  });

  it("keeps the public viewer accent on a separate per-board axis", () => {
    // The public board accent is the streamer's own colour, NOT the operator
    // brand cobalt — it must resolve from --yr-color-board-accent at runtime.
    expect(declared(sources.publicShell, "--yr-accent")).toBe("var(--yr-color-board-accent)");
    expect(sources.publicRuntime).toContain('value: "var(--yr-color-board-accent)"');
    expect(sources.publicRuntime).toContain('ink: "#000000"');
  });

  it("does not regress to the previous generic indigo/purple accents", () => {
    // Guard against re-introducing the drifted accents this redesign replaced.
    for (const [name, src] of Object.entries({ app: sources.app, v3: sources.v3, landing: sources.landing })) {
      expect(src.toLowerCase(), `${name} reintroduced #7c3aed`).not.toContain("#7c3aed");
    }
  });
});
