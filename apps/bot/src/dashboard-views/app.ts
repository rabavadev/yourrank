import { botPageHtml } from "@yourrank/shared/page-shell";
import { dashboardChromeHtml } from "@yourrank/shared/dashboard-chrome";
import { botNavItems, pageMeta } from "./shell.js";
import { overviewPanel } from "./pages/overview.js";
import { botsPanel } from "./pages/bots.js";
import { commandsPanel } from "./pages/commands.js";
import { offersPanel } from "./pages/offers.js";
import { broadcastsPanel } from "./pages/broadcasts.js";
import { dashClientScript } from "./client-script.js";

function panelHtml(page: string, publicBaseUrl: string): string {
  switch (page) {
    case "bots": return botsPanel();
    case "commands": return commandsPanel();
    case "offers": return offersPanel(publicBaseUrl);
    case "broadcasts": return broadcastsPanel();
    case "overview":
    default: return overviewPanel();
  }
}

export function appHtml(
  user: { display_name: string; email: string; plan: string },
  publicBaseUrl: string,
  nonce?: string,
  page = "overview",
  nav?: string
): string {
  const meta = pageMeta(page);
  // The Telegram pages render in the leaderboard dashboard's shell (same rail,
  // topbar and account menu) instead of a second, older-looking one.
  const chrome = dashboardChromeHtml({
    nav: botNavItems(),
    active: page,
    navLabel: "Telegram",
    headLabel: "Telegram",
    headName: user.display_name || "Streamer",
    headMeta: `${(user.plan || "free").replace(/^./, (c) => c.toUpperCase())} plan`,
    productLinks: [
      { label: "Sites", href: "/dashboard" },
      { label: "Telegram", href: "/bot/dashboard", active: true },
      { label: "Credits & Shop", href: "/dashboard/rewards/redemptions" },
    ],
    title: meta.label,
    subtitle: meta.sub,
    crumbs: [
      { label: "Telegram", href: "/bot/dashboard" },
      { label: meta.label },
    ],
    user,
    activePath: "/bot/dashboard",
    logoutAction: "/bot/auth/logout",
    // Each Telegram page is its own document (nav links are full loads), so
    // render only the active panel. This keeps one panel's slow or failed data
    // from bloating or breaking the others, and matches the SPA section model
    // the leaderboard dashboard already uses.
    content: panelHtml(page, publicBaseUrl),
  });
  return botPageHtml({
    user,
    page,
    nonce,
    nav,
    dashboardChrome: true,
    content: `${chrome}
${dashClientScript()}`,
  });
}
