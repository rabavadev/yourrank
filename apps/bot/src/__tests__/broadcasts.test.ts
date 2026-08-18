import { describe, expect, it } from "bun:test";
import { broadcastAtStart, buildBroadcastTotalCountUpdate } from "../broadcasts.js";

describe("broadcast batch helpers", () => {
  it("aligns segmented total-count placeholders with their params", () => {
    const update = buildBroadcastTotalCountUpdate(
      { language: "en" },
      "bot-1",
      "broadcast-1",
    );

    expect(update.text).toContain("bs.language = $2");
    expect(update.text).toContain("WHERE id = $3");
    expect(update.params).toEqual(["bot-1", "en", "broadcast-1"]);
  });

  it("recognizes postgres.js bigint strings as the first cursor", () => {
    expect(broadcastAtStart("0")).toBe(true);
    expect(broadcastAtStart(0)).toBe(true);
    expect(broadcastAtStart("42")).toBe(false);
  });
});
