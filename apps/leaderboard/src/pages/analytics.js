import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

// analytics page
export const analyticsPage = leaderboardPageHtml({
  title: "Analytics · YourRank",
  canonical: "https://yourrank.site/dashboard/analytics",
  mainClass: "wrap an-wrap",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to view analytics.</p>",
  scripts: ['<script src="/assets/analytics.js?v=3"></script>'],
  content: `<div class="an-head"><div><div class="an-eyebrow" id="anEyebrow">your page</div><h1 class="an-title">Analytics</h1><p class="an-sub">How your page turns visits into engagement — last 30 days · <a id="liveLink" href="#" target="_blank">view page</a></p></div></div>

<div id="an" hidden>
<div class="an-hero">
<section class="an-card an-card--lg">
<div class="an-card-head"><div><h2 class="an-sec">Engagement funnel</h2><p class="an-note">Of everyone who lands, how many take action.</p></div><span class="an-lbl">30 days</span></div>
<div class="an-funnel">
<div class="an-fstage" data-tone="top"><div class="an-frow"><span class="an-fname">Page views</span><span class="an-fmeta"><span class="an-fval" id="fViews">–</span><span class="an-fpct">100%</span></span></div><div class="an-fbar"><span id="fViewsBar" style="width:100%"></span></div></div>
<div class="an-drop" id="dropCopies"></div>
<div class="an-fstage" data-tone="mid"><div class="an-frow"><span class="an-fname">Code copies</span><span class="an-fmeta"><span class="an-fval" id="fCopies">–</span><span class="an-fpct" id="fCopiesPct">–</span></span></div><div class="an-fbar"><span id="fCopiesBar" style="width:0"></span></div></div>
<div class="an-drop" id="dropClicks"></div>
<div class="an-fstage" data-tone="mid"><div class="an-frow"><span class="an-fname">Join clicks</span><span class="an-fmeta"><span class="an-fval" id="fClicks">–</span><span class="an-fpct" id="fClicksPct">–</span></span></div><div class="an-fbar"><span id="fClicksBar" style="width:0"></span></div></div>
<div class="an-drop" id="dropConversions"></div>
<div class="an-fstage" data-tone="win"><div class="an-frow"><span class="an-fname">Conversions</span><span class="an-fmeta"><span class="an-fval" id="fConversions">–</span><span class="an-fpct" id="fConversionsPct">–</span></span></div><div class="an-fbar"><span id="fConversionsBar" style="width:0"></span></div></div>
</div>
</section>
<section class="an-card an-card--lg">
<div class="an-metric-lead"><span class="an-lbl">Join clicks · 30d</span><div class="an-big num" id="pmBig">–</div><div id="pmDeltaRow" class="an-delta-row"></div></div>
<div class="an-spark" id="sparkWrap"></div>
<div class="an-metric-sub"><span>Page views · 30d</span><span class="num" id="pmViews30">–</span></div>
<div class="an-metric-sub"><span>Code copies · 30d</span><span class="num" id="pmCopies30">–</span></div>
<div class="an-metric-sub"><span>Views today</span><span class="num" id="pmViewsToday">–</span></div>
<div class="an-metric-sub"><span>Conversions · 30d</span><span class="num" id="pmConversions30">–</span></div>
<div class="an-metric-sub"><span>Revenue · 30d</span><span class="num" id="pmRevenue30">–</span></div>
</section>
</div>

<div class="an-row2">
<section class="an-card">
<div class="an-card-head"><div><h2 class="an-sec">Daily views</h2><p class="an-note">Last 14 days.</p></div><span class="an-legend"><i class="an-dotc"></i>Views</span></div>
<div class="an-trend" id="trendWrap"></div>
<p class="an-note an-empty-inline" id="trendEmpty" hidden>No views yet — share your page link to get it moving.</p>
</section>
<section class="an-card">
<div class="an-card-head"><div><h2 class="an-sec">Top referrers</h2><p class="an-note">Where visitors came from · 30d.</p></div></div>
<div class="an-src" id="refList"></div>
<p class="an-note an-empty-inline" id="refEmpty" hidden>No referrer data yet.</p>
</section>
</div>

<div class="an-row2">
<section class="an-card">
<div class="an-card-head"><div><h2 class="an-sec">Audience</h2><p class="an-note">New vs returning viewers · 30d.</p></div></div>
<div class="stat-tiles" style="margin:0">
<div class="stat-tile"><span class="stat-num" id="audNew">–</span><span class="stat-lbl">New</span></div>
<div class="stat-tile"><span class="stat-num" id="audReturning">–</span><span class="stat-lbl">Returning</span></div>
<div class="stat-tile"><span class="stat-num" id="audSessions">–</span><span class="stat-lbl">Sessions</span></div>
</div>
</section>
<section class="an-card">
<div class="an-card-head"><div><h2 class="an-sec">Scroll depth</h2><p class="an-note">How far people scroll · 30d.</p></div></div>
<div class="an-scroll" id="scrollWrap"></div>
<p class="an-note an-empty-inline" id="scrollEmpty" hidden>No scroll data yet.</p>
</section>
</div>

<section class="an-card">
<div class="an-card-head"><div><h2 class="an-sec">When your traffic shows up</h2><p class="an-note">Views by day × hour (UTC) · last 30 days.</p></div>
<button class="btn btn--sm" id="exportBtn" type="button">Export CSV</button></div>
<div class="an-heat-wrap" id="heatWrap"><div class="an-note">Loading…</div></div>
<div class="an-heat-foot">less<i style="background:var(--an-heat-0)"></i><i style="background:var(--an-heat-1)"></i><i style="background:var(--an-heat-2)"></i><i style="background:var(--accent)"></i>more</div>
<p class="status" id="exportStatus" role="status" aria-live="polite"></p>
</section>
</div>

<div id="empty" class="an-empty" hidden>
<div class="an-empty-hero">
<div class="an-empty-badge"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" stroke-width="1.6"><path d="M3 3v18h18"/><path d="M7 15l3.5-4 3 2.5L20 7"/></svg></div>
<h2>No views yet</h2>
<p>Your analytics fill in as soon as people visit your page. Share your link in your stream panels and Discord to get the funnel moving.</p>
<div class="an-empty-cta"><a class="btn btn--accent" id="emptyView" href="#" target="_blank">View my page</a><a class="btn" href="/dashboard">Back to dashboard</a></div>
</div>
<div class="an-empty-steps">
<div class="an-estep"><div class="an-en">STEP 1</div><div class="an-et">Share your link</div><div class="an-ed">Add your page URL to your Twitch/Kick panels and pinned chat.</div></div>
<div class="an-estep"><div class="an-en">STEP 2</div><div class="an-et">Viewers engage</div><div class="an-ed">Every view, code copy and Join click is tracked here automatically.</div></div>
<div class="an-estep"><div class="an-en">STEP 3</div><div class="an-et">Read the funnel</div><div class="an-ed">See where people drop off and double down on what converts.</div></div>
</div>
</div>

<div id="loading" class="an-load">
<div class="an-hero">
<section class="an-card an-card--lg"><div class="skeleton skeleton-text--sm skel-w-120 mb-18"></div><div class="skeleton skeleton-block skel-h-34 mb-10"></div><div class="skeleton skeleton-block skel-h-34 skel-w-60 mb-10"></div><div class="skeleton skeleton-block skel-h-34 skel-w-40"></div></section>
<section class="an-card an-card--lg"><div class="skeleton skeleton-text--sm skel-w-100 mb-18"></div><div class="skeleton skeleton-block skel-h-40 skel-w-40 mb-18"></div><div class="skeleton skeleton-block skel-h-40 mb-18"></div><div class="skeleton skeleton-text mb-10"></div><div class="skeleton skeleton-text skel-w-60"></div></section>
</div>
<div class="an-row2">
<section class="an-card"><div class="skeleton skeleton-text--sm skel-w-120 mb-18"></div><div class="skeleton skeleton-block skel-h-200"></div></section>
<section class="an-card"><div class="skeleton skeleton-text--sm skel-w-100 mb-18"></div><div class="skeleton skeleton-text mb-18"></div><div class="skeleton skeleton-text skel-w-60 mb-18"></div><div class="skeleton skeleton-text skel-w-40"></div></section>
</div>
</div>`
});
