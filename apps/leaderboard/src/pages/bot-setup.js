import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

// botSetup page
export const botSetupPage = leaderboardPageHtml({
  title: "Connect Telegram Bot · YourRank",
  canonical: "https://yourrank.site/dashboard/bot/setup",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to set up your Telegram bot.</p>",
  scripts: ['<script src="/assets/bot-setup.js?v=2"></script>'],
  content: `<div class="dash-head"><div><h1>🤖 Connect your Telegram bot (optional)</h1><p class="live-link">Your leaderboard works without a bot — this is just an extra channel for your audience.</p></div></div>
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
<div class="field mb-10"><label for="botToken">Bot token</label><div class="pw-wrap"><input id="botToken" type="password" placeholder="123456789:ABCdefGhIjKlMnOpQrStUvWxYz" autocomplete="off" spellcheck="false" /><button type="button" class="pw-toggle" id="tokenToggle" aria-label="Show token">Show</button></div></div>
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
</ul></div>`
});
