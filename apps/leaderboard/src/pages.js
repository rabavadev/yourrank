// Static HTML pages served by the Worker. Kept as plain template strings.

// Shared shell for the legal pages — plain, readable, no fluff.
const legal = (title, updated, body, pagePath, desc) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · YourRank</title>
<meta name="description" content="${desc || title}" />
<link rel="canonical" href="https://yourrank.site/${pagePath}" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="legal" id="main-content"><h1>${title}</h1><p class="legal-updated">Last updated: ${updated}</p>
${body}
<p class="legal-foot"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a> · <a href="/">Home</a></p>
</main></body></html>`;

export const PAGES = {
  index: `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>YourRank — hosted leaderboards for casino streamers</title>
<meta name="description" content="A hosted leaderboard page for your Stake/Kick community. Edit prizes, code and players from a dashboard. Your page updates instantly." />
<link rel="canonical" href="https://yourrank.site/" />
<meta property="og:title" content="YourRank - Hosted Leaderboards for Streamers">
<meta property="og:description" content="Create your own branded leaderboard page. Track referrals, manage promo codes, and grow your audience.">
<meta property="og:url" content="https://yourrank.site/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="YourRank - Hosted Leaderboards for Streamers" />
<meta name="twitter:description" content="Create your own branded leaderboard page. Track referrals, manage promo codes, and grow your audience." />
<!-- og:image removed: no static asset exists; add when a brand image is created -->
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"YourRank","url":"https://yourrank.site","description":"Hosted leaderboard pages for casino streamers","contactPoint":{"@type":"ContactPoint","contactType":"customer service"}}</script>
</head><body>
<noscript><div class="noscript-card">
<h1>YourRank</h1>
<p>Hosted leaderboards for casino streamers. JavaScript is required for the full experience.</p>
<a href="/signup">Create your page</a>
</div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="wrap">
<nav class="top"><div class="brand">Your<b>Rank</b></div>
<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<div class="links"><a href="#how">How it works</a><a href="#postbacks">Postbacks</a><a href="#pricing">Pricing</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Get started</a></div></nav>
<main class="hero" id="main-content"><div>
<p class="label mb-18">Leaderboards for casino streamers</p>
<h1>Run your leaderboard without touching code.</h1>
<p class="lead">Your prize pool, referral code and ranked players, on a page you edit from a dashboard. Change a number, hit save, your page updates. That's it.</p>
<div class="cta"><a href="/signup" class="btn btn--accent">Create your page</a><a href="#example" class="btn">See a live one</a></div>
<p class="fine">Free to start. Your own URL from day one.</p></div>
<div class="spec"><div class="spec-h"><span>your-page.config</span><span class="dot">● live</span></div>
<div class="spec-row"><span>Public URL</span><span>yourrank.site/you</span></div>
<div class="spec-row"><span>Prize pool</span><span>editable</span></div>
<div class="spec-row"><span>Countdown</span><span>auto</span></div>
<div class="spec-row"><span>Standings</span><span>sorted by wager</span></div>
<div class="spec-row"><span>Updates</span><span>instant</span></div></div></main>
</div>
<section id="how"><div class="wrap"><h2 class="sec">How it works</h2><p class="sec-sub">Three steps. No build tools, no redeploys, nothing to host yourself.</p>
<div class="steps">
<div class="step"><div class="n">01</div><div><h3>Create your account</h3><p>Pick a handle. That becomes your page URL. Takes about a minute.</p></div></div>
<div class="step"><div class="n">02</div><div><h3>Fill in your details</h3><p>Prize pool, referral code, countdown date, and your ranked players. All from one dashboard.</p></div></div>
<div class="step"><div class="n">03</div><div><h3>Share your link</h3><p>Your page is live. Update the numbers whenever you want and they change instantly.</p></div></div>
</div>
<div class="steps mt-24">
<div class="step"><div class="n">✦</div><div><h3>Built-in analytics</h3><p>Track views, clicks, and referrers from your dashboard. See what's working and where your traffic comes from.</p></div></div>
</div></div></section>
<section id="postbacks"><div class="wrap"><h2 class="sec">Track real conversions</h2><p class="sec-sub">When a casino confirms a player deposited, YourRank receives the postback and updates the leaderboard automatically. No manual updates. No guessing.</p>
<div class="steps">
<div class="step"><div class="n">⟲</div><div><h3>Automatic updates</h3><p>Postbacks from the casino push real deposit data straight into your leaderboard. Your standings stay accurate without you lifting a finger.</p></div></div>
<div class="step"><div class="n">🔌</div><div><h3>Works with any postback-enabled casino</h3><p>Stake, Rollbit, BC.Game, and any other casino that supports postback URLs. Just plug in your YourRank postback URL and the data flows in.</p></div></div>
<div class="step"><div class="n">⚡</div><div><h3>No spreadsheets, no copy-paste</h3><p>Forget manually updating player wagers. The postback system does it in real time — confirmed deposits, verified conversions, zero human error.</p></div></div>
</div></div></section>
<section id="example"><div class="wrap"><h2 class="sec">A real page</h2><p class="sec-sub">This is a live leaderboard running on YourRank. Yours works the same way.</p>
<div class="example"><div class="bar"><span>yourrank.site/demo</span><span>live</span></div>
<iframe src="/demo" loading="lazy" title="Example leaderboard"></iframe></div></div></section>
<section id="pricing"><div class="wrap"><h2 class="sec">Pricing</h2><p class="sec-sub">Start free. Upgrade when your board is pulling weight.</p>
<div class="pricing-grid">
<div class="price-card"><div class="price-head"><h3>Free</h3><div class="price-amount">$0</div><div class="price-period">forever</div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 10 players</li><li>YourRank badge on your page</li><li>Basic analytics (7 days)</li><li>Live countdown &amp; auto-sort</li></ul><a href="/signup" class="btn btn--sm price-cta">Start free</a></div>
<div class="price-card"><div class="price-head"><h3>Starter</h3><div class="price-amount">$12<span>/mo</span></div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 25 players</li><li>No YourRank badge</li><li>Full analytics (30 days)</li><li>CSV import</li></ul><a href="/signup" class="btn btn--sm price-cta">Start</a></div>
<div class="price-card price-card--popular"><div class="price-badge">Most Popular</div><div class="price-head"><h3>Pro</h3><div class="price-amount">$29<span>/mo</span></div></div><ul class="price-features"><li>Up to 3 leaderboards</li><li>Unlimited players</li><li>No YourRank badge</li><li>Custom domain</li><li>OBS overlay widget</li><li>Discord webhooks</li><li>Telegram notifications</li><li>Priority support</li></ul><a href="/signup" class="btn btn--sm btn--accent price-cta">Go Pro</a></div>
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/mo</span></div></div><ul class="price-features"><li>Unlimited leaderboards</li><li>Unlimited players</li><li>White-label branding</li><li>API access</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="mailto:contact@yourrank.site" class="btn btn--sm price-cta">Contact us</a></div>
<div class="price-card price-card--lifetime"><div class="price-badge price-badge--lifetime">Best Value</div><div class="price-head"><h3>Lifetime Pro</h3><div class="price-amount">$149<span class="price-amount-sub"> one-time</span></div></div><ul class="price-features"><li>All Pro features</li><li>Pay once, use forever</li><li>No monthly bills</li><li>Up to 3 leaderboards</li><li>Unlimited players</li><li>Custom domain &amp; OBS widget</li><li>Priority support</li></ul><a href="/signup" class="btn btn--accent btn--sm price-cta">Get Lifetime Pro</a></div>
</div></div></section>
<section id="start"><div class="wrap"><h2 class="sec">Ready to start?</h2><p class="sec-sub">Create your free page in under a minute. No credit card needed.</p>
<div class="cta cta-wrap"><a href="/signup" class="btn btn--accent btn--cta-lg">Create your free page</a></div></div></section>
<footer><div class="wrap footer-wrap">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a></span>
<span>18+ · Gambling can be addictive. Play responsibly.</span></div></footer>
<script src="/assets/landing.js?v=2"></script>
</body></html>`,

  login: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sign in · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/login" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Your leaderboard, hosted and handled.</h1><p>Edit your prize pool, code and players from one dashboard. Your page updates instantly. No code, no redeploys.</p></div>
<div class="feat"><div>— Live countdown to every reset</div><div>— Auto-sorted standings from wager</div><div>— Your own public URL</div></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>Sign in</h2><p class="sub">Welcome back.</p>
<form id="form" method="POST" action="/api/auth/login" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="field"><label for="password">Password</label><div class="pw-wrap"><input id="password" name="password" type="password" autocomplete="current-password" required /><button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password"><svg data-eye width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg data-eye-off width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" hidden><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button></div></div>
<div class="err" id="err" role="alert" aria-live="assertive"></div><button class="btn btn--accent w-full" type="submit" id="submit">Sign in</button></form>
<p class="foot">No account? <a href="/signup">Create one</a> · <a href="/forgot">Forgot password?</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  forgot: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset password · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/forgot" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Locked out? It happens.</h1><p>Tell us the email on your account and we'll send a reset link. If email isn't set up on this deployment yet, contact support and we'll hand you a link directly.</p></div>
<div class="feat"></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>Reset password</h2><p class="sub">We'll email you a link.</p>
<form id="form" method="POST" action="/api/auth/forgot" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="err" id="err" role="alert" aria-live="assertive"></div><div class="msg" id="msg" hidden role="status" aria-live="polite"></div><button class="btn btn--accent w-full" type="submit" id="submit">Send reset link</button></form>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  reset: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New password · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/reset" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Set a new password.</h1><p>Pick something you'll remember this time. At least 8 characters.</p></div>
<div class="feat"></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>New password</h2><p class="sub">Then you're straight back in.</p>
<form id="form" method="POST" action="/api/auth/reset" novalidate><div class="field"><label for="password">New password</label><div class="pw-wrap"><input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" aria-describedby="pw-hint" /><button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password"><svg data-eye width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg data-eye-off width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" hidden><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button></div>
  <span class="hint" id="pw-hint">At least 8 characters.</span></div>
    <div class="err" id="err" role="alert" aria-live="assertive"></div><button class="btn btn--accent w-full" type="submit" id="submit">Save &amp; sign in</button></form>
  <p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
  <script src="/assets/auth.js?v=2"></script></body></html>`,

    signup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Create account · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/signup" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Launch your leaderboard in a few minutes.</h1><p>Pick a handle, fill in your prizes and players, and your page goes live at yourrank.site/yourname.</p></div>
