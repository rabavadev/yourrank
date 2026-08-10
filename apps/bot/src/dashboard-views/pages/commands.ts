// commands dashboard page panels
export function commandsPanel(): string {
  return `
  <div class="panel" data-page="commands" id="commandsEmptyHint">
    <h2>Commands</h2>
    <p class="muted">Connect a bot first — do that in <a href="/bot/bots">Bots</a>.</p>
  </div>

  <div class="panel" data-page="bots commands" id="customizePanel">
    <div class="cmd-head">
      <h2>Welcome message</h2>
      <p class="muted" id="selectedBotName">No bot selected</p>
    </div>
    <div id="custDisabledNote" class="muted notice hidden">This bot is disconnected — reconnect it to customize.</div>
    <p class="muted panel-intro">This is what viewers receive when they send <code>/start</code> to the selected bot.</p>
    <label for="welcomeMsg" class="muted field-label">Welcome message</label>
    <textarea id="welcomeMsg" rows="2" placeholder="Leave blank to use the default greeting"></textarea>
    <button data-action="saveWelcome" type="button">Save welcome message</button>

    <hr class="divider" />

    <h2 class="subhead">Custom commands</h2>
    <p class="muted panel-intro">Add slash-commands your viewers can send (e.g. <code>/vip</code>) and the reply they'll get. Built-ins like <code>/start</code>, <code>/code</code>, <code>/subscribe</code> are reserved and can't be overridden.</p>
    <div class="row">
      <label class="sr-only" for="cmdName">Command</label>
      <input id="cmdName" placeholder="Command (e.g. vip)">
      <label class="sr-only" for="cmdResp">Reply</label>
      <input id="cmdResp" placeholder="Reply text viewers receive">
    </div>
    <div class="row mt-sm">
      <label class="sr-only" for="cmdBtnLabel">Button label</label>
      <input id="cmdBtnLabel" placeholder="Button label (optional)">
      <label class="sr-only" for="cmdBtnUrl">Button URL</label>
      <input id="cmdBtnUrl" type="url" placeholder="https://example.com (optional)">
      <button data-action="addCommandButton" type="button" title="Add button">+</button>
    </div>
    <div id="cmdButtonList" class="cmd-button-list"></div>
    <button data-action="addCommand" type="button" class="mt-sm">Add command</button>
    <p class="muted hint">Tip: view a command to see the full reply, or test it by sending a copy to your chat ID.</p>

    <div id="cmdPreview" class="cmd-preview" hidden>
      <h3 class="subhead">Command preview</h3>
      <p><b id="cmdPreviewName">/</b></p>
      <pre id="cmdPreviewResponse" class="pre-wrap"></pre>
      <div class="row">
        <label class="sr-only" for="cmdTestChatId">Chat ID</label>
        <input id="cmdTestChatId" inputmode="numeric" placeholder="Your chat ID">
        <button data-action="testCommand" type="button">Send test</button>
        <button class="ghost" data-action="closeCommandPreview" type="button">Close</button>
      </div>
    </div>

    <div class="tbl-scroll"><table class="mt-md"><thead><tr><th>Command</th><th>Reply</th><th>Buttons</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="cmdList"><tr><td colspan="5" class="muted">Loading…</td></tr></tbody></table></div>
  </div>`;
}
