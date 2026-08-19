import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as bundle } from "esbuild";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(appDir, "src/assets");
const out = path.join(appDir, "src/assets_bundled.js");

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

async function assetContent(rel) {
  if (rel === "dashboard/routes.js") {
    const result = await bundle({
      entryPoints: [path.join(assetsDir, rel)],
      bundle: true,
      format: "esm",
      platform: "browser",
      write: false,
    });
    return result.outputFiles[0].text;
  }
  return fs.readFileSync(path.join(assetsDir, rel), "utf8");
}

export async function writeAssetBundle() {
  const files = collectFiles(assetsDir);
  let outSrc = "// Auto-generated. Do not edit. Asset files inlined as strings.\n";
  outSrc += "export const ASSETS = {\n";
  for (const rel of files) {
    const ext = path.extname(rel);
    const isBinary = ext === ".webp";
    const content = isBinary
      ? fs.readFileSync(path.join(assetsDir, rel), "base64")
      : await assetContent(rel);
    const webPath = "/assets/" + rel;
    outSrc += `  ${JSON.stringify(webPath)}: [${JSON.stringify(content)}, ${JSON.stringify(ext)}, ${JSON.stringify(isBinary ? "base64" : "utf8")}],\n`;
  }
  outSrc += "};\n";
  fs.writeFileSync(out, outSrc);
  console.log("bundled", files.length, "assets into", out, "(", outSrc.length, "bytes )");
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  await writeAssetBundle();
}
