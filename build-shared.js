// Build script to compile shared TypeScript to JavaScript for the leaderboard Worker
import { execSync } from "node:child_process";

console.log("Compiling shared TypeScript to JavaScript for leaderboard Worker...");

try {
  // Use the leaderboard app's tsconfig.json which is configured to compile shared/
  // Note: This compiles all shared/*.ts files including the new env.ts
  execSync("npx tsc --project apps/leaderboard/tsconfig.json", {
    cwd: process.cwd(),
    stdio: "inherit"
  });
  console.log("✓ All shared TypeScript files compiled successfully");
  console.log("Build complete");
} catch (error) {
  console.error("✗ TypeScript compilation failed:", error.message);
  process.exit(1);
}