<div class="feat"><div>— Free to set up</div><div>— Your public URL from day one</div><div>— Upgrade to Pro when you're ready</div></div></aside>
<main class="auth-main" id="main-content"><div class="auth-card"><h2>Create account</h2><p class="sub">Free. Takes a minute.</p>
<form id="form" method="POST" action="/api/auth/signup" novalidate>
<div class="field"><label for="name">Display name</label><input id="name" name="name" type="text" placeholder="YourName" autocomplete="nickname" required />
<span class="hint">Also becomes your page URL: <span class="mono" id="slugPreview">yourrank.site/…</span></span></div>
<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="field"><label for="password">Password</label><div class="pw-wrap"><input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" aria-describedby="pw-hint" /><button type="button" class="pw-toggle" data-pw-toggle aria-label="Show password"><svg data-eye width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><svg data-eye-off width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" hidden><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button></div>
  <span class="hint" id="pw-hint">At least 8 characters.</span></div>
  <div class="err" id="err" role="alert" aria-live="assertive"></div><button class="btn btn--accent w-full" type="submit" id="submit">Create account</button></form>
<p class="foot">Already have one? <a href="/login">Sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  dashboard: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dashboard · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/shell-nav.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to use the dashboard.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<!--GM_NAV-->
<main class="wrap" id="main-content"><div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-180"></div><div class="skeleton skeleton-text--sm skel-w-260 mt-8"></div></div><div class="skeleton skeleton-text skel-w-90"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-200"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-300"></div></div>
</div>
<div id="dash" hidden>
<div class="dash-head"><div><h1>Your leaderboard</h1><p class="live-link">Live at <a id="liveLink" href="#" target="_blank">…</a></p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div class="card" id="boardSwitcher"><h2>Boards</h2><p class="card-sub">Switch between your leaderboards. <span class="hint" id="boardCount"></span></p>
<div class="board-list" id="boardList"></div>
<div class="mt-10 d-flex gap-8 flex-wrap"><button class="btn btn--sm" id="newBoard" type="button" hidden>+ New board</button></div>
<div id="newBoardForm" hidden class="mt-12 d-flex gap-8 items-end flex-wrap">
<div class="field field-flex"><label for="nb_name">Board name</label><input id="nb_name" placeholder="July 2026 Board" /></div>
<div class="field field-flex"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="july-2026" /></div>
<button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button>
<button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button>
<div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div>
</div></div>
<div class="card"><h2>Analytics</h2><p class="card-sub">Last 30 days on your page. Views count every visit; copies and clicks are people grabbing your code or hitting Join.</p>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="st_views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_views30">–</span><span class="stat-lbl">Views · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_copies30">–</span><span class="stat-lbl">Code copies · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_clicks30">–</span><span class="stat-lbl">Join clicks · 30d</span></div></div>
<div class="stat-chart"><div class="stat-bars" id="statBars" title="Daily views, last 14 days"></div><div class="stat-chart-lbl"><span id="statFrom"></span><span>Daily views, last 14 days</span><span>today</span></div></div>
<p class="hint" id="statsEmpty" hidden>No views yet — share your page link in your stream panels and Discord to get it moving.</p></div>
<div class="card"><h2>Brand &amp; prize</h2><p class="card-sub">The headline details on your page.</p><div class="grid2">
<div class="field"><label for="f_name">Display name</label><input id="f_name" /></div>
<div class="field"><label for="f_tagline">Tagline</label><input id="f_tagline" placeholder="Casino streamer & Stake partner" /></div>
<div class="field"><label for="f_casino">Casino</label><input id="f_casino" placeholder="Stake" /></div>
<div class="field"><label for="f_code">Referral code</label><input id="f_code" placeholder="BTZ" /></div>
<div class="field"><label for="f_cta">Referral link</label><input id="f_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="field"><label for="f_pool">Prize pool</label><input id="f_pool" placeholder="$3,500" /></div>
<div class="field"><label for="f_period">Period</label><input id="f_period" placeholder="Monthly" /></div>
<div class="field"><label for="f_ends">Countdown ends (UTC)</label><input id="f_ends" type="datetime-local" /><span class="hint">When the leaderboard resets. Powers the live timer.</span></div></div>
<div class="field"><label for="f_blurb">Partner blurb</label><textarea id="f_blurb" rows="2" placeholder="Short pitch about the casino and your code."></textarea></div></div>
<div class="card"><h2>Players</h2><p class="card-sub">The board auto-sorts by wagered, highest first. Prize <span class="mono">0</span> shows a dash. Names can be masked (keep the <span class="mono">***</span>). <span class="mono" id="pCount"></span></p>
<div class="players-wrap"><table class="players"><thead><tr><th class="rank">#</th><th>Player</th><th class="ta-r">Wagered</th><th class="ta-r">Prize</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
<div id="playersEmpty" class="empty" hidden>No players yet. Add your first one.</div>
<div class="mt-14 d-flex gap-8 flex-wrap items-center"><button class="btn btn--sm" id="addRow">+ Add player</button><button class="btn btn--sm" id="importBtn" type="button">Paste from spreadsheet</button><button class="btn btn--sm" id="csvImportBtn" type="button">📁 Import CSV</button><button class="btn btn--sm btn--ghost" id="csvTemplateBtn" type="button">Download template</button><input type="file" id="csvFileInput" accept=".csv,.tsv,.txt" hidden /><span id="limitMsg" class="hint ml-auto c-muted" role="status" aria-live="polite"></span></div>
<div class="import" id="importPanel" hidden>
<p class="hint mb-8">One player per line: <span class="mono">name, wagered, prize</span> — commas or tabs. Copying straight out of Excel or Google Sheets works. Prize is optional.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div></div>
<div class="card" id="brandCard"><h2>Branding <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Your logo and page colors. Free pages use the default look.</p>
<div id="brandBody">
<div class="grid2">
<div class="field"><label for="logoFile">Logo</label>
<div class="logo-row"><img id="logoPreview" class="logo-preview" alt="" hidden /><input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden />
<button class="btn btn--sm" id="logoPick" type="button">Upload logo</button><button class="btn btn--sm btn--ghost" id="logoClear" type="button" hidden>Remove</button></div>
<span class="hint">PNG, JPG or WebP. Shows in your page header and as the link preview image when your page gets shared. Square works best.</span></div>
<div class="field"><label for="c_a">Page accent colors</label>
<div class="color-row"><label for="c_a" class="sr-only">Accent color start</label><input type="color" id="c_a" value="#5ad9ff" /><label for="c_b" class="sr-only">Accent color end</label><input type="color" id="c_b" value="#7b8cff" /><button class="btn btn--sm btn--ghost" id="colorsReset" type="button">Reset to default</button></div>
<span class="hint">Drives the big name gradient and buttons on your page. Save to apply.</span></div>
</div></div>
<div class="empty" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="overlayCard"><h2>OBS Stream Overlay <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Add a live leaderboard overlay to your stream. It auto-updates every 15 seconds with smooth rank animations.</p>
<div id="overlayBody">
<div class="field"><label>Overlay URL</label>
<div class="d-flex gap-8 items-center flex-wrap">
<code id="overlayUrl" class="overlay-url"></code>
<button class="btn btn--sm btn--accent" id="overlayCopy" type="button">📋 Copy</button>
</div>
<span class="hint">Add this as a <b>Browser Source</b> in OBS. Set width to <b>320px</b>, height auto. Check "Shutdown source when not visible" off for live updates.</span></div>
<div class="mt-14 d-flex gap-8 flex-wrap">
<a class="btn btn--sm" id="overlayPreview" href="#" target="_blank">Preview overlay →</a>
</div>
</div>
<div class="empty" id="overlayLock" hidden>OBS Overlay is a Pro feature. <a href="#" id="overlayUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="domainCard"><h2>Custom Domain <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Serve your leaderboard on your own domain instead of yourrank.site/yourname.</p>
<div id="domainBody">
<div class="field"><label for="f_domain">Your domain</label><input id="f_domain" placeholder="board.mystream.com" />
<span class="hint">Point a <b>CNAME record</b> for your domain to <span class="mono">yourrank.site</span>. Then enter the domain here and click <b>Verify &amp; Provision TLS</b>.</span></div>
<div class="mt-8 d-flex gap-8 items-center flex-wrap">
<button class="btn btn--sm btn--accent" id="domainVerify" type="button">Verify &amp; Provision TLS</button>
</div>
<div id="domainStatus" class="hint mt-8 min-h-18" role="status" aria-live="polite"></div>
</div>
<div class="empty" id="domainLock" hidden>Custom domains are a Pro feature. <a href="#" id="domainUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="notifyCard"><h2>Notifications <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Get alerted when your leaderboard resets or a player breaks into the top 3. Discord and Telegram supported.</p>
<div id="notifyBody">
<div class="field"><label>Events that trigger notifications</label>
<div class="d-flex gap-8 flex-wrap mb-4">
<span class="pill pill--muted">🔄 Leaderboard reset</span>
<span class="pill pill--muted">🏆 Player enters top 3</span>
</div></div>
<div class="field"><label for="f_webhook">Discord webhook URL</label>
<input id="f_webhook" placeholder="https://discord.com/api/webhooks/..." />
<span class="hint">Create a webhook in your Discord server settings → Integrations → Webhooks. Paste the URL here.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<button class="btn btn--sm" id="testDiscord" type="button">📨 Test Discord</button>
<span class="hint" id="testDiscordStatus" role="status" aria-live="polite"></span>
</div>
<div class="field"><label for="f_tgChatId">Telegram chat/group ID</label>
<input id="f_tgChatId" placeholder="-1001234567890" />
<span class="hint">The chat or group ID where notifications should be sent. Use <code>/start</code> in your bot chat or add the bot to a group to get the ID.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<label class="hint chk"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label>
<button class="btn btn--sm" id="testTelegram" type="button">📨 Test Telegram</button>
<span class="hint" id="testTelegramStatus" role="status" aria-live="polite"></span>
</div>
</div>
<div class="empty" id="notifyLock" hidden>Notifications are a Pro feature. <a href="#" id="notifyUpgrade">Upgrade to unlock them</a>.</div></div>
<div class="card" id="archiveCard"><h2>Past winners</h2><p class="card-sub">When a period ends, close it out: the current board is saved and shown on your page under "Past Winners". Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field field-flex"><label for="a_label">Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field m-0"><label for="a_clear">Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent self-end" id="a_go" type="button">Close out period</button></div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div></div>
<div class="card" id="planCard"><h2>Plan &amp; billing</h2><p class="card-sub">Upgrade to unlock more players, boards and features.</p>
<div class="plan-row"><div><div class="plan-name" id="planName">Free</div><div class="hint" id="planMeta">Up to 10 players · YourRank badge on your page</div></div>
<button class="btn btn--accent" id="goPro">Upgrade</button></div>
<p class="hint" id="planHint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes. <a href="/dashboard/billing">See all plans</a>.</p></div>
<div class="savebar"><label class="hint chk mr-auto"><input type="checkbox" id="pubToggle" checked /> Page published</label><span class="status" id="status" role="status" aria-live="polite"></span><a class="btn btn--ghost" id="viewLive" href="#" target="_blank">View live page</a><button class="btn btn--accent" id="save">Save changes</button></div></div></main>
<script src="/assets/dashboard.js?v=2"></script></body></html>`,

analytics: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Analytics · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/analytics" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/shell-nav.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to view analytics.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<!--GM_NAV-->
<main class="wrap" id="main-content">
<div class="dash-head"><div><h1>Analytics</h1><p class="live-link">Performance of <a id="liveLink" href="#" target="_blank">your page</a></p></div></div>
<div id="an" hidden>
<div class="card"><h2>Last 30 days</h2><p class="card-sub">Views count every visit to your page. Code copies and Join clicks show real engagement.</p>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="views30">–</span><span class="stat-lbl">Views · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="copies30">–</span><span class="stat-lbl">Code copies · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="clicks30">–</span><span class="stat-lbl">Join clicks · 30d</span></div></div>
<div class="stat-chart"><div class="stat-bars" id="bars"></div><div class="stat-chart-lbl"><span id="from"></span><span>Daily views, last 14 days</span><span>today</span></div><div class="chart-tooltip" id="chartTooltip" hidden></div></div>
<p class="hint" id="empty" hidden>No views yet. Share your page link in your stream panels and Discord to get it moving.</p></div>
<div class="card"><h2>Today</h2><p class="card-sub">Live since midnight UTC.</p>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="viewsToday">–</span><span class="stat-lbl">Views today</span></div>
<div class="stat-tile"><span class="stat-num" id="copiesToday">–</span><span class="stat-lbl">Code copies today</span></div>
<div class="stat-tile"><span class="stat-num" id="clicksToday">–</span><span class="stat-lbl">Join clicks today</span></div></div></div>
<div class="card"><h2>Activity heatmap</h2><p class="card-sub">When your page gets the most traffic — day of week × hour (UTC), last 30 days. Darker green = more views.</p>
<div class="heatmap-wrap" id="heatmapWrap"><div class="heatmap-loading">Loading…</div></div></div>
<div class="card"><h2>Top referrers</h2><p class="card-sub">Where your visitors come from — top 5 domains in the last 30 days.</p>
<table class="ref-table" id="refTable"><thead><tr><th>Domain</th><th class="ta-r">Views</th></tr></thead><tbody id="refBody"></tbody></table>
<div class="empty" id="refEmpty" hidden>No referrer data yet.</div></div>
<div class="card"><h2>Export</h2><p class="card-sub">Download a CSV of your page views, code copies, and join clicks for the last 30 days.</p>
<button class="btn btn--accent" id="exportBtn" type="button">Export CSV</button>
<p class="status" id="exportStatus" role="status" aria-live="polite"></p></div></div>
<div id="loading" class="py-26">
<div class="mb-18"><div class="skeleton skeleton-text--lg skel-w-120"></div><div class="skeleton skeleton-text--sm skel-w-200 mt-8"></div></div>
<div class="card"><div class="skeleton skeleton-block skel-h-80"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-200"></div></div>
</div></main>
<script src="/assets/analytics.js?v=2"></script></body></html>`,

