import { describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dir, "../../../..");
const landing = fs.readFileSync(path.join(root, "apps/leaderboard/src/pages/landing.js"), "utf8");
const css = fs.readFileSync(path.join(root, "apps/leaderboard/src/assets/landing.css"), "utf8");
const asset = fs.readFileSync(path.join(root, "apps/leaderboard/src/assets/landing.js"), "utf8");

describe("marketing landing contract", () => {
  it("keeps required SEO, anchors, legal copy, and the real product proof", () => {
    expect(landing).toContain("<h1");
    for (const anchor of ["id=\"mechanism\"", "id=\"products\"", "id=\"proof\"", "id=\"pricing\""]) {
      expect(landing).toContain(anchor);
    }
    for (const legal of ["{{AFFILIATE_DISCLOSURE}}", "{{COMPANY_NAME}}", "{{SUPPORT_EMAIL}}", "18+", "For entertainment and community engagement only. YourRank does not take bets or pay prizes."]) {
      expect(landing).toContain(legal);
    }
    expect(landing).toContain('iframe src="/demo"');
    expect(landing.toLowerCase()).not.toContain("pexels.com");
  });

  it("ships a restrained product-proof hero with matching CSS and one purposeful motion", () => {
    expect(landing).toContain('data-redesign="product-proof-hero-v1"');
    expect(landing).toContain('class="wrap hero-proof-layout"');
    expect(landing).toContain('class="devin-showcase-frame"');
    expect(landing).toContain('class="community-loop-section"');
    expect(landing).toContain('data-community-loop');
    expect(landing).toContain('class="community-loop-map"');
    expect(landing).toContain("Sites lead to Telegram, Telegram leads to Credits and Shop");
    expect(landing).toContain("Turn viewers into a community that returns.");
    expect(landing).toContain('src="/assets/landing.js?v=4"');
    expect(landing).not.toContain("signal-command-center-v1");
    for (const removed of ["command-center", "hero-grid", "hero-aura", "signal-map", "signal-event", "hero-index"]) {
      expect(landing).not.toContain(removed);
      expect(css).not.toContain(`.${removed}`);
    }
    for (const image of ["leaderboards", "kick-credits", "giveaways", "shop", "mini-games"]) {
      expect(landing).toContain(`/assets/media/${image}-640.webp`);
      expect(landing).toContain(`/assets/media/${image}-1280.webp`);
    }
    expect(landing).toContain("product-chapters");
    expect(landing).toContain("product-chapter");
    expect(landing).toContain("chapter-media");
    expect(landing).not.toContain("feature-gallery");
    expect(landing).toContain("Dice, mines and plinko rounds");
    expect(landing).not.toMatch(/Mini games[^<]*(?:Keno|Flip)/i);
    expect(landing).toContain("family=Archivo:wdth,wght@125,700..800");
    expect(landing).not.toContain("Archivo+Expanded");
    expect(asset).toContain("community-loop");
    expect(css).toContain(".hero-proof-layout{");
    expect(css).toContain("body{min-width:0}");
    expect(css).toContain("object-fit:contain");
    expect(css).toContain("@media(prefers-reduced-motion:reduce)");
    expect(css).toMatch(/\.reveal\{opacity:1;transform:none\}/);
    expect(css).toContain("@media print");
  });
});
