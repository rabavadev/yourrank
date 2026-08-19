import type { NavItem } from "@yourrank/shared/dashboard-chrome";
import { dashboardNavItems } from "@yourrank/shared/dashboard-nav";



export const pageLinks = [
  { key: "overview", label: "Overview", href: "/dashboard/telegram", sub: "Your bot at a glance — last 14 days" },
  { key: "bots", label: "Bots", href: "/dashboard/telegram/bots", sub: "Connect and customize your Telegram bot" },
  { key: "commands", label: "Replies", href: "/dashboard/telegram/commands", sub: "Replies your bot sends when viewers type /something" },
  { key: "offers", label: "Offers", href: "/dashboard/telegram/offers", sub: "Your tracked offers — clicks are tracked automatically" },
  { key: "broadcasts", label: "Messages", href: "/dashboard/telegram/broadcasts", sub: "Send a message to your subscribers" },
];

/** Shared dashboard navigation with Telegram's pages nested under its product entry. */
export function botNavItems(): NavItem[] {
  return dashboardNavItems();
}

export function pageMeta(active: string): { label: string; sub: string } {
  const p = pageLinks.find((l) => l.key === active) || pageLinks[0];
  return { label: p.label, sub: p.sub };
}
