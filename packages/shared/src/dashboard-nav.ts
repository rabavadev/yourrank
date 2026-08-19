import type { NavItem } from "./dashboard-chrome.js";

const NAV_ICONS = {
  players: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  design: '<path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.5a2.5 2.5 0 0 1-2.5-2.5V6a3 3 0 0 0-3-3z"/><circle cx="7.5" cy="10.5" r=".5"/><circle cx="10.5" cy="7.5" r=".5"/><circle cx="7.5" cy="15.5" r=".5"/>',
  games: '<path d="M6 11h4M8 9v4"/><path d="M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7A4.7 4.7 0 0 0 2 9.7v4.6A4.7 4.7 0 0 0 6.7 19h10.6a4.7 4.7 0 0 0 4.7-4.7V9.7A4.7 4.7 0 0 0 17.3 5z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
  boards: '<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>',
  giveaways: '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  shop: '<path d="M3 9l2-5h14l2 5"/><path d="M5 13v7h14v-7M9 20v-5h6v5"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  viewers: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
};

const GEAR_ICON = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';

const DASHBOARD_NAV: NavItem[] = [
  { key: "home", label: "Home", href: "/dashboard", icon: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>', productKey: "sites" },
  { key: "board", label: "Leaderboard", href: "/dashboard/leaderboard/setup", icon: NAV_ICONS.players },
  {
    key: "engage",
    label: "Engage",
    kind: "group",
    children: [
      { key: "giveaways", label: "Giveaways", href: "/dashboard/giveaways/chat", icon: NAV_ICONS.giveaways },
      { key: "raffles", label: "Raffles", href: "/dashboard/giveaways/raffles", icon: NAV_ICONS.giveaways },
      { key: "predictions", label: "Predictions", href: "/dashboard/giveaways/preds", icon: NAV_ICONS.viewers },
      { key: "drops", label: "Drops", href: "/dashboard/giveaways/drops", icon: NAV_ICONS.share },
    ],
  },
  { key: "games", label: "Games", href: "/dashboard/games", icon: NAV_ICONS.games },
  { key: "redemptions", label: "Rewards", href: "/dashboard/rewards/redemptions", icon: NAV_ICONS.shop, productKey: "credits" },
  {
    key: "audience",
    label: "Audience",
    kind: "group",
    children: [
      { key: "performance", label: "Analytics", href: "/dashboard/analytics/activity", icon: NAV_ICONS.viewers },
      { key: "telegram", label: "Telegram", href: "/dashboard/telegram", icon: NAV_ICONS.share, productKey: "telegram" },
    ],
  },
  { key: "site", label: "Site", href: "/dashboard/settings/board", icon: NAV_ICONS.boards },
  { key: "settings", label: "Settings", href: "/dashboard/settings", icon: GEAR_ICON },
];

export const NAV_OWNER_MAP = {
  board: "board",
  leaderboard: "board",
  giveaways: "giveaways",
  raffles: "raffles",
  predictions: "predictions",
  drops: "drops",
  games: "games",
  activity: "performance",
  referrals: "performance",
  performance: "performance",
  redemptions: "redemptions",
  shop: "redemptions",
  rules: "redemptions",
  channel: "redemptions",
  rewards: "redemptions",
  viewers: "redemptions",
  audience: "redemptions",
  history: "redemptions",
  boards: "site",
  site: "site",
  settings: "settings",
  account: "settings",
  team: "settings",
  plan: "settings",
  connections: "settings",
  data: "settings",
  integrations: "settings",
  billing: "settings",
} as const;

export function navOwner(nav: string | null | undefined): string {
  return NAV_OWNER_MAP[nav as keyof typeof NAV_OWNER_MAP] || nav || "home";
}

export function dashboardNavItems(): NavItem[] {
  return DASHBOARD_NAV.map((item) => ({ ...item }));
}
