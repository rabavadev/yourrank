// Help center pages: an operator hub plus Support and Feedback forms.
// Rendered through the shared page shell so a signed-in streamer keeps the app
// header (and their session) instead of landing on a marketing page that offers
// them a "Sign in" button.
const TABS = [
  { key: "support", label: "Support", kind: "support" },
  { key: "feedback", label: "Feedback", kind: "feedback" },
];

function tabsHtml(active) {
  return TABS.map((t) => {
    const isOn = t.key === active;
    return `<a class="lb-nav${isOn ? " is-on" : ""}" href="/help/${t.key}"${isOn ? ' aria-current="page"' : ""}>${t.label}</a>`;
  }).join("");
}

function helpContent({ active, h1, intro, kind, subjectPlaceholder, messagePlaceholder }) {
  return `<div id="help-app" data-help-tab="${active}">
<div class="lb-backdrop" id="helpBackdrop"></div>
<div class="lb-shell">
  <aside class="lb-side" id="helpSide" aria-label="Help sections">
    <div class="lb-side-head"><span class="label">Help</span></div>
    <nav class="lb-side-group" aria-label="Help">
      ${tabsHtml(active)}
    </nav>
    <button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
  </aside>
  <div class="lb-main">
    <div class="lb-phead">
      <button class="lb-menu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="helpSide">☰</button>
    </div>
    <div class="lb-bento">
      <div class="lb-widget">
        <h1 id="contactTitle">${h1}</h1>
        <p class="sub" id="contactIntro">${intro}</p>
        <form id="contactForm" class="card">
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
      </div>
    </div>
  </div>
</div>
</div>`;
}

function helpPage(opts) {
  return {
    config: {
      title: `${opts.title} · YourRank`,
      canonical: opts.canonical,
      description: opts.description,
      robots: "index, follow",
      styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css"],
      scripts: ['<script src="/assets/contact.js"></script>'],
      mainClass: "wrap",
      nav: true,
      footer: true,
      wide: true,
    },
    Component: () => helpContent(opts),
  };
}

function helpHubContent() {
  return `<div class="operator-help" id="help-hub">
<h1>Operator help</h1>
<p class="operator-help-lead">Find the dashboard page for the task you are doing now. These instructions follow the controls and routes currently in YourRank.</p>

<section class="operator-help-section" aria-labelledby="help-board">
  <h2 id="help-board">Board and public page</h2>
  <p>Use the Board editor to configure the public page visitors see.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/editor">Set up a board</a><span>Open the editor. Its tabs cover setup, players, design, sharing, and history.</span></li>
    <li><a href="/dashboard/editor#players">Manage players</a><span>Add and update the ranked rows used by the leaderboard.</span></li>
    <li><a href="/dashboard/editor/design">Change design</a><span>Edit the public page’s branding and visual settings in Design.</span></li>
    <li><a href="/dashboard/editor/share">Share the public page</a><span>Find the public URL, OBS overlay URL, embed code, and share links.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-credits">
  <h2 id="help-credits">Credits and viewer fulfilment</h2>
  <p>Credits come from Kick channel-point rewards and can be spent on shop items.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/settings/integrations">Connect Kick</a><span>Link the Kick channel so channel-point reward redemptions can become credits.</span></li>
    <li><a href="/dashboard/rewards/rules">Create a credit rule</a><span>Choose a Kick reward and set how many credits it awards.</span></li>
    <li><a href="/dashboard/rewards/shop">Add a shop item</a><span>Create something viewers can unlock with their credits.</span></li>
    <li><a href="/dashboard/rewards/redemptions">Process shop redemptions</a><span>Review pending viewer requests and approve or cancel them.</span></li>
    <li><a href="/dashboard/audience/viewers">Check viewer balances</a><span>See viewer balances, total earned, total spent, and recent earning activity.</span></li>
    <li><a href="/dashboard/audience/activity">Review credit activity</a><span>Filter the board’s credit events by viewer and event type.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-telegram">
  <h2 id="help-telegram">Telegram bot</h2>
  <p>The bot dashboard separates the bot connection, its replies, and messages to subscribers.</p>
  <ul class="operator-help-list">
    <li><a href="/bot/bots">Connect a Telegram bot</a><span>Add the bot token in Bots, then manage the connected bot there.</span></li>
    <li><a href="/bot/commands">Edit commands</a><span>Change the replies your bot sends when viewers type a command.</span></li>
    <li><a href="/bot/broadcasts">Send a broadcast</a><span>Compose a message to subscribers, preview it, send a rehearsal to your chat, then send now or schedule it.</span></li>
    <li><a href="/bot/offers">Manage offers</a><span>Create offers with tracked links for your community.</span></li>
  </ul>
</section>

<section class="operator-help-section" aria-labelledby="help-account">
  <h2 id="help-account">Account, plan, and integrations</h2>
  <p>Account-level settings live separately from board-level settings.</p>
  <ul class="operator-help-list">
    <li><a href="/dashboard/settings">Account settings</a><span>Manage account-level settings, plan access, connections, and account data.</span></li>
    <li><a href="/dashboard/settings/board">Board settings</a><span>Manage the selected board’s integrations, viewer login providers, notifications, domain, and support resources.</span></li>
    <li><a href="/account/plan">Plan and billing</a><span>Manage the account subscription and review plan access.</span></li>
    <li><a href="/account/profile">Profile</a><span>Update account profile information.</span></li>
    <li><a href="/account/connected">Connected accounts</a><span>Review connected account providers.</span></li>
    <li><a href="/account/postbacks">Postbacks</a><span>Configure signed score postbacks for supported integrations.</span></li>
    <li><a href="/account/data">Danger zone</a><span>Export account data or manage account deletion.</span></li>
  </ul>
</section>

<div class="operator-help-actions">
  <a class="btn btn--accent" href="/help/support">Contact support</a>
  <a class="btn" href="/help/feedback">Give feedback</a>
</div>
</div>`;
}

export const helpHubPage = {
  config: {
    title: "Operator help · YourRank",
    canonical: "https://yourrank.site/help",
    description: "Task-oriented help for YourRank operators managing boards, credits, Telegram bots, offers, and account settings.",
    robots: "index, follow",
    styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/ui.css"],
    scripts: [],
    mainClass: "wrap",
    nav: true,
    footer: true,
    wide: true,
  },
  Component: () => helpHubContent(),
};

export const helpSupportPage = helpPage({
  active: "support",
  title: "Contact support",
  description: "Get help with YourRank. Questions, feedback, and support.",
  canonical: "https://yourrank.site/help/support",
  h1: "Contact support",
  intro: "Tell us what went wrong or what you need help with. We'll reply by email — usually within 1 business day.",
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
