/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
import {
  profilePage,
  planPage,
  postbacksPage,
  connectedPage,
  dataPage,
} from "./account-pages.js";

const TITLES = {
  profile: "Profile",
  plan: "Plan & billing",
  postbacks: "Postbacks",
  connected: "Connected accounts",
  data: "Danger zone",
};

const PAGES_BY_TAB = {
  profile: profilePage,
  plan: planPage,
  postbacks: postbacksPage,
  connected: connectedPage,
  data: dataPage,
};

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "plan", label: "Plan & billing" },
  { key: "postbacks", label: "Postbacks" },
  { key: "connected", label: "Connected accounts" },
  { key: "data", label: "Danger zone" },
];

function AccountShell({ activeTab, children }) {
  return (
    <>
      <div class="toast" id="status" role="status" aria-live="polite" hidden></div>
      <div class="v2-dash">
      <div class="lb-shell">
        <aside class="lb-side" id="lbSide" aria-label="Account sections">
          <div class="lb-side-head">
            <span class="label">Account</span>
            <div class="lb-active-name" id="accUserName">…</div>
          </div>
          <nav class="lb-side-group" aria-label="Account">
            {TABS.map((t) => (
              <a
                class={"lb-nav" + (activeTab === t.key ? " is-on" : "")}
                href={"/account/" + t.key}
                aria-current={activeTab === t.key ? "page" : undefined}
              >
                {t.label}
              </a>
            ))}
          </nav>
          <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
        </aside>
        <div class="lb-main">
          <div class="lb-phead">
            <button class="lb-menu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button>
          </div>
          <header class="lb-topbar">
            <h1 class="lb-topbar-title" tabindex="-1">{TITLES[activeTab] || "Account"}</h1>
          </header>
          <div class="acct-main">
            {children}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

function AccountContent({ tab }) {
  const html = PAGES_BY_TAB[tab] || profilePage;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function AccountPage({ tab }) {
  return (
    <AccountShell activeTab={tab}>
      <AccountContent tab={tab} />
    </AccountShell>
  );
}

export const AccountProfilePage = () => <AccountPage tab="profile" />;
export const AccountPlanPage = () => <AccountPage tab="plan" />;
export const AccountPostbacksPage = () => <AccountPage tab="postbacks" />;
export const AccountConnectedPage = () => <AccountPage tab="connected" />;
export const AccountDataPage = () => <AccountPage tab="data" />;

const accountConfigBase = {
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v2.css", "/assets/ui.css"],
  scripts: ['<script src="/assets/account.js?v=3" type="module"></script>'],
  nav: true,
  footer: false,
  wide: true,
};

export const accountProfileConfig = { ...accountConfigBase, title: "Profile · Account · YourRank", canonical: "https://yourrank.site/account/profile" };
export const accountPlanConfig = { ...accountConfigBase, title: "Plan & billing · Account · YourRank", canonical: "https://yourrank.site/account/plan" };
export const accountPostbacksConfig = { ...accountConfigBase, title: "Postbacks · Account · YourRank", canonical: "https://yourrank.site/account/postbacks" };
export const accountConnectedConfig = { ...accountConfigBase, title: "Connected accounts · Account · YourRank", canonical: "https://yourrank.site/account/connected" };
export const accountDataConfig = { ...accountConfigBase, title: "Danger zone · Account · YourRank", canonical: "https://yourrank.site/account/data" };
