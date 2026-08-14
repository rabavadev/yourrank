/**
 * Telegram Bot Creator Workspace Page Templates (V4 Premium Design)
 */

export function page(tab, title, sub, body) {
  return `<div class="v3-head"><h1>${title}</h1><p class="v3-head-sub">${sub}</p></div>${body}`;
}

export const overviewHtml = `
<div class="lb-bento tg-overview-grid" data-page="overview">
  <div class="lb-widget lb-widget--full" aria-label="Quick actions">
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Quick actions</h2>
        <p class="muted text-xs m-0 mt-4">Common Telegram bot workflows</p>
      </div>
      <span class="v3-chip v3-chip--fulfilled">● Operational</span>
    </div>
    <div class="d-flex flex-wrap gap-12">
      <a href="/dashboard/telegram/bots" class="bot-quick-action">
        <div class="bot-quick-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 15h6"/><path d="M12 6V4"/></svg>
        </div>
        <div class="bot-quick-text">
          <span class="font-600 text-sm">Connect your bot</span>
          <span class="muted text-xs">Link via @BotFather token</span>
        </div>
      </a>
      <a href="/dashboard/telegram/offers" class="bot-quick-action">
        <div class="bot-quick-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V3"/><path d="M8 3h8"/></svg>
        </div>
        <div class="bot-quick-text">
          <span class="font-600 text-sm">Add a casino offer</span>
          <span class="muted text-xs">Create tracked short link</span>
        </div>
      </a>
      <a href="/dashboard/telegram/broadcasts" class="bot-quick-action">
        <div class="bot-quick-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-5v12L3 13v-2z"/><circle cx="11" cy="11" r="2"/></svg>
        </div>
        <div class="bot-quick-text">
          <span class="font-600 text-sm">Broadcast announcement</span>
          <span class="muted text-xs">Direct message to subscribers</span>
        </div>
      </a>
      <a href="/dashboard/telegram/commands" class="bot-quick-action">
        <div class="bot-quick-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 21 17 3"/><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/></svg>
        </div>
        <div class="bot-quick-text">
          <span class="font-600 text-sm">Customize replies</span>
          <span class="muted text-xs">Welcome greeting & /commands</span>
        </div>
      </a>
    </div>
  </div>

  <div class="lb-widget lb-widget--full">
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Telegram performance</h2>
        <p class="muted text-xs m-0 mt-4" id="ovScope">Metrics for all connected bots over the last 14 days.</p>
      </div>
    </div>
    <div class="kpi-row">
      <div class="kpi-card" title="Total clicks on tracked offer links">
        <div class="kpi-lbl">Clicks · 14d</div>
        <div class="kpi-val" id="totClicks">–</div>
        <div class="kpi-sub" id="clicksSub">Tracked links</div>
      </div>
      <div class="kpi-card" title="Unique users who clicked tracked offer links">
        <div class="kpi-lbl">Unique clickers</div>
        <div class="kpi-val" id="totUnique">–</div>
        <div class="kpi-sub" id="uniqueSub">Distinct visitors</div>
      </div>
      <div class="kpi-card" title="Users who started a conversation with any of your bots">
        <div class="kpi-lbl">Subscribers</div>
        <div class="kpi-val" id="totSubs">–</div>
        <div class="kpi-sub" id="subsNew">Direct chat opt-ins</div>
      </div>
      <div class="kpi-card" title="Offers currently marked active">
        <div class="kpi-lbl">Active offers</div>
        <div class="kpi-val" id="totOffers">–</div>
        <div class="kpi-sub" id="offersSub">Live affiliate links</div>
      </div>
    </div>
  </div>

  <div class="lb-widget lb-widget--half">
    <div class="d-flex justify-between items-center mb-md">
      <h2 class="m-0 text-base font-600">Daily clicks</h2>
      <span class="muted text-xs">Last 14 days</span>
    </div>
    <div class="tg-chart-card">
      <svg id="chart" role="img" aria-label="Daily clicks chart" width="100%" height="120" preserveAspectRatio="none"></svg>
      <div id="chartLabels" class="muted d-flex justify-between text-xs mt-sm"></div>
    </div>
  </div>
  
  <div class="lb-widget lb-widget--half">
    <div class="d-flex justify-between items-center mb-md">
      <h2 class="m-0 text-base font-600">Subscriber sources</h2>
      <span class="muted text-xs">Origin attribution</span>
    </div>
    <div class="v3-table-scroll">
      <table class="v3-table">
        <thead><tr><th>Source</th><th class="ta-r">Subscribers</th></tr></thead>
        <tbody id="subSources"><tr><td colspan="2" class="muted">Loading sources…</td></tr></tbody>
      </table>
    </div>
    <p class="muted hint text-xs mt-sm">Tag sources using deep links: <code id="deepLinkExample">t.me/&lt;bot&gt;?start=twitch</code></p>
  </div>

  <div class="lb-widget lb-widget--half">
    <div class="d-flex justify-between items-center mb-md">
      <h2 class="m-0 text-base font-600">Connected bots</h2>
      <a href="/dashboard/telegram/bots" class="btn btn--xs btn--ghost">Manage bots →</a>
    </div>
    <div id="ovBots" class="muted">Loading bots…</div>
  </div>
  
  <div class="lb-widget lb-widget--half">
    <div class="d-flex justify-between items-center mb-md">
      <h2 class="m-0 text-base font-600">Top casino offers</h2>
      <a href="/dashboard/telegram/offers" class="btn btn--xs btn--ghost">All offers →</a>
    </div>
    <div id="ovOffers" class="muted">Loading offers…</div>
  </div>
</div>
`;

