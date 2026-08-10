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
