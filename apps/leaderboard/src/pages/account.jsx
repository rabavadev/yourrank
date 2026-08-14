/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import { raw } from "hono/html";
import { settingsWidgets } from "./account-pages.js";
import { DashboardShell } from "./dashboard-shell.jsx";

const SETTINGS_TABS = [
  ["account", "Profile & Security", '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
  ["team", "Team & Mods", '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'],
  ["plan", "Plan & Billing", '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>'],
  ["connections", "Sponsors & Integrations", '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'],
  ["data", "Backup & Danger Zone", '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>'],
];

function settingsPanel(key, html) {
  return <section class="account-settings-panel" data-settings-panel={key} hidden={key !== "account"} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function UnifiedSettingsPage({ activePath, user, tab = "account" } = {}) {
  const active = SETTINGS_TABS.some(([key]) => key === tab) ? tab : "account";
  const siteUrl = new URL(activePath || "/dashboard/settings", "https://yourrank.site");
  siteUrl.pathname = "/dashboard/settings/board";
  return <DashboardShell activeNav="account" boardContext="none" crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Account settings" }]} footer="account" title="Settings" user={user}>
    <div class="account-body account-settings" id="acc-app" data-acc-tab="settings" data-settings-active={active}>
      <div class="account-settings-head">
        <div class="account-settings-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Global Account Scope</span>
        </div>
        <h1>Account settings</h1>
        <p class="card-sub">Your master account, billing, security, and global connections. Settings for one specific site live in <a href={siteUrl.pathname + siteUrl.search}>site settings</a>.</p>
      </div>
      <nav class="v3-tabs account-settings-tabs" aria-label="Settings sections">
        {SETTINGS_TABS.map(([key, label, iconSvg]) => (
          <a class={"v3-tab" + (key === active ? " is-on" : "")} href={`/dashboard/settings/${key}`} data-settings-tab={key} aria-current={key === active ? "page" : undefined}>
            <svg class="tab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{raw(iconSvg)}</svg>
            <span>{label}</span>
          </a>
        ))}
      </nav>
      <div class="account-settings-layout">
        <div class="account-settings-main">
          {settingsPanel("account", `${settingsWidgets.account}<div class="lb-widget lb-widget--full acc-site-scope-card"><div class="acc-site-scope-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div><div><h2>Selected site settings</h2><p class="card-sub">Your web address, visitor access, alerts, themes, and public content belong to individual sites.</p><a class="btn btn--ghost mt-6" href="${siteUrl.pathname + siteUrl.search}">Open site settings ↗</a></div></div>`)}
          {settingsPanel("team", settingsWidgets.team)}
          {settingsPanel("plan", settingsWidgets.plan)}
          {settingsPanel("connections", `${settingsWidgets.postbacks}<div class="lb-widget lb-widget--full"><h2>Connected accounts</h2><p class="card-sub">Streamer identities and connected services.</p><div id="connectedAccounts"><p class="hint">Loading…</p></div></div><div class="lb-widget lb-widget--full"><h2>Site connections</h2><p class="card-sub">Kick and Credits settings belong to the selected site.</p><a class="btn btn--accent" href="/dashboard/rewards/channel">Open site connections</a></div>`)}
          {settingsPanel("data", `${settingsWidgets.data}<div class="lb-widget lb-widget--full lb-widget--danger"><h2>Selected site data</h2><p class="card-sub">These actions affect one selected site, not your whole account. Open the site tools before making a destructive change.</p><div class="d-flex gap-8 flex-wrap"><a class="btn btn--ghost" href="/dashboard/editor/history">Reset or archive a site</a><a class="btn btn--ghost" href="/dashboard/editor/setup">Delete a site</a></div></div>`)}
        </div>
        <aside class="account-settings-sidebar" aria-label="Account summary">
          <div class="account-summary-card">
            <div class="summary-header">
              <div class="summary-avatar" id="accSummaryAvatar" aria-hidden="true">👤</div>
              <div class="summary-user-info">
                <strong class="summary-name" id="accSummaryName">Account</strong>
                <span class="summary-email" id="accSummaryEmail">{user?.email || "Signed in"}</span>
              </div>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-stat-row">
              <span class="summary-stat-label">Current Plan</span>
              <span class="summary-stat-value"><span class="pill pill--good" id="accSummaryPlan">{user?.plan?.name || "Active"}</span></span>
            </div>
            <div class="summary-stat-row">
              <span class="summary-stat-label">Account Scope</span>
              <span class="summary-stat-value">Owner / Master</span>
            </div>
            <div class="summary-stat-row">
              <span class="summary-stat-label">Security Posture</span>
              <span class="summary-stat-value summary-security-good">● Protected</span>
            </div>
            <div class="summary-actions">
              <a class="btn btn--ghost btn--sm w-full" href="/dashboard/settings/plan">Manage subscription →</a>
            </div>
          </div>
          <div class="account-scope-helper">
            <div class="helper-badge">💡 Tip</div>
            <p>Looking to configure prizes, change themes, or connect Kick for a specific leaderboard? Head over to <a href={siteUrl.pathname + siteUrl.search}>site settings</a>.</p>
          </div>
        </aside>
      </div>
    </div>
  </DashboardShell>;
}

const settingsConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v3.css", "/assets/ui.css", "/assets/dashboard-v4.css"],
  scripts: ['<script src="/assets/account.js?v=3" type="module"></script>', '<script src="/assets/shell-nav.js?v=2" defer></script>'],
  nav: false,
  footer: false,
  wide: true,
};

export const settingsConfig = {
  ...settingsConfigBase,
  title: "Account settings · YourRank",
  canonical: "https://yourrank.site/dashboard/settings",
};

export const settingsUnifiedPage = { config: settingsConfig, Component: UnifiedSettingsPage };

