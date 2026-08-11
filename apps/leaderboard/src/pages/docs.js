// Public API documentation page
const body = `
<nav class="docs-toc" aria-label="Documentation sections">
  <a href="#getting-started">Getting started</a>
  <a href="#authentication">Authentication</a>
  <a href="#endpoints">Endpoints</a>
  <a href="#examples">Examples</a>
  <a href="#chat-bots">Chat bots</a>
  <a href="#postbacks">Postbacks</a>
  <a href="#openapi">OpenAPI</a>
</nav>

<h2 id="getting-started">Getting started</h2>
<p>YourRank exposes read-only public endpoints for every leaderboard. Use them to pull standings, player lists, rank lookups, and stats into stream overlays, bots, or your own apps. Pro and Agency accounts can also push updated player data with a signed score postback.</p>

<h2 id="authentication">Authentication</h2>
<p>Public read endpoints do not require authentication. Replace <code>{slug}</code> with the board's public handle. Score postbacks require a <code>X-Postback-Key</code> and an HMAC-SHA256 signature in <code>X-Postback-Signature</code>.</p>

<h2 id="base-url">Base URL</h2>
<pre><code>https://yourrank.site</code></pre>

<h2 id="endpoints">Read-only endpoints</h2>
<table class="docs-table">
<thead><tr><th>Method</th><th>Path</th><th>Description</th></tr></thead>
<tbody>
<tr><td>GET</td><td><code>/api/public/{slug}</code></td><td>Full leaderboard data object.</td></tr>
<tr><td>GET</td><td><code>/api/public/{slug}/standings</code></td><td>Sorted player standings with positions and countdown.</td></tr>
<tr><td>GET</td><td><code>/api/public/{slug}/players</code></td><td>Lightweight sorted player array.</td></tr>
<tr><td>GET</td><td><code>/api/public/{slug}/rank?user=PLAYER</code></td><td>Plain-text rank lookup for chat bots.</td></tr>
<tr><td>GET</td><td><code>/api/public/{slug}/stats</code></td><td>Views, copies, clicks, and a 14-day series.</td></tr>
</tbody>
</table>

<h2 id="examples">Examples</h2>

<h3>Full data</h3>
<pre><code class="docs-lang">curl https://yourrank.site/api/public/demo</code></pre>

<h3>Standings</h3>
<pre><code class="docs-lang">curl https://yourrank.site/api/public/demo/standings</code></pre>
<pre><code class="docs-json">{
  "slug": "demo",
  "name": "Demo Challenge",
  "casino": "",
  "period": "Monthly",
  "prizePool": "500 points",
  "players": [
    { "name": "Alex", "wagered": 9500, "prize": 250, "position": 1 },
    { "name": "Bree", "wagered": 7200, "prize": 150, "position": 2 },
    { "name": "Casey", "wagered": 5400, "prize": 100, "position": 3 }
  ]
}</code></pre>

<h3>JavaScript</h3>
<pre><code class="docs-lang">const res = await fetch("https://yourrank.site/api/public/demo/standings");
const data = await res.json();
console.log(data.players[0].name);</code></pre>

<h2 id="chat-bots">Chat bot commands</h2>
<p><b>Nightbot</b> rank lookup:</p>
<pre><code class="docs-lang">!rank $(customapi https://yourrank.site/api/public/demo/rank?user=Alex)</code></pre>
<p><b>Streamlabs</b> rank lookup:</p>
<pre><code class="docs-lang">!rank $(readapi https://yourrank.site/api/public/demo/rank?user=Alex)</code></pre>

<h2 id="postbacks">Score postback (Pro/Agency only)</h2>
<p>Push updated player lists from your own backend. Requires <code>X-Postback-Key</code> and an HMAC-SHA256 signature of the raw request body in <code>X-Postback-Signature</code>.</p>
<pre><code class="docs-lang">POST /api/scores
Content-Type: application/json
X-Postback-Key: your-key
X-Postback-Signature: hex-signature

{
  "slug": "demo",
  "players": [
    { "name": "Alice", "wagered": 15000, "prize": 600 }
  ]
}</code></pre>
<p>Find your postback key and secret in your dashboard under <b>Postbacks &amp; Attribution</b>.</p>

<h2 id="openapi">OpenAPI spec</h2>
<p>Download the machine-readable spec at <a href="/api/openapi.json">/api/openapi.json</a>.</p>
`;

export const docsPage = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>API Documentation · YourRank</title>
<meta name="description" content="YourRank public API documentation with endpoints, examples, chat bot commands, and OpenAPI spec." />
<link rel="canonical" href="https://yourrank.site/docs" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" /><link rel="stylesheet" href="/assets/ui.css" />
<style>
.docs-wrap{max-width:840px;margin:0 auto;padding:40px 24px}
.docs-wrap h1{font-size:clamp(32px,5vw,48px);font-weight:800;letter-spacing:-.03em;margin:0 0 12px}
.docs-wrap h2{font-size:22px;font-weight:700;margin:36px 0 14px}
.docs-wrap h3{font-size:16px;font-weight:600;margin:24px 0 10px}
.docs-wrap p{line-height:1.6;color:var(--yr-color-text-secondary-4, #9a94b8)}
.docs-wrap pre{background:var(--yr-color-surface-sunken-3, #1a1a22);border:1px solid var(--yr-color-chart-series-line, rgba(87,113,255,.2));border-radius:10px;padding:16px;overflow-x:auto;margin:14px 0;font-family:"JetBrains Mono",monospace;font-size:13px}
.docs-wrap code{font-family:"JetBrains Mono",monospace;background:var(--yr-color-surface-sunken-3, #1a1a22);padding:2px 6px;border-radius:4px}
.docs-wrap pre code{padding:0;background:transparent}
.docs-table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
.docs-table th,.docs-table td{padding:10px 8px;border-bottom:1px solid var(--yr-color-chart-series-line, rgba(87,113,255,.2));text-align:left}
.docs-table th{color:var(--yr-color-text-secondary-4, #9a94b8);font-weight:600}
.docs-lang{color:var(--yr-color-success-8, #7ee787)}
.docs-json{color:var(--yr-color-chart-series-3, #d6b0ff)}
.docs-toc{display:flex;flex-wrap:wrap;gap:8px 16px;padding:16px 0 0;margin:0 0 28px;border-bottom:1px solid var(--yr-color-chart-series-line, rgba(87,113,255,.2));list-style:none}
.docs-toc a{color:var(--yr-color-text-secondary-4, #9a94b8);text-decoration:none;font-size:14px;font-weight:500}
.docs-toc a:hover{color:var(--yr-color-chart-series, #8b5cf6);text-decoration:underline}
.legal-foot{margin-top:48px;font-size:13px;color:var(--yr-color-text-muted-3, #6c6685)}
</style></head><body>
<a href="#main-content" class="sr-only skip-link">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a>
<div class="topbar-right"><a href="/login" class="btn btn--sm btn--ghost">Sign in</a></div></header>
<main class="docs-wrap" id="main-content"><h1>API Documentation</h1>
<p>Read-only public endpoints for leaderboards, plus a signed score postback for Pro/Agency accounts.</p>
${body}
<p class="legal-foot"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/">Home</a> · © {{YEAR}} YourRank</p>
</main></body></html>`;
