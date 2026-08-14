/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {
  telegramOverviewPage,
  telegramBotsPage,
  telegramCommandsPage,
  telegramOffersPage,
  telegramBroadcastsPage,
} from "./telegram-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const PAGES = {
  overview: telegramOverviewPage,
  bots: telegramBotsPage,
  commands: telegramCommandsPage,
  offers: telegramOffersPage,
  broadcasts: telegramBroadcastsPage,
};

const CRUMB_LABELS = {
  overview: "Bot overview",
  bots: "Telegram bots",
  commands: "Commands & replies",
  offers: "Tracked offers",
  broadcasts: "Broadcast messages",
};

function crumbsFor(tab) {
  const trail = [{ label: "Telegram", href: "/dashboard/telegram" }];
  return tab === "overview" ? trail.map((c) => ({ label: c.label })) : [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

function TelegramPage({ tab = "overview", activeNav = "tg_overview", boardContext = "none", footer = "telegram", user }) {
  const body = PAGES[tab] || telegramOverviewPage;
  const title = "Telegram · " + (CRUMB_LABELS[tab] || "Workspace");
  return (
    <DashboardShell activeNav={activeNav} boardContext={boardContext} title={title} crumbs={crumbsFor(tab)} footer={footer} rootId="tg-dash" user={user}>
      <div class="tg-workspace-content">
        <div id="tg-loading" class="ui-loading" role="status" aria-live="polite" aria-busy="true" hidden>
          <div class="ui-loading__spinner"></div>
          <span class="sr-only">Loading Telegram bot workspace…</span>
        </div>
        <div id="tg-app" data-tg-tab={tab} dangerouslySetInnerHTML={{ __html: body }}></div>
      </div>
    </DashboardShell>
  );
}

export function TelegramOverviewPage({ user } = {}) {
  return <TelegramPage tab="overview" activeNav="tg_overview" footer="telegram" user={user} />;
}
export function TelegramBotsPage({ user } = {}) {
  return <TelegramPage tab="bots" activeNav="tg_bots" footer="telegram" user={user} />;
}
export function TelegramCommandsPage({ user } = {}) {
  return <TelegramPage tab="commands" activeNav="tg_commands" footer="telegram" user={user} />;
}
export function TelegramOffersPage({ user } = {}) {
  return <TelegramPage tab="offers" activeNav="tg_offers" footer="telegram" user={user} />;
}
export function TelegramBroadcastsPage({ user } = {}) {
  return <TelegramPage tab="broadcasts" activeNav="tg_broadcasts" footer="telegram" user={user} />;
}

const telegramConfigBase = {
  styles: [
    "/assets/app.css",
    "/assets/shell-nav.css",
    "/assets/dashboard-v3.css",
    "/assets/ui.css",
    "/assets/dashboard-v4.css",
  ],
  scripts: [
    '<script src="/assets/dashboard.js?v=4" type="module"></script>',
    '<script src="/assets/telegram-bot.js?v=1" type="module"></script>',
    '<script src="/assets/shell-nav.js?v=2" defer></script>',
  ],
  nav: false,
  footer: false,
  wide: true,
};

export const telegramOverviewConfig = { ...telegramConfigBase, title: "Overview · Telegram Bot · YourRank", canonical: "https://yourrank.site/dashboard/telegram" };
export const telegramBotsConfig = { ...telegramConfigBase, title: "Bots · Telegram Bot · YourRank", canonical: "https://yourrank.site/dashboard/telegram/bots" };
export const telegramCommandsConfig = { ...telegramConfigBase, title: "Commands · Telegram Bot · YourRank", canonical: "https://yourrank.site/dashboard/telegram/commands" };
export const telegramOffersConfig = { ...telegramConfigBase, title: "Tracked Offers · Telegram Bot · YourRank", canonical: "https://yourrank.site/dashboard/telegram/offers" };
export const telegramBroadcastsConfig = { ...telegramConfigBase, title: "Broadcasts · Telegram Bot · YourRank", canonical: "https://yourrank.site/dashboard/telegram/broadcasts" };

export const telegramOverviewRoute = { config: telegramOverviewConfig, Component: TelegramOverviewPage };
export const telegramBotsRoute = { config: telegramBotsConfig, Component: TelegramBotsPage };
export const telegramCommandsRoute = { config: telegramCommandsConfig, Component: TelegramCommandsPage };
export const telegramOffersRoute = { config: telegramOffersConfig, Component: TelegramOffersPage };
export const telegramBroadcastsRoute = { config: telegramBroadcastsConfig, Component: TelegramBroadcastsPage };
