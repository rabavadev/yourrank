import { describe, expect, it } from "bun:test";
import { validatePassword } from "../password-rules.js";

describe("validatePassword", () => {
  it("accepts a password meeting all advertised rules", () => {
    expect(validatePassword("Secure9!")).toEqual({ ok: true, message: "" });
  });

  it("rejects each advertised rule with a specific message", () => {
    expect(validatePassword("Short9!").message).toContain("8 characters");
    expect(validatePassword("lowercase9!").message).toContain("upper and lower");
    expect(validatePassword("NoNumber!").message).toContain("number");
    expect(validatePassword("NoSymbol9").message).toContain("symbol");
  });
});