export const botsHtml = `
<div class="lb-bento tg-bento-wrap" data-page="bots">
  <!-- Connected Bots Section (shown only when bots exist) -->
  <div class="lb-widget lb-widget--full" id="connectedBotsWidget" hidden>
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Active bots</h2>
        <p class="muted text-xs m-0 mt-4">Bots running and responding to community chat</p>
      </div>
      <div id="botPlanState" class="v3-chip v3-chip--fulfilled">0 / 1 Bots connected</div>
    </div>
    
    <div id="botList" class="tg-bot-list"></div>
  </div>

  <!-- Connection Card -->
  <div class="lb-widget lb-widget--full tg-wizard-widget" id="connectWizardWidget">
    <div class="d-flex justify-between items-center mb-lg">
      <div class="d-flex items-center gap-12">
        <div class="tg-logo-badge">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
        </div>
        <div>
          <h2 class="m-0 text-base font-600" id="wizardTitle">Connect a Telegram bot</h2>
          <p class="muted text-xs m-0 mt-2" id="wizardSub">Automate chat replies, send stream live alerts, and share sponsor deals</p>
        </div>
      </div>
      <span class="v3-chip v3-chip--pro">⚡ 30-Second Setup</span>
    </div>

    <!-- Stepper Progress Bar -->
    <div class="tg-stepper mb-lg">
      <div class="tg-stepper-item is-active" data-step-indicator="1">
        <div class="tg-stepper-num">1</div>
        <div class="tg-stepper-text">
          <div class="tg-stepper-title">Open @BotFather</div>
          <div class="tg-stepper-sub">Get bot token</div>
        </div>
      </div>
      <div class="tg-stepper-line" aria-hidden="true"></div>
      <div class="tg-stepper-item is-active" data-step-indicator="2">
        <div class="tg-stepper-num">2</div>
        <div class="tg-stepper-text">
          <div class="tg-stepper-title">Paste &amp; Connect</div>
          <div class="tg-stepper-sub">Secure connection</div>
        </div>
      </div>
      <div class="tg-stepper-line" aria-hidden="true"></div>
      <div class="tg-stepper-item" data-step-indicator="3">
        <div class="tg-stepper-num">3</div>
        <div class="tg-stepper-text">
          <div class="tg-stepper-title">Live &amp; Active</div>
          <div class="tg-stepper-sub">Ready for chat</div>
        </div>
      </div>
    </div>

    <div class="wizard" id="connectWizard">
      <!-- Direct Unified Setup Step -->
      <div class="wizard-step" data-step="1">
        <div class="tg-connect-grid">
          <!-- Left: Direct Token Input Form -->
          <div class="tg-connect-form">
            <div class="tg-field">
              <label for="botToken">Telegram Bot API Token <span class="text-danger">*</span></label>
              <div class="d-flex gap-8 mt-4">
                <input class="v3-input mono grow" id="botToken" type="password" autocomplete="off" placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ">
                <button class="btn btn--ghost" data-action="toggleToken" type="button" aria-label="Show token">Show</button>
                <button class="btn btn--ghost" data-action="pasteToken" type="button" aria-label="Paste token">Paste</button>
              </div>
              <span class="muted hint text-xs mt-4 d-block">🔒 Tokens are encrypted securely. Only the last 4 characters are ever displayed.</span>
            </div>

            <div class="tg-field mt-md">
              <label for="botWelcome">Custom Welcome Message <span class="muted font-normal">(Optional)</span></label>
              <textarea class="v3-input mt-4" id="botWelcome" rows="3" placeholder="👋 Welcome! Type /leaderboard to check live rankings or /offers for bonuses." style="min-height: 80px;"></textarea>
            </div>

            <div class="tg-connect-actions mt-lg">
              <button class="btn btn--accent" data-action="connectBot" type="button">⚡ Connect &amp; Activate Bot</button>
              <a href="https://t.me/BotFather" target="_blank" rel="noopener" class="btn btn--ghost tg-btn-telegram">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                Open @BotFather in Telegram ↗
              </a>
            </div>
          </div>

          <!-- Right: How to Get Token Quick Guide -->
          <div class="tg-guide-panel">
            <div class="tg-guide-head">
              <span class="tg-guide-badge">QUICK GUIDE</span>
              <h4 class="m-0 text-sm font-600">How to get your Bot Token</h4>
            </div>
            <ol class="tg-guide-steps">
              <li>
                <span class="tg-guide-num">1</span>
                <div>Open <a href="https://t.me/BotFather" target="_blank" rel="noopener"><b>@BotFather</b> ↗</a> in Telegram and send <code>/newbot</code>.</div>
              </li>
              <li>
                <span class="tg-guide-num">2</span>
                <div>Choose a display name and a username ending in <code>_bot</code>.</div>
              </li>
              <li>
                <span class="tg-guide-num">3</span>
                <div>Copy the <b>HTTP API Token</b> and paste it into the field on the left.</div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Step 3 / Verification Progress -->
      <div class="wizard-step" data-step="3" hidden>
        <div class="tg-loading-card">
          <div class="ui-loading__spinner"></div>
          <div>
            <h3 class="m-0 text-base font-600">Connecting &amp; verifying bot…</h3>
            <p class="muted text-sm m-0 mt-4" id="connectStatus">Checking token validity and registering bot with Telegram…</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Test Message Card -->
  <div class="lb-widget lb-widget--full" id="testMsgPanel" hidden>
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Send test message</h2>
        <p class="muted text-xs m-0 mt-4">Verify that <b id="tmBotName">your bot</b> can dispatch messages directly to Telegram</p>
      </div>
    </div>
    <div class="tg-form-grid-2 mb-md">
      <div class="tg-field">
        <label for="tmChatId">Your Telegram Chat ID</label>
        <input class="v3-input" id="tmChatId" inputmode="numeric" placeholder="e.g. 123456789">
        <span class="muted hint text-xs mt-2 d-block">Find your Chat ID by sending /start to <a href="https://t.me/userinfobot" target="_blank" rel="noopener">@userinfobot</a></span>
      </div>
      <div class="tg-field">
        <label for="tmText">Test Message Body</label>
        <input class="v3-input" id="tmText" placeholder="⚡ Test notification from YourRank">
      </div>
    </div>
    <div class="d-flex gap-8">
      <button class="btn btn--accent" data-action="sendTestMessage" type="button">Send test message</button>
      <button class="btn btn--ghost" data-action="cancelTestMessage" type="button">Cancel</button>
    </div>
  </div>
</div>
`;

