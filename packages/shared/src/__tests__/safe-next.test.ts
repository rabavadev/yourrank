import { describe, expect, it } from "bun:test";
import { isSafeNextPath, safeNextPath } from "../safe-next.js";

describe("safe next paths", () => {
  it("accepts local paths and rejects external or empty values", () => {
    expect(isSafeNextPath("/dashboard")).toBe(true);
    expect(isSafeNextPath("/dashboard?verified=1")).toBe(true);
    expect(isSafeNextPath("//evil.com")).toBe(false);
    expect(isSafeNextPath("https://evil.com")).toBe(false);
    expect(isSafeNextPath("javascript:alert(1)")).toBe(false);
    expect(isSafeNextPath("")).toBe(false);
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
  });
});
