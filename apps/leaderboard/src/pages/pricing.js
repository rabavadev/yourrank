// pricing page
export const pricingPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pricing · YourRank</title>
<meta name="description" content="YourRank pricing and plans. Free forever, Starter, Pro, Agency, and Lifetime." />
<link rel="canonical" href="https://yourrank.site/pricing" />
<meta property="og:title" content="YourRank Pricing">
<meta property="og:description" content="Free, Starter, Pro, Agency and Lifetime plans for streamer and community leaderboards.">
<meta property="og:image" content="https://yourrank.site/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yourrank.site/og.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/landing.css" />
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header><nav class="top wrap"><a href="/" class="brand">Your<b>Rank</b></a>
<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<div class="links"><a href="/#how">How it works</a><a href="/#postbacks">Postbacks</a><a href="/pricing">Pricing</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Create your free page</a></div></nav></header>
<main class="wrap" id="main-content" style="padding:48px 24px 24px">
<h1 style="font-size:clamp(32px,5vw,52px);line-height:1.05;letter-spacing:-.03em;margin:0 0 12px;max-width:18ch">Simple pricing for streamers.</h1>
<p class="prose-lead">Start free. Upgrade when your board is pulling weight. No hidden fees, no credit card required to try.</p>
<p class="prose-lead prose-lead--sub">Try every Pro feature with a <b>7-day free Pro trial</b> — no payment up front. Paid plans are billed in <b>crypto</b> (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms.</p>
<div class="pricing-grid pricing-grid--4" style="margin-top:32px">
<div class="price-card"><div class="price-head"><h3>Free</h3><div class="price-amount">$0</div><div class="price-period">forever</div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 10 players</li><li>YourRank badge on your page</li><li>Basic analytics (7 days)</li><li>Live countdown &amp; auto-sort</li></ul><a href="/signup?plan=free" class="btn btn--sm price-cta">Start free</a></div>
<div class="price-card"><div class="price-head"><h3>Starter</h3><div class="price-amount">$12<span>/30 days</span></div></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 25 players</li><li>No YourRank badge</li><li>Full analytics (30 days)</li><li>CSV import</li></ul><a href="/signup?plan=starter" class="btn btn--sm price-cta">Choose Starter</a></div>
<div class="price-card price-card--popular"><div class="price-badge">Most Popular</div><div class="price-head"><h3>Pro</h3><div class="price-amount">$29<span>/30 days</span></div></div><ul class="price-features"><li>Up to 3 leaderboards</li><li>Up to 9,999 players</li><li>No YourRank badge</li><li>Custom domain</li><li>OBS overlay widget</li><li>Discord webhooks</li><li>Telegram notifications</li><li>Signed score API</li><li>Priority support</li></ul><a href="/signup?plan=pro" class="btn btn--sm btn--accent price-cta">Go Pro</a></div>
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/30 days</span></div></div><ul class="price-features"><li>Up to 99 leaderboards</li><li>Up to 9,999 players per board</li><li>White-label branding</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="/contact?plan=agency" class="btn btn--sm price-cta">Contact us</a></div>
</div>
<div class="lifetime-banner"><div class="lifetime-banner-txt"><span class="lifetime-banner-lead">Prefer to pay once?</span> <b>Lifetime Pro</b> — every Pro feature, no monthly bills. <span class="lifetime-banner-price">$149<small> one-time</small></span></div><a href="/signup?plan=lifetime" class="btn btn--accent lifetime-banner-cta">Get Lifetime Pro</a></div>
<p class="pay-note">Paid plans billed in crypto (BTC · ETH · USDT · 100+ more). Card checkout coming soon.</p>

<h2 class="sec" style="margin-top:64px">Compare plans</h2>
<div class="table-scroll" role="region" aria-label="Plan comparison" tabindex="0" style="margin-top:24px;overflow-x:auto;-webkit-overflow-scrolling:touch">
<table class="pricing" style="min-width:520px">
<thead><tr><th>Feature</th><th>Free</th><th>Starter</th><th>Pro</th><th>Agency</th></tr></thead>
<tbody>
<tr><td>Leaderboards</td><td>1</td><td>1</td><td>3</td><td>99</td></tr>
<tr><td>Players per board</td><td>10</td><td>25</td><td>9,999</td><td>9,999</td></tr>
<tr><td>Custom domain</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>OBS overlay</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Postback tracking</td><td>Basic</td><td>Basic</td><td>Advanced</td><td>Advanced</td></tr>
<tr><td>Public read API</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Signed score API</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr class="pro-row"><td>Price</td><td>$0</td><td>$12/30 days</td><td>$29/30 days</td><td>$79/30 days</td></tr>
</tbody>
</table>
</div>

<h2 class="sec" style="margin-top:64px">Frequently asked questions</h2>
<div class="steps" style="margin-top:24px">
<div class="step"><div class="n">?</div><div><h3>Do plans auto-renew?</h3><p>No. Each payment gives you 30 days of access. When it expires, your page drops back to the Free plan — you can renew manually whenever you're ready.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Is there a free trial?</h3><p>Two ways: the Free plan never expires — use it as long as you like — and you can also start a 7-day free Pro trial from your <a href="/dashboard?nav=manage">Plan &amp; billing</a> section to test every Pro feature before you pay.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>What payment methods do you accept?</h3><p>Crypto (BTC, ETH, USDT and 100+ more) through our payment processor. We are working on adding credit card checkout.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Do you offer refunds?</h3><p>Paid periods keep working until the end of the 30 days and are not partially refunded. Crypto and lifetime purchases are non-refundable. See <a href="/refund">our refund policy</a>.</p></div></div>
</div>

<div class="cta cta-wrap" style="margin-top:64px;text-align:center"><a href="/signup" class="btn btn--accent btn--cta-lg">Create your free page</a></div>
</main>
<div class="mobile-cta"><a href="/signup" class="btn btn--accent">Create your free page</a></div>
<footer><div class="wrap footer-wrap">
<span>© <span id="yr"></span> YourRank</span>
<span><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/refund">Refunds</a> · <a href="/cookies">Cookies</a> · <a href="/responsible">Responsible play</a></span>
</div></footer>
<script src="/assets/landing.js"></script></body></html>`;