billing: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Billing · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/billing" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/shell-nav.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to manage billing.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<!--GM_NAV-->
<main class="wrap" id="main-content">
<div class="dash-head"><div><h1>Billing</h1><p class="live-link">Your YourRank plan</p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div id="bl" hidden>
<div class="card" id="currentCard"><h2>Current plan</h2><p class="card-sub"><span id="planLine">Free — up to 10 players, one leaderboard.</span></p>
<p class="hint" id="expLine" hidden></p>
<div id="cancelBox" class="mt-18" hidden><p class="hint">Paid subscription? You can cancel it at any time. You'll keep features until the end of the current billing period.</p>
<button class="btn btn--danger" id="cancelBtn" type="button">Cancel subscription</button>
<p class="status" id="cancelStatus" role="status" aria-live="polite"></p></div></div>
<div class="card" id="trialCard" hidden><h2>Try Pro free for 7 days</h2><p class="card-sub">Experience all Pro features — unlimited players, custom domain, OBS overlay, notifications — with no commitment.</p>
<button class="btn btn--accent" id="trialBtn" type="button">Start free trial</button>
<p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
<div class="card" id="trialStatusCard" hidden><h2>Trial active</h2><p class="card-sub" id="trialInfo">Your Pro trial is running.</p>
<p class="hint">After the trial ends, your plan will revert to Free. Upgrade anytime to keep Pro features.</p></div>
<div class="card" id="upgradeCard"><h2>Upgrade</h2><p class="card-sub" id="upgradeSub">Choose the plan that fits your needs.</p>
<div id="planOptions"></div>
<div id="lifetimeBox" class="lifetime-box">
<div class="lifetime-inner">
<div><div class="lifetime-title">⚡ Lifetime Pro — $149</div>
<div class="hint mt-4">Pay once, use forever. All Pro features, no monthly bills. No expiry.</div></div>
<button class="btn btn--accent" id="lifetimeBtn" type="button">Get Lifetime Pro</button>
</div>
<p class="status" id="lifetimeStatus" role="status" aria-live="polite"></p></div>
<p class="hint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes.</p>
<p class="status" id="status" role="status" aria-live="polite"></p></div>
<div class="card" id="proCard" hidden><h2>You're on <span id="currentPlanName">Pro</span></h2><p class="card-sub">Thanks for supporting YourRank. Manage everything from the Leaderboard tab.</p>
<p class="hint" id="proExp"></p>
<p class="hint c-accent fw-600" id="lifetimeNotice" hidden>⭐ Lifetime Pro — no expiry. You own this forever.</p></div>
  <div class="card card--danger" id="dangerZone"><h2> Danger zone</h2><p class="card-sub">Permanently delete your account and all associated data. This action cannot be undone.</p>
  <button class="btn btn--danger" id="deleteAccountBtn" type="button">Delete my account</button>
  <p class="status" id="deleteStatus" role="status" aria-live="polite"></p></div></div>
  <div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-100"></div><div class="skeleton skeleton-text--sm skel-w-160 mt-8"></div></div><div class="skeleton skeleton-text skel-w-100"></div></div>
