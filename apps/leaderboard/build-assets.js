import fs from "node:fs";
import path from "node:path";

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
