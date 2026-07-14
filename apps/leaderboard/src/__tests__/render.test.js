import { test, expect, describe } from "bun:test";
import { renderLeaderboard } from "../render.js";

const unconfigured = {
  brand: { name: "FreshUser", casino: "", code: "", prizePool: "", period: "Monthly" },
  players: [], socials: [], whyStats: [], partner: { chips: [], blurb: "" }, branding: {},
};

const configured = {
  brand: { name: "BigStreamer", casino: "Stake", code: "BIG", prizePool: "$10,000", period: "Monthly", ctaUrl: "https://stake.com" },
  players: [{ name: "a", wagered: 5, prize: 1 }],
  socials: [{ name: "X", handle: "@a", action: "Follow", url: "https://x.com/a", brand: "x" }],
  whyStats: [{ big: "Instant", label: "Rakeback" }],
  partner: { chips: ["Fast"], blurb: "hi" }, branding: {},
};

describe("renderLeaderboard — unconfigured board", () => {
  const html = renderLeaderboard(unconfigured, { slug: "freshuser", nonce: "n" });

  test("does not fabricate an Official Partner claim", () => {
    expect(html).not.toContain("Official Partner");
  });
  test("does not default the casino to Stake", () => {
    expect(html).not.toContain("Stake");
  });
  test("omits the partner section, exclusive code box and Join CTA", () => {
    expect(html).not.toContain('id="partner"');
    expect(html).not.toContain("Exclusive Code");
    expect(html).not.toContain(">Join now<");
    expect(html).not.toContain("Join <span");
  });
  test("omits the empty socials section", () => {
    expect(html).not.toContain('id="socials"');
  });
  test("uses a neutral title and a fallback og:image", () => {
    expect(html).toContain("<title>FreshUser — Leaderboard</title>");
    expect(html).toContain("/og.png");
  });
});

describe("renderLeaderboard — configured board", () => {
  const html = renderLeaderboard(configured, { slug: "big", nonce: "n" });

  test("keeps the Official Partner badge and casino perks", () => {
    expect(html).toContain("Official Partner");
    expect(html).toContain("Exclusive Code");
    expect(html).toContain("Stake");
  });
  test("renders the socials section when socials exist", () => {
    expect(html).toContain('id="socials"');
  });
  test("uses the casino-branded title", () => {
    expect(html).toContain("<title>BigStreamer | Stake Leaderboard</title>");
  });
});
