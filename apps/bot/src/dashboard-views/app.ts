import { botPageHtml } from "../../../../shared/page-shell.js";
import { dashboardChromeHtml } from "../../../../shared/dashboard-chrome.js";
import { botNavItems, pageMeta } from "./shell.js";
import { overviewPanel } from "./pages/overview.js";
import { botsPanel } from "./pages/bots.js";
import { commandsPanel } from "./pages/commands.js";
import { offersPanel } from "./pages/offers.js";
import { broadcastsPanel } from "./pages/broadcasts.js";
import { dashClientScript } from "./client-script.js";

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
      { label: "Leaderboards", href: "/dashboard" },
      { label: "Help", href: "/help/support" },
    ],
    title: meta.label,
    subtitle: meta.sub,
    crumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Telegram", href: "/bot/dashboard" },
      { label: meta.label },
    ],
    user,
    activePath: "/bot/dashboard",
    logoutAction: "/bot/auth/logout",
    content: `${overviewPanel()}
  ${botsPanel()}
  ${commandsPanel()}
  ${offersPanel(publicBaseUrl)}
  ${broadcastsPanel()}`,
  });
  return botPageHtml({
    user,
    page,
    nonce,
    nav,
    dashboardChrome: true,
    content: `${chrome}
<div id="toast" class="hidden" role="status" aria-live="polite"></div>
${dashClientScript()}`,
  });
}