export const commandsHtml = `
<div class="lb-bento" data-page="commands">
  <div class="lb-widget lb-widget--full" id="customizePanel">
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Welcome greeting &amp; commands</h2>
        <p class="muted text-xs m-0 mt-4">Configure what your Telegram bot responds with when subscribers message it</p>
      </div>
      <p class="muted text-xs m-0 font-600" id="selectedBotName">Active bot</p>
    </div>
    
    <div class="tg-field mb-lg">
      <label for="botSelect">Select Bot to Customize</label>
      <select id="botSelect" class="v3-input"><option value="">Loading bots…</option></select>
    </div>
    
    <div id="custDisabledNote" class="v3-note hidden mb-md">This bot is disconnected — reconnect it to customize.</div>
    
    <div class="tg-card mb-xl">
      <div class="tg-field">
        <label for="welcomeMsg">Default Welcome Message (Sent when a subscriber types /start)</label>
        <textarea id="welcomeMsg" class="v3-input w-full" rows="3" placeholder="👋 Welcome! Check out our live standings and active casino offers below."></textarea>
      </div>
      <div>
        <button class="btn btn--sm btn--accent" data-action="saveWelcome" type="button">Save welcome message</button>
      </div>
    </div>

    <div class="mb-md">
      <h2 class="m-0 text-base font-600">Custom slash commands</h2>
      <p class="muted text-xs m-0 mt-4">Add custom triggers (e.g. <code>/vip</code>, <code>/discord</code>, <code>/bonus</code>) and replies subscribers receive.</p>
    </div>
    
    <div class="tg-card mb-lg">
      <div class="tg-form-grid-3">
        <div class="tg-field">
          <label for="cmdName">Command Trigger</label>
          <input class="v3-input" id="cmdName" placeholder="vip (without /)">
        </div>
        <div class="tg-field">
          <label for="cmdResp">Reply Text</label>
          <input class="v3-input" id="cmdResp" placeholder="Reply text subscribers receive">
        </div>
      </div>
      <div class="tg-form-grid-3 mt-sm">
        <div class="tg-field">
          <label for="cmdBtnLabel">Inline Button Label (Optional)</label>
          <input class="v3-input" id="cmdBtnLabel" placeholder="Join VIP Club">
        </div>
        <div class="tg-field">
          <label for="cmdBtnUrl">Button URL (Optional)</label>
          <div class="d-flex gap-8">
            <input class="v3-input command-button-url grow" id="cmdBtnUrl" type="url" placeholder="https://example.com/vip">
            <button class="btn btn--accent" data-action="addCommand" type="button">Add command</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-lg">
      <h3 class="text-sm font-600 mb-sm">Active commands</h3>
      <div id="cmdList" class="tg-command-list"></div>
    </div>
  </div>
</div>
`;

