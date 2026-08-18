// Markup for Giveaways & Community Events Hub (Chat Giveaways, Ticket Raffles, Flash Code Drops)

const GIVEAWAY_TABS = [
  ["chat", "Chat giveaways"],
  ["raffles", "Ticket raffles"],
  ["drops", "Code drops"],
  ["preds", "Predictions"],
];

export function renderGiveawaysHtml(activeTab = "chat") {
  const active = GIVEAWAY_TABS.some(([tab]) => tab === activeTab) ? activeTab : "chat";
  const tabs = GIVEAWAY_TABS.map(([tab, label]) => `
  <a class="gw-tab-btn v3-tab${tab === active ? " is-active is-on" : ""}" id="tab-btn-${tab}" href="/dashboard/giveaways/${tab}" data-tab="${tab}" role="tab" aria-selected="${tab === active ? "true" : "false"}"${tab === active ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `
<div class="v3-head">
  <div class="v3-head-col">
  <h1>${GIVEAWAY_TABS.find(([tab]) => tab === active)?.[1] || "Chat giveaways"}</h1>
    <p class="v3-head-sub">Engage your viewers with live chat giveaways, loyalty point ticket raffles, and flash drop claim codes.</p>
  </div>
  <div class="d-flex gap-8 items-center flex-wrap">
    <button class="btn btn--sm btn--accent" id="btn-open-event-drawer" type="button">+ Create Event</button>
  </div>
</div>

<!-- Segmented Navigation Tabs -->
<div class="gw-nav-tabs v3-tabs" role="tablist" aria-label="Giveaways pages">
${tabs}
</div>

<!-- =========================================================================
     TAB 1: LIVE CHAT GIVEAWAYS
     ========================================================================= -->
<div class="gw-tab-pane${active === "chat" ? " is-active" : ""}" id="pane-chat"${active === "chat" ? "" : " hidden"}>
  <div class="gw-layout">
    <!-- Left Column: Setup, Anti-Alt Shield & Live Feed -->
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

          <!-- Giveaway Rules & Fair Play (Optional) -->
          <div class="gw-security-box">
            <div class="gw-security-head">
              <div class="gw-sec-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Fair Play Rules (Optional)</span>
              </div>
              <span class="pill pill--good" id="gw-shield-status">Active</span>
            </div>

            <label class="cr-toggle-row">
              <span>
                <b>Block Fake / Duplicate Accounts</b>
                <small>Filter out instant bot farms &amp; duplicate alt entries</small>
              </span>
              <input type="checkbox" class="v3-toggle" id="gw-opt-antialt" checked />
            </label>

            <div class="field" style="margin-top: 10px; margin-bottom: 8px;">
              <label for="gw-trust-min">Who is eligible to win?</label>
              <select id="gw-trust-min" class="v3-select">
                <option value="0">Everyone (Open to all chatters)</option>
                <option value="50" selected>Balanced — Filter obvious fake accounts (Recommended)</option>
                <option value="75">Loyal Viewers Only — Active stream chatters</option>
              </select>
              <span class="hint">Choose who is eligible when you draw a winner.</span>
            </div>

            <div class="field" style="margin-bottom: 8px;">
              <label for="gw-opt-subs-perk">Subscriber &amp; VIP Perks</label>
              <select id="gw-opt-subs-perk" class="v3-select">
                <option value="all" selected>Equal Chance (1x for everyone)</option>
                <option value="subs_2x">⭐ 2x Double Chance for Subs &amp; VIPs</option>
                <option value="subs_3x">⭐ 3x Triple Chance for Subs &amp; VIPs</option>
                <option value="subs_5x">🔥 5x Ultra Luck for Subs &amp; VIPs</option>
                <option value="subs_only">👑 Subscribers &amp; VIPs Only</option>
              </select>
              <span class="hint">Reward your subscribers with higher winning odds or exclusive draws.</span>
            </div>

            <div class="field" style="margin-bottom: 8px;">
              <label for="gw-opt-min-msgs">Minimum Stream Chat Messages</label>
              <select id="gw-opt-min-msgs" class="v3-select">
                <option value="0" selected>No minimum (Instant entry)</option>
                <option value="3">At least 3 messages during stream</option>
                <option value="5">At least 5 messages (Active chatter)</option>
                <option value="10">At least 10 messages (Super active)</option>
              </select>
              <span class="hint">Ensure entrants are actually active in chat during your broadcast.</span>
            </div>

            <label class="cr-toggle-row">
              <span>
                <b>Skip Recent Winners</b>
                <small>Give others a chance (skip anyone who won in the last 24 hours)</small>
              </span>
              <input type="checkbox" class="v3-toggle" id="gw-opt-skip-past" />
            </label>
          </div>

          <div class="gw-actions">
            <button class="btn btn--accent" id="gw-btn-listen" type="submit">
              <span id="gw-listen-btn-text">🎧 Connect &amp; Start Listening</span>
            </button>
            <button class="btn btn--ghost" id="gw-btn-reset" type="button" style="display: none;">
              Clear Entrants
            </button>
          </div>
        </form>
      </section>

      <!-- Real-Time Chat Stream Activity (Compact Log) -->
      <section class="v3-table-card gw-card" id="gw-feed-card">
        <div class="v3-section-head">
          <div>
            <h2>Live Stream Chat</h2>
            <p class="v3-head-sub">Real-time messages from your Kick channel.</p>
          </div>
          <span class="pill pill--info" id="gw-feed-counter">0 msgs</span>
        </div>
        <div class="gw-feed-container" id="gw-chat-feed" aria-live="polite">
          <div class="gw-feed-empty" id="gw-feed-empty">
            Connect to start viewing incoming stream chat messages…
          </div>
        </div>
      </section>
    </div>

    <!-- Right Column: Winner Stage & Entrants Table -->
    <div class="gw-main">
      <!-- Winner Stage Card -->
      <section class="v3-table-card gw-card" id="gw-stage-card">
        <div class="gw-stage-head">
          <div>
            <h2>Live Giveaway Stage</h2>
            <p class="v3-head-sub">Draw verified winners live on stream with transparent fair-play scoring.</p>
          </div>
          <div class="gw-metrics-row">
            <div class="gw-stat-pill">
              <span class="gw-stat-val" id="gw-stat-entrants">0</span>
              <span class="gw-stat-lbl">Entrants</span>
            </div>
            <div class="gw-stat-pill">
              <span class="gw-stat-val" id="gw-stat-verified">0</span>
              <span class="gw-stat-lbl">Verified</span>
            </div>
            <div class="gw-stat-pill" id="gw-pill-flagged" style="display: none;">
              <span class="gw-stat-val font-danger" id="gw-stat-flagged">0</span>
              <span class="gw-stat-lbl">Flagged Alts</span>
            </div>
          </div>
        </div>

        <div class="gw-stage-body">
          <!-- Active Winner Card (Hidden until drawn) -->
          <div class="gw-winner-stage" id="gw-winner-stage" style="display: none;">
            <div class="gw-winner-podium">
              <div class="gw-winner-crown">👑</div>
              <img class="gw-winner-avatar" id="gw-winner-avatar" src="" alt="Winner avatar" />
              <div class="gw-winner-meta">
                <div class="gw-winner-badges-row">
                  <span class="gw-winner-badge">WINNER DRAWN</span>
                  <span class="gw-trust-badge gw-trust-badge--high" id="gw-winner-trust">🟢 Verified Viewer</span>
                </div>
                <h3 class="gw-winner-username" id="gw-winner-name">Username</h3>
                <p class="gw-winner-msg" id="gw-winner-message">"entry message"</p>
              </div>
            </div>

            <!-- Claim Timer Bar -->
            <div class="gw-claim-box" id="gw-claim-box">
              <div class="gw-claim-header">
                <span class="gw-claim-dot gw-claim-dot--waiting" id="gw-claim-dot"></span>
                <strong id="gw-claim-status">Waiting for winner to type in chat…</strong>
                <span class="gw-claim-countdown" id="gw-claim-countdown">60s</span>
              </div>
              <div class="gw-claim-bar-bg">
                <div class="gw-claim-bar-fill" id="gw-claim-fill"></div>
              </div>
            </div>

            <div class="gw-winner-actions">
              <button class="btn btn--accent" id="gw-btn-copy-winner" type="button">📋 Copy Info</button>
              <button class="btn btn--ghost font-danger" id="gw-btn-reroll" type="button">🎲 Re-roll Winner</button>
            </div>
          </div>

          <!-- Pre-Draw Idle Stage -->
          <div class="gw-stage-idle gw-roller" id="gw-stage-idle">
            <div class="gw-idle-wheel">
              <div class="gw-idle-icon">🎁</div>
            </div>
            <h3>Ready to pick a winner</h3>
            <p>Wait for your viewers to enter, then roll the random selector.</p>
            <button class="btn btn--accent btn--lg" id="gw-btn-roll" type="button" disabled>
              🎲 Draw Random Winner
            </button>
          </div>
        </div>
      </section>

      <!-- Entrants Live Roster -->
      <section class="v3-table-card gw-card" id="gw-entrants-card">
        <div class="v3-section-head">
          <div>
            <h2>Verified Entrants (<span id="gw-count-header">0</span>)</h2>
            <p class="v3-head-sub">Live participants who typed the keyword in chat.</p>
          </div>
          <div class="gw-entrants-tools">
            <input type="text" class="v3-search-input" id="gw-search-entrants" placeholder="Search entrant…" />
            <button class="btn btn--sm btn--ghost" id="gw-btn-export" type="button">Export CSV</button>
          </div>
        </div>

        <div class="v3-table-scroll">
          <table class="v3-table">
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Viewer</th>
                <th>Status</th>
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
          <p>Start listening to chat, tell your viewers to type your keyword, and they will appear here live in real time.</p>
        </div>
      </section>
    </div>
  </div>
</div>

<!-- =========================================================================
     TAB 2: TICKET RAFFLES
     ========================================================================= -->
<div class="gw-tab-pane${active === "raffles" ? " is-active" : ""}" id="pane-raffles"${active === "raffles" ? "" : " hidden"}>
  <div class="gw-events-grid">
    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Active Ticket Raffles</h2>
          <p class="v3-head-sub">Viewers buy tickets using loyalty points to win scheduled prizes.</p>
        </div>
        <button class="btn btn--sm btn--accent" id="btn-create-raffle" type="button">+ New Raffle</button>
      </div>

      <div class="gw-raffles-container" id="rf-active-list">
        <div class="v3-empty" id="rf-empty-active">
          <div class="v3-empty-ic">🎟️</div>
          <h2>No active raffles</h2>
          <p>Create a raffle to let your viewers buy tickets with their loyalty credits.</p>
        </div>
      </div>
    </section>

    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Past &amp; Drawn Raffles</h2>
          <p class="v3-head-sub">History of winners and ticket sales.</p>
        </div>
      </div>

      <div class="v3-table-scroll">
        <table class="v3-table">
          <thead>
            <tr>
              <th>Prize Title</th>
              <th>Ticket Cost</th>
              <th>Total Tickets</th>
              <th>Winner</th>
              <th>Drawn At</th>
            </tr>
          </thead>
          <tbody id="rf-past-list">
            <tr><td colspan="5" class="ta-c font-muted" style="padding: 24px;">No past raffles yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<!-- =========================================================================
     TAB 3: FLASH CODE DROPS
     ========================================================================= -->
<div class="gw-tab-pane${active === "drops" ? " is-active" : ""}" id="pane-drops"${active === "drops" ? "" : " hidden"}>
  <div class="gw-events-grid">
    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Active Flash Drops</h2>
          <p class="v3-head-sub">Drop limited-claim codes in chat for instant viewer reward surges.</p>
        </div>
        <button class="btn btn--sm btn--accent" id="btn-create-drop" type="button">+ Launch New Drop</button>
      </div>

      <div class="gw-drops-container" id="cd-active-list">
        <div class="v3-empty" id="cd-empty-active">
          <div class="v3-empty-ic">⚡</div>
          <h2>No active flash drops</h2>
          <p>Launch a flash drop code to reward active stream viewers in real time.</p>
        </div>
      </div>
    </section>

    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Drop History &amp; Claims</h2>
          <p class="v3-head-sub">Past claim codes and claim volumes.</p>
        </div>
      </div>

      <div class="v3-table-scroll">
        <table class="v3-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Reward</th>
              <th>Claims</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="cd-past-list">
            <tr><td colspan="5" class="ta-c font-muted" style="padding: 24px;">No drops created yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<!-- =========================================================================
     TAB 4: LIVE PREDICTIONS & BETTING
     ========================================================================= -->
<div class="gw-tab-pane${active === "preds" ? " is-active" : ""}" id="pane-preds"${active === "preds" ? "" : " hidden"}>
  <div class="gw-events-grid">
    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Active Stream Predictions</h2>
          <p class="v3-head-sub">Run live betting pools on in-game events with dynamic proportional payouts.</p>
        </div>
        <button class="btn btn--sm btn--accent" id="btn-create-pred" type="button">+ New Prediction</button>
      </div>

      <div class="gw-preds-container" id="pred-active-list">
        <div class="v3-empty" id="pred-empty-active">
          <div class="v3-empty-ic">🔮</div>
          <h2>No active predictions</h2>
          <p>Launch a live prediction to let viewers wager their loyalty points on your stream match outcomes.</p>
        </div>
      </div>
    </section>

    <section class="v3-table-card gw-card">
      <div class="v3-section-head">
        <div>
          <h2>Prediction History &amp; Settlements</h2>
          <p class="v3-head-sub">Past settled predictions and payout logs.</p>
        </div>
      </div>

      <div class="v3-table-scroll">
        <table class="v3-table">
          <thead>
            <tr>
              <th>Prediction Title</th>
              <th>Total Pool</th>
              <th>Participants</th>
              <th>Outcome</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody id="pred-past-list">
            <tr><td colspan="6" class="ta-c font-muted" style="padding: 24px;">No predictions created yet.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<!-- =========================================================================
     DRAWERS & MODALS
     ========================================================================= -->

<!-- Create Prediction Drawer -->
<div class="gw-drawer-backdrop" id="pred-drawer" hidden>
  <div class="gw-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="pred-drawer-title">
    <div class="gw-drawer-head">
      <h2 id="pred-drawer-title">🔮 Create Live Prediction</h2>
      <button class="gw-modal-close-btn" id="pred-drawer-close" type="button" aria-label="Close">✕</button>
    </div>
    <form id="pred-form" class="gw-drawer-body">
      <div class="field">
        <label for="pred-title">Prediction Question *</label>
        <input type="text" id="pred-title" placeholder="e.g. Will I clutch this 1v3 round?" required />
        <span class="hint">What are your viewers predicting?</span>
      </div>

      <div class="field">
        <label>Options</label>
        <div class="grid2">
          <div>
            <label for="pred-opt-1" class="font-12 font-muted">Option A (Yes / نعم)</label>
            <input type="text" id="pred-opt-1" value="Yes / نعم" required />
          </div>
          <div>
            <label for="pred-opt-2" class="font-12 font-muted">Option B (No / لا)</label>
            <input type="text" id="pred-opt-2" value="No / لا" required />
          </div>
        </div>
      </div>

      <div class="field">
        <label for="pred-min-bet">Minimum Bet (Credits)</label>
        <input type="number" id="pred-min-bet" min="1" value="10" placeholder="e.g. 10" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="5" data-target="pred-min-bet">5 pts</button>
          <button class="gw-chip" type="button" data-val="10" data-target="pred-min-bet">10 pts</button>
          <button class="gw-chip" type="button" data-val="25" data-target="pred-min-bet">25 pts</button>
          <button class="gw-chip" type="button" data-val="50" data-target="pred-min-bet">50 pts</button>
        </div>
      </div>

      <div class="field">
        <label for="pred-max-bet">Maximum Bet (Credits)</label>
        <input type="number" id="pred-max-bet" min="1" value="500" placeholder="e.g. 500" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="100" data-target="pred-max-bet">100 pts</button>
          <button class="gw-chip" type="button" data-val="500" data-target="pred-max-bet">500 pts</button>
          <button class="gw-chip" type="button" data-val="1000" data-target="pred-max-bet">1,000 pts</button>
          <button class="gw-chip" type="button" data-val="5000" data-target="pred-max-bet">5,000 pts</button>
        </div>
      </div>

      <div class="field">
        <label for="pred-lock-min">Betting Window</label>
        <select id="pred-lock-min" class="v3-select">
          <option value="2">2 minutes (Fast round)</option>
          <option value="5" selected>5 minutes (Standard match)</option>
          <option value="10">10 minutes</option>
          <option value="0">Manual lock only (until streamer clicks Lock)</option>
        </select>
      </div>

      <div class="gw-drawer-footer">
        <button class="btn btn--ghost" id="pred-cancel" type="button">Cancel</button>
        <button class="btn btn--accent" id="pred-submit" type="submit">Launch Prediction 🔮</button>
      </div>
    </form>
  </div>
</div>

<!-- Settle Prediction Modal -->
<div class="gw-drawer-backdrop" id="settle-drawer" hidden>
  <div class="gw-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="settle-title">
    <div class="gw-drawer-head">
      <h2 id="settle-title">⚖️ Settle Prediction Outcome</h2>
      <button class="gw-modal-close-btn" id="settle-drawer-close" type="button" aria-label="Close">✕</button>
    </div>
    <div class="gw-drawer-body">
      <p class="font-muted font-14" id="settle-pred-title">Select which option won to distribute the prize pool automatically.</p>
      <input type="hidden" id="settle-pred-id" value="" />

      <div class="field">
        <label>Which option won?</label>
        <div class="d-flex flex-column gap-8 mt-8" id="settle-options-container"></div>
      </div>

      <div class="gw-drawer-footer">
        <button class="btn btn--ghost font-danger" id="settle-btn-cancel-pred" type="button">Cancel &amp; Refund All</button>
        <button class="btn btn--accent" id="settle-btn-confirm" type="button">Confirm &amp; Payout Winners 🎉</button>
      </div>
    </div>
  </div>
</div>

<!-- Create Raffle Drawer -->
<div class="gw-drawer-backdrop" id="rf-drawer" hidden>
  <div class="gw-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="rf-drawer-title">
    <div class="gw-drawer-head">
      <h2 id="rf-drawer-title">🎟️ Create Ticket Raffle</h2>
      <button class="gw-modal-close-btn" id="rf-drawer-close" type="button" aria-label="Close">✕</button>
    </div>
    <form id="rf-form" class="gw-drawer-body">
      <div class="field">
        <label for="rf-title">Prize Title *</label>
        <input type="text" id="rf-title" placeholder="e.g. $100 Amazon Gift Card or VIP Role" required />
        <span class="hint">What will the winner receive?</span>
      </div>

      <div class="field">
        <label for="rf-desc">Description (Optional)</label>
        <textarea id="rf-desc" rows="2" placeholder="Rules or details for claiming this prize…"></textarea>
      </div>

      <div class="field">
        <label for="rf-cost">Ticket Cost (in Credits)</label>
        <input type="number" id="rf-cost" min="0" value="30" placeholder="e.g. 30" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="0" data-target="rf-cost">Free (0 pts)</button>
          <button class="gw-chip" type="button" data-val="25" data-target="rf-cost">25 pts</button>
          <button class="gw-chip" type="button" data-val="50" data-target="rf-cost">50 pts</button>
          <button class="gw-chip" type="button" data-val="100" data-target="rf-cost">100 pts</button>
        </div>
        <span class="hint">How many points a viewer pays per ticket. Set 0 for free community entries.</span>
      </div>

      <div class="field">
        <label for="rf-max">Max Tickets per Viewer</label>
        <input type="number" id="rf-max" min="1" value="10" placeholder="e.g. 5" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="1" data-target="rf-max">1 ticket</button>
          <button class="gw-chip" type="button" data-val="5" data-target="rf-max">5 tickets</button>
          <button class="gw-chip" type="button" data-val="10" data-target="rf-max">10 tickets</button>
          <button class="gw-chip" type="button" data-val="25" data-target="rf-max">25 tickets</button>
        </div>
        <span class="hint">Prevents one viewer from buying all tickets.</span>
      </div>

      <div class="gw-drawer-footer">
        <button class="btn btn--ghost" id="rf-cancel" type="button">Cancel</button>
        <button class="btn btn--accent" id="rf-submit" type="submit">Create Raffle 🎟️</button>
      </div>
    </form>
  </div>
</div>

<!-- Launch Flash Code Drop Drawer -->
<div class="gw-drawer-backdrop" id="cd-drawer" hidden>
  <div class="gw-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cd-drawer-title">
    <div class="gw-drawer-head">
      <h2 id="cd-drawer-title">⚡ Launch Flash Code Drop</h2>
      <button class="gw-modal-close-btn" id="cd-drawer-close" type="button" aria-label="Close">✕</button>
    </div>
    <form id="cd-form" class="gw-drawer-body">
      <div class="field">
        <label for="cd-code">Secret Drop Code *</label>
        <div class="d-flex gap-8">
          <input type="text" id="cd-code" placeholder="e.g. KICKBOOST" style="text-transform: uppercase;" required />
          <button class="btn btn--sm btn--ghost" id="cd-btn-random" type="button">🎲 Random</button>
        </div>
        <span class="hint">The keyword you shout out on stream for viewers to claim.</span>
      </div>

      <div class="field">
        <label for="cd-points">Credits Reward per Viewer</label>
        <input type="number" id="cd-points" min="1" value="100" placeholder="e.g. 30" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="25" data-target="cd-points">+25 pts</button>
          <button class="gw-chip" type="button" data-val="50" data-target="cd-points">+50 pts</button>
          <button class="gw-chip" type="button" data-val="100" data-target="cd-points">+100 pts</button>
          <button class="gw-chip" type="button" data-val="250" data-target="cd-points">+250 pts</button>
        </div>
        <span class="hint">How many points each viewer receives upon claiming.</span>
      </div>

      <div class="field">
        <label for="cd-max">Max Total Claims (First Come, First Served)</label>
        <input type="number" id="cd-max" min="1" value="50" placeholder="e.g. 20" required />
        <div class="gw-chip-presets">
          <button class="gw-chip" type="button" data-val="10" data-target="cd-max">10 claims</button>
          <button class="gw-chip" type="button" data-val="25" data-target="cd-max">25 claims</button>
          <button class="gw-chip" type="button" data-val="50" data-target="cd-max">50 claims</button>
          <button class="gw-chip" type="button" data-val="100" data-target="cd-max">100 claims</button>
        </div>
        <span class="hint">Once this limit is reached, the drop code expires automatically.</span>
      </div>

      <div class="field">
        <label for="cd-expire">Time Limit (Optional)</label>
        <select id="cd-expire" class="v3-select">
          <option value="0">No time limit (until claims run out)</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </div>

      <div class="gw-drawer-footer">
        <button class="btn btn--ghost" id="cd-cancel" type="button">Cancel</button>
        <button class="btn btn--accent" id="cd-submit" type="submit">Launch Drop ⚡</button>
      </div>
    </form>
  </div>
</div>

<!-- Winner Celebration Pop-up Modal -->
<div class="gw-modal-backdrop" id="gw-winner-modal" hidden>
  <div class="gw-modal-content" role="dialog" aria-modal="true" aria-labelledby="gw-modal-name">
    <div class="gw-modal-hero">
      <button class="gw-modal-close-btn" id="gw-modal-close" type="button" aria-label="Close modal">✕</button>
      <div class="gw-modal-crown" aria-hidden="true">👑</div>
      <img class="gw-modal-avatar" id="gw-modal-avatar" src="" alt="Winner avatar" />
      <div class="gw-winner-badges-row" style="justify-content: center;">
        <span class="gw-winner-badge">WINNER DRAWN</span>
        <span class="gw-trust-badge gw-trust-badge--high" id="gw-modal-trust-badge">🟢 Verified Viewer</span>
      </div>
      <h2 class="gw-modal-name" id="gw-modal-name">Winner</h2>
      <p class="gw-winner-msg" id="gw-modal-msg">"!"</p>
    </div>

    <div class="gw-modal-body">
      <!-- Live Claim Countdown Bar -->
      <div class="gw-claim-box" id="gw-modal-claim-box" style="margin: 0;">
        <div class="gw-claim-header">
          <span class="gw-claim-dot gw-claim-dot--waiting" id="gw-modal-claim-dot"></span>
          <strong id="gw-modal-claim-status" style="color: #ffffff;">Waiting for winner to chat in live stream…</strong>
          <span class="gw-claim-countdown" id="gw-modal-claim-countdown">60s</span>
        </div>
        <div class="gw-claim-bar-bg">
          <div class="gw-claim-bar-fill" id="gw-modal-claim-fill"></div>
        </div>
        <p class="hint" style="margin-top: 6px; color: #94a3b8; font-size: 11.5px;">
          Ask the winner to send a message in chat. Their live responses appear in the isolated box below.
        </p>
      </div>

      <!-- Dedicated Winner Live Chat Feed -->
      <div class="gw-winner-chat-card">
        <div class="gw-winner-chat-head">
          <span>💬 Winner's Live Chat Log</span>
          <span class="gw-winner-chat-tag">⚡ Live Filtered</span>
        </div>
        <div class="gw-winner-chat-feed" id="gw-winner-chat-feed" aria-live="polite">
          <div class="gw-winner-chat-empty" id="gw-winner-chat-empty">
            Waiting for winner's messages in chat…
          </div>
        </div>
      </div>
    </div>

    <div class="gw-modal-footer">
      <button class="btn btn--sm btn--ghost" id="gw-modal-reroll" type="button">🎲 Re-roll</button>
      <button class="btn btn--sm btn--accent" id="gw-modal-copy" type="button">📋 Copy Winner Info</button>
      <button class="btn btn--sm btn--ghost" id="gw-modal-done" type="button">Done &amp; Close</button>
    </div>
  </div>
</div>
`;
}

export const giveawaysHtml = renderGiveawaysHtml();
