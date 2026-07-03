// Static HTML pages served by the Worker. Kept as plain template strings.

// Shared shell for the legal pages — plain, readable, no fluff.
const legal = (title, updated, body, pagePath) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · YourRank</title><link rel="canonical" href="https://yourrank.site/${pagePath}" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="legal"><h1>${title}</h1><p class="legal-updated">Last updated: ${updated}</p>
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
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"YourRank","url":"https://yourrank.site","description":"Hosted leaderboard pages for casino streamers","contactPoint":{"@type":"ContactPoint","contactType":"customer service"}}</script>
</head><body>
<div class="wrap">
<nav class="top"><div class="brand">Your<b>Rank</b></div>
<div class="links"><a href="#how">How it works</a><a href="#postbacks">Postbacks</a><a href="#pricing">Pricing</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Get started</a></div></nav>
<header class="hero"><div>
<p class="label" style="margin-bottom:18px">Leaderboards for casino streamers</p>
<h1>Run your leaderboard without touching code.</h1>
<p class="lead">Your prize pool, referral code and ranked players, on a page you edit from a dashboard. Change a number, hit save, your page updates. That's it.</p>
<div class="cta"><a href="/signup" class="btn btn--accent">Create your page</a><a href="#example" class="btn">See a live one</a></div>
<p class="fine">Free to start. Your own URL from day one.</p></div>
<div class="spec"><div class="spec-h"><span>your-page.config</span><span class="dot">● live</span></div>
<div class="spec-row"><span>Public URL</span><span>yourrank.site/you</span></div>
<div class="spec-row"><span>Prize pool</span><span>editable</span></div>
<div class="spec-row"><span>Countdown</span><span>auto</span></div>
<div class="spec-row"><span>Standings</span><span>sorted by wager</span></div>
<div class="spec-row"><span>Updates</span><span>instant</span></div></div></header>
</div>
<section id="how"><div class="wrap"><h2 class="sec">How it works</h2><p class="sec-sub">Three steps. No build tools, no redeploys, nothing to host yourself.</p>
<div class="steps">
<div class="step"><div class="n">01</div><div><h3>Create your account</h3><p>Pick a handle. That becomes your page URL. Takes about a minute.</p></div></div>
<div class="step"><div class="n">02</div><div><h3>Fill in your details</h3><p>Prize pool, referral code, countdown date, and your ranked players. All from one dashboard.</p></div></div>
<div class="step"><div class="n">03</div><div><h3>Share your link</h3><p>Your page is live. Update the numbers whenever you want and they change instantly.</p></div></div>
</div>
<div class="steps" style="margin-top:24px">
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
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/mo</span></div></div><ul class="price-features"><li>Unlimited leaderboards</li><li>Unlimited players</li><li>White-label branding</li><li>API access</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="/signup" class="btn btn--sm price-cta">Contact us</a></div>
<div class="price-card" style="border:2px solid #c8ff00;position:relative"><div class="price-badge" style="background:#c8ff00;color:#000">Best Value</div><div class="price-head"><h3>Lifetime Pro</h3><div class="price-amount">$149<span style="font-size:13px;font-weight:400"> one-time</span></div></div><ul class="price-features"><li>All Pro features</li><li>Pay once, use forever</li><li>No monthly bills</li><li>Up to 3 leaderboards</li><li>Unlimited players</li><li>Custom domain &amp; OBS widget</li><li>Priority support</li></ul><a href="/signup" class="btn btn--accent btn--sm price-cta">Get Lifetime Pro</a></div>
</div></div></section>
<section id="start"><div class="wrap"><h2 class="sec">Ready to start?</h2><p class="sec-sub">Create your free page in under a minute. No credit card needed.</p>
<div class="cta" style="text-align:center;margin:32px 0"><a href="/signup" class="btn btn--accent" style="font-size:18px;padding:16px 36px">Create your free page</a></div></div></section>
<footer><div class="wrap" style="display:flex;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a></span>
<span>18+ · Gambling can be addictive. Play responsibly.</span></div></footer>
<script src="/assets/landing.js?v=2"></script>
</body></html>`,

  login: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sign in · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/login" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Your leaderboard, hosted and handled.</h1><p>Edit your prize pool, code and players from one dashboard. Your page updates instantly. No code, no redeploys.</p></div>
<div class="feat"><div>— Live countdown to every reset</div><div>— Auto-sorted standings from wager</div><div>— Your own public URL</div></div></aside>
<main class="auth-main"><div class="auth-card"><h2>Sign in</h2><p class="sub">Welcome back.</p>
<form id="form" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required /></div>
<div class="err" id="err"></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Sign in</button></form>
<p class="foot">No account? <a href="/signup">Create one</a> · <a href="/forgot">Forgot password?</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  forgot: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset password · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/forgot" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Locked out? It happens.</h1><p>Tell us the email on your account and we'll send a reset link. If email isn't set up on this deployment yet, contact support and we'll hand you a link directly.</p></div>
<div class="feat"></div></aside>
<main class="auth-main"><div class="auth-card"><h2>Reset password</h2><p class="sub">We'll email you a link.</p>
<form id="form" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="err" id="err"></div><div class="msg" id="msg" hidden></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Send reset link</button></form>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  reset: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New password · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/reset" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Set a new password.</h1><p>Pick something you'll remember this time. At least 8 characters.</p></div>
<div class="feat"></div></aside>
<main class="auth-main"><div class="auth-card"><h2>New password</h2><p class="sub">Then you're straight back in.</p>
<form id="form" novalidate><div class="field"><label for="password">New password</label><input id="password" name="password" type="password" autocomplete="new-password" required />
<span class="hint">At least 8 characters.</span></div>
<div class="err" id="err"></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Save & sign in</button></form>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  signup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Create account · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/signup" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Your<b>Rank</b></div></div>
<div><h1>Launch your leaderboard in a few minutes.</h1><p>Pick a handle, fill in your prizes and players, and your page goes live at yourrank.site/yourname.</p></div>
<div class="feat"><div>— Free to set up</div><div>— Your public URL from day one</div><div>— Upgrade to Pro when you're ready</div></div></aside>
<main class="auth-main"><div class="auth-card"><h2>Create account</h2><p class="sub">Free. Takes a minute.</p>
<form id="form" novalidate>
<div class="field"><label for="name">Display name</label><input id="name" name="name" type="text" placeholder="ChuckyBTZ" autocomplete="nickname" required />
<span class="hint">Also becomes your page URL: <span class="mono" id="slugPreview">yourrank.site/…</span></span></div>
<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="new-password" required />
<span class="hint">At least 8 characters.</span></div>
<div class="err" id="err"></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Create account</button></form>
<p class="foot">Already have one? <a href="/login">Sign in</a></p></div></main></div>
<script src="/assets/auth.js?v=2"></script></body></html>`,

  dashboard: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dashboard · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS--></head><body>
