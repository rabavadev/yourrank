// contact page
export const contactPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Contact · YourRank</title>
<meta name="description" content="Get in touch with the YourRank team. Questions, feedback, and support." />
<link rel="canonical" href="https://yourrank.site/contact" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="wrap pg-narrow" id="main-content">
<h1 id="contactTitle">Contact</h1>
<p class="sub" id="contactIntro">Questions, feedback, or billing issue? Send us a message and we'll reply by email — usually within 1 business day.</p>
<form id="contactForm" class="card">
<div class="field"><label for="c_name">Name</label><input id="c_name" name="name" type="text" autocomplete="name" required maxlength="120" /></div>
<div class="field"><label for="c_email">Email</label><input id="c_email" name="email" type="email" autocomplete="email" required maxlength="254" /></div>
<div class="field"><label for="c_kind">Message type</label><select id="c_kind" name="kind"><option value="support">Contact support</option><option value="feedback">Give product feedback</option></select></div>
<div class="field"><label for="c_subject">Subject</label><input id="c_subject" name="subject" type="text" maxlength="120" placeholder="What is this about?" /></div>
<input id="c_context" name="context" type="hidden" />
<div class="field"><label for="c_message">Message</label><textarea id="c_message" name="message" rows="6" required minlength="10" maxlength="4000" placeholder="Tell us what's going on..."></textarea></div>
<div class="err" id="c_err" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent w-full" type="submit" id="c_submit">Send message</button>
<p class="hint text-accent" id="c_success" hidden>Message received. We'll reply by email.</p>
</form>
<p class="hint mt-18" id="c_back_wrap" hidden><a id="c_back" href="/dashboard">← Back to dashboard</a></p>
<p class="hint mt-24">You can also email <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a> directly.</p>
</main>
<footer class="wrap footer-wrap mt-48">
<span>© <span id="yr"></span> {{COMPANY_NAME}}</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/cookies">Cookies</a> · <a href="/responsible">Responsible play</a></span>
</footer>
<script src="/assets/contact.js"></script></body></html>`;