export const offersHtml = `
<div class="lb-bento" data-page="offers">
  <div class="lb-widget lb-widget--full">
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Tracked casino offers</h2>
        <p class="muted text-xs m-0 mt-4">Track clicks, unique visits, and conversions from your Telegram subscribers</p>
      </div>
      <div id="offerPlanState" class="v3-chip v3-chip--fulfilled">Live Tracking Active</div>
    </div>
    
    <div class="v3-table-scroll">
      <table class="v3-table">
        <thead><tr><th>Offer &amp; Casino</th><th>Short Link</th><th class="ta-r">Clicks</th><th class="ta-r">Unique</th><th>Status</th><th class="ta-r">Actions</th></tr></thead>
        <tbody id="offers"><tr><td colspan="6" class="muted">Loading offers…</td></tr></tbody>
      </table>
    </div>
  </div>

  <div class="lb-widget lb-widget--full">
    <div class="mb-md">
      <h2 class="m-0 text-base font-600">Create new offer</h2>
      <p class="muted text-xs m-0 mt-4">Add an affiliate offer. YourRank generates a high-speed tracked short link you can share.</p>
    </div>
    
    <div class="tg-card offer-create-form" id="offerCreateForm">
      <div class="tg-form-grid-2">
        <div class="tg-field">
          <label for="oCasino">Casino / Sponsor <span class="text-danger">*</span></label>
          <input class="v3-input" id="oCasino" placeholder="e.g. Stake, Roobet">
        </div>
        <div class="tg-field">
          <label for="oLabel">Offer Label <span class="text-danger">*</span></label>
          <input class="v3-input" id="oLabel" placeholder="e.g. 200% Welcome Bonus + 50 Free Spins">
        </div>
      </div>
      
      <div class="tg-field">
        <label for="oUrl">Affiliate Target URL <span class="text-danger">*</span></label>
        <input class="v3-input mono" id="oUrl" type="url" inputmode="url" placeholder="https://casino.com/?c=yourcode">
      </div>
      
      <div class="tg-form-grid-2">
        <div class="tg-field">
          <label for="oCode">Promo Code (Optional)</label>
          <input class="v3-input" id="oCode" placeholder="YOURRANK">
        </div>
        <div class="tg-field">
          <label for="oBonus">Bonus Details (Optional)</label>
          <input class="v3-input" id="oBonus" placeholder="Wager 35x · Min dep $20">
        </div>
      </div>
      <div>
        <button class="btn btn--accent" data-action="createOffer" type="button">Create Tracked Offer</button>
      </div>
    </div>
  </div>
</div>
`;

