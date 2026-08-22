/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { raw } from "hono/html";
import { DashboardShell } from "./dashboard-shell.jsx";
import { renderGiveawayDrawersHtml, renderGiveawaysContentHtml } from "./giveaway-pages.js";

export function GiveawaysPage({ user, tab = "chat", fragment } = {}) {
  const labels = { chat: "Giveaways", raffles: "Raffles", drops: "Drops", preds: "Predictions", tournaments: "Tournaments" };
  const crumbs = [{ label: "Engagement", href: "/dashboard/giveaways" }, { label: labels[tab] || labels.chat }];
  const content = <div class="gw-workspace-content">
    <div id="gw-app" dangerouslySetInnerHTML={{ __html: renderGiveawaysContentHtml(tab) }}></div>
  </div>;
  if (fragment) return <>{content}{raw(renderGiveawayDrawersHtml(tab))}</>;
  return (
    <DashboardShell
      activeNav={tab === "chat" || tab === "tournaments" ? "giveaways" : tab === "preds" ? "predictions" : tab}
      activePath={`/dashboard/giveaways/${tab === "preds" ? "predictions" : tab}`}
      boardContext="selector"
      crumbs={crumbs}
      footer="rewards"
      rootId="gw-dash"
      user={user}
      overlays={renderGiveawayDrawersHtml(tab)}
    >
      {content}
    </DashboardShell>
  );
}

export const giveawaysConfig = {
  title: "Engagement · YourRank",
  canonical: "https://yourrank.site/dashboard/giveaways",
  styles: [
    "/assets/app.css",
    "/assets/shell-nav.css",
    "/assets/ui.css",
    "/assets/dashboard-v4.css",
    "/assets/giveaways.css",
  ],
  scripts: [
    '<script src="/assets/giveaways.js?v=1" type="module"></script>',
    '<script src="/assets/tournaments.js?v=1" type="module"></script>',
    '<script src="/assets/shell-nav.js?v=2" defer></script>',
  ],
  nav: false,
  footer: false,
  wide: true,
  bootWatchdog: true,
};

export const giveawaysPage = {
  config: giveawaysConfig,
  Component: GiveawaysPage,
};
