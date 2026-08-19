export function giveawayAction(activeCount) {
  return Number(activeCount) > 0
    ? { label: "Active now", href: "/dashboard/giveaways" }
    : { label: "Start a giveaway", href: "/dashboard/giveaways" };
}

export function visitsMetricState({ published, statsStatus, stats } = {}) {
  if (!published) return { kind: "unpublished", value: "Not published" };
  if (statsStatus === "loading") return { kind: "loading" };
  if (statsStatus === "ready") {
    const days = Array.isArray(stats?.days) ? stats.days : [];
    const views = days.reduce((total, day) => total + Number(day?.views || 0), 0);
    return { kind: "ready", value: views };
  }
  return { kind: "unavailable", value: "Unavailable" };
}

export function activityEmptyAction(published) {
  return published
    ? { label: "Share your site", href: "/dashboard/leaderboard/share" }
    : { label: "Publish your site", href: "/dashboard/leaderboard/setup" };
}
