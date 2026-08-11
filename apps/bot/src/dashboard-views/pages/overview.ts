// overview dashboard page panels
export function overviewPanel(): string {
  return `
  <div class="qa" data-page="overview" aria-label="Quick actions">
    <a href="/bot/bots"><span class="t">Connect your bot</span><span class="d">Paste one code, done</span></a>
    <a href="/bot/offers"><span class="t">Add a casino offer</span><span class="d">Get a link you can share</span></a>
    <a href="/bot/broadcasts"><span class="t">Message your subscribers</span><span class="d">One message to everyone</span></a>
    <a href="/bot/commands"><span class="t">Change what your bot says</span><span class="d">Greeting and replies</span></a>
  </div>

  <p class="muted" id="ovScope">Metrics for all connected bots over the last 14 days. Times are local.</p>
  <!-- Overview stats -->
  <div class="kpis" data-page="overview">
    <div class="kpi" title="Total clicks on tracked offer links"><div class="lbl">Clicks · 14d</div><div class="stat" id="totClicks">–</div><div class="sub" id="clicksSub"></div></div>
    <div class="kpi" title="Unique users who clicked tracked offer links"><div class="lbl">Unique · 14d</div><div class="stat" id="totUnique">–</div><div class="sub" id="uniqueSub"></div></div>
    <div class="kpi" title="Users who started a conversation with any of your bots"><div class="lbl">Subscribers</div><div class="stat" id="totSubs">–</div><div class="sub" id="subsNew"></div></div>
    <div class="kpi" title="Offers currently marked active"><div class="lbl">Active offers</div><div class="stat" id="totOffers">–</div><div class="sub" id="offersSub"></div></div>
  </div>
  <div class="grid2 mb-lg" data-page="overview">
    <div class="panel"><div class="cardhd"><h2>Daily clicks</h2><span class="muted text-xs">14 days</span></div>
      <svg id="chart" role="img" aria-label="Daily clicks chart" width="100%" height="120" preserveAspectRatio="none"></svg>
      <div id="chartLabels" class="muted chart-axis"></div></div>
    <div class="panel"><div class="cardhd"><h2>Where subscribers came from</h2></div>
      <table><thead><tr><th>Source</th><th class="num">Subscribers</th></tr></thead>
      <tbody id="subSources"><tr><td colspan="2" class="muted">Loading…</td></tr></tbody></table>
      <p class="muted hint">Share <code id="deepLinkExample">t.me/&lt;yourbot&gt;?start=twitch</code> to tag a source. <b>direct</b> = no link.</p>
    </div>
  </div>

  <div class="grid2 mb-lg" data-page="overview">
    <div class="panel"><div class="cardhd"><h2>Your bots</h2><a href="/bot/bots">Manage →</a></div>
      <div id="ovBots" class="muted">Loading…</div></div>
    <div class="panel"><div class="cardhd"><h2>Top offers</h2><a href="/bot/offers">All offers →</a></div>
      <div id="ovOffers" class="muted">Loading…</div></div>
  </div>

  <div class="panel" data-page="overview"><div class="cardhd"><h2>Finish setup</h2></div>
    <div class="steps" id="ovSetup">
      <div class="step" id="stepBot"><div class="n">STEP 1</div><div class="t">Connect a bot</div><div class="d">Add your Telegram bot token in <a href="/bot/bots">Bots</a>.</div></div>
      <div class="step" id="stepOffer"><div class="n">STEP 2</div><div class="t">Create an offer</div><div class="d">Add a casino offer with a tracked link in <a href="/bot/offers">Offers</a>.</div></div>
      <div class="step" id="stepPb"><div class="n">STEP 3</div><div class="t">Track deposits</div><div class="d">See which clicks turn into deposits \u2014 set it up in <a href="/account/postbacks">Account → Postbacks</a>.</div></div>
    </div>
  </div>`;
}
