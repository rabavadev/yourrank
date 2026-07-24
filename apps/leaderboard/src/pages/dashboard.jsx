/** @jsxImportSource hono/jsx */
export const dashboardConfig = {
  title: "Dashboard · YourRank",
  canonical: "https://yourrank.site/dashboard",
  scripts: ['<script src="/assets/dashboard.js?v=4" type="module"></script>'],
};

export function DashboardContent() {
  return (
    <>
      <div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-180"></div><div class="skeleton skeleton-text--sm skel-w-260 mt-8"></div></div><div class="skeleton skeleton-text skel-w-90"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-200"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-300"></div></div>
</div>
<div id="dash" hidden>
<div class="toast" id="status" role="status" aria-live="polite"></div>
<div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="Dashboard sections" role="dialog" aria-modal="false">
<div class="lb-side-head">
<div class="lb-side-board">
<span class="label" id="activeBoardLabel">Active board</span>
<div class="lb-active-name" id="activeBoardName">…</div>
<div class="lb-active-meta" id="activeBoardMeta"></div>
<label class="lb-board-pub hint chk"><input type="checkbox" id="pubToggle" checked /> Published</label>
<div class="lb-board-row">
<select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch board"></select>
<button class="btn btn--sm lb-board-new" id="newBoard" type="button" title="New board" aria-label="New board">+</button>
</div>
<button class="lb-linkbtn lb-board-manage" id="manageBoardsBtn" type="button">Manage boards</button>
<div class="board-upsell" id="boardLimitUpsell" role="status" hidden>
<div><b id="boardLimitTitle">Need another leaderboard?</b><p class="hint" id="boardLimitText"></p></div>
<a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/billing">Upgrade plan</a>
</div>
<div class="lb-board-form" id="newBoardForm" hidden>
<div class="field field-flex"><label for="nb_name">Board name</label><input id="nb_name" placeholder="Stake July 2026" /></div>
<div class="field field-flex"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="stake-july-2026" /></div>
<div class="field field-flex"><label for="nb_casino">Casino</label><input id="nb_casino" placeholder="e.g. Stake" required /></div>
<div class="field field-flex"><label for="nb_code">Referral code</label><input id="nb_code" placeholder="BTZ" /></div>
<div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div>
</div>
</div>
</div>
<button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
<span class="lb-side-grp">Board</span>
<button class="lb-nav is-on" type="button" data-nav="board" aria-current="page"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>Editor</button>
<button class="lb-nav" type="button" data-nav="overview"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg></span>Overview</button>
<button class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg></span>Boards</button>
<span class="lb-side-grp">Automate</span>
<a class="lb-nav lb-nav--link" href="/dashboard/attribution"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></span>Postbacks</a>
<button class="lb-nav" type="button" data-nav="integrations"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6"/><path d="M12 2v8"/><path d="m8 6 4 4 4-4"/><path d="M2 12h5"/><path d="M17 12h5"/></svg></span>Integrations</button>
<span class="lb-side-grp">Grow</span>
<button class="lb-nav" type="button" data-nav="growth"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></span>Analytics</button>
<button class="lb-nav" type="button" data-nav="referrals"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="7" rx="1"/><path d="M12 22V7"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M7.5 7a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg></span>Referrals</button>
<span class="lb-side-grp">Plan</span>
<button class="lb-nav" type="button" data-nav="manage"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg></span>Plan &amp; billing</button>
<div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live board ↗</a><span class="label" id="planBadge">FREE PLAN</span></div>
</aside>
<div class="lb-main">

<section class="lb-page" data-page="overview">
<div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button><div class="lb-phead-text"><h1 tabindex="-1">Overview</h1><p class="lb-psub">Your leaderboard at a glance</p></div><div class="lb-phead-actions"><button class="btn btn--sm" id="overviewCopyLink" type="button">Copy link</button></div></div>
<div class="card card--danger" id="draftBanner" hidden><h2>Pick up where you left off</h2><p class="card-sub">You started the setup wizard for <b id="draftName">this board</b> but didn't finish. Jump back into the guided flow, or switch to editing it here.</p><div class="d-flex gap-10 flex-wrap"><a class="btn btn--sm btn--accent" id="draftResume" href="/dashboard/setup">Resume wizard →</a><button class="btn btn--sm btn--ghost" id="draftDone" type="button">Edit here instead</button></div></div>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="ov_board">–</span><span class="stat-lbl">Board</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_prize">–</span><span class="stat-lbl">Prize pool</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_players">–</span><span class="stat-lbl">Players</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_resets">–</span><span class="stat-lbl">Resets in</span></div>
</div>
<div class="lb-qa" aria-label="Quick actions" id="ovQuickActions">
<button type="button" data-jump="board"><span class="lb-qa-t">Add players</span><span class="lb-qa-d">Type them in or paste from a spreadsheet</span></button>
<button type="button" data-jump="board"><span class="lb-qa-t">Set the prize</span><span class="lb-qa-d">Prize pool, casino and your code</span></button>
<button type="button" data-jump="board"><span class="lb-qa-t">Pick a design</span><span class="lb-qa-d">One click publishes it</span></button>
<button type="button" id="ov_copyLink"><span class="lb-qa-t">Copy your page link</span><span class="lb-qa-d">Share it anywhere</span></button>
<a class="lb-qa" href="/demo" target="_blank" rel="noopener noreferrer"><span class="lb-qa-t">View demo</span><span class="lb-qa-d">See a live example board</span></a>
</div>
<div class="card" id="ovTelegramCard"><h2>Your leaderboard works without Telegram</h2><p class="card-sub">The web page is the core channel. A Telegram bot is optional and just gives viewers another way to interact.</p><div class="d-flex gap-10 flex-wrap"><a class="btn btn--sm btn--accent" href="/dashboard/bot/setup">Connect a bot (optional)</a><a class="btn btn--sm btn--ghost" href="/demo" target="_blank" rel="noopener noreferrer">View demo</a></div></div>
<div class="card"><div class="lb-cardhd"><h2>Daily activity · 14 days</h2><a href="/dashboard/analytics" class="lb-cardlink">Full analytics →</a></div><div class="stat-chart"><div class="stat-bars" id="ov_bars" title="Daily activity, last 14 days"></div><div class="stat-chart-lbl"><span id="ov_barsFrom"></span><span>today</span></div></div><p class="hint" id="ov_barsEmpty" hidden>No activity yet — share your page link to get it moving.</p><div class="stat-legend"><span class="stat-legend-item views">Views</span><span class="stat-legend-item copies">Copies</span><span class="stat-legend-item clicks">Clicks</span></div></div>
<div class="card"><div class="lb-cardhd"><h2>Top players</h2><button class="lb-cardlink" type="button" data-jump="board">Manage all →</button></div><div class="lb-toplist" id="ov_top"></div><div class="empty" id="ov_topEmpty" hidden>No players yet. <button class="lb-linkbtn" type="button" data-jump="board">Add your first one →</button></div></div>
<div class="card" id="ovSetupSteps"><h2>Finish setup</h2><p class="card-sub">A few steps to a page worth sharing.</p><div class="lb-steps" id="ov_steps">
<div class="lb-step" id="ov_step_brand"><span class="lb-step-n">Step 1</span><span class="lb-step-t">Brand &amp; prize</span><span class="lb-step-d">Set your name, code and prize in <button class="lb-linkbtn" type="button" data-jump="board">Prize &amp; players</button>.</span></div>
<div class="lb-step" id="ov_step_players"><span class="lb-step-n">Step 2</span><span class="lb-step-t">Add players</span><span class="lb-step-d">Add or import your ranked list.</span></div>
<div class="lb-step" id="ov_step_bot"><span class="lb-step-n">Step 3</span><span class="lb-step-t">Connect the bot <span class="pill pill--muted">Optional</span></span><span class="lb-step-d"><a class="lb-linkbtn" href="/dashboard/bot/setup">Connect your Telegram bot</a> so viewers can subscribe and get alerts.</span></div>
<div class="lb-step" id="ov_step_share"><span class="lb-step-n">Step 4</span><span class="lb-step-t">Share your leaderboard link</span><span class="lb-step-d">Publish your page, then drop your URL in stream panels and Discord.</span></div>
<div class="lb-step" id="ov_step_postback"><span class="lb-step-n">Step 5</span><span class="lb-step-t">Add postback tracking</span><span class="lb-step-d"><a class="lb-linkbtn" href="/dashboard/attribution">Set up casino postbacks</a> to see which viewers convert into depositors.</span></div>
</div></div>

</section>
<section class="lb-page" data-page="boards">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Boards</h1><p class="lb-psub">All your sponsor leaderboards</p></div><button class="btn btn--sm" id="addBoardFromBoards" type="button">+ New board</button></div>
<div class="card">
<div class="board-table-wrap">
<table class="board-table">
<thead><tr><th>Board</th><th>Sponsor</th><th>URL</th><th>Players</th><th>Template</th><th>Status</th><th class="ta-r">Actions</th></tr></thead>
<tbody id="boardsBody"></tbody>
</table>
</div>
<div id="boardsEmpty" class="empty" hidden>No boards yet. Create one to get started.</div>
</div>
</section>
<section class="lb-page" data-page="growth">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Analytics</h1><p class="lb-psub">How your page is performing</p></div></div>
<div class="card"><p class="card-sub">Last 30 days on your page. Views count every visit; copies and clicks are people grabbing your code or hitting Join.</p>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="st_views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_views30">–</span><span class="stat-lbl">Views · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_copies30">–</span><span class="stat-lbl">Code copies · 30d</span></div>
<div class="stat-tile"><span class="stat-num" id="st_clicks30">–</span><span class="stat-lbl">Join clicks · 30d</span></div></div>
<div class="stat-chart"><div class="stat-bars" id="statBars" title="Daily views, last 14 days"></div><div class="stat-chart-lbl"><span id="statFrom"></span><span>Daily views, last 14 days</span><span>today</span></div></div>
<p class="hint" id="statsEmpty" hidden>No views yet — share your page link in your stream panels and Discord to get it moving.</p></div>
<div class="card"><h2>Embed widget</h2><p class="card-sub">Copy this one-line iframe into your site, OBS browser source, or any stream panel. It auto-refreshes every 60 seconds.</p>
<div class="field"><textarea id="embedCode" rows="3" readonly style="font-family:var(--mono);font-size:13px"></textarea></div>
<div class="d-flex gap-8"><button class="btn btn--sm" id="copyEmbed" type="button">Copy code</button><a class="btn btn--sm btn--ghost" id="embedPreview" href="#" target="_blank" rel="noopener noreferrer">Preview</a></div></div>
</section>
<section class="lb-page" data-page="referrals">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Referrals</h1><p class="lb-psub">Invite other streamers, earn free Pro time</p></div></div>
<div class="card" id="refCard">
<h2>Your referral link</h2>
<p class="card-sub">Share this link. Every new user who signs up through it adds 31 days of Pro to your account.</p>
<div class="d-flex gap-8 flex-wrap items-center" style="margin-top:12px"><input id="refLink" class="field" readonly style="flex:1;min-width:220px" value="…" /><button class="btn btn--accent" id="refCopy" type="button">Copy link</button></div>
<div class="stat-tiles" style="margin-top:18px">
<div class="stat-tile"><span class="stat-num" id="refCount">–</span><span class="stat-lbl">People signed up</span></div>
<div class="stat-tile"><span class="stat-num" id="refDays">–</span><span class="stat-lbl">Free days earned</span></div>
<div class="stat-tile"><span class="stat-num" id="refSaved">–</span><span class="stat-lbl">Value earned ($)</span></div>
</div>
<p class="status" id="refStatus" role="status" aria-live="polite"></p>
</div>
</section>
<section class="lb-page is-on" data-page="board">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div class="lb-phead-text"><h1 tabindex="-1">Editor</h1><p class="lb-psub">Edit your board and watch it update live</p></div><div class="lb-phead-actions"><button class="btn btn--sm" id="editorCopyLink" type="button">Copy link</button><a class="btn btn--sm btn--accent" id="editorLiveLink" href="#" target="_blank" rel="noopener noreferrer">View live ↗</a></div></div>
<div class="streamer-hud card" style="margin-bottom:18px;display:flex;gap:12px;align-items:center;padding:12px;flex-wrap:wrap">
  <form id="hudQuickAdd" style="display:flex;gap:8px;flex:1;min-width:300px;align-items:center">
    <b style="font-size:13px;white-space:nowrap;margin-right:4px;display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>Quick Add</b>
    <input id="hudName" class="field" style="flex:2;margin:0" placeholder="Player name (e.g. Steve)" required />
    <input id="hudAmount" class="field" style="flex:1;margin:0" type="text" inputmode="decimal" placeholder="+$500" required />
    <button type="submit" class="btn btn--sm btn--accent" id="hudAddBtn">Update</button>
  </form>
  <button class="btn btn--sm ic-btn" id="hudCopyObs" type="button" style="white-space:nowrap;border-color:var(--accent);color:var(--accent)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy OBS Link</button>
</div>
<div class="editor-tabs" id="editorTabs" role="tablist" aria-label="Editor sections">
<button class="editor-tab is-active" type="button" role="tab" aria-selected="true" data-egroup="data">General &amp; data</button>
<button class="editor-tab" type="button" role="tab" aria-selected="false" data-egroup="appearance">Appearance</button>
<button class="editor-tab" type="button" role="tab" aria-selected="false" data-egroup="share">Embed &amp; share</button>
</div>
<div class="design-grid">
<div class="design-controls">
<div class="card" data-egroup="data"><h2>Brand &amp; prize</h2><p class="card-sub">The headline details on your page.</p><div class="grid2">
<div class="field"><label for="f_name">Display name</label><input id="f_name" /></div>
<div class="field"><label for="f_tagline">Tagline</label><input id="f_tagline" placeholder="Casino streamer & Stake partner" /></div>
<div class="field"><label for="f_casino">Casino</label><input id="f_casino" placeholder="e.g. Stake" required /></div>
<div class="field"><label for="f_code">Referral code</label><input id="f_code" placeholder="BTZ" /></div>
<div class="field"><label for="f_cta">Referral link</label><input id="f_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="field"><label for="f_pool">Prize pool</label><input id="f_pool" placeholder="$3,500" /></div>
<div class="field"><label for="f_period">Period</label><select id="f_period"><option>Weekly</option><option selected>Monthly</option><option>Season</option></select></div>
<div class="field"><label for="f_ends">Countdown ends</label><input id="f_ends" type="datetime-local" /><span class="hint" id="f_ends_hint">When the leaderboard resets, in your local time. Powers the live timer.</span></div>
<div class="field" style="grid-column:1/-1"><label class="chk"><input type="checkbox" id="f_auto_reset" /> Auto-reset when countdown ends</label><select id="f_auto_reset_clear" disabled style="margin-top:8px"><option value="wagers">Reset wagers to 0</option><option value="players">Clear all players</option><option value="none">Keep board as-is</option></select><span class="hint">Archives the finished period and extends the end date by one period automatically.</span></div>
<div class="field" style="grid-column:1/-1"><label class="chk"><input type="checkbox" id="f_password_enabled" /> Password-protect this board</label><input id="f_password" type="password" placeholder="Leave blank to keep current password" disabled style="margin-top:8px" /><span class="hint">Visitors must enter this password before seeing the leaderboard or using the public API.</span></div></div>
<div class="field"><label for="f_blurb">Partner blurb</label><textarea id="f_blurb" rows="2" placeholder="Short pitch about the casino and your code."></textarea></div></div>
<div class="card" data-egroup="data"><h2>Players</h2><p class="card-sub">The board auto-sorts by wagered, highest first. Prize <span class="mono">0</span> shows a dash. Names can be masked (keep the <span class="mono">***</span>). <span class="limit-widget" id="limitWidget"><span id="pCount" class="limit-hint"></span><span class="limit-bar"><span class="limit-fill" id="limitFill"></span></span><span class="limit-hint" id="limitHint"></span><a class="btn btn--sm btn--accent" id="playerLimitUpgrade" href="/dashboard/billing">Upgrade</a></span></p>
<div class="player-toolbar">
  <input type="search" id="playerSearch" class="player-search" placeholder="Find player..." autocomplete="off" />
  <div class="player-bulk" id="bulkActions" hidden>
    <button class="btn btn--xs btn--danger" id="bulkDelete" type="button">Delete selected</button>
    <button class="btn btn--xs" id="bulkClearWager" type="button">Clear wagered</button>
  </div>
</div>
<div class="players-wrap"><table class="players"><thead><tr><th class="sel"><input type="checkbox" id="selectAll" title="Select all" aria-label="Select all players" /></th><th class="rank">#</th><th>Player</th><th class="ta-r sortable sort-desc" id="wagerHeader">Wagered <span class="sort-ind" aria-hidden="true">↓</span></th><th class="ta-r">Prize</th><th class="ta-r col-score" hidden>Score</th><th class="ta-r col-hands" hidden>Hands</th><th class="ta-r col-net" hidden>Net profit</th><th class="ta-r col-win" hidden>Win rate</th><th class="ta-r col-change" hidden>Change</th><th class="col-menu"><div class="dropdown" id="colDropdown"><button class="btn btn--xs btn--ghost" id="colDropdownBtn" type="button">Columns ▾</button><div class="dropdown-menu" id="colMenu" hidden><label class="dropdown-item"><input type="checkbox" data-col="score" /> Score</label><label class="dropdown-item"><input type="checkbox" data-col="hands" /> Hands</label><label class="dropdown-item"><input type="checkbox" data-col="netProfit" /> Net profit</label><label class="dropdown-item"><input type="checkbox" data-col="winRate" /> Win rate</label><label class="dropdown-item"><input type="checkbox" data-col="change" /> Change</label></div></div></th></tr></thead><tbody id="rows"></tbody><tfoot id="quickAdd"><tr><td></td><td></td><td><input id="qa_name" class="p-name" placeholder="New player" /></td><td class="num"><input id="qa_wager" inputmode="decimal" placeholder="0" /></td><td class="num"><input id="qa_prize" inputmode="decimal" placeholder="0" /></td><td hidden></td><td hidden></td><td hidden></td><td hidden></td><td hidden></td><td class="act"><button class="btn btn--sm" id="qa_add" type="button">+ Add</button></td></tr></tfoot></table></div>
<div id="playersEmpty" class="empty" hidden>No players yet. Add your first one.</div>
<div class="mt-14 d-flex gap-8 flex-wrap items-center"><button class="btn btn--sm" id="addRow">+ Add player</button><div class="dropdown"><button class="btn btn--sm" id="importMenuBtn" type="button">Import ▾</button><div class="dropdown-menu" id="importMenu" hidden><button class="dropdown-item" id="importPasteBtn" type="button">Paste from spreadsheet</button><button class="dropdown-item" id="csvImportBtn" type="button">Import CSV file</button><button class="dropdown-item" id="gsheetBtn" type="button">Import from Google Sheets</button><div class="dropdown-divider"></div><button class="dropdown-item" id="csvTemplateBtn" type="button">Download template</button></div></div><button class="btn btn--sm btn--ghost ic-btn" id="csvExportBtn" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>Export CSV</button><input type="file" id="csvFileInput" accept=".csv,.tsv,.txt" hidden /><span id="limitMsg" class="hint ml-auto c-muted" role="status" aria-live="polite"></span></div>
<div class="import" id="importPanel" hidden>
<p class="hint mb-8">One player per line, commas or tabs. <strong>Add a header row</strong> (e.g. <span class="mono">name, prize, wagered</span>) and columns can be in <strong>any order</strong> — we match by name. Recognised: <span class="mono">name, wagered, prize, score, hands, net profit, win rate, change</span> (only name, wagered and prize are required). No header? We read them in that order. Pasting straight from Excel or Google Sheets works.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div>
<div class="import" id="gsheetPanel" hidden>
<p class="hint mb-8">Paste a Google Sheets URL. Public / “Publish to web” sheets work best; private sheets may be blocked by Google’s CORS.</p>
<div class="d-flex gap-8 flex-wrap">
<input type="text" id="gsheetUrl" style="flex:1" placeholder="https://docs.google.com/spreadsheets/d/..." />
<button class="btn btn--sm btn--accent" id="gsheetFetch" type="button">Fetch CSV</button>
</div>
<p class="hint mt-8" id="gsheetStatus"></p>
</div></div>
<div class="card" data-egroup="data" id="playerFieldsCard"><h2>Player columns</h2><p class="card-sub">Choose which extra columns show on the dashboard player table and on supported public templates.</p><div class="section-list" id="playerFieldsList"></div></div>
<div class="card" data-egroup="appearance" id="templateCard"><h2>Page design</h2><p class="card-sub">Pick a design; the preview on the right uses your real players.</p>
<div class="template-tabs" id="templateTabs" role="tablist" aria-label="Template categories"></div>
<div class="template-vibe-filters" id="templateVibeFilters" role="group" aria-label="Casino vibes" hidden></div>
<input type="hidden" id="f_template" value="classic" />
<div class="template-gallery-wrap" id="templateGalleryWrap">
<div class="template-featured" id="templateFeatured" hidden></div>
<div class="template-grid" id="templateGallery" aria-label="Page templates"></div>
</div>
<p class="hint template-status" id="templateStatus" role="status" aria-live="polite"></p></div>
<details class="pro-accordion" data-egroup="appearance" id="proAccordion">
<summary class="pro-accordion__summary">
<span class="pro-accordion__title">Pro features<span class="pill pill--info ml-6">PRO</span></span>
<span class="hint">Branding, sections, prize customization</span>
</summary>
<div class="pro-accordion__body">
<div class="card" id="brandCard"><h2>Branding <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Your logo and page colors. Free pages use the default look.</p>
<div id="brandBody">
<div class="grid2">
<div class="field"><label for="logoFile">Logo</label>
<div class="logo-row"><img id="logoPreview" class="logo-preview" alt="" hidden /><input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden />
<button class="btn btn--sm" id="logoPick" type="button">Upload logo</button><button class="btn btn--sm btn--ghost" id="logoClear" type="button" hidden>Remove</button></div>
<span class="hint">PNG, JPG or WebP. Shows in your page header and as the link preview image when your page gets shared. Square works best.</span></div>
<div class="field"><label>Curated color presets</label>
<div class="preset-list" id="colorPresets"></div>
<span class="hint">Each template includes ready-made combinations. Click one to publish it instantly.</span>
<details class="advanced-colors"><summary>Advanced custom colors</summary>
<div class="color-row"><label for="c_a" class="sr-only">Accent color start</label><input type="color" id="c_a" value="#5ad9ff" /><label for="c_b" class="sr-only">Accent color end</label><input type="color" id="c_b" value="#7b8cff" /><button class="btn btn--sm btn--ghost" id="applyCustomColors" type="button">Apply colors</button><button class="btn btn--sm btn--ghost" id="colorsReset" type="button">Template default</button></div>
</details></div>
<div class="field"><label for="f_font">Font</label><select id="f_font"><option value="Inter">Inter — Default</option><option value="Oswald">Oswald — Bold & Sporty</option><option value="Playfair Display">Playfair Display — Premium & Elegant</option><option value="Rajdhani">Rajdhani — Techy & Esports</option><option value="Bebas Neue">Bebas Neue — Impact & Hype</option></select><span class="hint">Changes the personality of your public page text.</span></div>
</div></div>
<div class="empty" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="sectionsCard"><h2>Sections <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Choose what appears on your public page. Turn sections off to build a leaner layout.</p>
<div id="sectionsBody"><div class="sections-editor" id="sectionsList"></div></div>
<div class="empty" id="sectionsLock" hidden>Section controls are a Pro feature. <a href="#" id="sectionsUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="prizesCard"><h2>Prize & countdown <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Customize how prizes, currency and the countdown appear on your public page.</p>
<div id="prizesBody">
<div class="grid2">
<div class="field"><label for="f_prizePoolLabel">Prize pool label</label><input type="text" id="f_prizePoolLabel" placeholder="Prize pool" /></div>
<div class="field"><label for="f_payoutsLabel">Payouts label</label><input type="text" id="f_payoutsLabel" placeholder="Payouts" /></div>
<div class="field"><label for="f_countdownLabel">Countdown label</label><input type="text" id="f_countdownLabel" placeholder="Race ends in" /></div>
<div class="field"><label for="f_currency">Currency symbol</label><input type="text" id="f_currency" placeholder="$ / € / £" maxlength="6" /></div>
</div>
<label class="hint chk"><input type="checkbox" id="f_hidePrizeAmounts" /> Hide prize amounts on the public page</label>
</div>
<div class="empty" id="prizesLock" hidden>Prize customization is a Pro feature. <a href="#" id="prizesUpgrade">Upgrade to unlock it</a>.</div></div>
</div>
</details>
<div class="card" data-egroup="appearance" id="textCard"><h2>Template text</h2><p class="card-sub">Change the copy inside your selected design. Keys with an empty value fall back to the default.</p>
<div class="text-editor" id="textList"></div></div>
<div class="card" data-egroup="share" id="legalCard"><h2>Legal pages</h2><p class="card-sub">Set your own Terms, Privacy, and other legal copy. Empty fields use defaults and the footer links go to your own /terms, /privacy, etc.</p>
<div class="legal-editor" id="legalList"></div></div>
<div class="card" data-egroup="appearance" id="socialsCard"><h2>Social links</h2><p class="card-sub">Add the links to your channels. Turn a network <b>on</b> to show it in the “Join the Socials” section of your public page; turn it <b>off</b> to hide it. Links with the toggle on but no URL stay hidden.</p>
<div class="socials-editor" id="socialsList"></div></div>
</div>
<div class="design-preview">
<div class="card">
<div class="preview-header">
<div class="preview-header-text"><h2>Live preview</h2><p class="preview-sub">Click elements on the board to edit them directly.</p></div>
<div class="preview-actions">
<div class="preview-tabs" role="tablist" aria-label="Preview device"><button class="preview-tab is-active" data-width="1100" data-device="desktop" type="button" role="tab" aria-selected="true">Desktop</button><button class="preview-tab" data-width="390" data-device="mobile" type="button" role="tab" aria-selected="false">Mobile</button></div>
</div>
</div>
<div class="preview-frame" id="previewFrame"><div class="preview-stage" id="previewStage"><iframe id="designPreview" src="" loading="eager" title="Live preview"></iframe></div></div>
</div>
</div>
</div>
</section>
<section class="lb-page" data-page="integrations">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Integrations</h1><p class="lb-psub">Overlay, custom domain and alerts — set these once</p></div></div>
<div class="card" id="overlayCard"><h2>OBS Stream Overlay <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Add a live leaderboard overlay to your stream. It auto-updates every 15 seconds with smooth rank animations.</p>
<div id="overlayBody">
<div class="field"><label>Overlay URL</label>
<div class="d-flex gap-8 items-center flex-wrap">
<code id="overlayUrl" class="overlay-url"></code>
<button class="btn btn--sm btn--accent ic-btn" id="overlayCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy</button>
</div>
<span class="hint">Add this as a <b>Browser Source</b> in OBS. Set width to <b>320px</b>, height auto. Check "Shutdown source when not visible" off for live updates.</span></div>
<div class="mt-14 d-flex gap-8 flex-wrap">
<a class="btn btn--sm" id="overlayPreview" href="#" target="_blank" rel="noopener noreferrer">Preview overlay →</a>
</div>
</div>
<div class="empty" id="overlayLock" hidden>OBS Overlay is a Pro feature. <a href="#" id="overlayUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="domainCard"><h2>Custom Domain <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Serve your leaderboard on your own domain instead of yourrank.site/yourname.</p>
<div id="domainBody">
<div class="field"><label for="f_domain">Your domain</label><input id="f_domain" placeholder="board.mystream.com" />
<span class="hint">Point a <b>CNAME record</b> for your domain to <span class="mono">yourrank.site</span>. Then enter the domain here and click <b>Verify &amp; Provision TLS</b>.</span></div>
<div class="mt-8 d-flex gap-8 items-center flex-wrap">
<button class="btn btn--sm btn--accent" id="domainVerify" type="button">Verify &amp; Provision TLS</button>
</div>
<div id="domainStatus" class="hint mt-8 min-h-18" role="status" aria-live="polite"></div>
</div>
<div class="empty" id="domainLock" hidden>Custom domains are a Pro feature. <a href="#" id="domainUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" id="notifyCard"><h2>Notifications <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Optional alerts when your leaderboard resets or a player breaks into the top 3. Discord and Telegram supported — the leaderboard itself works without either.</p>
<div id="notifyBody">
<div class="field"><label>Events that trigger notifications</label>
<div class="d-flex gap-8 flex-wrap mb-4">
<span class="pill pill--muted ic-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>Leaderboard reset</span>
<span class="pill pill--muted ic-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>Player enters top 3</span>
</div></div>
<div class="field"><label for="f_webhook">Discord webhook URL</label>
<input id="f_webhook" placeholder="https://discord.com/api/webhooks/..." />
<span class="hint">Create a webhook in your Discord server settings → Integrations → Webhooks. Paste the URL here.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<button class="btn btn--sm ic-btn" id="testDiscord" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>Test Discord</button>
<span class="hint" id="testDiscordStatus" role="status" aria-live="polite"></span>
</div>
<div class="field"><label for="f_tgChatId">Telegram chat/group ID</label>
<input id="f_tgChatId" placeholder="-1001234567890" />
<span class="hint">The chat or group ID where notifications should be sent. Use <code>/start</code> in your bot chat or add the bot to a group to get the ID.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<label class="hint chk"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label>
<button class="btn btn--sm ic-btn" id="testTelegram" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>Test Telegram</button>
<span class="hint" id="testTelegramStatus" role="status" aria-live="polite"></span>
</div>
</div>
<div class="empty" id="notifyLock" hidden>Notifications are a Pro feature. <a href="#" id="notifyUpgrade">Upgrade to unlock them</a>.</div></div>
</section>
<section class="lb-page" data-page="manage">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Plan &amp; billing</h1><p class="lb-psub">Manage your plan, billing and period close-outs</p></div></div>
<div class="card" id="archiveCard"><h2>Past winners</h2><p class="card-sub">When a period ends, close it out: the current board is saved and shown on your page under "Past Winners". Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field field-flex"><label for="a_label">Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field m-0"><label for="a_clear">Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent self-end" id="a_go" type="button">Close out period</button></div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div></div>
<div class="card" id="planCard"><h2>Plan &amp; billing</h2><p class="card-sub">Pick the plan that fits your stream, or start a free Pro trial.</p>
<div class="plan-summary" id="planSummary"></div>
<div class="plan-grid" id="planGrid"></div>
<div class="plan-trial" id="planTrial" hidden><p class="hint">Not ready to pay? Try every Pro feature free for 7 days.</p><button class="btn btn--accent" id="trialBtn" type="button">Start free Pro trial</button><p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
<p class="hint" id="planHint">Paid plans are billed in crypto (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms. <a href="/dashboard/billing">See billing details →</a></p></div>
</section>
</div>
      </div>
      <div class="savebar" id="savebar" hidden><span class="savebar-hint">Unsaved changes</span><button class="btn btn--accent" id="save" type="button">Save changes</button></div>
      </div>
    </>
  );
}
