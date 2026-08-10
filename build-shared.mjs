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
function cleanGenerated(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    // Recurse into subdirectories (shared/games/*) but skip test fixtures.
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "node_modules") cleanGenerated(full);
      continue;
    }
    // Only remove a .js file that has a .ts sibling — i.e. one tsc generated.
    if (entry.name.endsWith(".js") && fs.existsSync(full.replace(/\.js$/, ".ts"))) {
      fs.rmSync(full);
    }
  }
}
cleanGenerated(sharedDir);

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