export const broadcastsHtml = `
<div class="lb-bento" data-page="broadcasts">
  <div class="lb-widget lb-widget--full">
    <div class="d-flex justify-between items-center mb-md">
      <div>
        <h2 class="m-0 text-base font-600">Broadcast to subscribers</h2>
        <p class="muted text-xs m-0 mt-4">Send an instant notification or stream update to everyone who started your bot</p>
      </div>
      <div id="bcPlanState" class="v3-chip v3-chip--fulfilled">Broadcasts Ready</div>
    </div>
    
    <div id="bcComposer" class="d-flex flex-col gap-20 mt-md">
      <div class="tg-card">
        <div class="mb-xs">
          <h3 class="m-0 text-sm font-600">1. Message Body</h3>
        </div>
        <div class="tg-field">
          <textarea class="v3-input" id="bcBody" rows="4" placeholder="🔴 LIVE NOW! Huge giveaway on stream today. Join chat: https://kick.com/yourchannel&#10;&#10;Use {name} to include subscriber name."></textarea>
        </div>
        <div class="tg-field">
          <label for="bcImage">Attached Image URL (Optional)</label>
          <input class="v3-input mono" id="bcImage" type="url" placeholder="https://example.com/stream-banner.png" />
        </div>
      </div>

      <div class="tg-card">
        <div class="mb-xs">
          <h3 class="m-0 text-sm font-600">2. Select Bot Sender</h3>
        </div>
        <div class="tg-field">
          <select class="v3-input" id="bcBotSelect"><option value="">Loading bots…</option></select>
        </div>
      </div>

      <div class="tg-card">
        <div class="mb-xs">
          <h3 class="m-0 text-sm font-600">3. Send Announcement</h3>
        </div>
        <div>
          <button class="btn btn--accent" data-action="sendBroadcast" type="button">Send Broadcast Now</button>
        </div>
      </div>
    </div>
  </div>

  <div class="lb-widget lb-widget--full">
    <div class="mb-md">
      <h2 class="m-0 text-base font-600">Broadcast history</h2>
      <p class="muted text-xs m-0 mt-4">Past announcements sent through your bots</p>
    </div>
    <div id="bcHistory" class="muted">Loading broadcast history…</div>
  </div>
</div>
`;

export const telegramOverviewPage = page("tg_overview", "Telegram bot overview", "Your bot at a glance — last 14 days.", overviewHtml);
export const telegramBotsPage = page("tg_bots", "Telegram bots", "Connect and customize your Telegram bots.", botsHtml);
export const telegramCommandsPage = page("tg_commands", "Commands & replies", "Replies your bot sends when viewers type /command.", commandsHtml);
export const telegramOffersPage = page("tg_offers", "Tracked offers", "Your casino partner links with automatic click tracking.", offersHtml);
export const telegramBroadcastsPage = page("tg_broadcasts", "Broadcast messages", "Send a direct message or announcement to your subscribers.", broadcastsHtml);
