// A failed request used to leave the panel's empty copy on screen, so "the
// network is down" and "you have no payments" were the same screen. Panels that
// can fail must say they failed and offer the retry.
import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const assets = path.resolve(import.meta.dir, "../assets");
const read = (f) => fs.readFileSync(path.join(assets, f), "utf8");
const utils = read("dashboard/utils.js");
const site = read("dashboard/site.js");
const performance = read("dashboard/performance.js");
const ui = read("ui.css");
const botClient = fs.readFileSync(path.resolve(import.meta.dir, "../../../bot/src/dashboard-views/client-script.ts"), "utf8");

describe("empty and error states", () => {
  it("has one definition of each", () => {
    expect(ui).toMatch(/^\.empty \{/m);
    expect(ui).toMatch(/^\.empty--error \{/m);
    expect(ui).toMatch(/^\.error-state \{/m);
  });

  it("keeps the panel's own empty copy so a retry can restore it", () => {
    expect(utils).toContain("el.dataset.emptyHtml = el.innerHTML");
    expect(utils).toContain("export function clearLoadError");
    expect(utils).toContain('textContent = "Try again"');
  });

  const failing = [
    ["billing history", site, /loadHistory[\s\S]*?showLoadError\(empty, "your payment history", loadHistory\)/],
    ["stats", site, /showLoadError\(\$\("statsEmpty"\), "your stats", loadStats\)/],
    ["overview chart", site, /showLoadError\(\$\("ov_barsEmpty"\), "your stats", loadStats\)/],
    ["traffic sources", performance, /showLoadError\(\$\("perfReferrersEmpty"\), "your traffic sources", loadHeatmap\)/],
  ];
  for (const [what, source, pattern] of failing) {
    it(`${what} distinguishes a failed load from an empty one`, () => {
      expect(source).toMatch(pattern);
    });
  }

  it("does not hide the empty node by hand any more", () => {
    // `empty.hidden = rows.length > 0` cannot tell the two states apart.
    expect(site).not.toMatch(/\bempty\.hidden\s*=/);
    expect(performance).not.toMatch(/\bempty\.hidden\s*=/);
  });

  it("the bot dashboard uses the same error component", () => {
    expect(botClient).toContain('class="empty empty--error"');
    expect(botClient).toContain("Try again");
  });
});
