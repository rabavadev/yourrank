// Confirmations, prompts and the broadcast preview each shipped their own
// dialog: three focus traps, three sets of ARIA wiring. There is one now, in
// /assets/dialog.js, and both Workers load it.
import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const assetsDir = path.resolve(import.meta.dir, "../assets");
const dialog = fs.readFileSync(path.join(assetsDir, "dialog.js"), "utf8");
const utils = fs.readFileSync(path.join(assetsDir, "dashboard/utils.js"), "utf8");
const botClient = fs.readFileSync(path.resolve(import.meta.dir, "../../../bot/src/dashboard-views/client-script.ts"), "utf8");
const botShell = fs.readFileSync(path.resolve(import.meta.dir, "../../../../shared/page-shell.ts"), "utf8");

describe("the dialog primitive", () => {
  it("traps Tab, closes on Escape and restores focus", () => {
    expect(dialog).toContain('e.key === "Escape"');
    expect(dialog).toContain('e.key !== "Tab"');
    expect(dialog).toContain("trigger.focus()");
    // A trap that only watches its own edges lets focus out the moment the user
    // clicks the page behind it; this pulls it back.
    expect(dialog).toContain("if (!el.contains(document.activeElement))");
  });

  it("labels itself for a screen reader", () => {
    expect(dialog).toContain('setAttribute("role", "dialog")');
    expect(dialog).toContain('setAttribute("aria-modal", "true")');
    expect(dialog).toContain('setAttribute("aria-labelledby", titleId)');
  });

  it("is the only implementation", () => {
    // Both Workers delegate; neither builds an overlay of its own any more.
    expect(utils).toContain("window.YRDialog");
    expect(utils).not.toContain('className = "modal"');
    expect(botClient).toContain("window.YRDialog.confirm");
    expect(botClient).not.toContain("position:fixed;inset:0;background:rgba(17,17,20,.45)");
    // The broadcast preview keeps its own markup but shares the trap.
    expect(botClient).toContain("window.YRDialog.trap");
    expect(botClient.match(/e\.key === 'Tab'/g)).toBeNull();
  });

  it("is loaded by the bot dashboard", () => {
    expect(botShell).toContain('<script src="/assets/dialog.js" defer></script>');
  });
});
