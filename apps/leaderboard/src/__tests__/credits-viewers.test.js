import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const creditsJs = readFileSync(new URL("../assets/credits.js", import.meta.url), "utf8");
const creditsPagesJs = readFileSync(new URL("../pages/credits-pages.js", import.meta.url), "utf8");

describe("viewer membership display", () => {
  it("shows join time and an explicit no-earnings state", () => {
    expect(creditsJs).toContain("const joined = fmtDate(v.created_at)");
    expect(creditsJs).toContain('const earned = v.last_earned_at ? fmtDate(v.last_earned_at) : "Not yet"');
    expect(creditsJs).toContain("Viewers who sign in will appear here");
    expect(creditsPagesJs).toContain("Joined / last earned");
  });
});
