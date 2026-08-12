/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { settingsWidgets } from "./account-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const SETTINGS_TABS = [
  ["account", "Account"],
  ["plan", "Plan & billing"],
  ["connections", "Integrations"],
  ["data", "Data & danger zone"],
];

function settingsPanel(key, html) {
  return <section class="account-settings-panel" data-settings-panel={key} hidden={key !== "account"} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function UnifiedSettingsPage({ activePath, user, tab = "account" } = {}) {
  const active = SETTINGS_TABS.some(([key]) => key === tab) ? tab : "account";
  const boardUrl = new URL(activePath || "/dashboard/settings", "https://yourrank.site");
  boardUrl.pathname = "/dashboard/settings/board";
  return <DashboardShell activeNav="account" boardContext="none" crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Account settings" }]} footer="account" title="Settings" user={user}>
    <div class="account-body account-settings" id="acc-app" data-acc-tab="settings" data-settings-active={active}>
      <div class="account-settings-head">
        <h1>Account settings</h1>
        <p class="card-sub">Your account, billing, integrations and data controls. Everything that belongs to one board lives in <a href={boardUrl.pathname + boardUrl.search}>board settings</a>.</p>
      </div>
      <nav class="v3-tabs account-settings-tabs" aria-label="Settings sections">
        {SETTINGS_TABS.map(([key, label]) => <a class={"v3-tab" + (key === active ? " is-on" : "")} href={`/dashboard/settings/${key}`} data-settings-tab={key}>{label}</a>)}
      </nav>
      {settingsPanel("account", `${settingsWidgets.account}<div class="lb-widget lb-widget--full"><h2>Selected board settings</h2><p class="card-sub">Custom domain, board access, notifications, and board content belong to the selected board.</p><a class="btn btn--ghost" href="${boardUrl.pathname + boardUrl.search}">Open board settings</a></div>`)}
      {settingsPanel("plan", settingsWidgets.plan)}
      {settingsPanel("connections", `${settingsWidgets.postbacks}<div class="lb-widget lb-widget--full"><h2>Connected accounts</h2><p class="card-sub">Streamer identities and board integrations.</p><div id="connectedAccounts"><p class="hint">Loading…</p></div></div><div class="lb-widget lb-widget--full"><h2>Board integrations</h2><p class="card-sub">Kick and Credits configuration belongs to the selected board.</p><a class="btn btn--accent" href="/dashboard/rewards/channel">Open board integrations</a></div>`)}
      {settingsPanel("data", `${settingsWidgets.data}<div class="lb-widget lb-widget--full lb-widget--danger"><h2>Selected board data</h2><p class="card-sub">These actions affect one selected board, not your account. Open the board tools before making a destructive change.</p><div class="d-flex gap-8 flex-wrap"><a class="btn btn--ghost" href="/dashboard/editor/history">Reset or archive a board</a><a class="btn btn--ghost" href="/dashboard/editor/setup">Delete a board</a></div></div>`)}
    </div>
  </DashboardShell>;
}

const settingsConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css"],
  scripts: ['<script src="/assets/account.js?v=3" type="module"></script>', '<script src="/assets/shell-nav.js?v=1" defer></script>'],
  nav: false,
  footer: false,
  wide: true,
};

export const settingsConfig = {
  ...settingsConfigBase,
  title: "Account settings · YourRank",
  canonical: "https://yourrank.site/dashboard/settings",
};
