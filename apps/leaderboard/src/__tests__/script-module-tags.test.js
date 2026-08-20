import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const pagesDir = path.resolve(import.meta.dir, "../pages");
const assetsDir = path.resolve(import.meta.dir, "../assets");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (/\.(?:js|jsx)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function hasStaticModuleSyntax(source) {
  return /^\s*(?:import(?!\s*\()|export)\b/m.test(source);
}

function pageScriptModules() {
  const scriptTagPattern = /<script\b[^>]*\bsrc=["'](\/assets\/[^"']+)["'][^>]*>/g;
  const mismatches = [];

  for (const pagePath of walk(pagesDir).sort()) {
    const pageSource = fs.readFileSync(pagePath, "utf8");
    for (const match of pageSource.matchAll(scriptTagPattern)) {
      const assetUrl = match[1];
      const assetPath = assetUrl.split("?", 1)[0];
      const assetFile = path.join(assetsDir, assetPath.slice("/assets/".length));
      const scriptTag = match[0];
      if (!fs.existsSync(assetFile)) continue;
      if (hasStaticModuleSyntax(fs.readFileSync(assetFile, "utf8")) &&
          !/\btype=["']module["']/.test(scriptTag)) {
        mismatches.push(`${path.relative(pagesDir, pagePath)} -> ${assetUrl}`);
      }
    }
  }

  return mismatches;
}

describe("page script module declarations", () => {
  it("loads every asset with static module syntax as a module script", () => {
    expect(pageScriptModules()).toEqual([]);
  });
});
