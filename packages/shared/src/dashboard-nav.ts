import type { NavItem } from "./dashboard-chrome.js";

const NAV_ICONS = {
  players: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  design: '<path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.5a2.5 2.5 0 0 1-2.5-2.5V6a3 3 0 0 0-3-3z"/><circle cx="7.5" cy="10.5" r=".5"/><circle cx="10.5" cy="7.5" r=".5"/><circle cx="7.5" cy="15.5" r=".5"/>',
  games: '<path d="M6 11h4M8 9v4"/><path d="M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7v4.6A4.7 4.7 0 0 0 6.7 19h10.6a4.7 4.7 0 0 0 4.7-4.7V9.7A4.7 4.7 0 0 0 17.3 5z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  giveaways: '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  shop: '<path d="M3 9l2-5h14l2 5"/><path d="M5 13v7h14v-7M9 20v-5h6v5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  boards: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  viewers: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 18h.01"/>',
};

const GEAR_ICON = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

const DASHBOARD_NAV: NavItem[] = [
  { key: "home", label: "Home", href: "/dashboard", icon: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>', productKey: "sites" },
  { key: "board", label: "My leaderboard", href: "/dashboard/leaderboard/players", icon: NAV_ICONS.players },
  { key: "board", label: "Basics", href: "/dashboard/leaderboard/setup", hash: "setup", child: true },
  { key: "board", label: "Players & scores", href: "/dashboard/leaderboard/players", hash: "players", child: true },
  { key: "board", label: "Look", href: "/dashboard/leaderboard/design", hash: "design", child: true },
  { key: "board", label: "Share", href: "/dashboard/leaderboard/share", hash: "share", child: true },
  { key: "board", label: "Past winners", href: "/dashboard/leaderboard/history", hash: "history", child: true },
  { key: "board", label: "Mini-games", href: "/dashboard/games", hash: "games", child: true },
  { key: "giveaways", label: "Giveaways", href: "/dashboard/giveaways/chat", icon: NAV_ICONS.giveaways },
  { key: "giveaways", label: "Chat giveaways", href: "/dashboard/giveaways/chat", hash: "chat", child: true },
  { key: "giveaways", label: "Ticket raffles", href: "/dashboard/giveaways/raffles", hash: "raffles", child: true },
  { key: "giveaways", label: "Code drops", href: "/dashboard/giveaways/drops", hash: "drops", child: true },
  { key: "giveaways", label: "Predictions", href: "/dashboard/giveaways/preds", hash: "preds", child: true },
  { key: "redemptions", label: "Rewards", href: "/dashboard/rewards/redemptions", icon: NAV_ICONS.shop, productKey: "credits" },
  { key: "redemptions", label: "Prize orders", href: "/dashboard/rewards/redemptions", hash: "redemptions", child: true },
  { key: "redemptions", label: "Shop", href: "/dashboard/rewards/shop", hash: "shop", child: true },
  { key: "redemptions", label: "How viewers earn points", href: "/dashboard/rewards/rules", hash: "rules", child: true },
  { key: "redemptions", label: "Kick connection", href: "/dashboard/rewards/channel", hash: "channel", child: true },
  { key: "redemptions", label: "Viewers", href: "/dashboard/audience/viewers", hash: "viewers", child: true },
  { key: "redemptions", label: "Activity", href: "/dashboard/audience/activity", hash: "activity", child: true },
  { key: "telegram", label: "Telegram", href: "/dashboard/telegram", icon: NAV_ICONS.share, productKey: "telegram" },
  { key: "telegram", label: "Overview", href: "/dashboard/telegram", hash: "overview", child: true },
  { key: "telegram", label: "Bot", href: "/dashboard/telegram/bots", hash: "bots", child: true },
  { key: "telegram", label: "Replies", href: "/dashboard/telegram/commands", hash: "commands", child: true },
  { key: "telegram", label: "Offers", href: "/dashboard/telegram/offers", hash: "offers", child: true },
  { key: "telegram", label: "Messages", href: "/dashboard/telegram/broadcasts", hash: "broadcasts", child: true },
  { key: "performance", label: "How it's going", href: "/dashboard/analytics/activity", icon: NAV_ICONS.viewers },
  { key: "performance", label: "Visitors", href: "/dashboard/analytics/activity", hash: "activity", child: true },
  { key: "performance", label: "Where they came from", href: "/dashboard/analytics/referrals", hash: "referrals", child: true },
  { key: "performance", label: "Events", href: "/dashboard/analytics/events", hash: "events", child: true },
  { key: "boards", label: "Your leaderboards", href: "/dashboard/leaderboards", icon: NAV_ICONS.boards },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: GEAR_ICON },
  { key: "settings", label: "This site", href: "/dashboard/settings/board", hash: "board", child: true },
  { key: "settings", label: "Account", href: "/dashboard/settings/account", hash: "account", child: true },
  { key: "settings", label: "Team", href: "/dashboard/settings/team", hash: "team", child: true },
  { key: "settings", label: "Plan", href: "/dashboard/settings/plan", hash: "plan", child: true },
  { key: "settings", label: "Connected apps", href: "/dashboard/settings/connections", hash: "connections", child: true },
  { key: "settings", label: "Data", href: "/dashboard/settings/data", hash: "data", child: true },
  { key: "help", label: "Help", href: "/help", icon: NAV_ICONS.help },
];

export function dashboardNavItems(): NavItem[] {
  return DASHBOARD_NAV.map((item) => ({ ...item }));
}
