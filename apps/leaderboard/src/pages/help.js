// Help center pages: Support and Feedback with a persistent sidebar.
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

function helpShell({ active, title, description, canonical, h1, intro, kind, subjectPlaceholder, messagePlaceholder }) {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · YourRank</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" />
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="hc-header"><div class="hc-header-inner">
<a class="brand" href="/">Your<b>Rank</b><span class="hc-tag">Help</span></a>
<nav class="hc-nav" aria-label="Help sections">
  <a class="hc-link${active === "support" ? " is-on" : ""}" href="/help/support"${active === "support" ? ' aria-current="page"' : ""}>Support</a>
  <a class="hc-link${active === "feedback" ? " is-on" : ""}" href="/help/feedback"${active === "feedback" ? ' aria-current="page"' : ""}>Feedback</a>
  <a class="hc-link" href="/docs">Docs</a>
</nav>
<a href="/login" class="btn btn--sm btn--ghost">Sign in</a>
</div></header>
<div id="help-app" data-help-tab="${active}">
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
      <main class="lb-widget" id="main-content">
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
      </main>
    </div>
  </div>
</div>
</div>
<footer class="wrap footer-wrap mt-48">
<span>© <span id="yr"></span> {{COMPANY_NAME}}</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/cookies">Cookies</a> · <a href="/responsible">Responsible play</a></span>
</footer>
<script src="/assets/contact.js"></script>
</body></html>`;
}

export const helpSupportPage = helpShell({
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

export const helpFeedbackPage = helpShell({
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
