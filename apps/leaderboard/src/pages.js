// Static HTML pages served by the Worker. Kept as plain template strings.

// Shared shell for the legal pages — plain, readable, no fluff.
const legal = (title, updated, body) => `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<header class="topbar"><a class="brand" href="/">Rank<b>Up</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="legal"><h1>${title}</h1><p class="legal-updated">Last updated: ${updated}</p>
${body}
<p class="legal-foot"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a> · <a href="/">Home</a></p>
</main></body></html>`;

export const PAGES = {
  index: `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>RankUp — hosted leaderboards for casino streamers</title>
<meta name="description" content="A hosted leaderboard page for your Stake/Kick community. Edit prizes, code and players from a dashboard. Your page updates instantly." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
</head><body>
<div class="wrap">
<nav class="top"><div class="brand">Rank<b>Up</b></div>
<div class="links"><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Get started</a></div></nav>
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
</div></div></section>
<section id="example"><div class="wrap"><h2 class="sec">A real page</h2><p class="sec-sub">This is a live leaderboard running on RankUp. Yours works the same way.</p>
<div class="example"><div class="bar"><span>yourrank.site/chuckybtz</span><span>live</span></div>
<iframe src="/chuckybtz" loading="lazy" title="Example leaderboard"></iframe></div></div></section>
<section id="pricing"><div class="wrap"><h2 class="sec">Pricing</h2><p class="sec-sub">Start free. Upgrade when your board is pulling weight.</p>
<table class="pricing"><thead><tr><th>Plan</th><th>Price</th><th>What you get</th><th>&nbsp;</th></tr></thead><tbody>
<tr><td class="plan">Free</td><td class="price">$0</td><td>One hosted page, live countdown, up to 10 players. Carries a small "Powered by RankUp" badge.</td><td><a href="/signup" class="btn btn--sm">Start</a></td></tr>
<tr class="pro-row"><td class="plan">Pro</td><td class="price">$29/mo</td><td>Up to 50 players, no RankUp badge, custom code &amp; socials, priority support. Pay with crypto.</td><td><a href="/signup" class="btn btn--sm btn--accent">Start</a></td></tr>
</tbody></table></div></section>
<section id="request"><div class="wrap"><h2 class="sec">Want us to set it up for you?</h2><p class="sec-sub">Prefer we build and manage the page? Tell us about your channel and we'll handle it.</p>
<form class="lead" id="leadForm" novalidate>
<div><label>Your handle / channel</label><input id="l_handle" placeholder="ChuckyBTZ" required /></div>
<div><label>Casino</label><input id="l_casino" placeholder="Stake" /></div>
<div class="full"><label>How to reach you</label><input id="l_contact" placeholder="Discord, email or Telegram" required /></div>
<div class="full"><label>Anything else</label><textarea id="l_note" rows="3" placeholder="Prize pool, code, roughly how many players…"></textarea></div>
<div class="full"><button class="btn btn--accent" type="submit" id="l_submit">Send request</button></div>
<div class="status" id="l_status"></div></form></div></section>
<footer><div class="wrap" style="display:flex;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px">
<span>© <span id="yr"></span> RankUp</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/responsible">Responsible play</a></span>
<span>18+ · Gambling can be addictive. Play responsibly.</span></div></footer>
<script src="/assets/landing.js"></script>
</body></html>`,

  login: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sign in · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Rank<b>Up</b></div></div>
<div><h1>Your leaderboard, hosted and handled.</h1><p>Edit your prize pool, code and players from one dashboard. Your page updates instantly. No code, no redeploys.</p></div>
<div class="feat"><div>— Live countdown to every reset</div><div>— Auto-sorted standings from wager</div><div>— Your own public URL</div></div></aside>
<main class="auth-main"><div class="auth-card"><h2>Sign in</h2><p class="sub">Welcome back.</p>
<form id="form" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required /></div>
<div class="err" id="err"></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Sign in</button></form>
<p class="foot">No account? <a href="/signup">Create one</a> · <a href="/forgot">Forgot password?</a></p></div></main></div>
<script src="/assets/auth.js"></script></body></html>`,

  forgot: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset password · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Rank<b>Up</b></div></div>
<div><h1>Locked out? It happens.</h1><p>Tell us the email on your account and we'll send a reset link. If email isn't set up on this deployment yet, contact support and we'll hand you a link directly.</p></div>
<div class="feat"></div></aside>
<main class="auth-main"><div class="auth-card"><h2>Reset password</h2><p class="sub">We'll email you a link.</p>
<form id="form" novalidate><div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required /></div>
<div class="err" id="err"></div><div class="msg" id="msg" hidden></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Send reset link</button></form>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/auth.js"></script></body></html>`,

  reset: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New password · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Rank<b>Up</b></div></div>
<div><h1>Set a new password.</h1><p>Pick something you'll remember this time. At least 8 characters.</p></div>
<div class="feat"></div></aside>
<main class="auth-main"><div class="auth-card"><h2>New password</h2><p class="sub">Then you're straight back in.</p>
<form id="form" novalidate><div class="field"><label for="password">New password</label><input id="password" name="password" type="password" autocomplete="new-password" required />
<span class="hint">At least 8 characters.</span></div>
<div class="err" id="err"></div><button class="btn btn--accent" style="width:100%" type="submit" id="submit">Save & sign in</button></form>
<p class="foot"><a href="/login">Back to sign in</a></p></div></main></div>
<script src="/assets/auth.js"></script></body></html>`,

  signup: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Create account · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<div class="auth-wrap"><aside class="auth-side"><div><div class="brand">Rank<b>Up</b></div></div>
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
<script src="/assets/auth.js"></script></body></html>`,

  dashboard: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dashboard · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><!--GM_NAV_CSS--></head><body>
<!--GM_NAV-->
<div class="wrap" id="app"><div class="skel" id="loading">Loading your leaderboard…</div>
<div id="dash" hidden>
<div class="dash-head"><div><h1>Your leaderboard</h1><p class="live-link">Live at <a id="liveLink" href="#" target="_blank">…</a></p></div><span class="label" id="planBadge">FREE PLAN</span></div>
<div class="card"><h3>Analytics</h3><p class="card-sub">Last 30 days on your page. Views count every visit; copies and clicks are people grabbing your code or hitting Join.</p>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="st_views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_views30">–</span><span class="stat-lbl">Views · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_copies30">–</span><span class="stat-lbl">Code copies · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_clicks30">–</span><span class="stat-lbl">Join clicks · 30d</span></div></div>
<div class="stat-chart"><div class="stat-bars" id="statBars" title="Daily views, last 14 days"></div><div class="stat-chart-lbl"><span id="statFrom"></span><span>Daily views, last 14 days</span><span>today</span></div></div>
<p class="hint" id="statsEmpty" hidden>No views yet — share your page link in your stream panels and Discord to get it moving.</p></div>
<div class="card"><h3>Brand & prize</h3><p class="card-sub">The headline details on your page.</p><div class="grid2">
<div class="field"><label>Display name</label><input id="f_name" /></div>
<div class="field"><label>Tagline</label><input id="f_tagline" placeholder="Casino streamer & Stake partner" /></div>
<div class="field"><label>Casino</label><input id="f_casino" placeholder="Stake" /></div>
<div class="field"><label>Referral code</label><input id="f_code" placeholder="BTZ" /></div>
<div class="field"><label>Referral link</label><input id="f_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="field"><label>Prize pool</label><input id="f_pool" placeholder="$3,500" /></div>
<div class="field"><label>Period</label><input id="f_period" placeholder="Monthly" /></div>
<div class="field"><label>Countdown ends (UTC)</label><input id="f_ends" type="datetime-local" /><span class="hint">When the leaderboard resets. Powers the live timer.</span></div></div>
<div class="field"><label>Partner blurb</label><textarea id="f_blurb" rows="2" placeholder="Short pitch about the casino and your code."></textarea></div></div>
<div class="card"><h3>Players</h3><p class="card-sub">The board auto-sorts by wagered, highest first. Prize <span class="mono">0</span> shows a dash. Names can be masked (keep the <span class="mono">***</span>). <span class="mono" id="pCount"></span></p>
<table class="players"><thead><tr><th class="rank">#</th><th>Player</th><th class="ta-r">Wagered</th><th class="ta-r">Prize</th><th></th></tr></thead><tbody id="rows"></tbody></table>
<div id="playersEmpty" class="empty" hidden>No players yet. Add your first one.</div>
<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--sm" id="addRow">+ Add player</button><button class="btn btn--sm" id="importBtn" type="button">Paste from spreadsheet</button></div>
<div class="import" id="importPanel" hidden>
<p class="hint" style="margin:0 0 8px">One player per line: <span class="mono">name, wagered, prize</span> — commas or tabs. Copying straight out of Excel or Google Sheets works. Prize is optional.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div></div>
<div class="card" id="brandCard"><h3>Branding <span class="pill pill--info" style="margin-left:6px">PRO</span></h3><p class="card-sub">Your logo and page colors. Free pages use the default look.</p>
<div id="brandBody">
<div class="grid2">
<div class="field"><label>Logo</label>
<div class="logo-row"><img id="logoPreview" class="logo-preview" alt="" hidden /><input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden />
<button class="btn btn--sm" id="logoPick" type="button">Upload logo</button><button class="btn btn--sm btn--ghost" id="logoClear" type="button" hidden>Remove</button></div>
<span class="hint">PNG, JPG or WebP. Shows in your page header and as the link preview image when your page gets shared. Square works best.</span></div>
<div class="field"><label>Page accent colors</label>
<div class="color-row"><input type="color" id="c_a" value="#5ad9ff" /><input type="color" id="c_b" value="#7b8cff" /><button class="btn btn--sm btn--ghost" id="colorsReset" type="button">Reset to default</button></div>
<span class="hint">Drives the big name gradient and buttons on your page. Save to apply.</span></div>
</div></div>
<div class="empty" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="archiveCard"><h3>Past winners</h3><p class="card-sub">When a period ends, close it out: the current board is saved and shown on your page under "Past Winners". Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field" style="flex:1;min-width:160px;margin:0"><label>Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field" style="margin:0"><label>Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent" id="a_go" type="button" style="align-self:flex-end">Close out period</button></div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div></div>
<div class="card" id="planCard"><h3>Plan &amp; billing</h3><p class="card-sub">Pro removes the RankUp badge from your page and raises the player limit to 50.</p>
<div class="plan-row"><div><div class="plan-name" id="planName">Free</div><div class="hint" id="planMeta">Up to 10 players · RankUp badge on your page</div></div>
<button class="btn btn--accent" id="goPro">Upgrade to Pro</button></div>
<p class="hint" id="planHint">Pay with crypto (BTC, ETH, USDT and 100+ more). Pro activates automatically once the network confirms — usually a few minutes.</p></div>
<div class="savebar"><span class="status" id="status"></span><a class="btn btn--ghost" id="viewLive" href="#" target="_blank">View live page</a><button class="btn btn--accent" id="save">Save changes</button></div></div></div>
<script src="/assets/dashboard.js"></script></body></html>`,

  admin: `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin · RankUp</title><link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /></head><body>
<header class="topbar"><div class="brand">Rank<b>Up</b> <span class="label" style="margin-left:8px">ADMIN</span></div>
<div class="topbar-right"><span class="muted" id="userEmail"></span><a href="/dashboard" class="btn btn--sm btn--ghost">Dashboard</a><a href="#" id="logout" class="btn btn--sm btn--ghost">Sign out</a></div></header>
<div class="wrap"><div class="skel" id="loading">Loading…</div>
<div id="panel" hidden>
<div class="dash-head"><div><h1>Operator panel</h1><p class="live-link">Everything that happens on RankUp, in one place.</p></div></div>
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
<script src="/assets/admin.js"></script></body></html>`,

  terms: legal("Terms of Service", "July 2026", `
<h2>What RankUp is</h2>
<p>RankUp hosts leaderboard pages for streamers and their communities. You get a dashboard to edit your page's content — prize pool, referral code, player standings — and we serve that page at a public URL. That's the whole service.</p>
<p><b>RankUp is not a casino.</b> No wagering, betting or gambling happens on this platform. Leaderboard standings are entered by the page owner. Prizes shown on any page are offered and paid by that page's owner, not by RankUp.</p>
<h2>Your account</h2>
<p>You need to be at least 18 to use RankUp. You're responsible for keeping your password safe and for everything published on your page. One account, one page.</p>
<h2>Your content</h2>
<p>Everything you put on your page — names, numbers, links, images — is yours, and so is the responsibility for it. Don't publish anything illegal, misleading (fake prizes you don't pay out), or that infringes someone else's rights. Don't impersonate other streamers or brands.</p>
<p>If your page promotes a gambling referral, you're responsible for complying with the laws and platform rules that apply to you and your audience.</p>
<h2>Payments</h2>
<p>Pro is a paid plan billed per 31-day period, paid in cryptocurrency or arranged directly with us. Payments are final once confirmed — if something goes wrong with a payment, contact us and we'll sort it out fairly. If Pro lapses, your page stays live on the Free plan (player limit and badge apply again).</p>
<h2>What we can do</h2>
<p>We can suspend pages or accounts that break these terms, harm other users, or expose us to legal risk. We'll be reasonable about it. We may change prices or features with notice.</p>
<h2>Liability</h2>
<p>RankUp is provided as-is. We work to keep pages online, but we don't guarantee uninterrupted service and we're not liable for lost revenue, lost viewers, or disputes between you and your community. Our total liability is capped at what you paid us in the last 3 months.</p>
<h2>Contact</h2>
<p>Questions about these terms: reach us through the contact form on the home page.</p>`),

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
<p>Privacy questions or deletion requests: use the contact form on the home page.</p>`),

  responsible: legal("Responsible Play", "July 2026", `
<p><b>RankUp pages are about gambling, and gambling carries real risk.</b> The leaderboards hosted here track wagers made on third-party casino sites. RankUp itself takes no bets and pays no winnings — but if you're a viewer taking part in these communities, this page is for you.</p>
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
<p>If you run a leaderboard on RankUp: be straight with your community about the risks, honour the prizes you post, and never pressure viewers to wager. Pages that mislead their communities get suspended.</p>`),
};
