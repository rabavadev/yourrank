// Markup for the Giveaways / Live Chat Keyword Listener dashboard page

export const giveawaysHtml = `
<div class="v3-head">
  <div class="v3-head-col">
    <h1>Live Chat Giveaways</h1>
    <p class="v3-head-sub">Connect to your Kick stream chat in real-time, collect keyword entries, and draw winners on stream.</p>
  </div>
</div>

<div class="gw-layout">
  <!-- Left Column: Setup & Live Feed -->
  <div class="gw-sidebar">
    <!-- Setup Card -->
    <section class="v3-table-card gw-card" id="gw-setup-card">
      <div class="v3-section-head">
        <div>
          <h2>Stream &amp; Keyword</h2>
          <p class="v3-head-sub">Configure your Kick channel and entry trigger.</p>
        </div>
        <div id="gw-status-badge" class="gw-status-pill gw-status--idle" aria-live="polite">
          <span class="gw-status-dot"></span>
          <span id="gw-status-text">Disconnected</span>
        </div>
      </div>

      <form id="gw-setup-form" class="gw-form">
        <div class="field">
          <label for="gw-channel-input">Kick Channel Name</label>
          <div class="gw-input-row">
            <span class="gw-input-prefix">kick.com/</span>
            <input id="gw-channel-input" name="channel" type="text" placeholder="channelname" required autocomplete="off" />
          </div>
          <span class="hint">Enter any Kick streamer channel or broadcaster username.</span>
        </div>

        <div class="field">
          <label for="gw-keyword-input">Target Keyword</label>
          <input id="gw-keyword-input" name="keyword" type="text" value="!win" placeholder="e.g. !win, !enter, YOURRANK" required />
          <span class="hint">Viewers who type this in chat will be entered into the giveaway.</span>
        </div>

        <div class="gw-options">
          <label class="cr-toggle-row">
            <span>
              <b>Unique entries only</b>
              <small>1 entry per viewer username</small>
            </span>
            <input type="checkbox" class="v3-toggle" id="gw-opt-unique" checked />
          </label>

          <label class="cr-toggle-row">
            <span>
              <b>Case sensitive</b>
              <small>Exact match on upper/lowercase</small>
            </span>
            <input type="checkbox" class="v3-toggle" id="gw-opt-case" />
          </label>

          <label class="cr-toggle-row">
            <span>
              <b>Full message match</b>
              <small>Only count if message is strictly the keyword</small>
            </span>
            <input type="checkbox" class="v3-toggle" id="gw-opt-exact" />
          </label>
        </div>

        <div class="gw-actions-row">
          <button class="btn btn--accent btn--lg flex-1" type="submit" id="gw-toggle-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span id="gw-toggle-text">Start Listening</span>
          </button>
        </div>
        <p class="status" id="gw-setup-status" role="status" aria-live="polite"></p>
      </form>
    </section>

    <!-- Live Chat Stream -->
    <section class="v3-table-card gw-card gw-chat-card">
      <div class="v3-section-head">
        <div>
          <h2>Live Chat Stream</h2>
          <p class="v3-head-sub">Real-time chat ticker</p>
        </div>
        <button class="btn btn--sm btn--ghost" id="gw-clear-chat" type="button">Clear</button>
      </div>
      <div class="gw-chat-feed" id="gw-chat-feed" aria-live="polite">
        <div class="gw-chat-empty" id="gw-chat-empty">
          <p>Waiting for chat connection…</p>
        </div>
      </div>
    </section>
  </div>

  <!-- Right Column: Main Workspace, KPI, Roll Winner, Entrants Table -->
  <div class="gw-main">
    <!-- KPI Strip -->
    <div class="v3-kpi-grid gw-kpis">
      <div class="v3-kpi-card">
        <div class="v3-kpi-label">Entrants</div>
        <div class="v3-kpi-value-row">
          <strong id="gw-stat-entrants">0</strong>
        </div>
      </div>
      <div class="v3-kpi-card">
        <div class="v3-kpi-label">Messages Scanned</div>
        <div class="v3-kpi-value-row">
          <strong id="gw-stat-messages">0</strong>
        </div>
      </div>
      <div class="v3-kpi-card">
        <div class="v3-kpi-label">Session Duration</div>
        <div class="v3-kpi-value-row">
          <strong id="gw-stat-time">00:00</strong>
        </div>
      </div>
      <div class="v3-kpi-card">
        <div class="v3-kpi-label">Channel Status</div>
        <div class="v3-kpi-value-row">
          <strong id="gw-stat-channel-name">—</strong>
        </div>
      </div>
    </div>

    <!-- Winner Draw Section -->
    <section class="v3-table-card gw-card gw-winner-section" id="gw-winner-stage">
      <div class="v3-section-head">
        <div>
          <h2>Draw Winner</h2>
          <p class="v3-head-sub">Select a random winner from the verified participants table.</p>
        </div>
        <div class="gw-winner-ctrls">
          <button class="btn btn--accent btn--lg" id="gw-roll-btn" type="button" disabled>
            <span class="gw-roll-ic" aria-hidden="true">🎲</span>
            <span>Pick Random Winner</span>
          </button>
        </div>
      </div>

      <!-- Animation / Roll Slot Box -->
      <div class="gw-roller" id="gw-roller" hidden>
        <div class="gw-roller-track" id="gw-roller-track">
          <span class="gw-roller-item">Rolling…</span>
        </div>
      </div>

      <!-- Winner Showcase Result -->
      <div class="gw-winner-showcase" id="gw-winner-showcase" hidden>
        <div class="gw-winner-crown" aria-hidden="true">👑</div>
        <div class="gw-winner-avatar-wrap">
          <img class="gw-winner-avatar" id="gw-winner-avatar" src="" alt="Winner avatar" />
        </div>
        <div class="gw-winner-info">
          <span class="gw-winner-badge">GIVEAWAY WINNER</span>
          <h3 class="gw-winner-name" id="gw-winner-name">Winner</h3>
          <p class="gw-winner-msg" id="gw-winner-msg">"!"</p>
          <span class="gw-winner-time" id="gw-winner-time"></span>
        </div>
        <div class="gw-winner-actions">
          <button class="btn btn--sm btn--accent" id="gw-copy-winner" type="button">Copy Winner Info</button>
          <button class="btn btn--sm btn--ghost" id="gw-reroll-btn" type="button">Re-roll</button>
          <button class="btn btn--sm btn--ghost" id="gw-dismiss-winner" type="button">Close</button>
        </div>
      </div>
    </section>

    <!-- Participants Table -->
    <section class="v3-table-card gw-card" id="gw-entrants-section">
      <div class="v3-section-head">
        <div>
          <h2>Entrants (<span id="gw-table-count">0</span>)</h2>
          <p class="v3-head-sub">Viewers who typed the matching keyword during this live session.</p>
        </div>
        <div class="gw-table-actions">
          <input type="search" class="gw-search-input" id="gw-search-input" placeholder="Search viewer…" />
          <button class="btn btn--sm" id="gw-export-btn" type="button" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button class="btn btn--sm btn--danger" id="gw-clear-btn" type="button" disabled>Clear All</button>
        </div>
      </div>

      <div class="cr-table-scroll">
        <table class="v3-table" id="gw-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Viewer</th>
              <th>Chat Message</th>
              <th>Entered At</th>
              <th class="ta-r">Action</th>
            </tr>
          </thead>
          <tbody id="gw-entrants-list"></tbody>
        </table>
      </div>

      <div class="v3-empty" id="gw-entrants-empty">
        <div class="v3-empty-ic">🎁</div>
        <h2>No entrants yet</h2>
        <p>Start listening to chat, tell your viewers to type your keyword, and they will appear here live.</p>
      </div>
    </section>
  </div>
</div>
`;
