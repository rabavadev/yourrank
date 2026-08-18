// The operator workspace and marketing site intentionally use separate accent
// axes: authenticated actions use electric violet, while marketing uses cobalt.
// This test protects ownership, consistency within each axis, and legibility.

import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const MARKETING_ACCENT = "#315cff";
const V4_ACCENT = "#2200ff";

const sources = {
  app: read("apps/leaderboard/src/assets/app.css"),
  dashboard: read("apps/leaderboard/src/assets/dashboard-v4.css"),
  landing: read("apps/leaderboard/src/assets/landing.css"),
  ui: read("apps/leaderboard/src/assets/ui.css"),
  publicShell: read("apps/leaderboard/src/assets/site-shell.css"),
  publicRuntime: read("packages/shared/src/site-render.ts"),
};

function declared(source, name) {
  const m = source.match(new RegExp(`${name}\\s*:\\s*([^;}]+)`));
  return m ? m[1].trim().toLowerCase() : null;
}

function declarationCount(source, name) {
  return (source.match(new RegExp(`(?:^|[{;])\\s*${name}\\s*:`, "g")) || []).length;
}

function declarationValues(source, name) {
  return [...source.matchAll(new RegExp(`${name}\\s*:\\s*([^;}]+)`, "g"))].map((match) => match[1].trim().toLowerCase());
}

function contrastRatio(foreground, background) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const luminance = (hex) => {
    const channels = hex
      .slice(1)
      .match(/../g)
      .map((part) => channel(parseInt(part, 16)));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("design tokens", () => {
  it("keeps each accent and status token owned by one stylesheet", () => {
    for (const name of ["--v4-cobalt", "--v4-cobalt-ink", "--v4-success", "--v4-warning", "--v4-danger"]) {
      expect(declarationCount(sources.dashboard, name), `${name} ownership`).toBe(1);
    }
    for (const [name, value] of [["--ok", "#16c784"], ["--warn", "#f59e0b"], ["--danger", "#f43f5e"]]) {
      expect(declarationValues(sources.app, name).filter((entry) => entry === value), `app.css ${name} base token`).toHaveLength(1);
      expect(declarationValues(sources.landing, name).filter((entry) => entry === value), `landing.css ${name} base token`).toHaveLength(1);
    }
    expect(declarationValues(sources.app, "--accent").filter((entry) => entry === MARKETING_ACCENT)).toHaveLength(1);
    expect(declarationValues(sources.landing, "--accent").filter((entry) => entry === MARKETING_ACCENT)).toHaveLength(1);
    expect(declarationValues(sources.app, "--accent-ink").filter((entry) => entry === "#ffffff").length).toBeGreaterThan(0);
    expect(declarationValues(sources.landing, "--accent-ink").filter((entry) => entry === "#ffffff").length).toBeGreaterThan(0);
    expect(declared(sources.app, "--accent")).toBe(MARKETING_ACCENT);
    expect(declared(sources.landing, "--accent")).toBe(MARKETING_ACCENT);
    expect(declared(sources.app, "--accent-ink")).toBe("#ffffff");
    expect(declared(sources.landing, "--accent-ink")).toBe("#ffffff");
    expect(declared(sources.dashboard, "--v4-cobalt")).toBe(V4_ACCENT);
  });

  it("ui.css reads the accent through the brand token chain", () => {
    // ui.css primitives read var(--yr-accent, var(--accent, ...)) so they follow
    // the host product's accent (operator cobalt, or a board's own brand on
    // public pages) rather than hardcoding a colour. Guard the chain exists and
    // that no component reintroduces a hardcoded purple accent.
    expect(sources.ui).toContain("var(--yr-accent, var(--accent");
    expect(sources.ui.toLowerCase()).not.toContain("#7c3aed");
  });

  it("keeps marketing status fills consistent", () => {
    expect(declared(sources.app, "--ok")).toBe("#16c784");
    expect(declared(sources.landing, "--ok")).toBe("#16c784");
    expect(declared(sources.app, "--warn")).toBe("#f59e0b");
    expect(declared(sources.landing, "--warn")).toBe("#f59e0b");
    expect(declared(sources.app, "--danger")).toBe("#f43f5e");
    expect(declared(sources.landing, "--danger")).toBe("#f43f5e");
  });

  it("keeps v4 primary action ink legible", () => {
    const ink = declared(sources.dashboard, "--v4-cobalt-ink");
    expect(ink).toBe("#ffffff");
    expect(sources.dashboard).toMatch(/\.btn--accent,[\s\S]*?color:\s*var\(--v4-cobalt-ink\)/);
    expect(contrastRatio(V4_ACCENT, ink)).toBeGreaterThanOrEqual(4.5);
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
    for (const [name, src] of Object.entries({ app: sources.app, dashboard: sources.dashboard, landing: sources.landing })) {
      expect(src.toLowerCase(), `${name} reintroduced #7c3aed`).not.toContain("#7c3aed");
    }
  });
});