<!--GM_NAV-->
<div class="wrap" id="app"><div class="skel" id="loading">Loading your leaderboard…</div>
<div id="dash" hidden>
<div class="dash-head"><div><h1>Your leaderboard</h1><p class="live-link">Live at <a id="liveLink" href="#" target="_blank">…</a></p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div class="card" id="boardSwitcher"><h2>Boards</h2><p class="card-sub">Switch between your leaderboards. <span class="hint" id="boardCount"></span></p>
<div class="board-list" id="boardList"></div>
<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" id="newBoard" type="button" hidden>+ New board</button></div>
<div id="newBoardForm" hidden style="margin-top:12px;display:flex;gap:8px;align-items:end;flex-wrap:wrap">
<div class="field" style="flex:1;min-width:160px;margin:0"><label for="nb_name">Board name</label><input id="nb_name" placeholder="July 2026 Board" /></div>
<div class="field" style="flex:1;min-width:160px;margin:0"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="july-2026" /></div>
<button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button>
<button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button>
<div class="hint" id="nb_err" style="width:100%"></div>
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
<table class="players"><thead><tr><th class="rank">#</th><th>Player</th><th class="ta-r">Wagered</th><th class="ta-r">Prize</th><th></th></tr></thead><tbody id="rows"></tbody></table>
<div id="playersEmpty" class="empty" hidden>No players yet. Add your first one.</div>
<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" id="addRow">+ Add player</button><button class="btn btn--sm" id="importBtn" type="button">Paste from spreadsheet</button><button class="btn btn--sm" id="csvImportBtn" type="button">📁 Import CSV</button><button class="btn btn--sm btn--ghost" id="csvTemplateBtn" type="button">Download template</button><input type="file" id="csvFileInput" accept=".csv,.tsv,.txt" hidden /></div>
<div class="import" id="importPanel" hidden>
<p class="hint" style="margin:0 0 8px">One player per line: <span class="mono">name, wagered, prize</span> — commas or tabs. Copying straight out of Excel or Google Sheets works. Prize is optional.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div></div>
<div class="card" id="brandCard"><h2>Branding <span class="pill pill--info" style="margin-left:6px">PRO</span></h2><p class="card-sub">Your logo and page colors. Free pages use the default look.</p>
<div id="brandBody">
<div class="grid2">
<div class="field"><label for="logoFile">Logo</label>
<div class="logo-row"><img id="logoPreview" class="logo-preview" alt="" hidden /><input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden />
<button class="btn btn--sm" id="logoPick" type="button">Upload logo</button><button class="btn btn--sm btn--ghost" id="logoClear" type="button" hidden>Remove</button></div>
<span class="hint">PNG, JPG or WebP. Shows in your page header and as the link preview image when your page gets shared. Square works best.</span></div>
<div class="field"><label for="c_a">Page accent colors</label>
<div class="color-row"><input type="color" id="c_a" value="#5ad9ff" /><input type="color" id="c_b" value="#7b8cff" /><button class="btn btn--sm btn--ghost" id="colorsReset" type="button">Reset to default</button></div>
<span class="hint">Drives the big name gradient and buttons on your page. Save to apply.</span></div>
</div></div>
<div class="empty" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="overlayCard"><h2>OBS Stream Overlay <span class="pill pill--info" style="margin-left:6px">PRO</span></h2><p class="card-sub">Add a live leaderboard overlay to your stream. It auto-updates every 15 seconds with smooth rank animations.</p>
<div id="overlayBody">
<div class="field"><label>Overlay URL</label>
<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
<code id="overlayUrl" style="flex:1;font-family:var(--mono);font-size:13px;background:var(--panel-2);border:1px solid var(--line-2);border-radius:8px;padding:10px 12px;word-break:break-all;min-width:0;user-select:all"></code>
<button class="btn btn--sm btn--accent" id="overlayCopy" type="button">📋 Copy</button>
</div>
<span class="hint">Add this as a <b>Browser Source</b> in OBS. Set width to <b>320px</b>, height auto. Check "Shutdown source when not visible" off for live updates.</span></div>
<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
<a class="btn btn--sm" id="overlayPreview" href="#" target="_blank">Preview overlay →</a>
</div>
</div>
<div class="empty" id="overlayLock" hidden>OBS Overlay is a Pro feature. <a href="#" id="overlayUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="domainCard"><h2>Custom Domain <span class="pill pill--info" style="margin-left:6px">PRO</span></h2><p class="card-sub">Serve your leaderboard on your own domain instead of yourrank.site/yourname.</p>
<div id="domainBody">
<div class="field"><label for="f_domain">Your domain</label><input id="f_domain" placeholder="board.mystream.com" />
<span class="hint">Point a <b>CNAME record</b> for your domain to <span class="mono">yourrank.site</span>. Then enter the domain here and click <b>Verify &amp; Provision TLS</b>.</span></div>
<div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
<button class="btn btn--sm btn--accent" id="domainVerify" type="button">Verify &amp; Provision TLS</button>
</div>
<div id="domainStatus" class="hint" style="margin-top:8px;min-height:18px"></div>
</div>
<div class="empty" id="domainLock" hidden>Custom domains are a Pro feature. <a href="#" id="domainUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="notifyCard"><h2>Notifications <span class="pill pill--info" style="margin-left:6px">PRO</span></h2><p class="card-sub">Get alerted when your leaderboard resets or a player breaks into the top 3. Discord and Telegram supported.</p>
<div id="notifyBody">
<div class="field"><label>Events that trigger notifications</label>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px">
<span class="pill pill--muted">🔄 Leaderboard reset</span>
<span class="pill pill--muted">🏆 Player enters top 3</span>
</div></div>
<div class="field"><label for="f_webhook">Discord webhook URL</label>
<input id="f_webhook" placeholder="https://discord.com/api/webhooks/..." />
<span class="hint">Create a webhook in your Discord server settings → Integrations → Webhooks. Paste the URL here.</span></div>
<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:-8px;margin-bottom:16px">
<button class="btn btn--sm" id="testDiscord" type="button">📨 Test Discord</button>
<span class="hint" id="testDiscordStatus"></span>
</div>
<div class="field"><label for="f_tgChatId">Telegram chat/group ID</label>
<input id="f_tgChatId" placeholder="-1001234567890" />
<span class="hint">The chat or group ID where notifications should be sent. Use <code>/start</code> in your bot chat or add the bot to a group to get the ID.</span></div>
<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:-8px;margin-bottom:16px">
<label class="hint chk"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label>
<button class="btn btn--sm" id="testTelegram" type="button">📨 Test Telegram</button>
<span class="hint" id="testTelegramStatus"></span>
</div>
</div>
<div class="empty" id="notifyLock" hidden>Notifications are a Pro feature. <a href="#" id="notifyUpgrade">Upgrade to unlock them</a>.</div></div>
<div class="card" id="archiveCard"><h2>Past winners</h2><p class="card-sub">When a period ends, close it out: the current board is saved and shown on your page under "Past Winners". Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field" style="flex:1;min-width:160px;margin:0"><label for="a_label">Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field" style="margin:0"><label for="a_clear">Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent" id="a_go" type="button" style="align-self:flex-end">Close out period</button></div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div></div>
<div class="card" id="planCard"><h2>Plan &amp; billing</h2><p class="card-sub">Upgrade to unlock more players, boards and features.</p>
<div class="plan-row"><div><div class="plan-name" id="planName">Free</div><div class="hint" id="planMeta">Up to 10 players · YourRank badge on your page</div></div>
<button class="btn btn--accent" id="goPro">Upgrade</button></div>
<p class="hint" id="planHint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes. <a href="/dashboard/billing">See all plans</a>.</p></div>
<div class="savebar"><label class="hint chk" style="margin-right:auto"><input type="checkbox" id="pubToggle" checked /> Page published</label><span class="status" id="status"></span><a class="btn btn--ghost" id="viewLive" href="#" target="_blank">View live page</a><button class="btn btn--accent" id="save">Save changes</button></div></div></div>
<script src="/assets/dashboard.js?v=2"></script></body></html>`,

analytics: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Analytics · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/analytics" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS--></head><body>
<!--GM_NAV-->
<div class="wrap" id="app">
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
<div class="empty" id="refEmpty" hidden>No referrer data yet.</div></div></div>
<div class="skel" id="loading">Loading analytics…</div></div>
<script src="/assets/analytics.js?v=2"></script></body></html>`,

