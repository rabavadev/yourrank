/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */


export const dashboardConfig = {
  title: "Dashboard · YourRank",
  canonical: "https://yourrank.site/dashboard",
  styles: ["/assets/app.css", "/assets/shell-nav.css", "/assets/dashboard-v2.css", "/assets/dashboard-v3.css", "/assets/ui.css"],
  scripts: ['<script src="/assets/dashboard.js?v=13" type="module"></script>'],
  nav: false,
  footer: false,
  wide: true,
};

export function DashboardContent() {
  return (
    <>
      <div id="loading" class="lb-bento pt-24">
<div class="lb-widget lb-widget--full d-flex justify-between items-center gap-12 flex-wrap">
<div class="d-flex flex-col gap-8">
<div class="skeleton skeleton-text--lg" style="width:160px"></div>
<div class="skeleton skeleton-text--sm" style="width:240px"></div>
</div>
<div class="skeleton skeleton-text" style="width:90px"></div>
</div>
<div class="lb-widget lb-widget--full">
<div class="kpi-row">
<div class="kpi-card"><div class="skeleton skeleton-text" style="width:70px"></div><div class="skeleton skeleton-text--lg" style="width:50px;margin-top:10px"></div></div>
<div class="kpi-card"><div class="skeleton skeleton-text" style="width:70px"></div><div class="skeleton skeleton-text--lg" style="width:50px;margin-top:10px"></div></div>
<div class="kpi-card"><div class="skeleton skeleton-text" style="width:70px"></div><div class="skeleton skeleton-text--lg" style="width:50px;margin-top:10px"></div></div>
<div class="kpi-card"><div class="skeleton skeleton-text" style="width:70px"></div><div class="skeleton skeleton-text--lg" style="width:50px;margin-top:10px"></div></div>
</div>
</div>
<div class="lb-widget lb-widget--wide"><div class="skeleton skeleton-block" style="height:180px"></div></div>
<div class="lb-widget lb-widget--narrow"><div class="skeleton skeleton-block" style="height:180px"></div></div>
<div class="lb-widget lb-widget--narrow"><div class="skeleton skeleton-block" style="height:180px"></div></div>
<div class="lb-widget lb-widget--half"><div class="skeleton skeleton-block" style="height:140px"></div></div>
<div class="lb-widget lb-widget--half"><div class="skeleton skeleton-block" style="height:140px"></div></div>
</div>
<div id="dash" class="v2-dash v3-dash" hidden>
<div class="toast" id="status" role="status" aria-live="polite"></div>
<div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="Dashboard sections">
<div class="lb-side-head">
<div class="lb-side-board">
<div class="lb-board-row-head">
  <div>
    <span class="label" id="activeBoardLabel">Active board</span>
    <div class="lb-active-name" id="activeBoardName">…</div>
    <div class="lb-active-meta" id="activeBoardMeta"></div>
  </div>
  <button class="btn btn--sm lb-board-new-side" id="newBoardSide" type="button" title="New board" aria-label="New board">+</button>
</div>
<button class="btn btn--sm btn--ghost lb-board-add" id="addBoardBtn" type="button">+ New board</button>
<button class="lb-linkbtn lb-board-manage" id="manageBoardsBtn" type="button">Manage boards</button>
<div class="board-upsell" id="boardLimitUpsell" role="status" hidden>
<div><b id="boardLimitTitle">Need another leaderboard?</b><p class="hint" id="boardLimitText"></p></div>
<a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard/settings">Upgrade plan</a>
</div>
<div class="lb-board-form" id="newBoardForm" hidden>
<div class="field field-flex"><label for="nb_name">Board name</label><input id="nb_name" placeholder="Summer Race 2026" /></div>
<div class="field field-flex"><label for="nb_slug">URL slug</label><input id="nb_slug" placeholder="summer-race-2026" /></div>
<div class="field field-flex"><label for="nb_casino">Sponsor / prize source</label><input id="nb_casino" placeholder="Your brand or sponsor" /></div>
<div class="field field-flex"><label for="nb_code">Referral or promo code</label><input id="nb_code" placeholder="OPTIONAL" /></div>
<div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div>
</div>
</div>
</div>
<button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
<nav class="lb-side-group lb-side-nav" data-area="all" aria-label="Dashboard">
<a class="lb-nav is-on" href="/dashboard" data-nav="home" aria-current="page"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg></span>Overview</a>
<a class="lb-nav" href="/dashboard/editor" data-nav="board" data-hash="players"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>Leaderboard</a>
<a class="lb-nav" href="/dashboard/editor/design" data-nav="board" data-hash="design"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></span>Page</a>
<a class="lb-nav" href="/dashboard/rewards/channel"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="6"/><path d="M8 21h12a2 2 0 0 0 2-2v-4"/><path d="m19 16 3-3-3-3"/></svg></span>Rewards &amp; Shop</a>
<a class="lb-nav" href="/dashboard/games" data-nav="games"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/><path d="m7.38 12 5.74-9.94"/><path d="M9.69 16 3.95 6.06"/><path d="M14.31 16H2.83"/><path d="m16.62 12-5.74 9.94"/></svg></span>Games</a>
<a class="lb-nav" href="/dashboard/analytics/activity" data-nav="performance" data-hash="activity"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18"/><path d="m7 12 4-4 4 4 5-5"/></svg></span>Analytics</a>
<a class="lb-nav" href="/dashboard/editor/history" data-nav="board" data-hash="history"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>History</a>
<a class="lb-nav" href="/dashboard/settings" data-nav="settings"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>Settings</a>
</nav>
<div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live page ↗</a><div class="lb-usage" id="planUsage" hidden><div class="lb-usage-head"><span class="lb-usage-lbl">VIP PRO</span><span class="lb-usage-val">Active</span></div><div class="lb-usage-meta">API Usage <span id="usageAmount">0</span> / <span id="usageLimit">0</span> req</div><div class="lb-usage-bar" aria-hidden="true"><i id="usageFill" style="width:0%"></i></div></div><span class="label" id="planBadge">FREE PLAN</span></div>
</aside>
<div class="lb-main">
<header class="lb-topbar" id="lbTopbar">
  <a class="lb-brand" href="/dashboard" aria-label="YourRank dashboard">
    <span class="lb-brand-mark">Y</span>
    <span class="lb-brand-txt">YourRank</span>
  </a>
  <div class="lb-topbar-hud">
    <div class="lb-board-select-wrap">
      <span class="lb-board-select-lbl" aria-hidden="true">Board:</span>
      <select class="lb-board-select" id="sidebarBoardSelect" aria-label="Switch board"></select>
      <button class="btn btn--sm lb-board-new" id="newBoard" type="button" title="New board" aria-label="New board">+</button>
    </div>
  </div>
  <div class="lb-topbar-actions">
    <span class="lb-status" id="lbTopbarStatus">—</span>
    <label class="lb-pub-toggle" title="When checked, saving makes the board public at /your-slug"><input type="checkbox" id="pubToggle" checked /> <span class="lb-pub-lbl">Publish site</span></label>
    <span class="lb-avatar" id="userAvatar" aria-label="Account">Y</span>
  </div>
</header>
<div class="lb-widget lb-widget--full lb-widget--danger" id="verifyBanner" hidden style="margin:0 0 24px"><h2>Verify your email</h2><p class="card-sub">Your leaderboard won't be public until you confirm your email address. Check your inbox for the link, or <a href="/verify-email">request a new one</a>.</p></div>
<section class="lb-page is-on" data-page="home">
<div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="v3-head"><h1>Overview</h1><p class="v3-head-sub" id="ovHeadSub">Complete setup to go live</p></div>
<div id="ovOnboardingBento" hidden>
<div class="ov-setup">
<div class="ov-setup-progress"><div class="ov-setup-head"><h2>Setup Progress</h2><span class="ov-setup-count" id="ovSetupCount">0 of 5 complete</span></div>
<div class="ov-setup-bar" aria-hidden="true"><i id="ovSetupFill" style="width:0%"></i></div></div>
<div class="ov-setup-list" id="ovChecklist">
<div class="ov-setup-row" id="ovStepBrand"><span class="ov-step-icon"></span><div class="ov-step-body"><b>Name your board</b><span class="hint">Set up your custom display name for this event series</span></div><span class="ov-step-status" id="ovStepBrandStatus">TODO</span></div>
<div class="ov-setup-row" id="ovStepPlayers"><span class="ov-step-icon"></span><div class="ov-step-body"><b>Add players</b><span class="hint">Import list of streamers or enter manually to populate leaderboard</span></div><span class="ov-step-status" id="ovStepPlayersStatus">TODO</span></div>
<div class="ov-setup-row" id="ovStepKick"><span class="ov-step-icon" id="ovStepKickMark"></span><div class="ov-step-body"><b>Connect Kick channel</b><span class="hint">Link streamer Kick API for automated wager tracking</span></div><span class="ov-step-status" id="ovStepKickStatus">TODO</span></div>
<div class="ov-setup-row" id="ovStepConfigure"><span class="ov-step-icon" id="ovStepConfigureMark"></span><div class="ov-step-body"><b>Configure your page</b><span class="hint">Customize layouts, visual branding, and prize announcements</span></div><span class="ov-step-status" id="ovStepConfigureStatus">TODO</span></div>
<div class="ov-setup-row" id="ovStepPublish"><span class="ov-step-icon" id="ovStepPublishMark"></span><div class="ov-step-body"><b>Publish</b><span class="hint">Make your leaderboard publicly accessible to viewers</span></div><span class="ov-step-status" id="ovStepPublishStatus">TODO</span></div>
</div><div class="ov-setup-foot"><button class="lb-linkbtn" type="button" id="ovSkipSetup" data-jump="board">Skip setup and view dashboard</button></div>
</div></div>
<div id="ovActiveBento" hidden><div class="ov-live" aria-label="Overview">
<div class="kpi-row"><div class="kpi-card"><span class="kpi-lbl">Pending redemptions</span><div class="kpi-value-row"><span class="kpi-val" id="ovPendingRedemptions">–</span><a class="kpi-action" href="/dashboard/rewards/redemptions">View queue →</a></div></div><div class="kpi-card"><span class="kpi-lbl">Page views (14d)</span><div class="kpi-value-row"><span class="kpi-val" id="ovViews14">–</span><span id="ovViewsDelta"></span></div></div><div class="kpi-card"><span class="kpi-lbl">Referral copies (14d)</span><div class="kpi-value-row"><span class="kpi-val" id="ovCopies14">–</span><span id="ovCopiesDelta"></span></div></div></div>
<div class="ov-live-grid"><div class="ov-live-card" aria-label="Recent activity"><div class="ov-live-card-head"><h2>Recent Activity</h2><button class="lb-cardlink kpi-action ov-analytics-link" id="ovAnalyticsLink" type="button" data-jump="performance">View analytics →</button></div><div class="ov-activity-list" id="ovActivityList"></div><p class="ov-card-empty" id="ovActivityEmpty" hidden>No activity yet.</p></div><div class="ov-live-card" aria-label="Top players"><h2>Top Players</h2><div class="ov-players-list" id="ovTopPlayers"></div><p class="ov-card-empty" id="ov_topEmpty" hidden>No players yet.</p></div></div>
<div class="v3-statusbar" id="ovStatusbar"><span><i class="ov-status-dot"></i><b id="ovPublishedStatus">Published</b></span><span class="ov-status-sep">|</span><span><i class="ov-status-dot"></i><b id="ovKickStatus">Kick Connected</b></span><span class="ov-status-sep">|</span><span id="ovTrackedPlayers"></span><span class="v3-statusbar-end" id="ovMetricsStatus"></span></div>
</div></div>
</section>
<section class="lb-page" data-page="board">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>

<h1 class="sr-only">Page</h1>
<div class="editor-steps v3-tabs" id="editorTabs" role="tablist" aria-label="Editor steps">
  <button class="editor-step v3-tab is-active" type="button" role="tab" aria-selected="true" data-egroup="setup"><span class="step-num">1</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="17" x2="23" y1="16" y2="16"/></svg> Setup</button>
  <button class="editor-step v3-tab" type="button" role="tab" aria-selected="false" data-egroup="players"><span class="step-num">2</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Players</button>
  <button class="editor-step v3-tab" type="button" role="tab" aria-selected="false" data-egroup="design"><span class="step-num">3</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> Design</button>
  <button class="editor-step v3-tab" type="button" role="tab" aria-selected="false" data-egroup="share"><span class="step-num">4</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg> Share</button>
  <button class="editor-step v3-tab" type="button" role="tab" aria-selected="false" data-egroup="history"><span class="step-num">5</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v5a5 5 0 0 0 5 5h10a5 5 0 0 1 5 5v5"/><path d="M12 12 7 7l5-5"/><path d="M12 12 17 7l5 5"/></svg> History</button>
  </div>
<div class="design-grid">
<div class="design-controls">
<div class="card" data-egroup="setup"><h2>Details</h2><p class="card-sub">The headline details on your page.</p><div class="grid2">
<div class="field"><label for="f_name">Display name</label><input id="f_name" /></div>
<div class="field"><label for="f_tagline">Tagline</label><input id="f_tagline" placeholder="Stream community leaderboard" /></div>
<div class="field"><label for="f_casino">Sponsor / prize source</label><input id="f_casino" placeholder="Your brand or sponsor" /></div>
<div class="field"><label for="f_code">Referral or promo code</label><input id="f_code" placeholder="OPTIONAL" /></div>
<div class="field"><label for="f_cta">Sponsor link</label><input id="f_cta" placeholder="https://example.com" /></div>
<div class="field field--full"><label for="f_blurb">Partner blurb</label><textarea id="f_blurb" rows="2" placeholder="Short pitch about the sponsor and your code (optional)."></textarea></div></div></div>
<div class="card" data-egroup="setup"><h2>Schedule &amp; prize</h2><p class="card-sub">When the race ends and what the winner gets.</p><div class="grid2">
<div class="field"><label for="f_pool">Prize pool</label><input id="f_pool" placeholder="$500" /></div>
<div class="field"><label for="f_period">Period</label><select id="f_period"><option>Weekly</option><option selected>Monthly</option><option>Season</option></select></div>
<div class="field"><label for="f_ends">Countdown ends</label><input id="f_ends" type="datetime-local" /><span class="hint" id="f_ends_hint">When the leaderboard resets, shown in your timezone. Powers the live timer.</span></div>
<div class="field field--full"><label class="chk"><input type="checkbox" id="f_auto_reset" /> Auto-reset when countdown ends</label><select id="f_auto_reset_clear" disabled class="mt-8"><option value="wagers">Reset wagers to 0</option><option value="players">Clear all players</option><option value="none">Keep board as-is</option></select><span class="hint">Archives the finished period and extends the end date by one period automatically.</span></div></div></div>
<div class="card" data-egroup="setup"><h2>Access</h2><p class="card-sub">Publishing and password protection.</p>
<div class="field field--full"><label class="chk"><input type="checkbox" id="f_password_enabled" /> Password-protect this board</label><input id="f_password" type="password" placeholder="Leave blank to keep current password" disabled class="mt-8" /><span class="hint">Visitors must enter this password before seeing the leaderboard or using the public API.</span></div>
<p class="hint mt-14">Publishing is controlled by the <b>Published</b> toggle in the sidebar.</p></div>
<div class="v3-players" data-egroup="players">
<div class="v3-head">
<h1>Leaderboard</h1>
<p class="v3-head-sub v3-head-sub--mono"><span id="pCount">0</span> / <span id="pLimit">0</span> players tracked <span id="limitHint" class="v3-players-limit"></span> <a class="v3-players-upgrade" id="playerLimitUpgrade" href="/dashboard/settings" hidden>Upgrade</a></p>
</div>
<div class="v3-players-bar">
<label class="v3-search" for="playerSearch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input type="search" id="playerSearch" placeholder="Search players..." aria-label="Search players" autocomplete="off" /></label>
<select class="v3-select" id="playerSort" aria-label="Sort players"><option value="wagered">Sort by: Wagered</option><option value="prize">Sort by: Prize</option><option value="name">Sort by: Name</option></select>
<div class="v3-players-bar-end">
<div class="v3-menu-wrap"><button class="v3-btn" id="colDropdownBtn" type="button" aria-haspopup="true" aria-expanded="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>Columns</button>
<div class="v3-menu" id="colMenu" hidden><label class="v3-menu-item"><input type="checkbox" data-col="score" /> Score</label><label class="v3-menu-item"><input type="checkbox" data-col="hands" /> Hands</label><label class="v3-menu-item"><input type="checkbox" data-col="netProfit" /> Net profit</label><label class="v3-menu-item"><input type="checkbox" data-col="winRate" /> Win rate</label><label class="v3-menu-item"><input type="checkbox" data-col="change" /> Change</label></div></div>
<div class="v3-menu-wrap"><button class="v3-btn v3-btn--accent" id="importMenuBtn" type="button" aria-haspopup="true" aria-expanded="false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/></svg>Import</button>
<div class="v3-menu v3-menu--dark v3-menu--end" id="importMenu" hidden><button class="v3-menu-item" id="importPasteBtn" type="button">Paste from spreadsheet</button><button class="v3-menu-item" id="csvImportBtn" type="button">Import CSV</button><button class="v3-menu-item" id="gsheetBtn" type="button">Import from Google Sheets</button><div class="v3-menu-sep"></div><button class="v3-menu-item" id="csvExportBtn" type="button">Export CSV</button><button class="v3-menu-item v3-menu-item--accent" id="csvTemplateBtn" type="button">Download template</button></div></div>
</div>
</div>
<div class="v3-table-card">
<div class="v3-table-scroll" id="playersTableWrap"><table class="v3-table v3-players-table"><thead><tr><th class="sel"><input type="checkbox" id="selectAll" title="Select all" aria-label="Select all players" /></th><th class="rank">Rank</th><th>Player</th><th class="num">Wagered</th><th class="num">Prize</th><th class="num col-score" hidden>Score</th><th class="num col-hands" hidden>Hands</th><th class="num col-net" hidden>Net profit</th><th class="num col-win" hidden>Win rate</th><th class="num col-change" hidden>Change</th><th class="act">Edit</th></tr></thead><tbody id="rows"></tbody><tfoot id="quickAdd"><tr><td class="sel"></td><td class="rank"></td><td><input id="qa_name" class="p-name" placeholder="New player" /></td><td class="num"><input id="qa_wager" inputmode="decimal" placeholder="0" /></td><td class="num"><input id="qa_prize" inputmode="decimal" placeholder="0" /></td><td class="num col-score" hidden></td><td class="num col-hands" hidden></td><td class="num col-net" hidden></td><td class="num col-win" hidden></td><td class="num col-change" hidden></td><td class="act"><button class="v3-btn v3-btn--xs" id="qa_add" type="button">+ Add</button></td></tr></tfoot></table></div>
<div class="v3-table-foot" id="playersFoot"><span id="playersShowing">No players</span><span class="v3-pager"><button class="v3-btn v3-btn--sm" id="playersPrev" type="button">Previous</button><button class="v3-btn v3-btn--sm" id="playersNext" type="button">Next</button></span></div>
<div id="playersEmpty" class="v3-empty" hidden>
<span class="v3-empty-ic" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
<h2>No players yet</h2>
<p>Import your first batch from a spreadsheet or paste them in directly.</p>
<div class="v3-empty-actions"><button class="v3-btn v3-btn--accent" id="emptyImportBtn" type="button">Import players</button><button class="v3-btn" id="emptyPasteBtn" type="button">Paste from clipboard</button></div>
</div>
</div>
<div class="v3-players-foot"><button class="v3-btn v3-btn--sm" id="addRow" type="button">+ Add player</button><input type="file" id="csvFileInput" accept=".csv,.tsv,.txt" hidden /><span id="limitMsg" class="hint ml-auto c-muted" role="status" aria-live="polite"></span></div>
<div class="import" id="importPanel" hidden>
<p class="hint mb-8">One player per line, commas or tabs. <strong>Add a header row</strong> (e.g. <span class="mono">name, prize, wagered</span>) and columns can be in <strong>any order</strong> — we match by name. Recognised: <span class="mono">name, wagered, prize, score, hands, net profit, win rate, change</span> (only name, wagered and prize are required). No header? We read them in that order. Pasting straight from Excel or Google Sheets works.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div>
<div class="import" id="gsheetPanel" hidden>
<p class="hint mb-8">Paste a Google Sheets URL. Public / “Publish to web” sheets work best; private sheets may be blocked by Google’s CORS.</p>
<div class="d-flex gap-8 flex-wrap">
<input type="text" id="gsheetUrl" class="flex-1" placeholder="https://docs.google.com/spreadsheets/d..." />
<button class="btn btn--sm btn--accent" id="gsheetFetch" type="button">Fetch CSV</button>
</div>
<p class="hint mt-8" id="gsheetStatus"></p>
</div>
<div class="v3-bulkbar" id="bulkActions" role="status" hidden><span class="v3-bulkbar-mark" aria-hidden="true"></span><span id="bulkCount">0 players selected</span><span class="v3-bulkbar-sep" aria-hidden="true"></span><button class="v3-btn v3-btn--dark" id="bulkClearWager" type="button">Clear wagers</button><button class="v3-btn v3-btn--danger" id="bulkDelete" type="button">Delete selected</button></div>
</div>
<div class="card" data-egroup="design" id="playerFieldsCard"><h2>Visible columns</h2><p class="card-sub">Choose which extra columns show on the dashboard player table and on supported public templates.</p><div class="section-list" id="playerFieldsList"></div></div>
<div class="card" data-egroup="design" id="templateCard"><h2>Template</h2><p class="card-sub">Pick a design; the preview on the right uses your real players.</p>
<input type="hidden" id="f_template" value="classic" />
<div class="template-gallery-wrap" id="templateGalleryWrap">
<div class="template-grid" id="templateGallery" aria-label="Page templates"></div>
</div>
<p class="hint template-status" id="templateStatus" role="status" aria-live="polite"></p>
<div class="template-options" id="templateOptions" hidden></div></div>
<div class="design-group-heading" data-egroup="design"><h3>Appearance</h3></div>
<div class="card" data-egroup="design" id="brandCard"><h2>Branding <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Your logo and page colors. Free pages use the default look.</p>
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
<div class="color-row"><label for="c_a" class="sr-only">Accent color start</label><input type="color" id="c_a" value="#5771ff" /><label for="c_b" class="sr-only">Accent color end</label><input type="color" id="c_b" value="#2200ff" /><button class="btn btn--sm btn--ghost" id="applyCustomColors" type="button">Apply colors</button><button class="btn btn--sm btn--ghost" id="colorsReset" type="button">Template default</button></div>
</details></div>
<div class="field"><label for="f_font">Font</label><select id="f_font"><option value="Inter">Inter — Default</option><option value="Oswald">Oswald — Bold & Sporty</option><option value="Playfair Display">Playfair Display — Premium & Elegant</option><option value="Rajdhani">Rajdhani — Techy & Esports</option><option value="Bebas Neue">Bebas Neue — Impact & Hype</option></select><span class="hint">Changes the personality of your public page text.</span></div>
</div></div>
<div class="empty upsell-card" id="brandLock" hidden>Branding is a Pro feature. <a href="/account/plan?from=branding" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" data-egroup="design" id="sectionsCard"><h2>Sections <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Choose what appears on your public page. Turn sections off to build a leaner layout.</p>
<div id="sectionsBody"><div class="sections-editor" id="sectionsList"></div></div>
<div class="empty upsell-card" id="sectionsLock" hidden>Section controls are a Pro feature. <a href="/account/plan?from=sections" id="sectionsUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" data-egroup="design" id="prizesCard"><h2>Prize display <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Customize how prizes, currency and the countdown appear on your public page.</p>
<div id="prizesBody">
<div class="grid2">
<div class="field"><label for="f_prizePoolLabel">Prize pool label</label><input type="text" id="f_prizePoolLabel" placeholder="Prize pool" /></div>
<div class="field"><label for="f_payoutsLabel">Payouts label</label><input type="text" id="f_payoutsLabel" placeholder="Payouts" /></div>
<div class="field"><label for="f_countdownLabel">Countdown label</label><input type="text" id="f_countdownLabel" placeholder="Race ends in" /></div>
<div class="field"><label for="f_currency">Currency symbol</label><input type="text" id="f_currency" placeholder="$ / € / £" maxlength="6" /></div>
</div>
<label class="hint chk"><input type="checkbox" id="f_hidePrizeAmounts" /> Hide prize amounts on the public page</label>
</div>
<div class="empty upsell-card" id="prizesLock" hidden>Prize customization is a Pro feature. <a href="/account/plan?from=prizes" id="prizesUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="design-group-heading" data-egroup="design"><h3>Content</h3></div>
<div class="card" data-egroup="design" id="textCard"><h2>Template text</h2><p class="card-sub">Change the copy inside your selected design. Keys with an empty value fall back to the default.</p>
<div class="text-editor" id="textList"></div></div>
<div class="card" data-egroup="design" id="socialsCard"><h2>Social links</h2><p class="card-sub">Add the links to your channels. Turn a network <b>on</b> to show it on your public page; turn it <b>off</b> to hide it.</p>
<div class="socials-editor" id="socialsList"></div></div>
<div class="card" data-egroup="share" id="embedShareCard"><h2>Embed &amp; share</h2><p class="card-sub">Share your leaderboard or embed it on stream.</p>
<div class="field"><label>Public page link</label><div class="d-flex gap-8 items-center flex-wrap"><code id="embedPublicLink" class="overlay-url"></code><button class="btn btn--sm btn--accent ic-btn" id="embedPublicCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</button></div></div>
<div class="embed-obs-box"><div class="d-flex items-center gap-8 mb-8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="20" height="14" x="2" y="3" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg><b class="font-14">OBS Browser Source</b></div><div class="field mb-8"><div class="d-flex gap-8 items-center flex-wrap"><code id="embedObsUrl" class="overlay-url"></code><button class="btn btn--sm btn--accent ic-btn" id="embedObsCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</button></div></div><div class="embed-obs-row"><div><span class="hint">Width</span><div class="embed-obs-dim" id="embedObsWidth">1100px</div></div><div><span class="hint">Height</span><div class="embed-obs-dim" id="embedObsHeight">auto</div></div></div><div class="embed-tip"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg><span>For best results, uncheck "Shutdown source when not visible" in OBS so the overlay stays live while switching scenes.</span></div></div>
<div class="field mt-14"><label>Website embed code</label><div class="embed-code-block" id="embedCodeBlock"><code id="embedCodeInline"></code><button class="embed-copy-btn" id="embedCodeCopy" type="button">Copy</button></div></div>
<div class="d-flex gap-8 flex-wrap mt-14"><label class="chk"><input type="checkbox" id="embedTransparent" /> Transparent background</label><label class="chk"><input type="checkbox" id="embedHideBranding" /> Hide branding</label></div>
<h3 class="m-0 mt-18 mb-8 font-14 fw-700">Share on social</h3>
<div class="share-cards" id="shareCards"><button class="share-card share-card--x" id="shareX" type="button"><span>Share on X</span></button><button class="share-card share-card--discord" id="shareDiscord" type="button"><span>Share on Discord</span></button><button class="share-card share-card--twitch" id="shareTwitch" type="button"><span>Share on Twitch</span></button><button class="share-card share-card--copy" id="shareCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy link</span></button></div>
<div class="api-access locked" id="apiAccess"><div><b class="font-14">API Access</b><p class="hint mt-4">REST API for programmatic board management</p></div><span class="api-lock-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Pro</span></div>
</div>
<div class="card" data-egroup="history"><h2>History</h2><p class="card-sub">Close out finished periods and see past winners. Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field field-flex"><label for="a_label">Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field m-0"><label for="a_clear">Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent self-end" id="a_go" type="button">Close out period</button>
</div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div>
</div>
</div>
<div class="design-preview">
<div class="card">
<div class="preview-header">
<div class="preview-header-text"><h2>Live Preview</h2><p class="preview-sub">Click elements on the board to edit them directly.</p></div>
<div class="preview-actions">
<div class="preview-tabs" role="tablist" aria-label="Preview device"><button class="preview-tab is-active" data-width="1100" data-device="desktop" type="button" role="tab" aria-selected="true">Desktop</button><button class="preview-tab" data-width="390" data-device="mobile" type="button" role="tab" aria-selected="false">Mobile</button></div>
<span class="v3-chip v3-chip--pro preview-sync" id="previewSyncStatus">SYNCED</span>
</div>
</div>
<div class="preview-sync-strip"><span><i aria-hidden="true"></i> PREVIEW MODE</span><small id="previewSyncTime">Last synced —</small></div>
<div class="preview-frame" id="previewFrame"><div class="preview-stage" id="previewStage"><iframe id="designPreview" name="designPreview" src="" loading="eager" title="Live preview" sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"></iframe></div><div class="preview-error" id="previewError" hidden><p>Preview could not load. <button class="btn btn--sm" id="previewRetry" type="button">Retry</button></p></div></div>
<a class="preview-live-link" id="previewLiveLink" href="#" target="_blank" rel="noopener noreferrer">Open live page ↗</a>
</div>
</div>
</div>
</section>
<section class="lb-page" data-page="games">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="v3-games-page">
  <header class="v3-head">
    <h1>Site Sections &amp; Games</h1>
    <p class="v3-head-sub">Control which sections appear on your public page</p>
  </header>
  <div class="v3-games-layout">
    <div class="v3-games-left">
      <div class="v3-table-card v3-setting-card">
        <div class="v3-card-head"><span class="v3-head-sub v3-head-sub--mono">Viewer site sections</span></div>
        <div id="gamesSectionRows"></div>
      </div>
      <div class="v3-table-card v3-block-card">
        <div class="v3-card-head"><div><h2>Leaderboard page blocks</h2><p class="v3-head-sub">Choose which blocks appear on your leaderboard page</p></div><span class="v3-chip v3-chip--pro">PRO</span></div>
        <div class="v3-block-grid" id="leaderboardBlockRows"></div>
        <div class="v3-note" id="leaderboardBlockNote">Block visibility follows your board settings.</div>
      </div>
    </div>
    <div class="v3-table-card v3-game-card">
      <div class="v3-card-head"><div><h2>Game settings</h2><p class="v3-head-sub">Configure constraints for credit-based viewer games</p></div></div>
      <div id="gameSettingRows"></div>
      <div class="v3-note">All games use credits only. Outcomes are server-determined and provably fair.</div>
    </div>
  </div>
</div>
</section>
<section class="lb-page" data-page="performance">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="v3-analytics-page">
  <header class="v3-head"><h1>Analytics</h1><p class="v3-head-sub">Track real-time viewer actions, clicks, and conversion performance</p></header>
  <div class="v3-analytics-scope"><span id="perfScope"><span id="perfBoardName">Active board</span> · Last <span id="perfRangeLabel">14</span> days · <span id="perfLocalTime" title="Daily and hourly activity buckets are aggregated in UTC.">Times in UTC</span></span><div id="perfRangeFilter" class="v3-range-filter" role="group" aria-label="Date range"><button class="v3-range-btn" type="button" data-range="7">7d</button><button class="v3-range-btn is-active" type="button" data-range="14">14d</button><button class="v3-range-btn" type="button" data-range="30">30d</button></div></div>
  <nav class="v3-tabs" aria-label="Analytics sections" role="tablist">
    <a class="v3-tab" href="/dashboard/analytics/activity" data-perf-tab="activity" role="tab">Activity</a>
    <a class="v3-tab" href="/dashboard/analytics/referrals" data-perf-tab="referrals" role="tab">Referrals</a>
    <a class="v3-tab" href="/dashboard/analytics/events" data-perf-tab="events" role="tab">Events</a>
  </nav>
  <div class="v3-kpi-grid">
    <div class="v3-kpi-card"><div class="v3-kpi-label">VIEWS <span title="Total times your public page was loaded." aria-label="Metric help">[?]</span></div><div class="v3-kpi-value-row"><strong id="perfKpiViews">–</strong><span class="v3-delta" id="perfKpiViewsDelta"></span></div></div>
    <div class="v3-kpi-card"><div class="v3-kpi-label">CTA CLICKS <span title="Clicks on your tracked referral or share links." aria-label="Metric help">[?]</span></div><div class="v3-kpi-value-row"><strong id="perfKpiClicks">–</strong><span class="v3-delta" id="perfKpiClicksDelta"></span></div></div>
    <div class="v3-kpi-card"><div class="v3-kpi-label">REF COPIES <span title="Times a visitor copied your public link to the clipboard." aria-label="Metric help">[?]</span></div><div class="v3-kpi-value-row"><strong id="perfKpiCopies">–</strong><span class="v3-delta" id="perfKpiCopiesDelta"></span></div></div>
    <div class="v3-kpi-card"><div class="v3-kpi-label">CTR <span title="Click-through rate: clicks divided by views in the selected range." aria-label="Metric help">[?]</span></div><div class="v3-kpi-value-row"><strong id="perfKpiCtr">–</strong><span class="v3-delta" id="perfKpiCtrDelta"></span></div></div>
  </div>
  <div class="v3-perf-panel" data-perf-panel="activity" id="perf-activity">
    <div class="v3-table-card v3-chart-card"><div class="v3-card-head"><h2>Views over time</h2><span class="v3-chart-total">Total views: <b id="perfTotalViews">0</b></span></div><div id="statBars" class="v3-line-chart" role="img" aria-label="Daily views over time"></div><p class="v3-empty-copy" id="statsEmpty" hidden>No activity yet — share your page link in your stream panels and Discord to get it moving.</p></div>
    <div class="v3-table-card v3-activity-table-card"><div class="v3-card-head"><h2>Daily activity</h2><a class="v3-btn" href="/api/site/stats/export" id="perfExport">Export CSV</a></div><div class="v3-table-scroll"><table class="v3-table"><thead><tr><th>DATE</th><th class="num">VIEWS</th><th class="num">CLICKS</th><th class="num">COPIES</th><th class="num">CTR</th></tr></thead><tbody id="perfActivityBody"></tbody></table></div></div>
    <div class="v3-table-card" id="perf-heatmap"><div class="v3-card-head"><div><h2>Activity map</h2><p class="v3-head-sub">Views by day and hour (last 30 days).</p></div></div><div class="heatmap-wrap"><div class="heatmap" id="perfHeatmapGrid"><p class="heatmap-loading">Loading…</p></div></div></div>
  </div>
  <div class="v3-perf-panel" data-perf-panel="referrals" id="perf-referrals" hidden>
    <div class="v3-table-card"><div class="v3-card-head"><div><h2>Referrals</h2><p class="v3-head-sub">Share your link. Every sign-up adds 31 days of Pro.</p></div></div><div class="v3-ref-link-row"><input id="refLink" readonly value="…" /><button class="v3-btn v3-btn--accent" id="refCopy" type="button">Copy link</button></div><div class="v3-stat-tiles"><div><b id="refCount">–</b><span>People signed up</span></div><div><b id="refDays">–</b><span>Free days earned</span></div><div><b id="refSaved">–</b><span>Value earned ($)</span></div></div><p id="refStatus" role="status" aria-live="polite"></p></div>
    <div class="v3-table-card" id="perf-referrers"><div class="v3-card-head"><h2>Top referrers</h2></div><div class="v3-table-scroll"><table class="v3-table"><thead><tr><th>DOMAIN</th><th class="num">VIEWS</th></tr></thead><tbody id="perfReferrersBody"></tbody></table></div><p class="v3-empty-copy" id="perfReferrersEmpty" hidden>No referrer data yet — add <code>?ref=your-source</code> to your share link to track sources.</p></div>
  </div>
  <div class="v3-perf-panel" data-perf-panel="events" id="perf-events" hidden><div class="v3-table-card"><div class="v3-card-head"><h2>Events</h2></div><ul class="events-list" id="eventsList"></ul><div class="v3-empty" id="eventsEmpty"><h2>No events yet</h2><p>Postbacks and score updates will appear once a sponsor sends them. Set up postbacks in <a href="/account/postbacks">Account → Postbacks</a>.</p></div></div></div>
  <details class="metric-glossary"><summary>Metric glossary</summary><dl><div><dt>Views</dt><dd>Total page loads of your public leaderboard.</dd></div><div><dt>Clicks</dt><dd>Clicks on your tracked referral or share links.</dd></div><div><dt>Copies</dt><dd>Times a visitor copied your page URL or a share link.</dd></div><div><dt>CTR</dt><dd>Click-through rate: clicks ÷ views in the selected date range.</dd></div><div><dt>Referrers</dt><dd>Domains that sent traffic to your page, when the browser reports them.</dd></div><div><dt>Events</dt><dd>Recent postbacks, score updates and link copies recorded for this board.</dd></div></dl></details>
</div>
</section>
<section class="lb-page" data-page="settings">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="v3-settings">
  <div class="v3-head"><h1>Settings</h1><p class="v3-head-sub" id="settingsSubline">Manage your subscription, account connections, and safety settings</p></div>
  <div class="v3-tabs" role="tablist" aria-label="Settings sections">
    <button class="v3-tab is-on" id="settingsTabPlan" type="button" role="tab" aria-selected="true" aria-controls="settingsPanelPlan" data-settings-tab="plan">Plan &amp; Usage</button>
    <button class="v3-tab" id="settingsTabAccount" type="button" role="tab" aria-selected="false" aria-controls="settingsPanelAccount" data-settings-tab="account">Account</button>
    <button class="v3-tab" id="settingsTabSecurity" type="button" role="tab" aria-selected="false" aria-controls="settingsPanelSecurity" data-settings-tab="security">Security</button>
    <button class="v3-tab" id="settingsTabDomain" type="button" role="tab" aria-selected="false" aria-controls="settingsPanelDomain" data-settings-tab="domain">Domain</button>
    <button class="v3-tab" id="settingsTabSupport" type="button" role="tab" aria-selected="false" aria-controls="settingsPanelSupport" data-settings-tab="support">Support</button>
  </div>
  <section class="v3-settings-panel" id="settingsPanelPlan" role="tabpanel" aria-labelledby="settingsTabPlan" data-settings-panel="plan">
    <div class="v3-settings-card v3-plan-card"><div><div class="v3-settings-plan-row"><span class="v3-chip v3-chip--pro" id="settingsPlanChip">—</span><span class="v3-settings-price" id="settingsPlanPrice">—</span></div><p class="v3-settings-card-sub" id="settingsPlanRenewal">—</p></div><a class="v3-set-btn v3-set-btn--outline" href="/account/plan" id="settingsManagePlan">Manage subscription</a></div>
    <div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Platform Limits</h2></div></div><div class="v3-set-meters" id="settingsUsage"><p class="v3-settings-inline">Loading usage…</p></div></div>
    <div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Account Providers &amp; Schedulers</h2></div></div><div class="v3-settings-group-label">VIEWER LOGIN PROVIDERS</div><div class="v3-settings-row"><div><b>Kick Authentication</b><p>Allow viewers to sign in natively using Kick OAuth services. <a href="/dashboard/rewards/channel">Configure in Rewards &amp; Shop</a></p></div><input class="v3-toggle" id="settingsKickLogin" type="checkbox" aria-label="Allow viewers to log in with Kick" disabled /></div><div class="v3-settings-row"><div><b>Discord Integration</b><p>Allow viewers to link Discord accounts to trace server roles.</p></div><a class="v3-set-btn v3-set-btn--outline" href="#settingsPanelSecurity" data-settings-jump="security">Webhook settings</a></div></div>
  </section>
  <section class="v3-settings-panel" id="settingsPanelAccount" role="tabpanel" aria-labelledby="settingsTabAccount" data-settings-panel="account" hidden>
    <div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Account security</h2><p>Update your password and review active sessions.</p></div></div><div class="v3-settings-form-grid"><label>Current password<input type="password" id="accCurrentPassword" autocomplete="current-password" /></label><label>New password<input type="password" id="accNewPassword" autocomplete="new-password" minlength="8" /></label></div><div class="v3-settings-actions"><button class="v3-set-btn v3-set-btn--dark" id="accChangePassword" type="button">Update password</button><span class="v3-settings-status" id="accPasswordStatus" role="status"></span></div><div class="v3-settings-divider"></div><div class="v3-settings-row"><div><b>Active sessions</b><p>Sign out every other device while keeping this one active.</p></div><button class="v3-set-btn v3-set-btn--outline" id="accRevokeSessions" type="button">Sign out other sessions</button></div><div id="accSessions" class="v3-settings-sessions"><p class="v3-settings-muted">Loading…</p></div><p class="v3-settings-status" id="accSessionsStatus" role="status"></p></div>
    <div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Integrations</h2><p>Stream tools, postbacks, Kick rewards and legal pages.</p></div></div><div class="v3-settings-row"><div><b>Kick rewards</b><p>Let viewers earn credits by redeeming Kick channel rewards.</p><span class="v3-settings-muted" id="kickStatus">Loading…</span></div><a class="v3-set-btn v3-set-btn--outline" href="/dashboard/credits" id="kickRewardsLink">Open Kick rewards</a></div><div class="v3-settings-row"><div><b>Postbacks</b><p id="postbackStatus">Receive automatic score updates from your sponsor.</p></div><a class="v3-set-btn v3-set-btn--outline" href="/account/postbacks">Manage postbacks</a></div><div class="v3-settings-divider"></div><div class="v3-settings-notify-account"><label class="v3-settings-label" for="f_tgChatId">Telegram chat/group ID</label><input id="f_tgChatId" placeholder="-1001234567890" /><label class="v3-settings-check"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label><button class="v3-set-btn v3-set-btn--outline" id="testTelegram" type="button">Test Telegram</button><span class="v3-settings-status" id="testTelegramStatus" role="status"></span></div><div class="v3-settings-divider"></div><div class="v3-settings-legal"><h3>Compliance</h3><div id="legalList"></div><div id="legalFooterPreview" class="v3-settings-muted"></div></div></div>
  </section>
  <section class="v3-settings-panel" id="settingsPanelSecurity" role="tabpanel" aria-labelledby="settingsTabSecurity" data-settings-panel="security" hidden>
    <div class="v3-settings-card"><div class="v3-settings-row v3-settings-row--top"><div><h2>Password Protection</h2><p>Visitors must enter this password before seeing the leaderboard or using the public API.</p></div><input class="v3-toggle" id="settingsPasswordEnabled" type="checkbox" aria-label="Enable password protection" /></div><div class="v3-settings-inline-form"><input id="settingsPassword" type="password" placeholder="Leave blank to keep current password" autocomplete="new-password" /><button class="v3-set-btn v3-set-btn--dark" id="settingsPasswordSave" type="button">Update password</button><span class="v3-settings-status" id="settingsPasswordStatus" role="status"></span></div></div>
    <div class="v3-settings-card"><div class="v3-settings-row v3-settings-row--top"><div><h2>Webhook Notifications <span class="v3-chip v3-chip--pro">PRO</span></h2><p>Receive alerts when your leaderboard resets or a player reaches the top 3.</p></div><input class="v3-toggle" id="settingsWebhookEnabled" type="checkbox" aria-label="Enable webhook notifications" /></div><div class="v3-settings-notify-body" id="notifyBody"><div class="v3-settings-inline-form"><input id="f_webhook" aria-label="Discord webhook URL" placeholder="https://discord.com/api/webhooks/..." /><button class="v3-set-btn v3-set-btn--outline" id="testDiscord" type="button">Test webhook</button><span class="v3-settings-status" id="testDiscordStatus" role="status"></span></div></div><div class="v3-settings-inline" id="notifyLock" hidden>Notifications are a Pro feature. <a href="/account/plan?from=notifications">Upgrade to unlock them</a>.</div></div>
    <div class="v3-settings-card v3-danger-card"><div class="v3-danger-lbl">DANGER ZONE</div><div class="v3-settings-row"><div><b>Reset All Leaderboard Data</b><p>Instantly wipes all player scores, wagers, and redemption history. This action cannot be undone.</p></div><button class="v3-set-btn v3-set-btn--danger-outline" id="settingsResetData" type="button">Reset data</button></div><div class="v3-settings-row"><div><b>Delete this board</b><p>Permanently delete this board configuration. This action cannot be undone.</p></div><button class="v3-set-btn v3-set-btn--danger" id="settingsDeleteBoard" type="button">Delete board</button></div></div>
  </section>
  <section class="v3-settings-panel" id="settingsPanelDomain" role="tabpanel" aria-labelledby="settingsTabDomain" data-settings-panel="domain" hidden><div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Custom Domain</h2><p>Point your domain to your public board and provision TLS.</p></div></div><div id="domainBody"><label class="v3-settings-label" for="f_domain">Your domain</label><input id="f_domain" placeholder="board.mystream.com" /><p class="v3-settings-muted">Point a CNAME record to <span class="mono">yourrank.site</span>, then verify.</p><button class="v3-set-btn v3-set-btn--dark" id="domainVerify" type="button">Verify &amp; Provision TLS</button><div id="domainStatus" class="v3-settings-status" role="status"></div></div><div class="v3-settings-inline" id="domainLock" hidden>Custom domains are a Pro feature. <a href="/account/plan?from=domain">Upgrade to unlock it</a>.</div></div></section>
  <section class="v3-settings-panel" id="settingsPanelSupport" role="tabpanel" aria-labelledby="settingsTabSupport" data-settings-panel="support" hidden><div class="v3-settings-card"><div class="v3-settings-card-head"><div><h2>Support &amp; Resources</h2><p>Find help and manage the tools around your public board.</p></div></div><div class="v3-settings-row"><div><b>OBS Overlay</b><p>Copy the overlay URL, embed code and share links.</p></div><a class="v3-set-btn v3-set-btn--outline" href="/dashboard/editor/share">Open Board → Share</a></div><div class="v3-settings-row"><div><b>Need help?</b><p>Contact support or read the YourRank documentation.</p></div><a class="v3-set-btn v3-set-btn--outline" href="/help/support">Contact support</a></div></div></section>
</div>
</section>

<section class="lb-page" data-page="boards">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><button class="btn btn--sm" id="addBoardFromBoards" type="button">+ New board</button></div>
<div class="card">
<div class="list-controls"><input type="search" id="boardsSearch" class="list-search" placeholder="Find board…" aria-label="Find board" /></div>
<div class="board-table-wrap">
<table class="board-table">
<thead><tr><th>Board</th><th>Sponsor</th><th>URL</th><th>Players</th><th>Template</th><th>Status</th><th class="ta-r">Actions</th></tr></thead>
<tbody id="boardsBody"></tbody>
</table>
</div>
<div id="boardsEmpty" class="empty" hidden>No boards yet. Create one to get started.</div>
</div>
</section>
</div>
      </div>
      <div class="savebar" id="savebar" hidden><span class="savebar-hint">Unsaved changes</span><span class="savebar-ts" id="editorTimestamp"></span><button class="btn btn--accent" id="save" type="button">Save changes</button></div>
      </div>
    </>
  );
}
