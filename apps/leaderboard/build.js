// Build: compiles shared TypeScript to JavaScript, then inlines asset files as string exports so the Worker is fully self-contained.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Step 1: Compile shared TypeScript to JavaScript
console.log("Compiling shared TypeScript...");
try {
  execSync("bun ../../build-shared.mjs", { stdio: "inherit" });
  console.log("TypeScript compilation complete");
} catch (error) {
  console.error("TypeScript compilation failed:", error);
  process.exit(1);
}

// Step 2: Bundle the games Preact island into src/assets/games/ (see
// build-games.mjs for why the games get a bundler and no other page does).
console.log("Bundling games island...");
try {
  execSync("bun build-games.mjs", { stdio: "inherit" });
} catch (error) {
  console.error("Games island build failed:", error);
  process.exit(1);
}

// Step 3: Bundle assets
const assetsDir = "src/assets";
const out = "src/assets_bundled.js";

function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(js|css|webp)$/.test(entry.name)) {
      results.push(path.relative(assetsDir, full).replace(/\\/g, "/"));
    }
  }
  return results;
}

const files = collectFiles(assetsDir);
let outSrc = "// Auto-generated. Do not edit. Asset files inlined as strings.\n";
outSrc += "export const ASSETS = {\n";
for (const rel of files) {
  const ext = path.extname(rel);
  const isBinary = ext === ".webp";
  const content = fs.readFileSync(path.join(assetsDir, rel), isBinary ? "base64" : "utf8");
  const webPath = "/assets/" + rel;
  outSrc += `  ${JSON.stringify(webPath)}: [${JSON.stringify(content)}, ${JSON.stringify(ext)}, ${JSON.stringify(isBinary ? "base64" : "utf8")}],\n`;
}
outSrc += "};\n";
fs.writeFileSync(out, outSrc);
console.log("bundled", files.length, "assets into", out, "(", outSrc.length, "bytes )");
