import { botPageHtml } from "@yourrank/shared/page-shell";
import { dashboardChromeHtml } from "@yourrank/shared/dashboard-chrome";
import { botNavItems, pageLinks, pageMeta } from "./shell.js";
import { overviewPanel } from "./pages/overview.js";
import { botsPanel } from "./pages/bots.js";
import { commandsPanel } from "./pages/commands.js";
import { offersPanel } from "./pages/offers.js";
import { broadcastsPanel } from "./pages/broadcasts.js";
import { dashClientScript } from "./client-script.js";

function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>
  )[ch]);
}

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

function telegramTabsHtml(page: string): string {
  return `<nav class="v3-tabs telegram-tabs" aria-label="Telegram pages">${
    pageLinks.map(({ key, label, href }) =>
      `<a class="v3-tab${key === page ? " is-on" : ""}" href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a>`
    ).join("")
  }</nav>`;
}

export function appHtml(
  user: { display_name: string; email: string; plan: string },
  publicBaseUrl: string,
  nonce?: string,
  page = "overview",
  nav?: string,
  canonicalPath = "/dashboard/telegram",
  context: { botUsername?: string | null; botStatus?: string | null; siteName?: string | null } = {},
): string {
  const meta = pageMeta(page);
  const pagePath = page === "overview" ? canonicalPath : `${canonicalPath}/${page}`;
  // Messaging keeps the same dashboard shell and creator vocabulary even though
  // the existing routes and provider integration remain Telegram-backed.
  const chrome = dashboardChromeHtml({
    nav: botNavItems(),
    active: "telegram",
    navLabel: "Messaging",
    railHeadHtml: `<div class="lb-ws-switcher"><a class="lb-ws-card" href="/dashboard/leaderboards"><div class="lb-ws-avatar">${esc((context.siteName || "S").slice(0, 1).toUpperCase())}</div><div class="lb-ws-meta"><span class="lb-ws-name">${esc(context.siteName || "No site connected")}</span><span class="lb-ws-plan">Current site</span></div></a></div>`,
    title: meta.label,
    subtitle: meta.sub,
    crumbs: [
      { label: "Messaging", href: "/dashboard/telegram" },
      { label: meta.label },
    ],
    user,
    topbarHtml: `<div class="lb-topbar-hud"><div class="lb-account-hud"><span class="lb-hud-icon" aria-hidden="true">◎</span><div class="lb-hud-details"><span class="lb-board-select-lbl">Bot</span>${context.botUsername ? `<span class="lb-account-title">@${esc(context.botUsername)} <span class="lb-status">${esc(context.botStatus || "active")}</span></span>` : `<a class="lb-account-title" href="/dashboard/telegram/bots">No bot connected · Connect one</a>`}</div></div></div>`,
    activePath: pagePath,
    railProfile: true,
    collapsible: true,
    logoutAction: "/bot/auth/logout",
    // Each messaging page is its own document, so render only the active panel.
    content: `${telegramTabsHtml(page)}${panelHtml(page, publicBaseUrl)}`,
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