<div class="card"><div class="skeleton skeleton-block skel-h-60"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-120"></div></div>
</div></main>
<script src="/assets/billing.js?v=2"></script></body></html>`,

botSetup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Connect Telegram Bot · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/bot/setup" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/shell-nav.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to set up your Telegram bot.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<!--GM_NAV-->
<main class="wrap" id="main-content">
<div class="dash-head"><div><h1>🤖 Connect your Telegram bot</h1><p class="live-link">Walk through the 4 steps below — takes about 2 minutes.</p></div></div>
<p class="mt-8"><a href="/dashboard" class="back-link">← Back to Dashboard</a></p>

<div class="card"><h2>Step 1</h2><p class="card-sub">Open @BotFather on Telegram — it's Telegram's official bot for creating bots.</p>
<div class="d-flex items-center gap-14 flex-wrap">
<span class="step-icon">📨</span>
<div><p class="mb-8">Tap the button below to open a chat with BotFather. It works on mobile and desktop.</p>
<a class="btn btn--accent" href="https://t.me/BotFather" target="_blank" rel="noopener">Open @BotFather →</a></div>
</div>
<button class="btn btn--sm btn--ghost mt-14" data-next="step2" type="button">I've opened BotFather →</button>
</div>

<div class="card" id="step2" hidden><h2>Step 2</h2><p class="card-sub">Create your bot by sending the /newbot command to BotFather.</p>
<div class="d-flex items-center gap-14 flex-wrap">
<span class="step-icon">💬</span>
<div><p class="mb-8">In the chat with BotFather, type:</p>
<div class="code-block">/newbot</div>
<p class="mb-8">BotFather will ask you for:</p>
<ul class="step-list">
<li>A <b>display name</b> for your bot (e.g. "YourName Leaderboard")</li>
<li>A <b>username</b> that ends in <span class="mono">bot</span> (e.g. "chuckybtz_leaderboard_bot")</li>
</ul>
<p class="m-0 c-soft">Just follow BotFather's prompts — it'll guide you through each step.</p></div>
</div>
<button class="btn btn--sm btn--ghost mt-14" data-next="step3" type="button">I've created my bot →</button>
</div>

<div class="card" id="step3" hidden><h2>Step 3</h2><p class="card-sub">Copy the API token BotFather gives you and paste it below.</p>
<div class="d-flex items-center gap-14 flex-wrap">
<span class="step-icon">🔑</span>
<div><p class="mb-8">After you create the bot, BotFather sends you a message with an <b>API token</b>. It looks like this:</p>
<div class="code-block code-block--muted">123456789:ABCdefGhIjKlMnOpQrStUvWxYz</div>
<p class="mb-14 c-soft">Copy that whole string and paste it in the box below. We'll validate it and set up the webhook automatically.</p>
<div class="field mb-10"><label for="botToken">Bot token</label><input id="botToken" placeholder="123456789:ABCdefGhIjKlMnOpQrStUvWxYz" autocomplete="off" spellcheck="false" /></div>
<button class="btn btn--accent" id="connectBtn" type="button" disabled>Connect bot</button>
<div id="connectStatus" class="hint mt-8 min-h-18" role="status" aria-live="polite"></div></div>
</div>
</div>

<div class="card" id="step4" hidden><h2>Step 4</h2><p class="card-sub">🎉 Your bot is connected and ready to go!</p>
<div class="d-flex items-center gap-14 flex-wrap">
<span class="step-icon">✅</span>
<div><p class="mb-8">Your bot <b id="botName">bot</b> (<span class="mono" id="botUsername">@bot</span>) is now wired up. The webhook has been set — messages sent to your bot will be handled automatically.</p>
<p class="mb-12 c-soft">You can now share your bot link with your audience. They can interact with your leaderboard directly through Telegram.</p>
<div class="d-flex gap-10 flex-wrap">
<a class="btn btn--accent" href="/dashboard">Back to dashboard</a>
<a class="btn" href="/bot/dashboard" id="botDashLink">Go to bot dashboard →</a>
</div></div>
</div>
</div>

<div class="card card--dashed mt-24"><h2>💡 Tips</h2><p class="card-sub">A few things to know.</p>
<ul class="tips-list">
<li>You only need to do this once — the webhook stays connected.</li>
<li>Your bot token is sensitive. <b>Never share it publicly.</b> If you think it's been leaked, you can revoke it from BotFather and we'll reconnect.</li>
<li>Want a custom avatar or description for your bot? Set it up in BotFather with <span class="mono">/setuserpic</span> and <span class="mono">/setdescription</span>.</li>
<li>Need help? <a href="https://t.me/BotFather" target="_blank" rel="noopener">BotFather's FAQ</a> covers most questions.</li>
</ul></div>

</main>
<script src="/assets/bot-setup.js?v=2"></script></body></html>`,

