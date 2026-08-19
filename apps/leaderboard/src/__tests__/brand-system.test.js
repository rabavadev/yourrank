import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "../../../..");
const SURFACE_ROOTS = [
  path.join(ROOT, "apps/leaderboard/src"),
  path.join(ROOT, "apps/web/src"),
  path.join(ROOT, "packages/shared/src"),
];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const BRAND_ASSET_ROOT = path.join(ROOT, "apps/web/public/brand");

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return SOURCE_EXTENSIONS.has(path.extname(file)) ? [file] : [];
  });
}

function readSurfaceSources() {
  return sourceFiles(SURFACE_ROOTS[0])
    .concat(sourceFiles(SURFACE_ROOTS[1]), sourceFiles(SURFACE_ROOTS[2]))
    .filter((file) => !file.endsWith("/brand-assets.ts") && !file.endsWith("/brand-system.test.js") && !file.endsWith("/assets_bundled.js"));
}

function identityRendererFiles() {
  const rendererHints = [
    /\bbrand(?:Mark|Wordmark|Lockup|Logo|Powered|Loader)(?:Svg|Html)?\s*\(/,
    /<(?:a|div|span)[^>]*(?:class|className)=["'][^"']*(?:brand|logo|wordmark)[^"']*["'][\s\S]{0,160}>[\s\S]{0,160}YourRank/i,
    /\/brand\/[^"']+\.svg/,
  ];
  return readSurfaceSources().filter((file) => {
    const source = fs.readFileSync(file, "utf8");
    return rendererHints.some((pattern) => pattern.test(source));
  });
}

describe("canonical YourRank identity", () => {
  test("has no legacy identity renderers in the surface source set", () => {
    const forbidden = [
      /Your<b>Rank/,
      /class=["'][^"']*brand[^"']*["'][^>]*>\s*YR\s*</,
      /brand-icon-wrap/,
      /brand-svg-icon/,
      /<rect x="3" y="13" width="6" height="8"/,
    ];
    const violations = [];
    for (const file of readSurfaceSources()) {
      const source = fs.readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        if (pattern.test(source)) violations.push(`${path.relative(ROOT, file)}: ${pattern}`);
      }
    }
    expect(violations).toEqual([]);
  });

  test("every discovered identity renderer consumes the shared canonical module", () => {
    const violations = identityRendererFiles()
      .filter((file) => !fs.readFileSync(file, "utf8").includes("brand-assets"))
      .map((file) => path.relative(ROOT, file));
    expect(violations).toEqual([]);
  });

  test("published SVGs contain the canonical mark geometry", () => {
    const markRects = [
      'x="3" y="13" width="6" height="8" rx="1"',
      'x="10" y="8" width="6" height="13" rx="1"',
      'x="17" y="3" width="4" height="18" rx="1"',
    ];
    const wordmarkRects = [
      'x="4" y="17.333" width="8" height="10.667" rx="1.333"',
      'x="13.333" y="10.667" width="8" height="17.333" rx="1.333"',
      'x="22.667" y="4" width="5.333" height="24" rx="1.333"',
    ];
    for (const file of ["yourrank-mark-dark.svg", "yourrank-mark-light.svg", "yourrank-mark-blue.svg", "powered-by-yourrank-dark.svg", "powered-by-yourrank-light.svg"]) {
      const source = fs.readFileSync(path.join(BRAND_ASSET_ROOT, file), "utf8");
      for (const rect of markRects) expect(source, `${file} ${rect}`).toContain(rect);
    }
    for (const file of ["yourrank-wordmark-dark.svg", "yourrank-wordmark-light.svg"]) {
      const source = fs.readFileSync(path.join(BRAND_ASSET_ROOT, file), "utf8");
      for (const rect of wordmarkRects) expect(source, `${file} ${rect}`).toContain(rect);
    }
  });
});
