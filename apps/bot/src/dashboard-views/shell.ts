import type { NavItem } from "../../../../shared/dashboard-chrome.js";

const ICONS: Record<string, string> = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  bots: '<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 15h6"/><path d="M12 6V4"/>',
  offers: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V3"/><path d="M8 3h8"/>',
  commands: '<path d="M7 21 17 3"/><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/>',
  broadcasts: '<path d="M3 11l18-5v12L3 13v-2z"/><circle cx="11" cy="11" r="2"/>',
};

export const pageLinks = [
  { key: "overview", label: "Overview", href: "/bot/dashboard", sub: "Your bot at a glance — last 14 days" },
  { key: "bots", label: "Bots", href: "/bot/bots", sub: "Connect and customize your Telegram bots" },
  { key: "offers", label: "Offers", href: "/bot/offers", sub: "Your casino links — clicks are tracked automatically" },
  { key: "commands", label: "Commands", href: "/bot/commands", sub: "Replies your bot sends when viewers type /something" },
  { key: "broadcasts", label: "Broadcasts", href: "/bot/broadcasts", sub: "Send a message to your subscribers" },
];

/**
 * The Telegram pages sit in the same rail as the leaderboard dashboard, under
 * their own group, with a link back to the board dashboard so /bot/* is never
 * a dead end.
 */
export function botNavItems(): NavItem[] {
  return [
    { key: "back", label: "Back to board dashboard", href: "/dashboard", icon: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>' },
    { group: "TELEGRAM" },
    ...pageLinks.map((p) => ({ key: p.key, label: p.label, href: p.href, icon: ICONS[p.key] })),
    { group: "ACCOUNT" },
    { key: "account", label: "Account settings", href: "/dashboard/settings", icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  ];
}

export function pageMeta(active: string): { label: string; sub: string } {
  const p = pageLinks.find((l) => l.key === active) || pageLinks[0];
  return { label: p.label, sub: p.sub };
}
