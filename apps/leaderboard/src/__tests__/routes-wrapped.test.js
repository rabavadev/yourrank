// Regression guard: every route entry in routes.js must be wrapped with withHandler().
//
// Rather than importing routes.js at runtime (which pulls in the full handler
// tree and requires mocking the database, KV, and session layers), this test
// reads routes.js as text and performs a structural assertion:
//
//   Every `handler:` value in the ROUTES array must be `withHandler(<name>)`,
//   not a bare function reference.
//
// This catches the mistake of adding a new route without the safety wrapper
// without requiring any live infrastructure. If the wrapping moves elsewhere
// (e.g. per-handler at export time), update the regex below.
//
// Run: bun test src/__tests__/routes-wrapped.test.js

import { test, expect, describe } from "bun:test";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const routesPath = resolve(__dirname, "../routes.js");
const source = readFileSync(routesPath, "utf8");

describe("routes.js — withHandler regression", () => {
  test("withHandler is imported from middleware/handler.js", () => {
    expect(source).toContain('import { withHandler } from "./middleware/handler.js"');
  });

  test("no bare handler: <fn> entries exist (all must be wrapped)", () => {
    // Match any `handler:` value that is NOT withHandler(...)
    // e.g.  handler: handleFoo   ← should not exist
    //        handler: withHandler(handleFoo)   ← fine
    const bareHandler = /handler:\s+(?!withHandler\()\w+/g;
    const matches = source.match(bareHandler) ?? [];

    if (matches.length > 0) {
      throw new Error(
        `Found ${matches.length} unwrapped handler(s) in routes.js:\n` +
        matches.map(m => `  ${m.trim()}`).join("\n") + "\n\n" +
        "Fix: change  handler: handleFoo  →  handler: withHandler(handleFoo)"
      );
    }

    expect(matches.length).toBe(0);
  });

  test("withHandler call count matches handler: entry count", () => {
    const handlerEntries = (source.match(/handler:/g) ?? []).length;
    const withHandlerCalls = (source.match(/withHandler\(/g) ?? []).length;

    // Every handler: entry must have exactly one withHandler() call.
    // If these drift apart someone added a handler: without a wrapper.
    expect(withHandlerCalls).toBe(handlerEntries);
  });
});
