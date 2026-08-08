// broadcasts dashboard page panels
export function broadcastsPanel(): string {
  return `
  <div class="panel" data-page="broadcasts"><h2>Broadcast to subscribers</h2>
    <div id="bcGate" class="muted style-21"></div>
    <label for="bcBotSelect" class="muted style-22">From bot</label>
    <select class="style-23" id="bcBotSelect"><option value="">Loading bots…</option></select>
    <label class="sr-only" for="bcBody">Message</label>
    <textarea id="bcBody" rows="3" placeholder="Message to all your bot's subscribers — use {name} to include the subscriber's first name (HTML supported)"></textarea>
    <label class="sr-only" for="bcImage">Image URL</label>
    <input id="bcImage" type="url" placeholder="Image URL (optional) — shown above the message" />

    <details class="bc-segment">
      <summary class="muted">Segment &amp; schedule</summary>
      <div class="bc-segment-fields">
        <label class="muted" for="bcSchedule">Schedule for later (optional, UTC)</label>
        <input id="bcSchedule" type="datetime-local" />
        <label class="muted" for="bcLang">Language</label>
        <select id="bcLang"><option value="">Any</option><option value="en">English</option><option value="ru">Russian</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="ar">Arabic</option><option value="de">German</option><option value="fr">French</option></select>
        <label class="muted" for="bcMinLastSeen">Active in last N days</label>
        <input id="bcMinLastSeen" type="number" min="0" max="3650" placeholder="e.g. 7" />
        <label class="muted" for="bcFirstSeen">Joined in last N days</label>
        <input id="bcFirstSeen" type="number" min="0" max="3650" placeholder="e.g. 30" />
        <label class="muted" for="bcUsername">Username contains</label>
        <input id="bcUsername" type="text" maxLength="100" placeholder="optional" />
      </div>
    </details>

    <div id="bcAudience" class="muted style-24" aria-live="polite">This will send to <b>–</b> subscribers.</div>
    <div id="bcPreview" class="bc-preview" hidden>
      <div class="bc-preview-card">
        <h3>Preview broadcast</h3>
        <p>This will send to <b id="bcPreviewCount">–</b> subscribers.</p>
        <div class="bc-preview-msg" id="bcPreviewBody"></div>
        <div class="bc-preview-img" id="bcPreviewImg" hidden></div>
        <div class="bc-preview-actions">
          <button class="ghost" data-action="closeBroadcastPreview" type="button">Cancel</button>
          <button data-action="confirmBroadcast" type="button">Send broadcast</button>
        </div>
      </div>
    </div>
    <div class="style-25">
      <button data-action="sendBroadcast" type="button">Queue broadcast</button>
      <span class="muted style-26">or send a test copy to</span>
      <input class="style-27" id="bcTestChat" inputmode="numeric" placeholder="your chat ID">
      <button class="ghost" data-action="testBroadcast" type="button">Send test</button>
    </div>
    <p class="muted style-28">Use <code>{name}</code> to include the subscriber's first name. Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>. Scheduled broadcasts can be cancelled until they start sending.</p>
    <table class="style-20"><thead><tr><th>Message</th><th>Bot</th><th>Status</th><th>Scheduled</th><th>Sent</th><th>Failed</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="bcList"></tbody></table>
  </div>`;
}
