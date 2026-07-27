// Build script to compile shared TypeScript to JavaScript for the leaderboard Worker
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to this script's location (repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.join(__dirname, "apps/leaderboard/tsconfig.json");

// Find tsc: workspace-local first, then hoisted root (bun workspaces hoist bins)
function findTsc() {
  const exts = process.platform === "win32" ? ["", ".exe", ".bunx", ".cmd"] : ["", ".bunx"];
  const bases = [
    path.join(__dirname, "apps/leaderboard/node_modules/.bin/tsc"),
    path.join(__dirname, "node_modules/.bin/tsc"),
  ];
  for (const base of bases) {
    for (const ext of exts) {
      const p = base + ext;
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

console.log("Compiling shared TypeScript to JavaScript for leaderboard Worker...");

// Remove stale generated .js files so tsc can emit fresh copies in-place.
const sharedDir = path.join(__dirname, "shared");
for (const entry of fs.readdirSync(sharedDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (entry.name.endsWith(".js")) {
    fs.rmSync(path.join(sharedDir, entry.name));
  }
}

try {
  const tscBin = findTsc();
  const cmd = tscBin
    ? `"${tscBin}" --project "${tsconfigPath}"`
    : `npx tsc --project "${tsconfigPath}"`;
  execSync(cmd, {
    cwd: __dirname,
    stdio: "inherit"
  });
  console.log("✓ All shared TypeScript files compiled successfully");
  console.log("Build complete");
} catch (error) {
  console.error("✗ TypeScript compilation failed:", error.message);
  process.exit(1);
}
