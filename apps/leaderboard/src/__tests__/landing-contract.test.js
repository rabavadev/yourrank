import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../../..");
const landing = fs.readFileSync(path.join(root, "apps/leaderboard/src/pages/landing.js"), "utf8");
const css = fs.readFileSync(path.join(root, "apps/leaderboard/src/assets/landing.css"), "utf8");
const asset = fs.readFileSync(path.join(root, "apps/leaderboard/src/assets/landing.js"), "utf8");

describe("marketing landing contract", () => {
  it("keeps required SEO, anchors, legal copy, and the real product proof", () => {
    expect(landing).toContain("<h1>");
    for (const anchor of ["id=\"products\"", "id=\"goals\"", "id=\"proof\"", "id=\"pricing\""]) {
      expect(landing).toContain(anchor);
    }
    for (const legal of ["{{AFFILIATE_DISCLOSURE}}", "{{COMPANY_NAME}}", "{{SUPPORT_EMAIL}}", "18+", "For entertainment and community engagement only. YourRank does not take bets or pay prizes."]) {
      expect(landing).toContain(legal);
    }
    expect(landing).toContain('iframe src="/demo"');
    expect(landing.toLowerCase()).not.toContain("pexels.com");
  });

  it("ships the scoreboard and motion behavior as external assets", () => {
    expect(landing).toContain('id="boardRows"');
    expect(landing).toContain('src="/assets/landing.js?v=4"');
    for (const image of ["leaderboards", "kick-credits", "giveaways", "shop", "mini-games"]) {
      expect(landing).toContain(`/assets/media/${image}-640.webp`);
      expect(landing).toContain(`/assets/media/${image}-1280.webp`);
    }
    expect(landing).toContain("feature-gallery");
    expect(landing).toContain("feature-plate");
    expect(landing).toContain("feature-spine");
    expect(landing).toContain("feature-caption");
    expect(landing).toContain("aria-live=\"polite\"");
    expect(landing).toContain("Dice, mines and plinko rounds");
    expect(landing).not.toMatch(/Mini games[^<]*(?:Keno|Flip)/i);
    expect(landing).toContain("family=Archivo:wdth,wght@125,700..800");
    expect(landing).not.toContain("Archivo+Expanded");
    expect(asset).toContain("IntersectionObserver");
    expect(asset).toContain("prefers-reduced-motion");
    expect(landing).toContain('<span class="hero-word is-active">leaderboards</span><span class="hero-word">credits</span><span class="hero-word">giveaways</span><span class="hero-word">rewards</span><span class="hero-word">standings</span>');
    expect(css).toContain("--accent:#315cff");
    expect(css).toContain("object-fit:contain");
    expect(css).toContain("@media(prefers-reduced-motion:no-preference)");
    expect(css).toContain("min-height:392px");
    expect(css).toMatch(/\.reveal\{opacity:1;transform:none\}/);
    expect(css).toContain("@media print");
    const seedPoints = [...landing.matchAll(/class="points mono">([\d,]+)</g)]
      .map((match) => Number(match[1].replace(/,/g, "")));
    expect(seedPoints).toEqual([...seedPoints].sort((a, b) => b - a));
  });
});
