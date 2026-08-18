import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { PAGES } from "../pages.jsx";

const source = readFileSync(new URL("../assets/dashboard/site-features-ux.js", import.meta.url), "utf8");
const previewTabs = readFileSync(new URL("../assets/dashboard/preview-tabs.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../assets/site-features-ux.css", import.meta.url), "utf8");

describe("site-scoped creator UX", () => {
  it("separates Games visually without removing it from editor keyboard order", () => {
    expect(source).toContain('games.classList.add("editor-site-feature-link")');
    expect(source).toContain('games.textContent = "Games"');
    expect(source).toContain('games.setAttribute("aria-label", "Games, site feature")');
    expect(source).toContain("tabs.insertBefore(label, games)");
    expect(source).not.toContain("features.append(label, games)");
    expect(css).toContain(".editor-site-features-label");
    expect(css).toContain(".editor-step.editor-site-feature-link");
  });

  it("uses creator-facing copy on the Games page", () => {
    expect(source).toContain('title.textContent = "Games"');
    expect(source).toContain("Preview the viewer games on this site and choose which ones are available.");
    expect(PAGES.dashboard.Component({ activePath: "/dashboard/games" }).toString()).toContain('data-page="games"');
  });

  it("keeps site settings separate from account settings", () => {
    expect(source).toContain('title.textContent = "Site settings"');
    expect(source).toContain("Account, billing, team, and security stay in");
    expect(source).toContain('account.href = "/dashboard/settings"');
  });

  it("puts technical and destructive site controls behind disclosure", () => {
    expect(source).toContain('detailsAround(danger, "Danger zone"');
    expect(source).toContain('detailsAround(telegram, "Telegram notifications"');
    expect(source).toContain('detailsAround(domainConnect, "Connect a domain you already own"');
    expect(css).toContain(".site-danger-disclosure");
  });

  it("consolidates site help into Help & feedback", () => {
    expect(source).toContain('supportTab.textContent = "Help"');
    expect(source).toContain('supportTitle.textContent = "Help & feedback"');
    expect(source).toContain('/help?area=leaderboard&return=/dashboard/settings/board');
    expect(source).toContain('actions[1].hidden = true');
  });

  it("boots from the dashboard enhancement entry point", () => {
    expect(previewTabs).toContain('import { setupSiteFeaturesUx } from "./site-features-ux.js"');
    expect(previewTabs).toContain("setupSiteFeaturesUx()");
    expect(source).toContain('/assets/site-features-ux.css?v=1');
  });
});
