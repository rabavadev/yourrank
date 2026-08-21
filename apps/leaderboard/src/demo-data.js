// Shared demo leaderboard data — used by /demo page, /go/demo redirect,
// /demo overlay, and /api/public/demo* API endpoints.
export function demoLeaderboardData() {
  return {
    brand: {
      name: "Demo Challenge",
      casino: "",
      code: "",
      ctaUrl: "",
      prizePool: "$500",
      period: "Monthly",
      tagline: "A sample cash-prize challenge for any streamer.",
      resetNote: "",
      blurb: "This is a demo board. Create your own and replace these players with your community.",
    },
    prizes: {
      prizePoolLabel: "Prize pool",
      currency: "$",
      payoutsLabel: "Payouts",
      wagerLabel: "Score",
      prizeLabel: "Prize",
      wagerTotalLabel: "Total Score",
    },
    branding: { hasLogo: false },
    players: [
      { name: "Alex", wagered: 9500, prize: 250 },
      { name: "Bree", wagered: 7200, prize: 150 },
      { name: "Casey", wagered: 5400, prize: 100 },
      { name: "Drew", wagered: 3100, prize: 0 },
      { name: "Ellis", wagered: 1800, prize: 0 },
    ],
    shopItems: [
      { id: "demo-vip", name: "VIP chat badge", description: "Stand out in chat for one stream.", cost: 250, stock: null, active: true },
      { id: "demo-shoutout", name: "Live shoutout", description: "A personal shoutout on the next stream.", cost: 400, stock: 8, active: true },
      { id: "demo-song", name: "Song request", description: "Choose the next track in the demo queue.", cost: 600, stock: 4, active: true },
      { id: "demo-cohost", name: "Community co-host", description: "Join a future community segment.", cost: 1000, stock: 2, active: true },
    ],
    demoActivity: [
      { kind: "SCORE UPDATE", text: "Alex moved into first place.", when: "12m ago" },
      { kind: "REWARD REDEEMED", text: "Bree redeemed a Live shoutout.", when: "38m ago" },
      { kind: "GIVEAWAY", text: "The Demo Drop giveaway is live.", when: "1h ago" },
    ],
    demoGiveaway: {
      name: "Demo Drop",
      prize: "$100",
      entries: "128 entries",
      ends: "Ends in 2h 14m",
    },
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    rules: [
      "Leaderboard resets automatically each period.",
      "Scores update instantly when posted via the dashboard or API.",
      "Rewards are set by the board owner and displayed for entertainment.",
    ],
    whyStats: [],
    socials: [],
    archives: [],
  };
}
