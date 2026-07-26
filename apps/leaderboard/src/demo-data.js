// Shared demo leaderboard data — used by /demo page, /go/demo redirect,
// /demo overlay, and /api/public/demo* API endpoints.
export function demoLeaderboardData() {
  return {
    brand: {
      name: "Demo Race",
      casino: "",
      code: "",
      ctaUrl: "",
      prizePool: "$500",
      period: "Monthly",
      tagline: "A sample leaderboard for any community.",
      resetNote: "",
      blurb: "This is a demo race. Create your own board and replace these players with your community.",
    },
    branding: { hasLogo: false },
    players: [
      { name: "Alex", wagered: 9500, prize: 250 },
      { name: "Bree", wagered: 7200, prize: 150 },
      { name: "Casey", wagered: 5400, prize: 100 },
      { name: "Drew", wagered: 3100, prize: 0 },
      { name: "Ellis", wagered: 1800, prize: 0 },
    ],
    endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    rules: [
      "Leaderboard resets automatically each period.",
      "Scores update instantly when posted via the dashboard or API.",
      "Prizes are set by the board owner and displayed for entertainment.",
    ],
    whyStats: [],
    socials: [],
    archives: [],
  };
}
