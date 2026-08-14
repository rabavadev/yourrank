// commands dashboard page panels
export function commandsPanel(): string {
  return `
  <div class="lb-bento" data-page="commands">
    <div class="lb-widget lb-widget--full" id="commandsEmptyHint">
      <div class="mb-md"><h2>Commands</h2></div>
      <p class="muted">Connect a bot first — do that in <a href="/bot/bots">Bots</a>.</p>
    </div>

    <div class="lb-widget lb-widget--full" id="customizePanel">
      <div class="d-flex justify-between items-center mb-md">
        <h2>Welcome message</h2>
        <p class="muted text-sm m-0" id="selectedBotName">No bot selected</p>
      </div>
      
      <div class="d-flex flex-col gap-8 mb-md command-bot-field">
        <label for="botSelect" class="muted text-xs">Bot</label>
        <select id="botSelect" class="v3-input"><option value="">Loading bots…</option></select>
      </div>
      
      <div id="custDisabledNote" class="v3-note hidden">This bot is disconnected — reconnect it to customize.</div>
      <p class="muted text-sm mb-md">This is what Telegram subscribers receive when they send <code>/start</code> to the selected bot.</p>
      
      <div class="d-flex flex-col gap-8 welcome-message-field">
        <label for="welcomeMsg" class="muted text-xs">Welcome message</label>
        <textarea id="welcomeMsg" class="v3-input" rows="2" placeholder="Leave blank to use the default greeting"></textarea>
        <div>
          <button class="btn btn--accent" data-action="saveWelcome" type="button">Save welcome message</button>
        </div>
      </div>

      <hr class="v3-divider my-lg" />

      <div class="mb-md"><h2>Custom commands</h2></div>
      <p class="muted text-sm mb-md">Add slash-commands your subscribers can send (e.g. <code>/vip</code>) and the reply they'll get. Built-ins like <code>/start</code>, <code>/code</code>, <code>/subscribe</code> are reserved and can't be overridden.</p>
      
      <div class="d-flex flex-wrap gap-12 command-form-row">
        <div class="d-flex flex-col gap-4 flex-1 command-form-field">
          <label class="sr-only" for="cmdName">Command</label>
          <input class="v3-input" id="cmdName" placeholder="Command (e.g. vip)">
        </div>
        <div class="d-flex flex-col gap-4 flex-1 command-form-field">
          <label class="sr-only" for="cmdResp">Reply</label>
          <input class="v3-input" id="cmdResp" placeholder="Reply text subscribers receive">
        </div>
      </div>
      <div class="d-flex flex-wrap gap-12 mt-sm command-form-row">
        <div class="d-flex flex-col gap-4 flex-1 command-form-field">
          <label class="sr-only" for="cmdBtnLabel">Button label</label>
          <input class="v3-input" id="cmdBtnLabel" placeholder="Button label (optional)">
        </div>
        <div class="d-flex flex-col gap-4 flex-1 command-form-field">
          <label class="sr-only" for="cmdBtnUrl">Button URL</label>
          <div class="d-flex gap-8">
            <input class="v3-input command-button-url" id="cmdBtnUrl" type="url" placeholder="https://example.com (optional)">
            <button class="btn btn--ghost" data-action="addCommandButton" type="button" title="Add button">+</button>
          </div>
        </div>
      </div>
      
      <div id="cmdButtonList" class="cmd-button-list mt-sm"></div>
      <div class="mt-md">
        <button class="btn btn--outline" data-action="addCommand" type="button">Add command</button>
      </div>
      <p class="muted text-xs mt-sm">Tip: view a command to see the full reply, or test it by sending a copy to your chat ID.</p>

      <div id="cmdPreview" class="bg-panel border radius-md p-16 mt-md" hidden>
        <div class="mb-sm"><h3>Command preview</h3></div>
        <p class="mb-sm"><b id="cmdPreviewName">/</b></p>
        <pre id="cmdPreviewResponse" class="v3-input font-mono text-sm mb-md command-preview-response"></pre>
        <div class="d-flex flex-wrap gap-8">
          <label class="sr-only" for="cmdTestChatId">Chat ID</label>
          <input class="v3-input" id="cmdTestChatId" inputmode="numeric" placeholder="Your chat ID">
          <button class="btn btn--accent" data-action="testCommand" type="button">Send test</button>
          <button class="btn btn--ghost" data-action="closeCommandPreview" type="button">Close</button>
        </div>
      </div>

      <div class="v3-table-scroll mt-lg">
        <table class="v3-table">
          <thead><tr><th>Command</th><th>Reply</th><th>Buttons</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody id="cmdList"><tr><td colspan="5" class="muted">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>
  </div>`;
}
