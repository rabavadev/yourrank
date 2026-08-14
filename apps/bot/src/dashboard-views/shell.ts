import type { NavItem } from "../../../../shared/dashboard-chrome.js";

const ICONS: Record<string, string> = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  bots: '<rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 15h6"/><path d="M12 6V4"/>',
  offers: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V3"/><path d="M8 3h8"/>',
  commands: '<path d="M7 21 17 3"/><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/>',
  broadcasts: '<path d="M3 11l18-5v12L3 13v-2z"/><circle cx="11" cy="11" r="2"/>',
};

export const pageLinks = [
  { key: "overview", label: "Home", href: "/bot/dashboard", sub: "Your bot at a glance — last 14 days" },
  { key: "bots", label: "Telegram bots", href: "/bot/bots", sub: "Connect and customize your Telegram bots" },
  { key: "commands", label: "Replies & commands", href: "/bot/commands", sub: "Replies your bot sends when viewers type /something" },
  { key: "offers", label: "Tracked offers", href: "/bot/offers", sub: "Your casino links — clicks are tracked automatically" },
  { key: "broadcasts", label: "Broadcast messages", href: "/bot/broadcasts", sub: "Send a message to your subscribers" },
];

/** Telegram-local navigation; the shared suite shell owns product and account links. */
export function botNavItems(): NavItem[] {
  return [
    { group: "TELEGRAM" },
    ...pageLinks.map((p) => ({ key: p.key, label: p.label, href: p.href, icon: ICONS[p.key] })),
  ];
}

export function pageMeta(active: string): { label: string; sub: string } {
  const p = pageLinks.find((l) => l.key === active) || pageLinks[0];
  return { label: p.label, sub: p.sub };
}