admin: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/admin" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank Admin requires JavaScript</p><p>Please enable JavaScript in your browser settings to use the admin panel.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><div class="brand">Your<b>Rank</b> <span class="label ml-8">ADMIN</span></div>
<div class="topbar-right"><span class="muted" id="userEmail"></span><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<main class="wrap" id="main-content"><div id="loading" class="py-26">
<div class="mb-18"><div class="skeleton skeleton-text--lg skel-w-160"></div><div class="skeleton skeleton-text--sm skel-w-240 mt-8"></div></div>
<div class="stats"><div class="stat"><div class="skeleton skeleton-text skel-w-60"></div><div class="skeleton skeleton-text--sm skel-w-50 mt-6"></div></div><div class="stat"><div class="skeleton skeleton-text skel-w-40"></div><div class="skeleton skeleton-text--sm skel-w-40 mt-6"></div></div><div class="stat"><div class="skeleton skeleton-text skel-w-30"></div><div class="skeleton skeleton-text--sm skel-w-50 mt-6"></div></div><div class="stat"><div class="skeleton skeleton-text skel-w-70"></div><div class="skeleton skeleton-text--sm skel-w-80 mt-6"></div></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-300"></div></div>
</div>
<div id="panel" hidden>
<div class="dash-head"><div><h1>Operator panel</h1><p class="live-link">Everything that happens on YourRank, in one place.</p></div></div>
<div class="stats"><div class="stat"><b id="s_users">–</b><span>accounts</span></div><div class="stat"><b id="s_pro">–</b><span>on Pro</span></div><div class="stat"><b id="s_leads">–</b><span>leads</span></div><div class="stat"><b id="s_rev">–</b><span>revenue (USD)</span></div></div>
<div class="tabs" role="tablist"><button class="tab is-on" id="tab-btn-users" data-tab="users" type="button" role="tab" aria-selected="true" aria-controls="tab-users">Users</button><button class="tab" id="tab-btn-leads" data-tab="leads" type="button" role="tab" aria-selected="false" aria-controls="tab-leads">Leads</button><button class="tab" id="tab-btn-payments" data-tab="payments" type="button" role="tab" aria-selected="false" aria-controls="tab-payments">Payments</button></div>
<div class="tabpane" id="tab-users" role="tabpanel" aria-labelledby="tab-btn-users">
<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Email</th><th>Page</th><th>Plan</th><th>Status</th><th class="ta-r">Players</th><th>Joined</th><th>Actions</th></tr></thead><tbody id="usersBody"></tbody></table></div>
<div class="empty" id="usersEmpty" hidden>No users yet.</div>
<div id="usersPagination" class="admin-pagination"></div></div>
<div class="tabpane" id="tab-leads" role="tabpanel" aria-labelledby="tab-btn-leads" hidden>
<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Handle</th><th>Casino</th><th>Contact</th><th>Note</th><th>When</th></tr></thead><tbody id="leadsBody"></tbody></table></div>
<div id="leadsPagination" class="admin-pagination"></div>
<div class="empty" id="leadsEmpty" hidden>No leads yet. Share the landing page around.</div></div>
<div class="tabpane" id="tab-payments" role="tabpanel" aria-labelledby="tab-btn-payments" hidden>
<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>User</th><th>Provider</th><th class="ta-r">Amount</th><th>Status</th><th>When</th></tr></thead><tbody id="payBody"></tbody></table></div>
<div id="payPagination" class="admin-pagination"></div>
<div class="empty" id="payEmpty" hidden>No payments yet.</div></div>
<p class="hint mt-18">Manual activation: use <b>+31d Pro</b> on any user after they pay you directly (PayPal, bank, whatever). Crypto payments through the site activate on their own. Reset links work for 24h — send them over Discord/Telegram if email isn't wired up.</p>
</div></main>
<script src="/assets/admin.js?v=2"></script></body></html>`,

  admin2fa: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify · YourRank Admin</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/admin" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" />
<link rel="stylesheet" href="/assets/admin2fa-styles.css" /></head><body>
<noscript><div class="noscript-msg"><p>YourRank Admin requires JavaScript</p><p>Please enable JavaScript to verify two-factor authentication.</p></div></noscript>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><div class="brand">Your<b>Rank</b> <span class="label ml-8">ADMIN</span></div>
<div class="topbar-right"><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<main class="wrap" id="main-content">
<div class="tfa-wrap" id="tfaVerify">
<h1>🔒 Two-Factor Authentication</h1>
<p>Enter the 6-digit code from your authenticator app.</p>
<label for="tfaCode" class="sr-only">6-digit verification code</label><input class="code-input" id="tfaCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" autofocus aria-label="Verification code" />
<div class="err" id="tfaErr" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent" id="tfaSubmit" type="button">Verify</button>
</div>

<div class="tfa-wrap tfa-setup" id="tfaSetup" hidden>
<h2>Set Up Two-Factor Authentication</h2>
<p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
<div class="qr-wrap"><img id="tfaQr" alt="QR Code" width="200" height="200" /></div>
<p>Or enter this secret manually:</p>
<code class="secret-box" id="tfaSecret"></code>
<p class="mt-16">After scanning, enter the 6-digit code to verify setup:</p>
<label for="tfaSetupCode" class="sr-only">6-digit verification code</label><input class="code-input" id="tfaSetupCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" aria-label="Verification code" />
<div class="err" id="tfaSetupErr" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent" id="tfaSetupSubmit" type="button">Enable 2FA</button>
</div>
</main>
<script src="/assets/qrcode.js"></script>
<script src="/assets/admin2fa.js?v=3"></script></body></html>`,

  setup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Setup · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/setup" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/shell-nav.css" />
