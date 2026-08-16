import { readdir, readFile } from "node:fs/promises";

const allowed = new Map([
  ["packages/shared/src/__tests__/session.test.ts", "Session tests need an in-memory DB fake"],
  ["apps/bot/src/__tests__/bot-commands.test.ts", "Bot command tests need DB and crypto fakes"],
  ["apps/bot/src/__tests__/bot-engine.test.ts", "Conversion tests need DB and crypto fakes"],
  ["apps/bot/src/__tests__/dashboard.test.ts", "Dashboard route tests need DB, crypto, and Telegram fakes"],
  ["apps/bot/src/__tests__/plans-rollup.test.ts", "Plan and rollup tests need DB and crypto fakes"],
  ["apps/leaderboard/src/__tests__/audit-validation.test.js", "Legacy isolated test with no safe production seam"],
  ["apps/leaderboard/src/__tests__/credits-loop.test.js", "Legacy isolated test with no safe production seam"],
  ["apps/leaderboard/src/__tests__/sites-handlers.test.js", "Legacy isolated test with no safe production seam"],
]);

const roots = [
  "packages/shared/src/__tests__",
  "apps/bot/src/__tests__",
  "apps/monitor/src/__tests__",
  "apps/leaderboard/src/__tests__",
];
const extensions = /\.(?:js|jsx|ts|tsx)$/;
const offenders = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      await walk(path);
    } else if (extensions.test(entry.name)) {
      const source = await readFile(path, "utf8");
      if (/\bmock\.module\s*\(/.test(source) && !allowed.has(path)) offenders.push(path);
    }
  }
}

for (const root of roots) await walk(root);

if (offenders.length) {
  console.error("Global module mocks are disallowed in shared, Worker, and leaderboard tests:");
  for (const file of offenders) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Global test-mock guard passed (${allowed.size} documented legacy files).`);