billing: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Billing · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/billing" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS--></head><body>
<!--GM_NAV-->
<div class="wrap" id="app">
<div class="dash-head"><div><h1>Billing</h1><p class="live-link">Your YourRank plan</p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div id="bl" hidden>
<div class="card" id="currentCard"><h2>Current plan</h2><p class="card-sub"><span id="planLine">Free — up to 10 players, one leaderboard.</span></p>
<p class="hint" id="expLine" hidden></p></div>
<div class="card" id="trialCard" hidden><h2>Try Pro free for 7 days</h2><p class="card-sub">Experience all Pro features — unlimited players, custom domain, OBS overlay, notifications — with no commitment.</p>
<button class="btn btn--accent" id="trialBtn" type="button">Start free trial</button>
<p class="status" id="trialStatus"></p></div>
<div class="card" id="trialStatusCard" hidden><h2>Trial active</h2><p class="card-sub" id="trialInfo">Your Pro trial is running.</p>
<p class="hint">After the trial ends, your plan will revert to Free. Upgrade anytime to keep Pro features.</p></div>
<div class="card" id="upgradeCard"><h2>Upgrade</h2><p class="card-sub" id="upgradeSub">Choose the plan that fits your needs.</p>
<div id="planOptions"></div>
<div id="lifetimeBox" style="margin-top:16px;padding:16px;border:2px solid var(--accent);border-radius:12px;background:var(--panel-2)">
<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
<div><div style="font-weight:700;font-size:16px;color:var(--accent)">⚡ Lifetime Pro — $149</div>
<div class="hint" style="margin-top:4px">Pay once, use forever. All Pro features, no monthly bills. No expiry.</div></div>
<button class="btn btn--accent" id="lifetimeBtn" type="button">Get Lifetime Pro</button>
</div>
<p class="status" id="lifetimeStatus"></p></div>
<p class="hint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes.</p>
<p class="status" id="status"></p></div>
<div class="card" id="proCard" hidden><h2>You're on <span id="currentPlanName">Pro</span></h2><p class="card-sub">Thanks for supporting YourRank. Manage everything from the Leaderboard tab.</p>
<p class="hint" id="proExp"></p>
<p class="hint" id="lifetimeNotice" hidden style="color:var(--accent);font-weight:600">⭐ Lifetime Pro — no expiry. You own this forever.</p></div></div>
<div class="skel" id="loading">Loading billing…</div></div>
<script src="/assets/billing.js?v=2"></script></body></html>`,

botSetup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Connect Telegram Bot · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/bot/setup" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS--></head><body>
<!--GM_NAV-->
<div class="wrap" id="app">
<div class="dash-head"><div><h1>🤖 Connect your Telegram bot</h1><p class="live-link">Walk through the 4 steps below — takes about 2 minutes.</p></div></div>

<div class="card"><h2>Step 1</h2><p class="card-sub">Open @BotFather on Telegram — it's Telegram's official bot for creating bots.</p>
<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
<span style="font-size:40px">📨</span>
<div><p style="margin:0 0 8px">Tap the button below to open a chat with BotFather. It works on mobile and desktop.</p>
<a class="btn btn--accent" href="https://t.me/BotFather" target="_blank" rel="noopener">Open @BotFather →</a></div>
</div>
<button class="btn btn--sm btn--ghost" style="margin-top:14px" data-next="step2" type="button">I've opened BotFather →</button>
</div>

<div class="card" id="step2" hidden><h2>Step 2</h2><p class="card-sub">Create your bot by sending the /newbot command to BotFather.</p>
<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
<span style="font-size:40px">💬</span>
<div><p style="margin:0 0 8px">In the chat with BotFather, type:</p>
<div style="font-family:var(--mono);background:var(--panel-2);border:1px solid var(--line-2);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-size:14px">/newbot</div>
<p style="margin:0 0 8px">BotFather will ask you for:</p>
<ul style="color:var(--ink-soft);font-size:14px;padding-left:18px;margin:0 0 8px">
<li>A <b>display name</b> for your bot (e.g. "ChuckyBTZ Leaderboard")</li>
<li>A <b>username</b> that ends in <span class="mono">bot</span> (e.g. "chuckybtz_leaderboard_bot")</li>
</ul>
<p style="margin:0;color:var(--ink-soft)">Just follow BotFather's prompts — it'll guide you through each step.</p></div>
</div>
<button class="btn btn--sm btn--ghost" style="margin-top:14px" data-next="step3" type="button">I've created my bot →</button>
</div>

<div class="card" id="step3" hidden><h2>Step 3</h2><p class="card-sub">Copy the API token BotFather gives you and paste it below.</p>
<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
<span style="font-size:40px">🔑</span>
<div><p style="margin:0 0 8px">After you create the bot, BotFather sends you a message with an <b>API token</b>. It looks like this:</p>
<div style="font-family:var(--mono);background:var(--panel-2);border:1px solid var(--line-2);border-radius:8px;padding:10px 14px;margin-bottom:10px;font-size:13px;color:var(--ink-mute)">123456789:ABCdefGhIjKlMnOpQrStUvWxYz</div>
<p style="margin:0 0 14px;color:var(--ink-soft)">Copy that whole string and paste it in the box below. We'll validate it and set up the webhook automatically.</p>
<div class="field" style="margin-bottom:10px"><label for="botToken">Bot token</label><input id="botToken" placeholder="123456789:ABCdefGhIjKlMnOpQrStUvWxYz" autocomplete="off" spellcheck="false" /></div>
<button class="btn btn--accent" id="connectBtn" type="button" disabled>Connect bot</button>
<div class="hint" id="connectStatus" style="margin-top:8px;min-height:18px"></div></div>
</div>
</div>

<div class="card" id="step4" hidden><h2>Step 4</h2><p class="card-sub">🎉 Your bot is connected and ready to go!</p>
<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
<span style="font-size:40px">✅</span>
<div><p style="margin:0 0 8px">Your bot <b id="botName">bot</b> (<span class="mono" id="botUsername">@bot</span>) is now wired up. The webhook has been set — messages sent to your bot will be handled automatically.</p>
<p style="margin:0 0 12px;color:var(--ink-soft)">You can now share your bot link with your audience. They can interact with your leaderboard directly through Telegram.</p>
<div style="display:flex;gap:10px;flex-wrap:wrap">
<a class="btn btn--accent" href="/dashboard">Back to dashboard</a>
<a class="btn" href="/bot/dashboard" id="botDashLink">Go to bot dashboard →</a>
</div></div>
</div>
</div>

<div class="card" style="border-style:dashed;margin-top:24px"><h2>💡 Tips</h2><p class="card-sub">A few things to know.</p>
<ul style="color:var(--ink-soft);font-size:14px;padding-left:18px;margin:0;line-height:1.8">
<li>You only need to do this once — the webhook stays connected.</li>
<li>Your bot token is sensitive. <b>Never share it publicly.</b> If you think it's been leaked, you can revoke it from BotFather and we'll reconnect.</li>
<li>Want a custom avatar or description for your bot? Set it up in BotFather with <span class="mono">/setuserpic</span> and <span class="mono">/setdescription</span>.</li>
<li>Need help? <a href="https://t.me/BotFather" target="_blank" rel="noopener">BotFather's FAQ</a> covers most questions.</li>
</ul></div>

</div>
<script src="/assets/bot-setup.js?v=2"></script></body></html>`,