<link rel="stylesheet" href="/assets/setup-styles.css" />
<noscript><div class="noscript-msg"><p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to set up your leaderboard.</p></div></noscript>
<!--GM_NAV-->
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<main class="gm-shell-main" id="main-content">
<div class="setup-wrap">
<h1>Set up your leaderboard</h1>
<p class="sub">Four quick steps and you're live.</p>
<div class="steps-ind" id="stepsInd"></div>

<div class="wiz-step active" id="step1">
<div class="field"><label for="wiz_name">Your name / handle</label>
<input id="wiz_name" placeholder="YourName" autocomplete="nickname" required />
<span class="hint">Auto-generates your URL below.</span></div>
<div class="field"><label for="wiz_slug">Your URL</label>
<input id="wiz_slug" placeholder="chuckybtz" autocomplete="off" />
<div class="preview-url" id="wiz_preview">yourrank.site/…</div>
<span class="hint">Letters, numbers, dashes only. You can change it here.</span></div>
<div class="btns-row"><span></span><button class="btn btn--accent" id="wiz1next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step2">
<div class="field"><label for="wiz_casino">Casino name</label>
<input id="wiz_casino" placeholder="Stake" /></div>
<div class="field"><label for="wiz_code">Referral code</label>
<input id="wiz_code" placeholder="BTZ" /></div>
<div class="field"><label for="wiz_cta">Referral link</label>
<input id="wiz_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="btns-row"><button class="btn" id="wiz2back" type="button">← Back</button><button class="btn btn--accent" id="wiz2next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step3">
<div class="field"><label for="wiz_players">Paste your players</label>
<span class="hint">One player per line: <span class="mono">name, wagered amount</span>. Comma or tab separated. Wagered is optional (defaults to 0).</span>
<textarea class="players-ta" id="wiz_players" rows="8" spellcheck="false" placeholder="*****ess, 152000
*****y, 98000
*****k, 61250"></textarea>
<span class="hint" id="wiz_pcount">0 players detected</span></div>
<div class="btns-row"><button class="btn" id="wiz3back" type="button">← Back</button><button class="btn btn--accent" id="wiz3next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step4">
<h2 class="setup-complete-title">Your page is ready! 🎉</h2>
<p class="setup-complete-sub">Share this link with your community:</p>
<div class="share-box">
<span class="url" id="wiz_finalUrl">yourrank.site/…</span>
<div class="d-flex gap-10 justify-center flex-wrap">
<button class="btn btn--accent" id="wiz_copy" type="button">📋 Copy link</button>
<a class="btn" id="wiz_view" href="#" target="_blank">View live page →</a>
</div>
</div>
<div class="btns-row"><button class="btn" id="wiz4back" type="button">← Back</button><button class="btn btn--accent" id="wiz_finish" type="button">Go to dashboard</button></div>
</div>

<div class="err" id="wiz_err" role="alert" aria-live="assertive"></div>
</div>
</main>
<script src="/assets/setup-wizard.js?v=2"></script></body></html>`,

  overlay: (data, opts = {}) => {
  const b = data.brand || {};
  const br = data.branding || {};
  const players = (data.players || []).slice().sort((a, c) => c.wagered - a.wagered).slice(0, 5);
  const endsAt = data.endsAt || null;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return "$" + (n || 0).toLocaleString("en-US");
  };
  const medal = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
  const rows = players.map((p, i) => `<div class="ov-row" data-name="${esc(p.name)}"><span class="ov-medal">${medal(i)}</span><span class="ov-name">${esc(p.name)}</span><span class="ov-wager">${fmt(p.wagered)}</span></div>`).join("");
  const empty = 5 - players.length;
  const emptyRows = empty > 0 ? Array.from({ length: empty }, (_, i) => `<div class="ov-row ov-empty"><span class="ov-medal">#${players.length + i + 1}</span><span class="ov-name">—</span><span class="ov-wager">—</span></div>`).join("") : "";
  const accentA = (br.accentA && /^#[0-9a-fA-F]{6}$/.test(br.accentA)) ? br.accentA : "#c8ff00";
  const accentB = (br.accentB && /^#[0-9a-fA-F]{6}$/.test(br.accentB)) ? br.accentB : "#5ad9ff";
  const dataJson = JSON.stringify({ players, endsAt }).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(b.name)} — OBS Overlay</title>
<style nonce="${opts.nonce || ""}">
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:320px;overflow:hidden;background:transparent;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;color:#fff}
.ov-wrap{width:320px;padding:14px 16px;background:rgba(8,8,12,0.92);border-radius:14px;border:1px solid rgba(255,255,255,0.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.ov-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.ov-brand{display:flex;flex-direction:column;gap:1px}
.ov-brand-name{font-size:15px;font-weight:700;letter-spacing:-.02em;background:linear-gradient(135deg,${accentA},${accentB});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;text-shadow:none}
.ov-brand-sub{font-size:10px;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:.08em}
.ov-live{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${accentA}}
.ov-live-dot{width:7px;height:7px;border-radius:50%;background:${accentA};animation:ov-pulse 1.5s ease-in-out infinite}
@keyframes ov-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.ov-timer{display:flex;align-items:center;justify-content:center;gap:3px;margin-bottom:12px;font-size:11px;color:rgba(255,255,255,0.5)}
.ov-timer b{font-family:'JetBrains Mono','Fira Code',monospace;font-size:13px;font-weight:700;color:${accentA};min-width:20px;text-align:center}
.ov-timer-sep{color:rgba(255,255,255,0.2);margin:0 1px}
.ov-timer-label{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,0.3);text-align:center;margin-bottom:6px}
.ov-timer-over{font-size:11px;color:rgba(255,255,255,0.4);font-style:italic}
.ov-rows{display:flex;flex-direction:column;gap:4px}
.ov-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.04);transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s ease,background .3s ease}
.ov-row:first-child{background:linear-gradient(135deg,rgba(200,255,0,0.08),rgba(90,217,255,0.06));border-color:rgba(200,255,0,0.12)}
.ov-row.ov-empty{opacity:.25}
.ov-row.ov-enter{animation:ov-slideIn .5s cubic-bezier(.22,1,.36,1) both}
@keyframes ov-slideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
.ov-row.ov-moved-up{border-left:2px solid ${accentA}}
.ov-row.ov-moved-down{border-left:2px solid rgba(255,80,80,0.6)}
.ov-medal{font-size:16px;min-width:24px;text-align:center;flex-shrink:0}
.ov-name{flex:1;font-size:13px;font-weight:600;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,0.5)}
.ov-wager{font-family:'JetBrains Mono','Fira Code',monospace;font-size:12px;font-weight:600;color:${accentA};flex-shrink:0;text-shadow:0 1px 3px rgba(0,0,0,0.5)}
.ov-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.05)}
.ov-footer .ov-count{font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.08em}
.ov-footer .ov-powered{font-size:8px;color:rgba(255,255,255,0.15);letter-spacing:.04em}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
</style>
</head><body>
<div class="ov-wrap">
<div class="ov-head">
<div class="ov-brand">
<span class="ov-brand-name">${esc(b.name)}</span>
<span class="ov-brand-sub">${esc(b.casino || "Stake")} · ${esc(b.period || "Monthly")}</span>
</div>
<span class="ov-live"><span class="ov-live-dot"></span>LIVE</span>
</div>
${endsAt ? `<p class="ov-timer-label">${esc(b.prizePool || "")} resets in</p>
<div class="ov-timer" data-ov-timer>
<b data-ot>--</b><span class="ov-timer-sep">d</span>
<b data-ot>--</b><span class="ov-timer-sep">:</span>
<b data-ot>--</b><span class="ov-timer-sep">:</span>
<b data-ot>--</b>
</div>` : ""}
<div class="ov-rows" id="ov-players">${rows}${emptyRows}</div>
<div class="ov-sponsor" data-ov-sponsor style="display:none;font-size:9px;text-align:center;color:rgba(255,255,255,0.4);padding:6px 0;letter-spacing:.04em"></div>
<div class="ov-footer">
<span class="ov-count"><span id="ov-count">${(data.players || []).length}</span> players</span>
<span class="ov-powered">YourRank</span>
</div>
</div>
<div id="ov-config" data-slug="${esc(opts.slug || "")}" data-theme="${esc(opts.theme || 'default')}" data-sponsor="${esc(opts.sponsor || "")}" data-sponsor-url="${esc(opts.sponsorUrl || "")}" data-json='${dataJson.replace(/'/g, "&#39;")}' hidden></div>
<script src="/assets/overlay.js?v=3"></script>
</body></html>`;
},

  terms: legal("Terms of Service", "July 2026", `
