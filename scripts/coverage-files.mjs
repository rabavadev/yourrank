import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testDir = path.join(root, "apps", "leaderboard", "src", "__tests__");
const excluded = new Set([
  "audit-validation.test.js",
  "credits-loop.test.js",
  "credits-lifecycle.test.js",
  "shop-redeem-edge-cases.test.js",
  "public-stream-version.test.js",
  "sites-handlers.test.js",
]);

for (const file of fs.readdirSync(testDir).sort()) {
  if (file.endsWith(".test.js") && !excluded.has(file)) {
    console.log(`src/__tests__/${file}`);
  }
}