admin: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/admin" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<header class="topbar"><div class="brand">Your<b>Rank</b> <span class="label" style="margin-left:8px">ADMIN</span></div>
<div class="topbar-right"><span class="muted" id="userEmail"></span><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<div class="wrap"><div class="skel" id="loading">Loading…</div>
<div id="panel" hidden>
<div class="dash-head"><div><h1>Operator panel</h1><p class="live-link">Everything that happens on YourRank, in one place.</p></div></div>
<div class="stats"><div class="stat"><b id="s_users">–</b><span>accounts</span></div><div class="stat"><b id="s_pro">–</b><span>on Pro</span></div><div class="stat"><b id="s_leads">–</b><span>leads</span></div><div class="stat"><b id="s_rev">–</b><span>revenue (USD)</span></div></div>
<div class="tabs"><button class="tab is-on" data-tab="users" type="button">Users</button><button class="tab" data-tab="leads" type="button">Leads</button><button class="tab" data-tab="payments" type="button">Payments</button></div>
<div class="tabpane" id="tab-users">
<table class="admin-table"><thead><tr><th>Email</th><th>Page</th><th>Plan</th><th>Status</th><th class="ta-r">Players</th><th>Joined</th><th>Actions</th></tr></thead><tbody id="usersBody"></tbody></table>
<div class="empty" id="usersEmpty" hidden>No users yet.</div></div>
<div class="tabpane" id="tab-leads" hidden>
<table class="admin-table"><thead><tr><th>Handle</th><th>Casino</th><th>Contact</th><th>Note</th><th>When</th></tr></thead><tbody id="leadsBody"></tbody></table>
<div class="empty" id="leadsEmpty" hidden>No leads yet. Share the landing page around.</div></div>
<div class="tabpane" id="tab-payments" hidden>
<table class="admin-table"><thead><tr><th>User</th><th>Provider</th><th class="ta-r">Amount</th><th>Status</th><th>When</th></tr></thead><tbody id="payBody"></tbody></table>
<div class="empty" id="payEmpty" hidden>No payments yet.</div></div>
<p class="hint" style="margin-top:18px">Manual activation: use <b>+31d Pro</b> on any user after they pay you directly (PayPal, bank, whatever). Crypto payments through the site activate on their own. Reset links work for 24h — send them over Discord/Telegram if email isn't wired up.</p>
</div></div>
<script src="/assets/admin.js?v=2"></script></body></html>`,

  admin2fa: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify · YourRank Admin</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/admin" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" />
<style>
.tfa-wrap{max-width:400px;margin:60px auto;padding:30px 24px;text-align:center}
.tfa-wrap h1{font-size:20px;margin:0 0 6px}
.tfa-wrap p{color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px}
.tfa-wrap .code-input{font-family:var(--mono,'JetBrains Mono',monospace);font-size:28px;letter-spacing:12px;text-align:center;background:var(--panel-2,#161618);border:2px solid var(--line-2,#2a2a30);border-radius:12px;color:var(--ink,#ededf0);padding:16px;width:100%;max-width:260px;display:block;margin:0 auto 16px}
.tfa-wrap .code-input:focus{border-color:var(--accent,#c8ff00);outline:none}
.tfa-wrap .err{color:#ff6b6b;font-size:13px;min-height:18px;margin:8px 0}
.tfa-wrap .btn{width:100%;max-width:260px}
.tfa-setup{margin-top:32px;text-align:left}
.tfa-setup h2{font-size:16px;margin:0 0 8px}
.tfa-setup p{color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 12px}
.tfa-setup .qr-wrap{background:#fff;border-radius:12px;padding:12px;display:inline-block;margin:8px 0}
.tfa-setup .secret-box{font-family:var(--mono,'JetBrains Mono',monospace);font-size:12px;word-break:break-all;background:var(--panel-2,#161618);border:1px solid var(--line-2,#2a2a30);border-radius:8px;padding:10px 12px;color:var(--accent,#c8ff00);margin:8px 0;display:block}
</style></head><body>
<header class="topbar"><div class="brand">Your<b>Rank</b> <span class="label" style="margin-left:8px">ADMIN</span></div>
<div class="topbar-right"><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<div class="wrap">
<div class="tfa-wrap" id="tfaVerify">
<h1>🔒 Two-Factor Authentication</h1>
<p>Enter the 6-digit code from your authenticator app.</p>
<input class="code-input" id="tfaCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" autofocus />
<div class="err" id="tfaErr"></div>
<button class="btn btn--accent" id="tfaSubmit" type="button">Verify</button>
</div>

<div class="tfa-wrap tfa-setup" id="tfaSetup" hidden>
<h2>Set Up Two-Factor Authentication</h2>
<p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
<div class="qr-wrap"><img id="tfaQr" alt="QR Code" width="200" height="200" /></div>
<p>Or enter this secret manually:</p>
<code class="secret-box" id="tfaSecret"></code>
<p style="margin-top:16px">After scanning, enter the 6-digit code to verify setup:</p>
<input class="code-input" id="tfaSetupCode" type="text" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="000000" autocomplete="one-time-code" />
<div class="err" id="tfaSetupErr"></div>
<button class="btn btn--accent" id="tfaSetupSubmit" type="button">Enable 2FA</button>
</div>
</div>
<script>
function getCsrf(){const m=document.cookie.match(/(?:^|;\\s*)__csrf=([^;]+)/);return m?m[1]:"";}
(async function(){
// Check 2FA status
const res=await fetch("/api/admin/2fa/status");
const data=await res.json();
if(!data.ok){location.href="/login";return;}

if(!data.enabled){
// Show setup flow
document.getElementById("tfaVerify").hidden=true;
document.getElementById("tfaSetup").hidden=false;
document.getElementById("tfaSetupSubmit").onclick=async()=>{
const code=document.getElementById("tfaSetupCode").value.trim();
if(!/^\\d{6}$/.test(code)){document.getElementById("tfaSetupErr").textContent="Enter a 6-digit code.";return;}
document.getElementById("tfaSetupErr").textContent="";
document.getElementById("tfaSetupSubmit").disabled=true;
// Enable 2FA
const enRes=await fetch("/api/admin/2fa/enable",{method:"POST",headers:{"x-csrf-token":getCsrf()}});
const enData=await enRes.json();
if(!enData.ok){document.getElementById("tfaSetupErr").textContent=enData.error||"Failed to enable 2FA.";document.getElementById("tfaSetupSubmit").disabled=false;return;}
// Show QR code
var qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent(enData.uri);
document.getElementById("tfaQr").src=qrUrl;
document.getElementById("tfaSecret").textContent=enData.secret;
// Verify the code
const vRes=await fetch("/api/admin/2fa/verify",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({code})});
const vData=await vRes.json();
if(vData.ok&&vData.verified){location.href="/admin";}else{document.getElementById("tfaSetupErr").textContent=vData.error||"Verification failed. Try the code from your authenticator.";document.getElementById("tfaSetupSubmit").disabled=false;}
};
}else if(!data.verified){
// Show verify flow
document.getElementById("tfaSubmit").onclick=async()=>{
const code=document.getElementById("tfaCode").value.trim();
if(!/^\\d{6}$/.test(code)){document.getElementById("tfaErr").textContent="Enter a 6-digit code.";return;}
document.getElementById("tfaErr").textContent="";
document.getElementById("tfaSubmit").disabled=true;
const vRes=await fetch("/api/admin/2fa/verify",{method:"POST",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify({code})});
const vData=await vRes.json();
if(vData.ok&&vData.verified){location.href="/admin";}else{document.getElementById("tfaErr").textContent=vData.error||"Invalid code.";document.getElementById("tfaSubmit").disabled=false;}
};
}
})();
document.getElementById("logout").onclick=async(e)=>{e.preventDefault();await fetch("/api/auth/logout",{method:"POST",headers:{"x-csrf-token":getCsrf()}});location.href="/login";};
</script></body></html>`,

  setup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Setup · YourRank</title>
