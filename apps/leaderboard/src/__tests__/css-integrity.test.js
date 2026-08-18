// A stray closing brace in the dashboard stylesheet silently un-wrapped a
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
    expect(sheets).not.toContain("dashboard-v3.css");
    expect(sheets).toContain("dashboard-v4.css");
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

describe("authenticated dashboard v4 contract", () => {
  const css = fs.readFileSync(path.join(assetsDir, "dashboard-v4.css"), "utf8");
  const shellJs = fs.readFileSync(path.join(assetsDir, "shell-nav.js"), "utf8");

  it("uses a 12-column workspace with a 24px gutter", () => {
    expect(css).toMatch(/grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
    expect(css).toMatch(/\.v3-dash\[data-auth-workspace\] \.lb-bento\s*\{[\s\S]*?gap:\s*24px/);
  });

  it("does not use absolute positioning for v4 structure", () => {
    // Controls may use absolute positioning for their own affordances; this
    // contract is only about the workspace shell and layout primitives.
    const structuralRules = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("}")
      .filter((rule) => /\{/.test(rule))
      .filter((rule) =>
        /(?:^|[\s,>])(?:\.lb-shell|\.lb-side|\.lb-side-nav|\.lb-main|\.lb-bento|\.lb-page|\.v3-grid|\.v3-stack|#cr-app|#cr-main|\.cr-workspace-content)(?=$|[\s,>:{.#])/.test(rule)
      )
      .join("}");
    expect(structuralRules).not.toMatch(/position:\s*absolute/);
  });

  it("keeps desktop collapse persistent and mobile drawers independent", () => {
    expect(shellJs).toContain('var collapseKey = "yr-side-collapsed"');
    expect(shellJs).toContain('root.setAttribute("data-side-collapsed", "true")');
    expect(shellJs).toContain('data-shell-drawer="shared"');
    expect(shellJs).toContain("trapDrawerFocus");
    expect(css).toContain('@media (min-width: 981px)');
    expect(css).toContain('@media (max-width: 980px)');
    expect(css).toContain('.v3-dash[data-auth-workspace] .lb-side.is-open');
  });
});

// The same button had three definitions (app.css and the bot
// shell's inlined CSS) that merged by cascade order, so a change to one of them
// only changed the component on some pages. They live in ui.css now.
describe("shared UI primitives", () => {
  const ui = fs.readFileSync(path.join(assetsDir, "ui.css"), "utf8");
  const botShell = fs.readFileSync(path.resolve(import.meta.dir, "../../../../packages/shared/src/page-shell.ts"), "utf8");

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

describe("nonce'd CSP pages", () => {
  // /docs is served with the nonce'd header (style-src 'self' 'nonce-…'), which
  // drops inline <style> blocks — the page shipped unstyled in production.
  it("keeps the docs page CSS in a stylesheet, not an inline block", () => {
    const docs = fs.readFileSync(path.resolve(import.meta.dir, "../pages/docs.js"), "utf8");
    expect(docs).toContain('href="/assets/docs.css"');
    expect(docs).not.toContain("<style>");
    expect(sheets).toContain("docs.css");
  });

  it("allows the shared shell's font origins in the bot CSP", () => {
    const botDash = fs.readFileSync(
      path.resolve(import.meta.dir, "../../../bot/src/dashboard.ts"),
      "utf8"
    );
    const policies = botDash.match(/default-src 'self';[^`]*/g) || [];
    expect(policies.length).toBeGreaterThan(0);
    for (const policy of policies) {
      expect(policy).toContain("https://fonts.googleapis.com");
      expect(policy).toContain("font-src 'self' https://fonts.gstatic.com");
    }
  });
});