<h2>What YourRank is</h2>
<p>YourRank hosts leaderboard pages for streamers and their communities. You get a dashboard to edit your page's content — prize pool, referral code, player standings — and we serve that page at a public URL. That's the whole service.</p>
<p><b>YourRank is not a casino.</b> No wagering, betting or gambling happens on this platform. Leaderboard standings are entered by the page owner. Prizes shown on any page are offered and paid by that page's owner, not by YourRank.</p>
<h2>Your account</h2>
<p>You need to be at least 18 to use YourRank. You're responsible for keeping your password safe and for everything published on your page. One account, one page.</p>
<h2>Your content</h2>
<p>Everything you put on your page — names, numbers, links, images — is yours, and so is the responsibility for it. Don't publish anything illegal, misleading (fake prizes you don't pay out), or that infringes someone else's rights. Don't impersonate other streamers or brands.</p>
<p>If your page promotes a gambling referral, you're responsible for complying with the laws and platform rules that apply to you and your audience.</p>
<h2>Payments</h2>
<p>Pro is a paid plan billed per 31-day period, paid in cryptocurrency or arranged directly with us. Payments are final once confirmed — if something goes wrong with a payment, contact us and we'll sort it out fairly. If Pro lapses, your page stays live on the Free plan (player limit and badge apply again).</p>
<h2>What we can do</h2>
<p>We can suspend pages or accounts that break these terms, harm other users, or expose us to legal risk. We'll be reasonable about it. We may change prices or features with notice.</p>
<h2>Liability</h2>
<p>YourRank is provided as-is. We work to keep pages online, but we don't guarantee uninterrupted service and we're not liable for lost revenue, lost viewers, or disputes between you and your community. Our total liability is capped at what you paid us in the last 3 months.</p>
<h2>Contact</h2>
<p>Questions about these terms: email us at contact@yourrank.site.</p>`, "terms", "YourRank terms of service. Covers accounts, content, payments, liability, and how we handle disputes."),

  privacy: legal("Privacy Policy", "July 2026", `
<h2>What we collect</h2>
<p>As little as we can get away with:</p>
<ul>
<li><b>Account:</b> your email and a hashed password (we never store the password itself).</li>
<li><b>Page content:</b> whatever you put on your leaderboard — it's public by design.</li>
<li><b>Requests:</b> if you use the contact form, we keep what you send us (handle, contact info, note).</li>
<li><b>Payments:</b> plan, amount, and payment status. Crypto payments are processed by NOWPayments — we never see or store wallet keys or card numbers.</li>
</ul>
<h2>Cookies</h2>
<p>Two cookies: a session cookie to keep you signed in, and a CSRF token cookie for security. No ad trackers, no analytics cookies, no third-party pixels.</p>
<h2>Who else sees data</h2>
<p>Our infrastructure runs on Cloudflare (hosting, database). Payment processing runs through NOWPayments. That's it — we don't sell or share your data with anyone else.</p>
<h2>How long we keep it</h2>
<p>As long as your account exists. Want your account and data deleted? Go to <a href="/dashboard/billing">Dashboard → Billing → Danger zone</a> and click "Delete my account."</p>
<h2>Your page is public</h2>
<p>Anything you publish on your leaderboard page is visible to anyone with the link, including player names you enter. Mask player names (like <span class="mono">*****ess</span>) if your community expects it.</p>
<h2>Contact</h2>
<p>Privacy questions or deletion requests: email us at contact@yourrank.site.</p>`, "privacy", "YourRank privacy policy. We collect minimal data: email, hashed password, and your public page content. No ad trackers."),

  responsible: legal("Responsible Play", "July 2026", `
<p><b>YourRank pages are about gambling, and gambling carries real risk.</b> The leaderboards hosted here track wagers made on third-party casino sites. YourRank itself takes no bets and pays no winnings — but if you're a viewer taking part in these communities, this page is for you.</p>
<h2>The basics</h2>
<ul>
<li>You must be <b>18 or older</b> (or the legal gambling age where you live, if higher).</li>
<li>Only gamble money you can afford to lose. A leaderboard position is never worth chasing losses.</li>
<li>Wager requirements on leaderboards can encourage playing more than you planned. Set a limit before you start, not after.</li>
<li>Gambling is entertainment, not income.</li>
</ul>
<h2>If it stops being fun</h2>
<p>These organisations offer free, confidential help:</p>
<ul>
<li><a href="https://www.begambleaware.org" target="_blank" rel="noopener">BeGambleAware</a> — advice and free support (UK)</li>
<li><a href="https://www.gamcare.org.uk" target="_blank" rel="noopener">GamCare</a> — support, tools and treatment</li>
<li><a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener">Gamblers Anonymous</a> — worldwide meetings</li>
<li><a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener">Gambling Therapy</a> — international, multilingual</li>
</ul>
<p>Most casinos, including Stake, offer self-exclusion and loss-limit tools in account settings. Use them.</p>
<h2>For streamers</h2>
<p>If you run a leaderboard on YourRank: be straight with your community about the risks, honour the prizes you post, and never pressure viewers to wager. Pages that mislead their communities get suspended.</p>`, "responsible", "Responsible play guidelines for YourRank users and viewers. Gambling carries real risk — know the limits and find help resources."),

  refund: legal("Refund & Cancellation Policy", "July 2026", `
<p><b>Free plan</b> — YourRank can be used free of charge, forever. No payment or credit card is required to create a page and test the service.</p>
<h2>Subscriptions</h2>
<p>Paid subscriptions are billed in advance. If you upgrade and change your mind, you can cancel at any time from your dashboard. After cancelling, you keep your paid features until the end of the current billing period. We do not offer partial refunds for unused days.</p>
<h2>Crypto payments</h2>
<p>Payments made in cryptocurrency are non-refundable because of blockchain irreversibility. Make sure the selected plan and amount are correct before sending any transaction.</p>
<h2>Lifetime plans</h2>
<p>Lifetime plans are a one-time purchase. They are non-refundable because they include immediate, permanent access to Pro features.</p>
<h2>Failed or duplicate charges</h2>
<p>If a charge was duplicated by mistake, contact us within 14 days and we will review the transaction. Approved duplicate charges are refunded to the original wallet or payment method.</p>
<h2>How to cancel</h2>
<p>Visit <a href="/dashboard/billing">/dashboard/billing</a> and choose "Cancel subscription". Your page will downgrade to the Free plan at the end of the billing period.</p>
<h2>Contact</h2>
<p>Questions about billing or refunds: <a href="/contact">contact us</a> or email contact@yourrank.site.</p>`, "refund", "YourRank refund and cancellation policy. Crypto payments are non-refundable; subscriptions can be cancelled at any time."),

  cookies: legal("Cookie Policy", "July 2026", `