<meta name="robots" content="noindex, nofollow" /><link rel="canonical" href="https://yourrank.site/dashboard/setup" /><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS-->
<style>
.setup-wrap{max-width:520px;margin:0 auto;padding:30px 22px 80px}
.setup-wrap h1{font-size:22px;letter-spacing:-.02em;margin:0 0 4px}
.setup-wrap .sub{color:var(--ink-mute);font-size:13px;margin:0 0 24px}
.steps-ind{display:flex;gap:6px;margin-bottom:28px}
.step-dot{width:100%;height:4px;border-radius:2px;background:var(--line-2);transition:background .2s}
.step-dot.done{background:var(--accent)}.step-dot.active{background:var(--accent);opacity:.6}
.wiz-step{display:none}.wiz-step.active{display:block}
.preview-url{font-family:var(--mono);font-size:14px;color:var(--accent);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:10px 12px;margin-top:6px;word-break:break-all}
.players-ta{font-family:var(--mono);font-size:13px;background:var(--panel);border:1px solid var(--line-2);border-radius:8px;padding:10px 12px;width:100%;color:var(--ink);resize:vertical}
.players-ta:focus{border-color:var(--accent)}
.share-box{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:18px;text-align:center;margin:20px 0}
.share-box .url{font-family:var(--mono);font-size:16px;color:var(--accent);word-break:break-all;margin-bottom:14px;display:block}
.btns-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.err{color:var(--danger);font-size:13px;min-height:18px;margin:4px 0}
</style><!--GM_NAV-->
<div class="gm-shell-main">
<div class="setup-wrap">
<h1>Set up your leaderboard</h1>
<p class="sub">Four quick steps and you're live.</p>
<div class="steps-ind" id="stepsInd"></div>

