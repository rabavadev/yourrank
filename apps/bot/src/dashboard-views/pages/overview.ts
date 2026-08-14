// overview dashboard page panels
export function overviewPanel(): string {
  return `
  <div class="lb-bento" data-page="overview">
    <div class="lb-widget lb-widget--full" aria-label="Quick actions">
      <div class="d-flex flex-wrap gap-12">
        <a href="/bot/bots" class="btn btn--ghost d-flex flex-col items-start gap-4 bot-quick-action"><span class="font-600 text-sm">Connect your bot</span><span class="muted text-xs">Paste one code, done</span></a>
        <a href="/bot/offers" class="btn btn--ghost d-flex flex-col items-start gap-4 bot-quick-action"><span class="font-600 text-sm">Add a casino offer</span><span class="muted text-xs">Get a link you can share</span></a>
        <a href="/bot/broadcasts" class="btn btn--ghost d-flex flex-col items-start gap-4 bot-quick-action"><span class="font-600 text-sm">Message your subscribers</span><span class="muted text-xs">One message to everyone</span></a>
        <a href="/bot/commands" class="btn btn--ghost d-flex flex-col items-start gap-4 bot-quick-action"><span class="font-600 text-sm">Change what your bot says</span><span class="muted text-xs">Greeting and replies</span></a>
      </div>
    </div>

    <!-- Overview stats -->
    <div class="lb-widget lb-widget--full">
      <p class="muted text-xs mb-lg" id="ovScope">Metrics for all connected bots over the last 14 days. Times are local.</p>
      <div class="kpi-row">
        <div class="kpi-card" title="Total clicks on tracked offer links"><div class="kpi-lbl">Clicks · 14d</div><div class="kpi-val" id="totClicks">–</div><div class="kpi-sub" id="clicksSub"></div></div>
        <div class="kpi-card" title="Unique users who clicked tracked offer links"><div class="kpi-lbl">Unique · 14d</div><div class="kpi-val" id="totUnique">–</div><div class="kpi-sub" id="uniqueSub"></div></div>
        <div class="kpi-card" title="Users who started a conversation with any of your bots"><div class="kpi-lbl">Subscribers</div><div class="kpi-val" id="totSubs">–</div><div class="kpi-sub" id="subsNew"></div></div>
        <div class="kpi-card" title="Offers currently marked active"><div class="kpi-lbl">Active offers</div><div class="kpi-val" id="totOffers">–</div><div class="kpi-sub" id="offersSub"></div></div>
      </div>
    </div>

    <div class="lb-widget lb-widget--half">
      <div class="d-flex justify-between items-center mb-md"><h2>Daily clicks</h2><span class="muted text-xs">14 days</span></div>
      <svg id="chart" role="img" aria-label="Daily clicks chart" width="100%" height="120" preserveAspectRatio="none"></svg>
      <div id="chartLabels" class="muted d-flex justify-between text-xs mt-sm"></div>
    </div>
    
    <div class="lb-widget lb-widget--half">
      <div class="mb-md"><h2>Where subscribers came from</h2></div>
      <table class="v3-table"><thead><tr><th>Source</th><th class="num">Subscribers</th></tr></thead>
      <tbody id="subSources"><tr><td colspan="2" class="muted">Loading…</td></tr></tbody></table>
      <p class="muted hint mt-sm">Share <code id="deepLinkExample">t.me/&lt;yourbot&gt;?start=twitch</code> to tag a source. <b>direct</b> = no link.</p>
    </div>

    <div class="lb-widget lb-widget--half">
      <div class="d-flex justify-between items-center mb-md"><h2>Your bots</h2><a href="/bot/bots" class="text-xs">Manage →</a></div>
      <div id="ovBots" class="muted">Loading…</div>
    </div>
    
    <div class="lb-widget lb-widget--half">
      <div class="d-flex justify-between items-center mb-md"><h2>Top offers</h2><a href="/bot/offers" class="text-xs">All offers →</a></div>
      <div id="ovOffers" class="muted">Loading…</div>
    </div>

    <div class="lb-widget lb-widget--full">
      <div class="mb-md"><h2>Finish setup</h2></div>
      <div class="d-flex gap-16 flex-wrap" id="ovSetup">
        <div class="step p-16 flex-1 bg-panel border radius-md" id="stepBot"><div class="text-xs muted font-mono mb-sm">STEP 1</div><div class="font-600 mb-sm text-sm">Connect a bot</div><div class="text-xs muted">Add your Telegram bot token in <a href="/bot/bots">Bots</a>.</div></div>
        <div class="step p-16 flex-1 bg-panel border radius-md" id="stepOffer"><div class="text-xs muted font-mono mb-sm">STEP 2</div><div class="font-600 mb-sm text-sm">Create an offer</div><div class="text-xs muted">Add a casino offer with a tracked link in <a href="/bot/offers">Offers</a>.</div></div>
        <div class="step p-16 flex-1 bg-panel border radius-md" id="stepPb"><div class="text-xs muted font-mono mb-sm">STEP 3</div><div class="font-600 mb-sm text-sm">Track deposits</div><div class="text-xs muted">See which clicks turn into deposits \u2014 set it up in <a href="/dashboard/settings/connections">Settings → Integrations</a>.</div></div>
      </div>
    </div>
  </div>`;
}