<p>YourRank uses cookies and similar technologies to keep you signed in, remember your preferences, and understand how our pages are used. This policy explains what we use and how you can control it.</p>
<h2>Essential cookies</h2>
<p>These are required for the site to work. They include your session cookie (<code>yr_session</code>) and CSRF token cookie (<code>__csrf</code>). We do not use them for advertising or tracking you across the web.</p>
<h2>Analytics and performance</h2>
<p>We collect aggregated page views and referrers for your own leaderboard analytics. No third-party analytics trackers (Google Analytics, Meta Pixel, etc.) are loaded on YourRank pages.</p>
<h2>Your choices</h2>
<p>You can clear cookies through your browser settings at any time. If you disable cookies, you will be signed out and some dashboard features may not work.</p>
<h2>Contact</h2>
<p>Questions about this policy: email contact@yourrank.site.</p>`, "cookies", "YourRank cookie policy. Explains essential cookies, analytics, and how to manage your choices."),

  contact: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Contact · YourRank</title>
<meta name="description" content="Get in touch with the YourRank team. Questions, feedback, and support." />
<link rel="canonical" href="https://yourrank.site/contact" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="wrap" id="main-content" style="max-width:620px;padding:48px 24px">
<h1>Contact</h1>
<p class="sub">Questions, feedback, or billing issue? Send us a message and we'll reply by email.</p>
<form id="contactForm" class="card">
<div class="field"><label for="c_name">Name</label><input id="c_name" name="name" type="text" autocomplete="name" required maxlength="120" /></div>
<div class="field"><label for="c_email">Email</label><input id="c_email" name="email" type="email" autocomplete="email" required maxlength="254" /></div>
<div class="field"><label for="c_subject">Subject</label><input id="c_subject" name="subject" type="text" maxlength="120" placeholder="What is this about?" /></div>
<div class="field"><label for="c_message">Message</label><textarea id="c_message" name="message" rows="6" required minlength="10" maxlength="4000" placeholder="Tell us what's going on..."></textarea></div>
<div class="err" id="c_err" role="alert" aria-live="assertive"></div>
<button class="btn btn--accent w-full" type="submit" id="c_submit">Send message</button>
<p class="hint" id="c_success" hidden style="color:var(--accent)">Message received. We'll reply by email.</p>
</form>
<p class="hint" style="margin-top:24px">You can also email <a href="mailto:contact@yourrank.site">contact@yourrank.site</a> directly.</p>
</main>
<footer class="wrap footer-wrap" style="margin-top:48px">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/responsible">Responsible play</a></span>
</footer>
<script src="/assets/contact.js"></script></body></html>`,

  pricing: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pricing · YourRank</title>
<meta name="description" content="YourRank pricing and plans. Free forever, Starter, Pro, Agency, and Lifetime." />
<link rel="canonical" href="https://yourrank.site/pricing" />
<meta property="og:title" content="YourRank Pricing">
<meta property="og:description" content="Free, Starter, Pro, Agency and Lifetime plans for casino streamer leaderboards.">
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<nav class="top" style="max-width:1080px;margin:0 auto;padding:0 24px"><div class="brand">Your<b>Rank</b></div>
<div class="links"><a href="/">Home</a><a href="/#how">How it works</a><a href="/contact">Contact</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Get started</a></div></nav>
<main class="wrap" id="main-content" style="padding:48px 24px 24px">
<h1 style="font-size:clamp(32px,5vw,52px);line-height:1.05;letter-spacing:-.03em;margin:0 0 12px;max-width:18ch">Simple pricing for streamers.</h1>
<p class="lead" style="max-width:58ch">Start free. Upgrade when your board is pulling weight. No hidden fees, no credit card required to try.</p>
<div class="pricing-grid" style="margin-top:32px">
<div class="price-card"><div class="price-head"><h3>Free</h3><div class="price-amount">$0</div><div class="price-period">forever</div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 10 players</li><li>YourRank badge on your page</li><li>Basic analytics (7 days)</li><li>Live countdown &amp; auto-sort</li></ul><a href="/signup" class="btn btn--sm price-cta">Start free</a></div>
<div class="price-card"><div class="price-head"><h3>Starter</h3><div class="price-amount">$12<span>/mo</span></div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 25 players</li><li>No YourRank badge</li><li>Full analytics (30 days)</li><li>CSV import</li></ul><a href="/signup" class="btn btn--sm price-cta">Start</a></div>
<div class="price-card price-card--popular"><div class="price-badge">Most Popular</div><div class="price-head"><h3>Pro</h3><div class="price-amount">$29<span>/mo</span></div></div><ul class="price-features"><li>Up to 3 leaderboards</li><li>Unlimited players</li><li>No YourRank badge</li><li>Custom domain</li><li>OBS overlay widget</li><li>Discord webhooks</li><li>Telegram notifications</li><li>Priority support</li></ul><a href="/signup" class="btn btn--sm btn--accent price-cta">Go Pro</a></div>
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/mo</span></div></div><ul class="price-features"><li>Unlimited leaderboards</li><li>Unlimited players</li><li>White-label branding</li><li>API access</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="/contact" class="btn btn--sm price-cta">Contact us</a></div>
<div class="price-card price-card--lifetime"><div class="price-badge price-badge--lifetime">Best Value</div><div class="price-head"><h3>Lifetime Pro</h3><div class="price-amount">$149<span class="price-amount-sub"> one-time</span></div></div><ul class="price-features"><li>All Pro features</li><li>Pay once, use forever</li><li>No monthly bills</li><li>Up to 3 leaderboards</li><li>Unlimited players</li><li>Custom domain &amp; OBS widget</li><li>Priority support</li></ul><a href="/signup" class="btn btn--accent btn--sm price-cta">Get Lifetime Pro</a></div>
</div>

<h2 class="sec" style="margin-top:64px">Compare plans</h2>
<table class="pricing" style="margin-top:24px">
<thead><tr><th>Feature</th><th>Free</th><th>Starter</th><th>Pro</th><th>Agency</th></tr></thead>
<tbody>
<tr><td>Leaderboards</td><td>1</td><td>1</td><td>3</td><td>Unlimited</td></tr>
<tr><td>Players</td><td>10</td><td>25</td><td>Unlimited</td><td>Unlimited</td></tr>
<tr><td>Custom domain</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>OBS overlay</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Postback tracking</td><td>Basic</td><td>Basic</td><td>Advanced</td><td>Advanced</td></tr>
<tr><td>API access</td><td>—</td><td>—</td><td>—</td><td>✓</td></tr>
<tr class="pro-row"><td>Price</td><td>$0</td><td>$12/mo</td><td>$29/mo</td><td>$79/mo</td></tr>
</tbody>
</table>

<h2 class="sec" style="margin-top:64px">Frequently asked questions</h2>
<div class="steps" style="margin-top:24px">
<div class="step"><div class="n">?</div><div><h3>Can I cancel any time?</h3><p>Yes. Cancel from <a href="/dashboard/billing">/dashboard/billing</a> and your page keeps paid features until the end of the billing period.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Is there a free trial?</h3><p>Free plan is the trial — you can use it for as long as you want. Upgrade when you need more players or features.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>What payment methods do you accept?</h3><p>Crypto (BTC, ETH, USDT and 100+ more) through our payment processor. We are working on adding credit card checkout.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Do you offer refunds?</h3><p>Subscriptions keep working until the end of the period and are not partially refunded. Crypto and lifetime purchases are non-refundable. See <a href="/refund">/refund</a>.</p></div></div>
</div>

<div class="cta cta-wrap" style="margin-top:64px;text-align:center"><a href="/signup" class="btn btn--accent btn--cta-lg">Create your free page</a></div>
</main>
<footer><div class="wrap footer-wrap">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/responsible">Responsible play</a></span>
</div></footer>
<script src="/assets/landing.js"></script></body></html>`,
};
