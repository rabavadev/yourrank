// bots dashboard page panels
export function botsPanel(): string {
  return `
  <div class="panel" data-page="bots"><h2>Your bots</h2>
    <div id="botList" class="muted">Loading…</div>

    <div class="wizard" id="connectWizard">
      <div class="wizard-step" data-step="1">
        <h3>1. Get a bot from @BotFather</h3>
        <p class="muted">Open BotFather in Telegram, create a new bot, and copy the API token. Keep the token secret — only you and YourRank need it.</p>
        <a href="https://t.me/BotFather" target="_blank" rel="noopener" class="btn">Open @BotFather</a>
        <button type="button" class="ghost" data-action="wizardNext" data-step="1">I have a token →</button>
      </div>

      <div class="wizard-step" data-step="2" hidden>
        <h3>2. Paste your bot token</h3>
        <p class="muted">Your token is encrypted on our side. We only store the last 4 characters so you can recognise it.</p>
        <label class="sr-only" for="botToken">Bot Token</label>
        <div class="style-11">
          <input class="style-12" id="botToken" type="password" autocomplete="off" placeholder="123456:ABC-...">
          <button class="ghost" data-action="toggleToken" type="button" aria-label="Show token">Show</button>
        </div>
        <label class="sr-only" for="botWelcome">Welcome Message</label>
        <input id="botWelcome" placeholder="Welcome message (optional)">
        <button data-action="connectBot" type="button">Connect bot</button>
        <button type="button" class="ghost" data-action="wizardPrev" data-step="2">← Back</button>
      </div>

      <div class="wizard-step" data-step="3" hidden>
        <h3>3. Verifying connection…</h3>
        <p class="muted" id="connectStatus">Checking your bot with Telegram.</p>
      </div>
    </div>
  </div>

  <!-- Test message (bots) -->
  <div class="panel" data-page="bots" id="testMsgPanel" hidden>
    <h2>Send a test message</h2>
    <p class="muted style-13">Send a one-off message from <b id="tmBotName">your bot</b> to confirm it works. Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>.</p>
    <div class="row">
      <label class="sr-only" for="tmChatId">Chat ID</label>
      <input id="tmChatId" inputmode="numeric" placeholder="Your Telegram chat ID (e.g. 123456789)">
      <label class="sr-only" for="tmText">Message</label>
      <input id="tmText" placeholder="Message to send">
    </div>
    <button data-action="sendTestMessage" type="button">Send test message</button>
    <button class="ghost" data-action="cancelTestMessage" type="button">Cancel</button>
  </div>`;
}
