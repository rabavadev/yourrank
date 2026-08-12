// A stray closing brace in dashboard-v2.css silently un-wrapped a
// `@media (max-width: …)` block, so the editor's "stack the live preview below
// the controls" rule applied at every width and the split-screen editor was
// single-column on desktop. Unbalanced braces do not throw anywhere — CSS just
// drops or re-scopes rules — so assert it.
import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const assetsDir = path.resolve(import.meta.dir, "../assets");
const sheets = fs.readdirSync(assetsDir).filter((f) => f.endsWith(".css"));

const stripped = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, '""');

describe("stylesheets", () => {
  it("finds the dashboard stylesheets", () => {
    expect(sheets).toContain("dashboard-v2.css");
    expect(sheets).toContain("app.css");
  });

  for (const sheet of sheets) {
    it(`${sheet} has balanced braces`, () => {
      const css = stripped(fs.readFileSync(path.join(assetsDir, sheet), "utf8"));
      let depth = 0;
      let line = 1;
      for (const ch of css) {
        if (ch === "\n") line++;
        else if (ch === "{") depth++;
        else if (ch === "}" && --depth < 0) throw new Error(`${sheet}: unmatched } on line ${line}`);
      }
      expect(`${sheet} depth=${depth}`).toBe(`${sheet} depth=0`);
    });
  }
});

// The same button had three definitions (app.css, dashboard-v2.css and the bot
// shell's inlined CSS) that merged by cascade order, so a change to one of them
// only changed the component on some pages. They live in ui.css now.
describe("shared UI primitives", () => {
  const ui = fs.readFileSync(path.join(assetsDir, "ui.css"), "utf8");
  const botShell = fs.readFileSync(path.resolve(import.meta.dir, "../../../../shared/page-shell.ts"), "utf8");

  it("defines the button component", () => {
    expect(ui).toMatch(/\.btn,\s*\.yr-ui button\s*\{/);
  });

  const selectorsOf = (css) =>
    stripped(css)
      .replace(/@[^{]+\{/g, "")
      .split("}")
      .map((block) => block.split("{")[0].trim())
      .filter(Boolean)
      .flatMap((s) => s.split(",").map((x) => x.trim()));

  // A bare `.btn`/`.badge`/`button` rule elsewhere re-forks the component;
  // scoped rules like `.perf-filter .btn` only position it and are fine.
  const OWNED = new Set([".btn", ".btn--accent", ".btn--ghost", ".btn--danger", ".btn--sm", ".btn--xs", ".badge", ".tbl-scroll", ".modal", ".modal-card", ".modal-input", ".modal-actions", ".empty", ".error-state", ".sr-only", ".skip-link"]);

  for (const sheet of sheets.filter((s) => s !== "ui.css")) {
    it(`${sheet} does not redefine them`, () => {
      const clashes = selectorsOf(fs.readFileSync(path.join(assetsDir, sheet), "utf8")).filter((s) =>
        OWNED.has(s.replace(/^\.v2-dash\s+/, "").replace(/:[a-z-]+(\([^)]*\))?$/, ""))
      );
      expect(clashes).toEqual([]);
    });
  }

  // Every page opens with `<a class="sr-only skip-link">`, so any sheet a page
  // can be rendered with alone has to hide it — /` and /pricing load landing.css
  // and ui.css only, and the skip link was visible on both.
  it("hides the skip link on every sheet a page ships with", () => {
    expect(ui).toMatch(/\.sr-only\s*\{[^}]*clip:\s*rect\(0,\s*0,\s*0,\s*0\)/);
    // The bot shell's skip link has no .sr-only class, so .skip-link has to
    // hide itself too rather than relying on the class next to it.
    expect(ui).toMatch(/\.skip-link\s*\{[^}]*transform:\s*translateY\(-200%\)/);
    expect(ui).toMatch(/\.skip-link:focus\s*\{[^}]*transform:\s*none/);
    const pagesDir = path.resolve(import.meta.dir, "../pages");
    const withSkipLink = fs
      .readdirSync(pagesDir)
      .filter((f) => /\.(js|jsx)$/.test(f))
      .filter((f) => fs.readFileSync(path.join(pagesDir, f), "utf8").includes("sr-only skip-link"));
    expect(withSkipLink.length).toBeGreaterThan(0);
    for (const file of withSkipLink) {
      const src = fs.readFileSync(path.join(pagesDir, file), "utf8");
      expect(`${file} links ui.css`).toBe(src.includes('href="/assets/ui.css"') ? `${file} links ui.css` : `${file} does not`);
    }
  });

  it("the bot shell styles buttons through ui.css, not its own copy", () => {
    expect(botShell).toContain('<link rel="stylesheet" href="/assets/ui.css">');
    expect(botShell).toContain('class="yr-ui"');
    const botCss = stripped(botShell.slice(botShell.indexOf("BOT_STYLE_ATTR_CSS")));
    expect(botCss).not.toMatch(/\n\s*button(\.\w+)?\s*\{/);
    expect(botCss).not.toMatch(/\n\s*\.badge\s*\{/);
  });
});
