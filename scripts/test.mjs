import { spawnSync } from "child_process";

// A cross-platform test runner that replaces the bash 'for' loops in package.json
function runCmd(command, args, cwd) {
  console.log(`\n> Running: ${command} ${args.join(" ")} in ${cwd || "."}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n❌ Command failed with exit code ${result.status}`);
    process.exit(1);
  }
}

// 1. Run shared tests
runCmd("bun", ["test", "shared/__tests__/"]);

// 2. Run bot tests
runCmd("bun", ["test"], "apps/bot");

// 3. Run leaderboard tests one by one to avoid mock.module cross-contamination
runCmd("node", ["scripts/test-leaderboard.mjs"]);

// 4. Run monitor tests
runCmd("bun", ["run", "test"], "apps/monitor");

console.log("\n✅ All tests passed successfully!");
