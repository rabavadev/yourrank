import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const dir = "apps/leaderboard/src/__tests__";
const allowlisted = new Set([
  "audit-validation.test.js",
  "credits-loop.test.js",
  "sites-handlers.test.js",
]);
const files = (await readdir(dir)).filter((name) => name.endsWith(".js"));
const offenders = [];
for (const file of files) {
  const source = await readFile(join(dir, file), "utf8");
  if (/\bmock\.module\s*\(/.test(source) && !allowlisted.has(file)) offenders.push(join(dir, file));
}
if (offenders.length) {
  console.error("Global module mocks are disallowed in leaderboard tests:");
  for (const file of offenders) console.error(`- ${file}`);
  process.exit(1);
}
