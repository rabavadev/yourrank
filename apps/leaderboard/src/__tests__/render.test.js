import { test, expect, describe } from "bun:test";
import { renderLeaderboard } from "../render.jsx";

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

describe("renderLeaderboard — unconfigured board", async () => {
  const html = await renderLeaderboard(unconfigured, { slug: "freshuser", nonce: "n" });

  test("does not fabricate an Official Partner claim", async () => {
    expect(html).not.toContain("Official Partner");
  });
  test("does not default the casino to Stake", async () => {
    expect(html).not.toContain("Stake");
  });
  test("omits the partner section, exclusive code box and Join CTA", async () => {
    expect(html).not.toContain('id="partner"');
    expect(html).not.toContain("Exclusive Code");
    expect(html).not.toContain(">Join now<");
    expect(html).not.toContain("Join <span");
  });
  test("omits the empty socials section", async () => {
    expect(html).not.toContain('id="socials"');
  });
  test("uses a neutral title and a fallback og:image", async () => {
    expect(html).toContain("<title>FreshUser — Leaderboard</title>");
    expect(html).toContain("/og.png");
  });
});

describe("renderLeaderboard — configured board", async () => {
  const html = await renderLeaderboard(configured, { slug: "big", nonce: "n" });

  test("keeps the Official Partner badge and casino perks", async () => {
    expect(html).toContain("Official Partner");
    expect(html).toContain("Exclusive Code");
    expect(html).toContain("Stake");
  });
  test("renders the socials section when socials exist", async () => {
    expect(html).toContain('id="socials"');
  });
  test("uses the casino-branded title", async () => {
    expect(html).toContain("<title>BigStreamer | Stake Leaderboard</title>");
  });
});

describe("renderLeaderboard — multi-board hub tabs", async () => {
  const boards = [
    { slug: "sponsora", name: "Sponsor A" },
    { slug: "sponsorb", name: "Sponsor B" },
    { slug: "sponsorc", name: "Sponsor C" },
  ];

  test("renders a tab per published board with the current one active", async () => {
    const html = await renderLeaderboard(configured, { slug: "sponsorb", nonce: "n", boards });
    expect(html).toContain('class="board-tabs"');
    expect(html).toContain('href="/sponsora"');
    expect(html).toContain('href="/sponsorc"');
    expect(html).toContain('board-tab board-tab--active" aria-current="page" href="/sponsorb"');
  });

  test("omits the tab strip when the streamer has a single board", async () => {
    const html = await renderLeaderboard(configured, { slug: "sponsora", nonce: "n", boards: [boards[0]] });
    expect(html).not.toContain('class="board-tabs"');
  });

  test("omits the tab strip when no boards are passed (e.g. custom domain)", async () => {
    const html = await renderLeaderboard(configured, { slug: "big", nonce: "n" });
    expect(html).not.toContain('class="board-tabs"');
  });
});