<div class="wiz-step active" id="step1">
<div class="field"><label for="wiz_name">Your name / handle</label>
<input id="wiz_name" placeholder="ChuckyBTZ" autocomplete="nickname" required />
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
<div class="field"><label>Paste your players</label>
<span class="hint">One player per line: <span class="mono">name, wagered amount</span>. Comma or tab separated. Wagered is optional (defaults to 0).</span>
<textarea class="players-ta" id="wiz_players" rows="8" spellcheck="false" placeholder="*****ess, 152000
*****y, 98000
*****k, 61250"></textarea>
<span class="hint" id="wiz_pcount">0 players detected</span></div>
<div class="btns-row"><button class="btn" id="wiz3back" type="button">← Back</button><button class="btn btn--accent" id="wiz3next" type="button">Next →</button></div>
</div>

<div class="wiz-step" id="step4">
<h2 style="font-size:18px;margin:0 0 6px">Your page is ready! 🎉</h2>
<p style="color:var(--ink-mute);font-size:13px;margin:0 0 14px">Share this link with your community:</p>
<div class="share-box">
<span class="url" id="wiz_finalUrl">yourrank.site/…</span>
<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
<button class="btn btn--accent" id="wiz_copy" type="button">📋 Copy link</button>
<a class="btn" id="wiz_view" href="#" target="_blank">View live page →</a>
</div>
</div>
<div class="btns-row"><button class="btn" id="wiz4back" type="button">← Back</button><button class="btn btn--accent" id="wiz_finish" type="button">Go to dashboard</button></div>
</div>

