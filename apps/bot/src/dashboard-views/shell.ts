import type { NavItem } from "@yourrank/shared/dashboard-chrome";
import { dashboardNavItems } from "@yourrank/shared/dashboard-nav";

export const pageLinks = [
  { key: "overview", label: "Overview", href: "/dashboard/telegram", sub: "Your messaging setup and recent activity" },
  { key: "bots", label: "Bot", href: "/dashboard/telegram/bots", sub: "Connect and manage your Telegram bot" },
  { key: "commands", label: "Auto replies", href: "/dashboard/telegram/commands", sub: "Automatic replies your bot sends to viewer commands" },
  { key: "offers", label: "Offers", href: "/dashboard/telegram/offers", sub: "Create and manage shareable tracked offers" },
  { key: "broadcasts", label: "Broadcasts", href: "/dashboard/telegram/broadcasts", sub: "Send updates to your subscribers" },
];

/** Shared dashboard navigation with Messaging's pages nested under its product entry. */
export function botNavItems(): NavItem[] {
  return dashboardNavItems();
}

export function pageMeta(active: string): { label: string; sub: string } {
  const p = pageLinks.find((l) => l.key === active) || pageLinks[0];
  return { label: p.label, sub: p.sub };
}
