import { describe, expect, it } from "bun:test";
import { resolveContactType } from "../assets/contact-context.js";

describe("contact context resolution", () => {
  it("uses explicit support and feedback context before server fallback", () => {
    for (const explicit of ["support", "feedback"]) {
      expect(resolveContactType({ helpTab: explicit, serverType: "feedback" })).toBe(explicit);
      expect(resolveContactType({ queryType: explicit, serverType: "support" })).toBe(explicit);
    }
  });

  it("preserves each server-rendered form variant when no explicit context exists", () => {
    expect(resolveContactType({ serverType: "feedback" })).toBe("feedback");
    expect(resolveContactType({ serverType: "support" })).toBe("support");
  });

  it("falls back to support only when no context is present", () => {
    expect(resolveContactType()).toBe("support");
    expect(resolveContactType({ helpTab: "unknown", queryType: "other", serverType: "unknown" })).toBe("support");
  });
});
