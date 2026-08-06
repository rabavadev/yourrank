import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Leaderboard tests MUST run one file per process: several test files mock
// the same modules (site.js, shared/db.js, shared/session.js) with different
// behavior, and bun's mock.module bindings are process-global — whichever
// file's mocks are bound first wins for the rest. Running the whole
// directory in one `bun test` produces spurious failures.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testDir = path.join(root, "apps", "leaderboard", "src", "__tests__");
const files = fs.readdirSync(testDir).filter((f) => f.endsWith(".test.js"));

for (const file of files) {
  console.log(`--- src/__tests__/${file} ---`);
  const result = spawnSync("bun", ["test", `src/__tests__/${file}`], {
    cwd: path.join(root, "apps", "leaderboard"),
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`\n❌ ${file} failed`);
    process.exit(1);
  }
}
