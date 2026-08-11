// broadcasts dashboard page panels
export function broadcastsPanel(): string {
  return `
  <div class="panel" data-page="broadcasts"><h2>Broadcast to subscribers</h2>
    <div id="bcGate" class="muted mb-sm"></div>
    <p class="muted" id="bcDraftStatus" hidden>Draft loaded from your last visit.</p>

    <div class="bc-step" data-step="1">
      <h3>1. Composer</h3>
      <label class="sr-only" for="bcBody">Message</label>
      <textarea id="bcBody" rows="3" aria-errormessage="bcBody-error" placeholder="Message to all your bot's subscribers — use {name} to include the subscriber's first name (HTML supported)"></textarea>
      <span id="bcBody-error" class="field-err" role="alert"></span>
      <label class="sr-only" for="bcImage">Image URL</label>
      <input id="bcImage" type="url" placeholder="Image URL (optional) — shown above the message" />
    </div>

    <div class="bc-step" data-step="2">
      <h3>2. Audience</h3>
      <label for="bcBotSelect" class="muted field-label">From bot</label>
      <select class="input-w-md" id="bcBotSelect" aria-errormessage="bcBotSelect-error"><option value="">Loading bots…</option></select>
      <span id="bcBotSelect-error" class="field-err" role="alert"></span>
      <div class="bc-segment-fields">
        <label class="muted" for="bcLang">Language</label>
        <select id="bcLang"><option value="">Any</option><option value="en">English</option><option value="ru">Russian</option><option value="es">Spanish</option><option value="pt">Portuguese</option><option value="ar">Arabic</option><option value="de">German</option><option value="fr">French</option></select>
        <label class="muted" for="bcMinLastSeen">Active in last N days</label>
        <input id="bcMinLastSeen" type="number" min="0" max="3650" placeholder="e.g. 7" />
        <label class="muted" for="bcFirstSeen">Joined in last N days</label>
        <input id="bcFirstSeen" type="number" min="0" max="3650" placeholder="e.g. 30" />
        <label class="muted" for="bcUsername">Username contains</label>
        <input id="bcUsername" type="text" maxLength="100" placeholder="optional" />
      </div>
      <div id="bcAudience" class="muted form-note" aria-live="polite">This will send to <b>–</b> subscribers.</div>
    </div>

    <div class="bc-step" data-step="3">
      <h3>3. Send time</h3>
      <div class="bc-when-options">
        <label><input type="radio" name="bcWhen" value="now" checked /> Send now</label>
        <label><input type="radio" name="bcWhen" value="schedule" /> Schedule</label>
      </div>
      <label class="muted" for="bcSchedule">Scheduled time</label>
      <input id="bcSchedule" type="datetime-local" disabled />
      <p class="muted" id="bcTimezone">Your timezone: <b>detecting…</b></p>
      <p class="muted" id="bcUtcHint" hidden>UTC equivalent: <b></b></p>
    </div>

    <div class="bc-step" data-step="4">
      <h3>4. Preview &amp; test</h3>
      <button class="ghost" data-action="openBroadcastPreview" type="button">Preview broadcast</button>
      <span class="muted text-sm">or send a test copy to</span>
      <input class="input-w-sm" id="bcTestChat" inputmode="numeric" aria-errormessage="bcTestChat-error" placeholder="your chat ID">
      <span id="bcTestChat-error" class="field-err" role="alert"></span>
      <button class="ghost" data-action="testBroadcast" type="button">Send test</button>
    </div>

    <div id="bcSummary" class="bc-summary" hidden>
      <h3>5. Summary</h3>
      <ul id="bcSummaryList" class="muted"></ul>
    </div>

    <div id="bcPreview" class="bc-preview" role="dialog" aria-modal="true" aria-labelledby="bcPreviewTitle" aria-describedby="bcPreviewDesc" hidden>
      <div class="bc-preview-card">
        <h3 id="bcPreviewTitle">Preview broadcast</h3>
        <p id="bcPreviewDesc">This will send to <b id="bcPreviewCount">–</b> subscribers.</p>
        <div class="bc-preview-msg" id="bcPreviewBody" role="document"></div>
        <div class="bc-preview-img" id="bcPreviewImg" hidden></div>
        <div class="bc-preview-actions">
          <button class="ghost" data-action="closeBroadcastPreview" type="button">Cancel</button>
          <button data-action="confirmBroadcast" type="button" id="bcConfirmBtn">Send now</button>
        </div>
      </div>
    </div>

    <div class="inline-row">
      <button data-action="sendBroadcast" type="button" id="bcReviewBtn">Review and send</button>
    </div>
    <p id="bcFormStatus" class="form-status" role="alert" aria-live="polite"></p>

    <p class="muted hint">Use <code>{name}</code> to include the subscriber's first name. Get your chat ID by sending <code>/start</code> to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a>. Scheduled broadcasts can be cancelled until they start sending.</p>
    <div class="tbl-scroll"><table class="mt-md"><thead><tr><th>Message</th><th>Bot</th><th>Status</th><th>Scheduled</th><th>Sent</th><th>Failed</th><th><span class="sr-only">Actions</span></th></tr></thead>
    <tbody id="bcList"><tr><td colspan="7" class="muted">Loading broadcasts…</td></tr></tbody></table></div>
  </div>`;
}
