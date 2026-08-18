/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { DashboardShell } from "./dashboard-shell.jsx";
import { renderGiveawaysHtml } from "./giveaway-pages.js";

export function GiveawaysPage({ user, tab = "chat" } = {}) {
  const labels = { chat: "Giveaways", raffles: "Raffles", drops: "Drops", preds: "Predictions" };
  const crumbs = [{ label: "Giveaways", href: "/dashboard/giveaways/chat" }, { label: labels[tab] || labels.chat }];
  return (
    <DashboardShell
      activeNav={tab === "chat" ? "giveaways" : tab === "preds" ? "predictions" : tab}
      boardContext="selector"
      crumbs={crumbs}
      footer="rewards"
      rootId="gw-dash"
      user={user}
    >
      <div class="gw-workspace-content">
        <div id="gw-app" dangerouslySetInnerHTML={{ __html: renderGiveawaysHtml(tab) }}></div>
      </div>
    </DashboardShell>
  );
}

export const giveawaysConfig = {
  title: "Live Chat Giveaways · YourRank",
  canonical: "https://yourrank.site/dashboard/giveaways",
  styles: [
    "/assets/app.css",
    "/assets/shell-nav.css",
    "/assets/dashboard-v3.css",
    "/assets/ui.css",
    "/assets/dashboard-v4.css",
    "/assets/giveaways.css",
  ],
  scripts: [
    '<script src="/assets/giveaways.js?v=1" type="module"></script>',
    '<script src="/assets/shell-nav.js?v=2" defer></script>',
  ],
  nav: false,
  footer: false,
  wide: true,
};

export const giveawaysPage = {
  config: giveawaysConfig,
  Component: GiveawaysPage,
};
