import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { giveawaysConfig } from "../pages/giveaways.jsx";

const source = readFileSync(new URL("../assets/giveaways-ux.js", import.meta.url), "utf8");

describe("chat giveaway creator flow", () => {
  it("loads the creator-facing enhancement", () => {
    expect(giveawaysConfig.scripts.join("\n")).toContain("/assets/giveaways-ux.js");
  });

  it("keeps the ordinary flow focused on channel, keyword, and collecting entries", () => {
    expect(source).toContain("Channel & keyword");
    expect(source).toContain("Kick channel");
    expect(source).toContain("Entry keyword");
    expect(source).toContain("Start collecting entries");
    expect(source).toContain("Draw winner");
  });

  it("moves optional matching and fair-play controls behind Advanced entry rules", () => {
    expect(source).toContain("Advanced entry rules");
    expect(source).toContain("The defaults work for a normal keyword giveaway.");
    expect(source).toContain('form.querySelector(".gw-options")');
    expect(source).toContain('form.querySelector(".gw-security-box")');
  });

  it("removes duplicate event creation and decorative winner chrome from chat", () => {
    expect(source).toContain('createEvent.hidden = true');
    expect(source).toContain("gw-idle-icon");
    expect(source).toContain("gw-winner-crown");
  });
});
