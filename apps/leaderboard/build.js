// Build: compiles shared TypeScript to JavaScript, then inlines asset files as string exports so the Worker is fully self-contained.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Step 1: Compile shared TypeScript to JavaScript
console.log("Compiling shared TypeScript...");
try {
  execSync("node ../../build-shared.js", { stdio: "inherit" });
  console.log("TypeScript compilation complete");
} catch (error) {
  console.error("TypeScript compilation failed:", error);
  process.exit(1);
}

// Step 2: Bundle assets
const assetsDir = "src/assets";
const out = "src/assets_bundled.js";

const files = fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f));
let outSrc = "// Auto-generated. Do not edit. Asset files inlined as strings.\n";
for (const f of files) {
  const content = fs.readFileSync(path.join(assetsDir, f), "utf8");
  const key = f.replace(/[\.\-]/g, "_");
  outSrc += `export const ${key} = ${JSON.stringify(content)};\n`;
}
fs.writeFileSync(out, outSrc);
console.log("bundled", files.length, "assets into", out, "(", outSrc.length, "bytes )");
