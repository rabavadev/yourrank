import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

// attribution page
export const attributionPage = leaderboardPageHtml({
  title: "Attribution · YourRank",
  canonical: "https://yourrank.site/dashboard/attribution",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to view attribution.</p>",
  scripts: ['<script src="/assets/attribution.js?v=1"></script>'],
  content: `<div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-100"></div><div class="skeleton skeleton-text--sm skel-w-160 mt-8"></div></div><div class="skeleton skeleton-text skel-w-100"></div></div>
<div class="card"><div class="skeleton skeleton-block skel-h-60"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-120"></div></div>
</div>
<div id="panel" hidden>
<div class="dash-head"><div><h1>Attribution</h1><p class="live-link">Track clicks, conversions, and revenue from your offers.</p></div><div class="range" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><select id="daysRange" class="select" style="padding:8px 10px;border-radius:6px;border:1px solid var(--line-2);background:var(--panel);color:var(--ink);font-size:13px;min-width:140px">
<option value="7">Last 7 days</option>
<option value="30" selected>Last 30 days</option>
<option value="90">Last 90 days</option>
</select><a href="/api/attribution/export" class="btn btn--sm btn--ghost" id="exportBtn">Export CSV</a></div></div>
<div class="postback-wrap" id="postbackCard" hidden style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px;border:1px solid var(--line-2);border-radius:10px;background:var(--panel-2);margin-top:18px">
<div class="postback-url" id="postbackUrl" style="font-family:var(--mono);font-size:13px;word-break:break-all;flex:1;color:var(--ink)"></div>
<button class="btn btn--sm" id="copyPostback" type="button">Copy</button>
<p class="hint" style="margin-top:8px;flex-basis:100%">Casinos send conversions with the key and HMAC signature in headers. Add <code>?click_ref=REF</code> to the offer link and pass the same ref in the signed postback query.</p>
</div>
<div class="postback-upgrade" id="postbackUpgrade" hidden style="padding:14px;border:1px solid var(--line-2);border-radius:10px;background:var(--panel-2);margin-top:18px;text-align:center">
<p class="card-sub">Postback tracking is included with Pro and Agency plans.</p>
<a href="/dashboard?nav=settings" class="btn btn--sm btn--accent">Upgrade to Pro</a>
</div>
<div class="stats" id="summary" style="margin-top:18px">
<div class="stat"><b id="s_clicks">–</b><span>clicks</span></div>
<div class="stat"><b id="s_unique">–</b><span>unique visitors</span></div>
<div class="stat"><b id="s_conversions">–</b><span>conversions</span></div>
<div class="stat"><b id="s_revenue">–</b><span>revenue</span></div>
<div class="stat"><b id="s_depositors">–</b><span>depositors</span></div>
</div>
<div class="card mt-18">
<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Offer</th><th>Casino</th><th class="ta-r">Clicks</th><th class="ta-r">Unique</th><th class="ta-r">Conversions</th><th class="ta-r">Revenue</th><th class="ta-r">Depositors</th></tr></thead><tbody id="offersBody"></tbody></table></div>
<div class="empty" id="offersEmpty" hidden>No offers or data yet.</div>
</div>
</div>`
});
