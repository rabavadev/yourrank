/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {
  profilePage,
  planPage,
  postbacksPage,
  connectedPage,
  dataPage,
} from "./account-pages.js";
import { settingsWidgets } from "./account-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const TITLES = {
  profile: "Profile",
  plan: "Plan & billing",
  postbacks: "Postbacks",
  connected: "Connected accounts",
  data: "Danger zone",
};

const PAGES_BY_TAB = { profile: profilePage, plan: planPage, postbacks: postbacksPage, connected: connectedPage, data: dataPage };

function AccountPage({ tab, user }) {
  return <DashboardShell activeNav={tab} boardContext="none" footer="account" title={TITLES[tab] || "Account"} user={user}>
    <div class="account-body" dangerouslySetInnerHTML={{ __html: PAGES_BY_TAB[tab] || profilePage }} />
  </DashboardShell>;
}

export const AccountProfilePage = ({ user } = {}) => <AccountPage tab="profile" user={user} />;
export const AccountPlanPage = ({ user } = {}) => <AccountPage tab="plan" user={user} />;
export const AccountPostbacksPage = ({ user } = {}) => <AccountPage tab="postbacks" user={user} />;
export const AccountConnectedPage = ({ user } = {}) => <AccountPage tab="connected" user={user} />;
export const AccountDataPage = ({ user } = {}) => <AccountPage tab="data" user={user} />;

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
  return <DashboardShell activeNav="settings" boardContext="none" footer="account" title="Settings" user={user}>
    <div class="account-body account-settings" id="acc-app" data-acc-tab="settings" data-settings-active={active}>
      <div class="account-settings-head">
        <h1>Settings</h1>
        <p class="card-sub">One place for your account, billing, integrations, and data controls.</p>
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

const accountConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css"],
  scripts: ['<script src="/assets/account.js?v=3" type="module"></script>', '<script src="/assets/shell-nav.js?v=1" defer></script>'],
  nav: false,
  footer: false,
  wide: true,
};

export const accountProfileConfig = { ...accountConfigBase, title: "Profile · Account · YourRank", canonical: "https://yourrank.site/account/profile" };
export const accountPlanConfig = { ...accountConfigBase, title: "Plan & billing · Account · YourRank", canonical: "https://yourrank.site/account/plan" };
export const accountPostbacksConfig = { ...accountConfigBase, title: "Postbacks · Account · YourRank", canonical: "https://yourrank.site/account/postbacks" };
export const accountConnectedConfig = { ...accountConfigBase, title: "Connected accounts · Account · YourRank", canonical: "https://yourrank.site/account/connected" };
export const accountDataConfig = { ...accountConfigBase, title: "Danger zone · Account · YourRank", canonical: "https://yourrank.site/account/data" };

export const settingsConfig = {
  ...accountConfigBase,
  title: "Settings · YourRank",
  canonical: "https://yourrank.site/dashboard/settings",
};
