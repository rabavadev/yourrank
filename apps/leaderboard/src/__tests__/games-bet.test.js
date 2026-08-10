// Bet maths and formatting. These helpers decide what the viewer is allowed to
// stake before a request is made; the server re-validates everything.
import { describe, expect, test } from "bun:test";
import {
  applyQuickAction,
  clampToBounds,
  formatCredits,
  formatMultiplier,
  normalizeAmount,
  validateBet,
  winTier,
} from "../games/bet.ts";

const bounds = { min: 10, max: 1000, balance: 500 };

describe("normalizeAmount", () => {
  test("rejects junk and floors to whole credits", () => {
    expect(normalizeAmount(Number.NaN)).toBe(0);
    expect(normalizeAmount(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeAmount(-5)).toBe(0);
    expect(normalizeAmount(12.6)).toBe(12);
  });
});

describe("clampToBounds", () => {
  test("clamps to min, and to the lower of max and balance", () => {
    expect(clampToBounds(1, bounds)).toBe(10);
    expect(clampToBounds(9999, bounds)).toBe(500);
    expect(clampToBounds(9999, { ...bounds, balance: 100000 })).toBe(1000);
  });
});

describe("validateBet", () => {
  test("accepts an in-range amount", () => {
    expect(validateBet(50, bounds)).toEqual({ valid: true, issue: null, message: null });
  });

  test("explains each failure in the viewer's terms", () => {
    expect(validateBet(0, bounds).issue).toBe("not_a_number");
    expect(validateBet(5, bounds)).toMatchObject({ issue: "below_min", message: "Minimum bet is 10 credits." });
    expect(validateBet(2000, bounds)).toMatchObject({ issue: "above_max", message: "Maximum bet is 1,000 credits." });
    expect(validateBet(800, bounds)).toMatchObject({ issue: "insufficient", message: "You only have 500 credits." });
  });

  test("min/max messages use the site's currency word", () => {
    expect(validateBet(5, bounds, "points").message).toContain("points");
  });
});

describe("applyQuickAction", () => {
  test("half, double and max stay inside the bounds", () => {
    expect(applyQuickAction(100, "half", bounds)).toBe(50);
    expect(applyQuickAction(100, "double", bounds)).toBe(200);
    expect(applyQuickAction(400, "double", bounds)).toBe(500); // capped by balance
    expect(applyQuickAction(10, "max", bounds)).toBe(500);
    expect(applyQuickAction(10, "half", bounds)).toBe(10); // never below min
  });

  test("increment and decrement step by the given amount", () => {
    expect(applyQuickAction(100, "increment", bounds, 25)).toBe(125);
    expect(applyQuickAction(100, "decrement", bounds, 25)).toBe(75);
  });
});

describe("formatting", () => {
  test("credits are grouped and multipliers keep two decimals", () => {
    expect(formatCredits(1234567)).toBe("1,234,567");
    expect(formatMultiplier(2)).toBe("2.00×");
    expect(formatMultiplier(0)).toBe("0.00×");
  });
});

describe("winTier", () => {
  test("tiers escalate with the server's multiplier", () => {
    expect(winTier(0)).toBe("loss");
    expect(winTier(1)).toBe("push");
    expect(winTier(1.5)).toBe("small");
    expect(winTier(6)).toBe("big");
    expect(winTier(100)).toBe("huge");
  });
});
