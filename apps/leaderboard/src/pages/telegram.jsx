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
  overview: "Overview",
  bots: "Active bots",
  commands: "Chat commands",
  offers: "Sponsor offers",
  broadcasts: "Broadcasts",
};

function crumbsFor(tab) {
  const trail = [{ label: "Telegram", href: "/dashboard/telegram" }];
  return tab === "overview" ? trail.map((c) => ({ label: c.label })) : [...trail, { label: CRUMB_LABELS[tab] || tab }];
}

const TELEGRAM_TABS = [
  { key: "overview", label: "Overview", href: "/dashboard/telegram" },
  { key: "bots", label: "Active bots", href: "/dashboard/telegram/bots" },
  { key: "commands", label: "Chat commands", href: "/dashboard/telegram/commands" },
  { key: "offers", label: "Sponsor offers", href: "/dashboard/telegram/offers" },
  { key: "broadcasts", label: "Broadcasts", href: "/dashboard/telegram/broadcasts" },
];

function TelegramSubTabs({ tab }) {
  return (
    <nav class="v3-tabs" aria-label="Telegram section navigation" style="margin-bottom: 20px;">
      {TELEGRAM_TABS.map((t) => (
        <a
          class={"v3-tab" + (t.key === tab ? " is-on" : "")}
          href={t.href}
          aria-current={t.key === tab ? "page" : undefined}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}

function TelegramPage({ tab = "overview", activeNav = "telegram", boardContext = "none", footer = "telegram", user }) {
  const body = PAGES[tab] || telegramOverviewPage;
  const title = "Telegram · " + (CRUMB_LABELS[tab] || "Workspace");
  return (
    <DashboardShell activeNav={activeNav} boardContext={boardContext} title={title} crumbs={crumbsFor(tab)} footer={footer} rootId="tg-dash" user={user}>
      <div class="tg-workspace-content">
        <TelegramSubTabs tab={tab} />
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
  return <TelegramPage tab="overview" activeNav="telegram" footer="telegram" user={user} />;
}
export function TelegramBotsPage({ user } = {}) {
  return <TelegramPage tab="bots" activeNav="telegram" footer="telegram" user={user} />;
}
export function TelegramCommandsPage({ user } = {}) {
  return <TelegramPage tab="commands" activeNav="telegram" footer="telegram" user={user} />;
}
export function TelegramOffersPage({ user } = {}) {
  return <TelegramPage tab="offers" activeNav="telegram" footer="telegram" user={user} />;
}
export function TelegramBroadcastsPage({ user } = {}) {
  return <TelegramPage tab="broadcasts" activeNav="telegram" footer="telegram" user={user} />;
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
    '<script src="/assets/shell-nav.js?v=2" defer></script>',
  ],
  nav: false,
  footer: false,
  wide: true,
};

export const telegramOverviewConfig = {
  ...telegramConfigBase,
  title: "Telegram Bot · YourRank",
  canonical: "https://yourrank.site/dashboard/telegram",
};
export const telegramBotsConfig = {
  ...telegramConfigBase,
  title: "Bots · Telegram · YourRank",
  canonical: "https://yourrank.site/dashboard/telegram/bots",
};
export const telegramCommandsConfig = {
  ...telegramConfigBase,
  title: "Commands · Telegram · YourRank",
  canonical: "https://yourrank.site/dashboard/telegram/commands",
};
export const telegramOffersConfig = {
  ...telegramConfigBase,
  title: "Offers · Telegram · YourRank",
  canonical: "https://yourrank.site/dashboard/telegram/offers",
};
export const telegramBroadcastsConfig = {
  ...telegramConfigBase,
  title: "Broadcasts · Telegram · YourRank",
  canonical: "https://yourrank.site/dashboard/telegram/broadcasts",
};

export const telegramOverviewRoute = {
  config: telegramOverviewConfig,
  Component: TelegramOverviewPage,
};
export const telegramBotsRoute = {
  config: telegramBotsConfig,
  Component: TelegramBotsPage,
};
export const telegramCommandsRoute = {
  config: telegramCommandsConfig,
  Component: TelegramCommandsPage,
};
export const telegramOffersRoute = {
  config: telegramOffersConfig,
  Component: TelegramOffersPage,
};
export const telegramBroadcastsRoute = {
  config: telegramBroadcastsConfig,
  Component: TelegramBroadcastsPage,
};
