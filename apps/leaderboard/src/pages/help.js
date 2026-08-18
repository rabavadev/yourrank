import { dashboardChromeHtml } from "@yourrank/shared/dashboard-chrome";
import { dashboardNavItems } from "./dashboard-shell.jsx";

// Help center pages: a creator-facing hub plus Support and Feedback forms.
// Rendered through the shared page shell so a signed-in streamer keeps the app
// context instead of landing on a separate marketing page.
const TABS = [
  { key: "support", label: "Support", href: "/help/support", icon: '<path d="M4 4h16v12H7l-3 3z"/><path d="M8 8h8M8 12h5"/>' },
  { key: "feedback", label: "Feedback", href: "/help/feedback", icon: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>' },
];

function helpNavigation(user) {
  return user ? dashboardNavItems() : TABS;
}

function helpContent({ active, h1, intro, kind, subjectPlaceholder, messagePlaceholder, user, activePath }) {
  const content = `
    <div class="lb-widget contact-workspace">
      <form id="contactForm" class="card"><h2>Send us a message</h2>
        <div class="field"><label for="c_name">Name</label><input id="c_name" name="name" type="text" autocomplete="name" required maxlength="120" /></div>
        <div class="field"><label for="c_email">Email</label><input id="c_email" name="email" type="email" autocomplete="email" required maxlength="254" /></div>
        <input type="hidden" id="c_kind" name="kind" value="${kind}" />
        <input id="c_context" name="context" type="hidden" />
        <div class="field"><label for="c_subject">Subject</label><input id="c_subject" name="subject" type="text" maxlength="120" placeholder="${subjectPlaceholder}" /></div>
        <div class="field"><label for="c_message">Message</label><textarea id="c_message" name="message" rows="6" required minlength="10" maxlength="4000" placeholder="${messagePlaceholder}"></textarea></div>
        <div class="err" id="c_err" role="alert" aria-live="assertive"></div>
        <button class="btn btn--accent w-full" type="submit" id="c_submit">Send message</button>
        <p class="hint text-accent" id="c_success" hidden>Message received. We'll reply by email.</p>
      </form>
      <p class="hint mt-18" id="c_back_wrap" hidden><a id="c_back" href="/">← Back</a></p>
      <p class="hint mt-24">You can also email <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a> directly.</p>
    </div>`;

  return dashboardChromeHtml({
    nav: helpNavigation(user),
    active: user ? "help" : active,
    navLabel: user ? "Dashboard" : "Help & feedback",
    headLabel: "Help & feedback",
    title: h1,
    titleId: "contactTitle",
    subtitle: intro,
    subtitleId: "contactIntro",
    user,
    activePath,
    content,
    railProfile: Boolean(user),
    collapsible: Boolean(user),
    embeddedInMain: true,
  });
}

function helpPage(opts) {
  return {
    config: {
      title: `${opts.title} · YourRank`,
      canonical: opts.canonical,
      description: opts.description,
      robots: "index, follow",
      styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css", "/assets/dashboard-v4.css"],
      scripts: ['<script src="/assets/contact.js"></script>', '<script src="/assets/shell-nav.js?v=2" defer></script>'],
      mainClass: "wrap yr-ui",
      nav: false,
      footer: false,
      wide: true,
    },
    Component: (renderOpts) => helpContent({ ...opts, ...renderOpts }),
  };
}

function helpHubContent({ user, activePath }) {
  const content = `<div class="operator-help" id="help-hub">
<p class="operator-help-lead">Choose what you are trying to do and jump straight to the right place.</p>

<section class="operator-help-section" aria-labelledby="help-site">
  <h2 id="help-site">Site and public page</h2>
  <p>Use the site editor to configure the public page visitors see.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/leaderboard/setup">Set up a site</a><span>Add the site details, schedule, and visitor access.</span></li>
    <li><a href="/dashboard/leaderboard/players">Manage players</a><span>Add and update the ranked rows used by the leaderboard.</span></li>
    <li><a href="/dashboard/leaderboard/design">Change design</a><span>Edit the public page’s branding and visual settings.</span></li>
    <li><a href="/dashboard/leaderboard/share">Share the public page</a><span>Find the public URL, stream overlay, embed code, and share links.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-credits">
  <h2 id="help-credits">Credits and viewer fulfilment</h2>
  <p>Manage how credits are earned, what viewers can unlock, and pending requests.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/rewards/channel">Connect Kick</a><span>Link the Kick channel used for credit rewards.</span></li>
    <li><a href="/dashboard/rewards/rules">Create a credit rule</a><span>Choose a Kick reward and set how many credits it awards.</span></li>
    <li><a href="/dashboard/rewards/shop">Add a shop item</a><span>Create something viewers can unlock with their credits.</span></li>
    <li><a href="/dashboard/rewards/redemptions">Process prize orders</a><span>Review pending viewer requests and approve or cancel them.</span></li>
    <li><a href="/dashboard/audience/viewers">Check viewer balances</a><span>See viewer balances and recent earning activity.</span></li>
    <li><a href="/dashboard/audience/activity">Review credit activity</a><span>Filter credit events by viewer and event type.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-telegram">
  <h2 id="help-telegram">Telegram</h2>
  <p>Connect your Telegram bot, manage replies, and send messages to subscribers.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/telegram/bots">Connect a Telegram bot</a><span>Add the connect code, then manage the connected bot.</span></li>
    <li><a href="/dashboard/telegram/commands">Edit commands</a><span>Change the replies your bot sends when viewers type a command.</span></li>
    <li><a href="/dashboard/telegram/broadcasts">Send a broadcast</a><span>Compose, preview, and send or schedule a subscriber message.</span></li>
    <li><a href="/dashboard/telegram/offers">Manage offers</a><span>Manage the offers available to your community.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-account">
  <h2 id="help-account">Account and settings</h2>
  <p>Account settings are separate from settings for one selected site.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/settings/account">Account</a><span>Change your password and review active sessions.</span></li>
    <li><a href="/dashboard/settings/board">Site settings</a><span>Manage visitor access, alerts, connected tools, and the web address for the selected site.</span></li>
    <li><a href="/dashboard/settings/plan">Plan</a><span>Manage the subscription and review plan access.</span></li>
    <li><a href="/dashboard/settings/connections">Integrations</a><span>Review connected services.</span></li>
    <li><a href="/dashboard/settings/data">Data</a><span>Export account data or manage account deletion.</span></li>
  </ul>
</section>

<div class="operator-help-actions">
  <a class="btn btn--accent" href="/help/support">Contact support</a>
  <a class="btn" href="/help/feedback">Give feedback</a>
</div>
</div>`;

  return dashboardChromeHtml({
    nav: helpNavigation(user),
    active: user ? "help" : "",
    navLabel: user ? "Dashboard" : "Help & feedback",
    headLabel: "Help & feedback",
    title: "Help & feedback",
    subtitle: "Find the right place for a task, contact support, or share feedback.",
    user,
    activePath,
    content,
    railProfile: Boolean(user),
    collapsible: Boolean(user),
    embeddedInMain: true,
  });
}

export const helpHubPage = {
  config: {
    title: "Help & feedback · YourRank",
    canonical: "https://yourrank.site/help",
    description: "Task-oriented help for creators using YourRank sites, rewards, messaging, analytics, and account settings.",
    robots: "index, follow",
    styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css", "/assets/dashboard-v4.css"],
    scripts: ['<script src="/assets/shell-nav.js?v=2" defer></script>'],
    mainClass: "wrap yr-ui",
    nav: false,
    footer: false,
    wide: true,
  },
  Component: (renderOpts) => helpHubContent(renderOpts),
};

export const helpSupportPage = helpPage({
  active: "support",
  title: "Contact support",
  description: "Get help with YourRank. Questions, feedback, and support.",
  canonical: "https://yourrank.site/help/support",
  h1: "Contact support",
  intro: "Tell us what went wrong or what you need help with. We'll reply by email.",
  kind: "support",
  subjectPlaceholder: "What do you need help with?",
  messagePlaceholder: "Describe the problem and what you expected to happen...",
});

export const helpFeedbackPage = helpPage({
  active: "feedback",
  title: "Give feedback",
  description: "Share product feedback and feature requests for YourRank.",
  canonical: "https://yourrank.site/help/feedback",
  h1: "Give feedback",
  intro: "Tell us what would make YourRank better. Every message reaches the product team.",
  kind: "feedback",
  subjectPlaceholder: "What could be better?",
  messagePlaceholder: "Share an idea, frustration, or feature request...",
});
