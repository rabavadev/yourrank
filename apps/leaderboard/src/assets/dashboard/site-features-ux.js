// Site-scoped UX cleanup shared by the leaderboard editor, Games, and site settings.

const STYLE_HREF = "/assets/site-features-ux.css?v=1";

function ensureStyles() {
  if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_HREF;
  document.head.appendChild(link);
}

function detailsAround(node, label, className) {
  if (!node || node.closest(`.${className}`)) return null;
  const details = document.createElement("details");
  details.className = `site-ux-details ${className}`;
  const summary = document.createElement("summary");
  summary.textContent = label;
  node.before(details);
  details.append(summary, node);
  return details;
}

function setupEditorFeatureNavigation() {
  const tabs = document.getElementById("editorTabs");
  const games = tabs?.querySelector('[data-egroup="games"]');
  if (!tabs || !games || tabs.querySelector(".editor-site-features-label")) return;

  // Keep the existing link inside the tab container so the editor's keyboard
  // controller retains its current button order. A visual separator is enough
  // to make Games read as a site feature rather than another editing step.
  const label = document.createElement("span");
  label.className = "editor-site-features-label";
  label.textContent = "Site feature";
  label.setAttribute("aria-hidden", "true");
  tabs.insertBefore(label, games);

  games.classList.add("editor-site-feature-link");
  games.textContent = "Games";
  games.setAttribute("aria-label", "Games, site feature");
}

function setupGamesPage() {
  const page = document.querySelector('section[data-page="games"]');
  if (!page) return;
  const head = page.querySelector(".v3-head");
  const title = head?.querySelector("h1");
  const sub = head?.querySelector(".v3-head-sub");
  if (title) title.textContent = "Games";
  if (sub) sub.textContent = "Preview the viewer games on this site and choose which ones are available.";

  const crumb = document.querySelector('.v3-crumbs span[aria-current="page"]');
  if (crumb) crumb.textContent = "Games";
}

function setupSiteSettings() {
  const page = document.querySelector('section[data-page="settings"]');
  if (!page || page.dataset.creatorSettingsUx === "true") return;
  page.dataset.creatorSettingsUx = "true";

  const head = page.querySelector(".v3-head");
  const title = head?.querySelector("h1");
  const sub = document.getElementById("settingsSubline");
  if (title) title.textContent = "Site settings";
  if (sub) {
    sub.replaceChildren(
      document.createTextNode("Settings for the selected public site. Account, billing, team, and security stay in "),
    );
    const account = document.createElement("a");
    account.href = "/dashboard/settings";
    account.textContent = "account settings";
    sub.append(account, document.createTextNode("."));
  }

  const supportTab = document.getElementById("settingsTabSupport");
  if (supportTab) supportTab.textContent = "Help";

  const support = document.getElementById("settingsPanelSupport");
  const supportTitle = support?.querySelector(".v3-settings-card-head h2");
  const supportIntro = support?.querySelector(".v3-settings-card-head p");
  if (supportTitle) supportTitle.textContent = "Help & feedback";
  if (supportIntro) supportIntro.textContent = "Find guidance, contact support, or send feedback for this site.";

  const supportRows = support ? [...support.querySelectorAll(".v3-settings-row")] : [];
  if (supportRows[0]) {
    const label = supportRows[0].querySelector("b");
    const copy = supportRows[0].querySelector("p");
    const action = supportRows[0].querySelector("a");
    if (label) label.textContent = "Sharing & stream overlay";
    if (copy) copy.textContent = "Copy the public link, stream overlay, or website embed when you need them.";
    if (action) action.textContent = "Open sharing";
  }
  if (supportRows[1]) {
    const label = supportRows[1].querySelector("b");
    const copy = supportRows[1].querySelector("p");
    const actions = [...supportRows[1].querySelectorAll("a")];
    if (label) label.textContent = "Help & feedback";
    if (copy) copy.textContent = "Open the help hub for guides, support, and product feedback.";
    if (actions[0]) {
      actions[0].href = "/help?area=leaderboard&return=/dashboard/settings/board";
      actions[0].textContent = "Open Help & feedback";
    }
    if (actions[1]) actions[1].hidden = true;
  }

  const danger = page.querySelector("#settingsPanelAccess .v3-danger-card");
  const dangerDetails = detailsAround(danger, "Danger zone", "site-danger-disclosure");
  const dangerLabel = danger?.querySelector(".v3-danger-lbl");
  if (dangerLabel) dangerLabel.hidden = true;
  if (dangerDetails) dangerDetails.dataset.kind = "danger";

  const telegram = page.querySelector("#settingsPanelIntegrations .v3-settings-notify-account");
  detailsAround(telegram, "Telegram notifications", "site-telegram-disclosure");

  const domainConnect = document.getElementById("domainConnectCard");
  const domainDetails = detailsAround(domainConnect, "Connect a domain you already own", "site-domain-disclosure");
  const domainHead = domainConnect?.querySelector(".v3-settings-card-head");
  if (domainDetails && domainHead) domainHead.hidden = true;
}

export function setupSiteFeaturesUx() {
  ensureStyles();
  setupEditorFeatureNavigation();
  setupGamesPage();
  setupSiteSettings();
}
