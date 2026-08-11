/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {
  profilePage,
  planPage,
  postbacksPage,
  connectedPage,
  dataPage,
} from "./account-pages.js";
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

export const AccountProfilePage = () => <AccountPage tab="profile" />;
export const AccountPlanPage = () => <AccountPage tab="plan" />;
export const AccountPostbacksPage = () => <AccountPage tab="postbacks" />;
export const AccountConnectedPage = () => <AccountPage tab="connected" />;
export const AccountDataPage = () => <AccountPage tab="data" />;

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
