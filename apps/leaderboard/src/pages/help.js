// Help center pages: Support and Feedback with a persistent sidebar.
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
  <aside class="lb-side" id="helpSide" aria-label="Help sections" role="dialog" aria-modal="false">
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
