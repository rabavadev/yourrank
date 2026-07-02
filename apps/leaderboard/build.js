// Build: inlines asset files as string exports so the Worker is fully self-contained.
import fs from "node:fs";
import path from "node:path";

const assetsDir = "src/assets";
const out = "src/assets_bundled.js";

const files = fs.readdirSync(assetsDir).filter((f) => /\.(js|css)$/.test(f));
let outSrc = "// Auto-generated. Do not edit. Asset files inlined as strings.\n";
for (const f of files) {
  const content = fs.readFileSync(path.join(assetsDir, f), "utf8");
  const key = f.replace(/\./g, "_");
  outSrc += `export const ${key} = ${JSON.stringify(content)};\n`;
}
fs.writeFileSync(out, outSrc);
console.log("bundled", files.length, "assets into", out, "(", outSrc.length, "bytes )");
