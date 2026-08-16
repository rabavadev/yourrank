import type { NavItem } from "@yourrank/shared/dashboard-chrome";

const ICONS: Record<string, string> = {
  overview: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  bots: '<rect width="16" height="12" x="4" y="8" rx="2"/><path d="M12 2v6M9 2h6M2 14h2M20 14h2M9 13v2M15 13v2"/>',
  offers: '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><circle cx="7" cy="7" r=".5" fill="currentColor"/>',
  commands: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="m8 10 2 2-2 2M13 14h3"/>',
  broadcasts: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
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
