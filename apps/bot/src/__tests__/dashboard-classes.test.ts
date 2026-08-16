// The bot dashboard's markup used to carry generated `style-N` classes and raw
// `style="…"` attributes. Both are named components/utilities now; these tests
// fail if either comes back, or if a name is used without being defined.

import { describe, it, expect } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const views = join(import.meta.dir, "..", "dashboard-views");
const pages = join(views, "pages");
const shell = join(import.meta.dir, "..", "..", "..", "..", "packages", "shared", "src", "page-shell.ts");

const viewFiles = [
  ...readdirSync(views).filter((f) => f.endsWith(".ts")).map((f) => join(views, f)),
  ...readdirSync(pages).filter((f) => f.endsWith(".ts")).map((f) => join(pages, f)),
];

const shellCss = readFileSync(shell, "utf8");

describe("bot dashboard styling", () => {
  it("has no generated style-N classes left", () => {
    for (const file of [...viewFiles, shell]) {
      expect(readFileSync(file, "utf8")).not.toMatch(/style-\d/);
    }
  });

  it("has no inline style attributes (they need a CSP nonce and can't be reused)", () => {
    for (const file of viewFiles) {
      expect(readFileSync(file, "utf8")).not.toMatch(/\sstyle="/);
    }
  });

  it("defines every utility the views use", () => {
    const utilities = [
      "mb-sm", "mb-md", "mb-lg", "mt-sm", "mt-md", "text-sm", "text-xs", "num",
      "pagehead-row", "panel-intro", "subhead", "hint", "notice", "field-label",
      "field-row", "grow", "form-note", "inline-row", "input-w-md", "input-w-sm",
      "link-block", "chart-axis", "divider", "pre-wrap",
    ];
    const used = new Set<string>();
    for (const file of viewFiles) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/class="([^"$]+)"/g)) {
        for (const cls of m[1].split(/\s+/)) if (utilities.includes(cls)) used.add(cls);
      }
    }
    expect(used.size).toBeGreaterThan(0);
    for (const cls of used) expect(shellCss).toContain(`.${cls} `);
  });
});
