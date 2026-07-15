// Build: compiles shared TypeScript to JavaScript, then inlines asset files as string exports so the Worker is fully self-contained.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Step 1: Compile shared TypeScript to JavaScript
console.log("Compiling shared TypeScript...");
try {
  execSync("node ../../build-shared.mjs", { stdio: "inherit" });
  console.log("TypeScript compilation complete");
} catch (error) {
  console.error("TypeScript compilation failed:", error);
  process.exit(1);
}

// Step 2: Bundle assets
const assetsDir = "src/assets";
const out = "src/assets_bundled.js";

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(js|css)$/.test(entry.name)) {
      results.push(path.relative(assetsDir, full).replace(/\\/g, "/"));
    }
  }
  return results;
}

const files = collectFiles(assetsDir);
let outSrc = "// Auto-generated. Do not edit. Asset files inlined as strings.\n";
outSrc += "export const ASSETS = {\n";
for (const rel of files) {
  const content = fs.readFileSync(path.join(assetsDir, rel), "utf8");
  const ext = path.extname(rel);
  const webPath = "/assets/" + rel;
  outSrc += `  ${JSON.stringify(webPath)}: [${JSON.stringify(content)}, ${JSON.stringify(ext)}],\n`;
}
outSrc += "};\n";
fs.writeFileSync(out, outSrc);
console.log("bundled", files.length, "assets into", out, "(", outSrc.length, "bytes )");
