import { paymentMethodsAnswer } from "./faq.js";

// pricing page
export const pricingPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pricing · YourRank suite</title>
<meta name="description" content="YourRank suite pricing: free, Starter, Pro and Agency plans for leaderboards, Telegram bot, and viewer rewards & shop." />
<link rel="canonical" href="https://yourrank.site/pricing" />
<meta property="og:title" content="YourRank suite pricing">
<meta property="og:description" content="Free, Starter, Pro, Agency and Lifetime plans for the YourRank streamer suite.">
<meta property="og:image" content="https://yourrank.site/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yourrank.site/og.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/ui.css" /><link rel="stylesheet" href="/assets/landing.css" />
</head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header><nav class="top wrap"><a href="/" class="brand">Your<b>Rank</b></a>
<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<div class="links"><a href="/">Home</a><a href="/#products">Products</a><a href="/faq">FAQ</a><a href="/login">Sign in</a><a href="/signup" class="btn btn--accent">Create your free page</a></div></nav></header>
<main class="wrap pg-wrap" id="main-content">
<h1 class="pg-title">Suite pricing for streamers.</h1>
<p class="prose-lead">Start free. Upgrade when a product is pulling weight. Every plan covers leaderboards, Telegram bot, and rewards &amp; shop with product-specific limits.</p>
<p class="prose-lead prose-lead--sub">Try every Pro feature with a <b>7-day free Pro trial</b> — no payment up front. Paid plans are billed in <b>crypto</b> (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms. No auto-renew, cancel anytime.</p>
<div class="pricing-grid pricing-grid--4 mt-32">
<div class="price-card"><div class="price-head"><h3>Free</h3><div class="price-amount">$0</div><div class="price-period">forever</div><p class="price-audience">For trying YourRank</p></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 10 players</li><li>1 Telegram bot</li><li>Up to 3 tracked offers</li><li>Up to 3 credit rules</li><li>Up to 5 shop items</li><li>YourRank badge on your page</li><li>Basic analytics (7 days)</li><li>Live countdown &amp; auto-sort</li></ul><a href="/signup?plan=free" class="btn btn--sm price-cta">Start free</a></div>
<div class="price-card"><div class="price-head"><h3>Starter</h3><div class="price-amount">$12<span>/30 days</span></div><p class="price-audience">For growing streamers</p></div><ul class="price-features"><li>1 leaderboard</li><li>Up to 25 players</li><li>1 Telegram bot</li><li>Up to 3 tracked offers</li><li>Up to 3 credit rules</li><li>Up to 5 shop items</li><li>No YourRank badge</li><li>Full analytics (30 days)</li><li>CSV import</li></ul><a href="/signup?plan=starter" class="btn btn--sm price-cta">Choose Starter</a></div>
<div class="price-card price-card--popular"><div class="price-badge">Most Popular</div><div class="price-head"><h3>Pro</h3><div class="price-amount">$29<span>/30 days</span></div><p class="price-audience">For serious creators</p></div><ul class="price-features"><li>Up to 3 leaderboards</li><li>Up to 9,999 players</li><li>Up to 3 Telegram bots</li><li>Up to 50 tracked offers</li><li>Up to 50 credit rules</li><li>Up to 100 shop items</li><li>No YourRank badge</li><li>Custom domain</li><li>OBS overlay widget</li><li>Discord webhooks</li><li>Signed score API</li><li>Priority support</li></ul><a href="/signup?plan=pro" class="btn btn--sm btn--accent price-cta">Go Pro</a></div>
<div class="price-card"><div class="price-head"><h3>Agency</h3><div class="price-amount">$79<span>/30 days</span></div><p class="price-audience">For teams &amp; networks</p></div><ul class="price-features"><li>Up to 99 leaderboards</li><li>Up to 9,999 players per board</li><li>Up to 25 Telegram bots</li><li>Up to 999 tracked offers</li><li>Up to 999 credit rules</li><li>Up to 999 shop items</li><li>White-label branding</li><li>Everything in Pro</li><li>Dedicated support</li></ul><a href="/help/support?area=billing" class="btn btn--sm price-cta">Contact us</a></div>
</div>
<div class="lifetime-banner"><div class="lifetime-banner-txt"><span class="lifetime-banner-lead">Prefer to pay once?</span> <b>Lifetime Pro</b> — every Pro feature, no monthly bills. <span class="lifetime-banner-price">$149<small> one-time</small></span></div><a href="/signup?plan=lifetime" class="btn btn--accent lifetime-banner-cta">Get Lifetime Pro</a></div>
<p class="pay-note">Paid plans billed in crypto (BTC · ETH · USDT · 100+ more). Card checkout coming soon. <span class="pay-note--trust">7-day Pro trial · No card required · No automatic renewal · Cancel anytime</span></p>

<h2 class="sec mt-64">Compare plans</h2>
<div class="table-scroll table-scroll--pricing" role="region" aria-label="Plan comparison" tabindex="0">
<table class="pricing pricing-table">
<thead><tr><th>Feature</th><th>Free</th><th>Starter</th><th>Pro</th><th>Agency</th></tr></thead>
<tbody>
<tr><td>Leaderboards</td><td>1</td><td>1</td><td>3</td><td>99</td></tr>
<tr><td>Players per board</td><td>10</td><td>25</td><td>9,999</td><td>9,999</td></tr>
<tr><td>Telegram bots</td><td>1</td><td>1</td><td>3</td><td>25</td></tr>
<tr><td>Tracked offers</td><td>3</td><td>3</td><td>50</td><td>999</td></tr>
<tr><td>Credit rules</td><td>3</td><td>3</td><td>50</td><td>999</td></tr>
<tr><td>Items</td><td>5</td><td>5</td><td>100</td><td>999</td></tr>
<tr><td>Custom domain</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>OBS overlay</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr><td>Postback tracking</td><td>Basic</td><td>Basic</td><td>Advanced</td><td>Advanced</td></tr>
<tr><td>Public read API</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td>Signed score API</td><td>—</td><td>—</td><td>✓</td><td>✓</td></tr>
<tr class="pro-row"><td>Price</td><td>$0</td><td>$12/30 days</td><td>$29/30 days</td><td>$79/30 days</td></tr>
</tbody>
</table>
</div>

<h2 class="sec mt-64">Frequently asked questions</h2>
<p class="prose-lead prose-lead--sub">For general product questions, see the <a href="/faq">YourRank FAQ</a>.</p>
<div class="steps mt-24">
<div class="step"><div class="n">?</div><div><h3>Do plans auto-renew?</h3><p>No. Each payment gives you 30 days of access. When it expires, your page drops back to the Free plan — you can renew manually whenever you're ready.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Is there a free trial?</h3><p>Two ways: the Free plan never expires — use it as long as you like — and you can also start a 7-day free Pro trial from your <a href="/dashboard/settings">Plan &amp; billing</a> section to test every Pro feature before you pay.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>What payment methods do you accept?</h3><p>${paymentMethodsAnswer}</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Do you offer refunds?</h3><p>Paid periods keep working until the end of the 30 days and are not partially refunded. Crypto and lifetime purchases are non-refundable. See <a href="/refund">our refund policy</a>.</p></div></div>
<div class="step"><div class="n">?</div><div><h3>Do viewers need to pay?</h3><p>No. Viewers log in with Kick or Discord for free and spend credits they earn from channel-point redemptions. Streamers control the rewards and shop.</p></div></div>
</div>

<div class="cta cta-wrap mt-64 text-center"><a href="/signup" class="btn btn--accent btn--cta-lg">Create your free page</a></div>
</main>
<div class="mobile-cta"><a href="/signup" class="btn btn--accent">Create your free page</a></div>
<footer class="ftr ftr--platform"><div class="wrap">
<p class="ftr-copy">© {{YEAR}} YourRank · <a href="/help/support">Contact</a></p>
</div></footer>
<script src="/assets/landing.js?v=3"></script></body></html>`;