<div class="err" id="wiz_err"></div>
</div>
</div>
<script>
(function(){
const slugify=(s)=>String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const $=id=>document.getElementById(id);
const origin=location.origin;
const TOTAL=4;
let step=1, slug="";

// Step indicators
const ind=$("stepsInd");
for(let i=0;i<TOTAL;i++){const d=document.createElement("div");d.className="step-dot";ind.appendChild(d);}
function updateDots(){ind.querySelectorAll(".step-dot").forEach((d,i)=>{d.className="step-dot"+(i<step-1?" done":"")+(i===step-1?" active":"");});}
function showStep(n){step=n;document.querySelectorAll(".wiz-step").forEach((s,i)=>{s.classList.toggle("active",i===n-1);});updateDots();}

// Step 1: name → slug auto-gen
const nameIn=$("wiz_name"), slugIn=$("wiz_slug"), preview=$("wiz_preview");
let userEditedSlug=false;
nameIn.addEventListener("input",()=>{if(!userEditedSlug){const s=slugify(nameIn.value);slugIn.value=s;preview.textContent=s?"yourrank.site/"+s:"yourrank.site/…";}});
slugIn.addEventListener("input",()=>{userEditedSlug=true;const s=slugify(slugIn.value);preview.textContent=s?"yourrank.site/"+s:"yourrank.site/…";});

// Step 3: player count
const pta=$("wiz_players"), pcount=$("wiz_pcount");
pta.addEventListener("input",()=>{
const lines=pta.value.split("\\n").filter(l=>{const t=l.trim();return t&&!t.startsWith("#")&&!t.startsWith("//");});
pcount.textContent=lines.length+" player"+(lines.length===1?"":"s")+" detected";
});

// Nav buttons
$("wiz1next").onclick=()=>{if(!slugify(nameIn.value)&&!slugIn.value.trim()){$("wiz_err").textContent="Enter your name or a custom slug.";return;}if(!slugIn.value.trim()){slugIn.value=slugify(nameIn.value);}slug=slugify(slugIn.value);if(!slug){$("wiz_err").textContent="Invalid slug — letters, numbers, dashes only.";return;}$("wiz_err").textContent="";showStep(2);};
$("wiz2next").onclick=()=>{$("wiz_err").textContent="";showStep(3);};
$("wiz2back").onclick=()=>{$("wiz_err").textContent="";showStep(1);};
$("wiz3next").onclick=()=>{$("wiz_err").textContent="";$("wiz_finalUrl").textContent="yourrank.site/"+slug;$("wiz_view").href=origin+"/"+slug;showStep(4);};
$("wiz3back").onclick=()=>{$("wiz_err").textContent="";showStep(2);};
$("wiz4back").onclick=()=>{$("wiz_err").textContent="";showStep(3);};

// Copy button
$("wiz_copy").onclick=async()=>{const url=origin+"/"+slug;try{await navigator.clipboard.writeText(url);$("wiz_copy").textContent="✓ Copied!";setTimeout(()=>$("wiz_copy").textContent="📋 Copy link",2000);}catch(e){$("wiz_copy").textContent="Copy failed";setTimeout(()=>$("wiz_copy").textContent="📋 Copy link",2000);}};

// Parse players textarea
function parsePlayers(){
const lines=pta.value.split("\\n").filter(l=>{const t=l.trim();return t&&!t.startsWith("#")&&!t.startsWith("//");});
return lines.map(l=>{const parts=l.split(/[\\t,]+/).map(s=>s.trim());return{name:parts[0]||"",wagered:parseInt(parts[1],10)||0,prize:0};}).filter(p=>p.name);
}

// CSRF helper
function getCsrf(){const m=document.cookie.match(/(?:^|;\\s*)__csrf=([^;]+)/);return m?m[1]:"";}

// Finish: save and redirect
$("wiz_finish").onclick=async()=>{
$("wiz_finish").disabled=true;$("wiz_finish").textContent="Saving…";$("wiz_err").textContent="";
const payload={
brand:{name:nameIn.value.trim()||slug,casino:$("wiz_casino").value.trim()||"Stake",code:$("wiz_code").value.trim()||"",ctaUrl:$("wiz_cta").value.trim()||"",prizePool:"$0",period:"Monthly",tagline:"",resetNote:"",blurb:""},
players:parsePlayers()
};
try{
const res=await fetch("/api/site",{method:"PUT",headers:{"content-type":"application/json","x-csrf-token":getCsrf()},body:JSON.stringify(payload)});
const data=await res.json();
if(!res.ok||!data.ok){$("wiz_err").textContent=data.error||"Save failed. Try again.";$("wiz_finish").disabled=false;$("wiz_finish").textContent="Go to dashboard";return;}
location.href="/dashboard";
}catch(e){$("wiz_err").textContent="Network error. Try again.";$("wiz_finish").disabled=false;$("wiz_finish").textContent="Go to dashboard";}
};
updateDots();
})();
</script></body></html>`,

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
<style>
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
<div class="ov-footer">
<span class="ov-count"><span id="ov-count">${(data.players || []).length}</span> players</span>
<span class="ov-powered">YourRank</span>
</div>
</div>
<script>window.__OVERLAY_SLUG__=${JSON.stringify(opts.slug || "")};window.__OVERLAY_DATA__=${dataJson};</script>
<script src="/assets/overlay.js?v=2"></script>
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
<p>Questions about these terms: reach us through the contact form on the home page.</p>`, "terms"),

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
<p>One session cookie, used to keep you signed in. No ad trackers, no analytics cookies, no third-party pixels.</p>
<h2>Who else sees data</h2>
<p>Our infrastructure runs on Cloudflare (hosting, database). Payment processing runs through NOWPayments. That's it — we don't sell or share your data with anyone else.</p>
<h2>How long we keep it</h2>
<p>As long as your account exists. Want your account and data deleted? Contact us and we'll remove it.</p>
<h2>Your page is public</h2>
<p>Anything you publish on your leaderboard page is visible to anyone with the link, including player names you enter. Mask player names (like <span class="mono">*****ess</span>) if your community expects it.</p>
<h2>Contact</h2>
<p>Privacy questions or deletion requests: use the contact form on the home page.</p>`, "privacy"),

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
<p>If you run a leaderboard on YourRank: be straight with your community about the risks, honour the prizes you post, and never pressure viewers to wager. Pages that mislead their communities get suspended.</p>`, "responsible"),
};
