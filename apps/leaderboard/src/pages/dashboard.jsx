/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
export const dashboardConfig = {
  title: "Dashboard · YourRank",
  canonical: "https://yourrank.site/dashboard",
  styles: ["/assets/app.css"],
  scripts: ['<script src="/assets/dashboard.js?v=11" type="module"></script>'],
  nav: false,
  footer: false,
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
<a class="btn btn--sm btn--accent" id="boardLimitCta" href="/dashboard?nav=settings">Upgrade plan</a>
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
<nav aria-label="Main">
<button class="lb-nav" type="button" data-nav="home"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg></span>Home</button>
<button class="lb-nav is-on" type="button" data-nav="board" aria-current="page"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>Board</button>
<button class="lb-nav" type="button" data-nav="performance"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></span>Analytics</button>
<button class="lb-nav" type="button" data-nav="settings"><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>Settings</button>
<button class="lb-nav lb-nav--boards" type="button" data-nav="boards" hidden><span class="lb-nav-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg></span>Boards</button>
</nav>
<div class="lb-side-foot"><a class="btn btn--sm btn--accent lb-live-btn" id="liveLink" href="#" target="_blank" rel="noopener noreferrer">View live board ↗</a><span class="label" id="planBadge">FREE PLAN</span></div>
</aside>
<div class="lb-main">
<div class="lb-widget lb-widget--full lb-widget--danger" id="verifyBanner" hidden style="margin:16px 24px 0"><h2>Verify your email</h2><p class="card-sub">Your leaderboard won't be public until you confirm your email address. Check your inbox for the link, or <a href="/verify-email">request a new one</a>.</p></div>
<header class="lb-topbar" id="lbTopbar">
  <div class="lb-topbar-left">
    <h1 class="lb-topbar-title" id="lbTopbarTitle" tabindex="-1">Home</h1>
    <span class="lb-status lb-status--draft" id="lbTopbarStatus">Draft</span>
  </div>
  <div class="lb-topbar-hud">
    <div class="hud-stat"><span class="hud-lbl">Views</span><div class="hud-val" id="hud_views">–</div></div>
    <div class="hud-stat"><span class="hud-lbl">Clicks</span><div class="hud-val" id="hud_clicks">–</div></div>
    <div class="hud-stat"><span class="hud-lbl">CTR</span><div class="hud-val" id="hud_ctr">–</div></div>
    <div class="hud-stat"><span class="hud-lbl">Signups</span><div class="hud-val" id="hud_signups">–</div></div>
  </div>
  <div class="lb-topbar-actions">
    <button class="btn btn--sm" id="editorCopyLink" type="button">Copy link</button>
    <a class="btn btn--sm btn--accent" id="editorLiveLink" href="#" target="_blank" rel="noopener noreferrer">View live ↗</a>
  </div>
</header>
<section class="lb-page is-on" data-page="home">
<div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="lb-bento" id="ovOnboardingBento" hidden>
<div class="lb-widget lb-widget--full ov-welcome">
<div class="ov-welcome-body">
<div class="ov-welcome-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
<h2 id="ovWelcomeTitle">Create your first leaderboard</h2>
<p class="card-sub" id="ovWelcomeSub">Three quick steps and your page is ready to share.</p>
<ol class="ov-checklist" id="ovChecklist">
<li id="ovStepBrand"><span class="ov-step-num" data-num="1">1</span><span class="ov-step-body"><b>Name &amp; prize</b><span class="hint">Set the board name, sponsor and prize pool</span></span></li>
<li id="ovStepPlayers"><span class="ov-step-num" data-num="2">2</span><span class="ov-step-body"><b>Add players</b><span class="hint">Type them in or paste from a spreadsheet</span></span></li>
<li id="ovStepShare"><span class="ov-step-num" data-num="3">3</span><span class="ov-step-body"><b>Share</b><span class="hint">Publish and copy your public link</span></span></li>
</ol>
<div class="d-flex gap-10 flex-wrap justify-center">
<button class="btn btn--accent" id="ovStartBtn" type="button" data-jump="board">Set up your leaderboard</button>
<a class="btn btn--ghost" href="/demo" target="_blank" rel="noopener noreferrer">See a demo</a>
</div>
</div>
</div>
</div>
<div class="lb-bento" id="ovActiveBento" hidden>
<div class="lb-widget lb-widget--full" aria-label="Key metrics">
<div class="kpi-row">
<div class="kpi-card"><span class="kpi-lbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></span>Views · 7d</span><span class="kpi-val" id="ov_kpi_views">–</span></div>
<div class="kpi-card"><span class="kpi-lbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg></span>Clicks · 7d</span><span class="kpi-val" id="ov_kpi_clicks">–</span></div>
<div class="kpi-card"><span class="kpi-lbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></span>Copies · 7d</span><span class="kpi-val" id="ov_kpi_copies">–</span></div>
<div class="kpi-card"><span class="kpi-lbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg></span>Signups · 7d</span><span class="kpi-val" id="ov_kpi_signups">–</span></div>
</div>
</div>

<div class="lb-widget lb-widget--wide"><div class="lb-cardhd"><h2>Activity · 14 days</h2><button class="lb-cardlink" type="button" data-jump="performance">Full analytics →</button></div><div class="stat-chart mt-14"><div class="stat-bars" id="ov_bars" title="Daily activity, last 14 days"></div><div class="stat-chart-lbl"><span id="ov_barsFrom"></span><span>today</span></div></div><p class="hint" id="ov_barsEmpty" hidden>No activity yet — share your page link to get it moving.</p><div class="stat-legend"><span class="stat-legend-item views">Views</span><span class="stat-legend-item copies">Copies</span><span class="stat-legend-item clicks">Clicks</span></div></div>
<div class="lb-widget lb-widget--narrow" id="ovBoardStatusWidget"><h2>Board health</h2><div class="mini-stats">
<div class="mini-stat"><span class="mini-stat-lbl">Name</span><span class="mini-stat-val" id="ov_board">–</span></div>
<div class="mini-stat"><span class="mini-stat-lbl">Prize pool</span><span class="mini-stat-val" id="ov_prize">–</span></div>
<div class="mini-stat"><span class="mini-stat-lbl">Players</span><span class="mini-stat-val" id="ov_players">–</span></div>
<div class="mini-stat"><span class="mini-stat-lbl">Resets in</span><span class="mini-stat-val" id="ov_resets">–</span></div>
</div><div class="board-status" id="ovBoardStatus"><div class="board-status-dot" id="ovStatusDot"></div><div><div class="board-status-text" id="ovStatusText">—</div><div class="board-status-sub" id="ovStatusSub"></div></div></div></div>

<div class="lb-widget lb-widget--half"><div class="lb-cardhd"><h2>Top players</h2><button class="lb-cardlink" type="button" data-jump="board">Manage all →</button></div><div class="lb-toplist" id="ov_top"></div><div class="empty" id="ov_topEmpty" hidden>No players yet. <button class="lb-linkbtn" type="button" data-jump="board">Add your first one →</button></div></div>
<div class="lb-widget lb-widget--half"><h2>Next steps</h2><div class="ov-checklist" aria-label="Onboarding checklist" id="ovQuickActions">
<button type="button" id="ovStepBrandBtn" class="ov-checklist-row" data-jump="board"><span class="ov-step-num" id="ovStepBrandMark" data-num="1">1</span><span class="ov-step-body"><b>Name &amp; prize</b><span class="hint">Set the board name, sponsor and prize pool</span></span></button>
<button type="button" id="ovStepPlayersBtn" class="ov-checklist-row" data-jump="board"><span class="ov-step-num" id="ovStepPlayersMark" data-num="2">2</span><span class="ov-step-body"><b>Add players</b><span class="hint">Type them in or paste from a spreadsheet</span></span></button>
<div id="ovShareWrap" class="ov-checklist-row"><span class="ov-step-num" id="ovStepShareMark" data-num="3">3</span><span class="ov-step-body"><b>Share</b><span class="hint" id="ovShareHint">Publish and copy your public link</span></span><button class="btn btn--sm" id="ov_copyLink" type="button">Copy link</button></div>
</div></div>
</div>
</section>
<section class="lb-page" data-page="board">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>

<div class="editor-steps" id="editorTabs" role="tablist" aria-label="Editor steps">
  <button class="editor-step is-active" type="button" role="tab" aria-selected="true" data-egroup="setup"><span class="step-num">1</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="17" x2="23" y1="16" y2="16"/></svg> Setup</button>
  <button class="editor-step" type="button" role="tab" aria-selected="false" data-egroup="players"><span class="step-num">2</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Players</button>
  <button class="editor-step" type="button" role="tab" aria-selected="false" data-egroup="design"><span class="step-num">3</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> Design</button>
  <button class="editor-step" type="button" role="tab" aria-selected="false" data-egroup="share"><span class="step-num">4</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg> Share</button>
  <button class="editor-step" type="button" role="tab" aria-selected="false" data-egroup="history"><span class="step-num">5</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v5a5 5 0 0 0 5 5h10a5 5 0 0 1 5 5v5"/><path d="M12 12 7 7l5-5"/><path d="M12 12 17 7l5 5"/></svg> History</button>
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
<div class="field"><label for="f_ends">Countdown ends</label><input id="f_ends" type="datetime-local" /><span class="hint" id="f_ends_hint">When the leaderboard resets, in your local time. Powers the live timer.</span></div>
<div class="field field--full"><label class="chk"><input type="checkbox" id="f_auto_reset" /> Auto-reset when countdown ends</label><select id="f_auto_reset_clear" disabled class="mt-8"><option value="wagers">Reset wagers to 0</option><option value="players">Clear all players</option><option value="none">Keep board as-is</option></select><span class="hint">Archives the finished period and extends the end date by one period automatically.</span></div></div></div>
<div class="card" data-egroup="setup"><h2>Access</h2><p class="card-sub">Publishing and password protection.</p>
<div class="field field--full"><label class="chk"><input type="checkbox" id="f_password_enabled" /> Password-protect this board</label><input id="f_password" type="password" placeholder="Leave blank to keep current password" disabled class="mt-8" /><span class="hint">Visitors must enter this password before seeing the leaderboard or using the public API.</span></div>
<p class="hint mt-14">Publishing is controlled by the <b>Published</b> toggle in the sidebar.</p></div>
<div class="card" data-egroup="players"><h2>Players</h2><p class="card-sub">The board auto-sorts by wagered, highest first. Prize <span class="mono">0</span> shows a dash. Names can be masked (keep the <span class="mono">***</span>). <span class="limit-widget" id="limitWidget"><span id="pCount" class="limit-hint"></span><span class="limit-bar"><span class="limit-fill" id="limitFill"></span></span><span class="limit-hint" id="limitHint"></span><a class="btn btn--sm btn--accent" id="playerLimitUpgrade" href="/dashboard?nav=settings">Upgrade</a></span></p>
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
<input type="text" id="gsheetUrl" class="flex-1" placeholder="https://docs.google.com/spreadsheets/d..." />
<button class="btn btn--sm btn--accent" id="gsheetFetch" type="button">Fetch CSV</button>
</div>
<p class="hint mt-8" id="gsheetStatus"></p>
</div></div>
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
<div class="empty upsell-card" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" data-egroup="design" id="sectionsCard"><h2>Sections <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Choose what appears on your public page. Turn sections off to build a leaner layout.</p>
<div id="sectionsBody"><div class="sections-editor" id="sectionsList"></div></div>
<div class="empty upsell-card" id="sectionsLock" hidden>Section controls are a Pro feature. <a href="#" id="sectionsUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="card" data-egroup="design" id="prizesCard"><h2>Prize & countdown <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Customize how prizes, currency and the countdown appear on your public page.</p>
<div id="prizesBody">
<div class="grid2">
<div class="field"><label for="f_prizePoolLabel">Prize pool label</label><input type="text" id="f_prizePoolLabel" placeholder="Prize pool" /></div>
<div class="field"><label for="f_payoutsLabel">Payouts label</label><input type="text" id="f_payoutsLabel" placeholder="Payouts" /></div>
<div class="field"><label for="f_countdownLabel">Countdown label</label><input type="text" id="f_countdownLabel" placeholder="Race ends in" /></div>
<div class="field"><label for="f_currency">Currency symbol</label><input type="text" id="f_currency" placeholder="$ / € / £" maxlength="6" /></div>
</div>
<label class="hint chk"><input type="checkbox" id="f_hidePrizeAmounts" /> Hide prize amounts on the public page</label>
</div>
<div class="empty upsell-card" id="prizesLock" hidden>Prize customization is a Pro feature. <a href="#" id="prizesUpgrade">Upgrade to unlock it</a>.</div></div>
<div class="design-group-heading" data-egroup="design"><h3>Content</h3></div>
<div class="card" data-egroup="design" id="textCard"><h2>Template text</h2><p class="card-sub">Change the copy inside your selected design. Keys with an empty value fall back to the default.</p>
<div class="text-editor" id="textList"></div></div>
<div class="card" data-egroup="design" id="socialsCard"><h2>Social links</h2><p class="card-sub">Add the links to your channels. Turn a network <b>on</b> to show it on your public page; turn it <b>off</b> to hide it.</p>
<div class="socials-editor" id="socialsList"></div></div>
<div class="card" data-egroup="share" id="embedShareCard"><h2>Embed &amp; share</h2><p class="card-sub">Share your leaderboard or embed it on stream.</p>
<div class="field"><label>Public page link</label><div class="d-flex gap-8 items-center flex-wrap"><code id="embedPublicLink" class="overlay-url"></code><button class="btn btn--sm btn--accent ic-btn" id="embedPublicCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</button></div></div>
<div class="embed-obs-box"><div class="d-flex items-center gap-8 mb-8"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg><b class="font-14">OBS Browser Source</b></div><div class="field mb-8"><div class="d-flex gap-8 items-center flex-wrap"><code id="embedObsUrl" class="overlay-url"></code><button class="btn btn--sm btn--accent ic-btn" id="embedObsCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy</button></div></div><div class="embed-obs-row"><div><span class="hint">Width</span><div class="embed-obs-dim" id="embedObsWidth">1100px</div></div><div><span class="hint">Height</span><div class="embed-obs-dim" id="embedObsHeight">auto</div></div></div><div class="embed-tip"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg><span>For best results, uncheck "Shutdown source when not visible" in OBS so the overlay stays live while switching scenes.</span></div></div>
<div class="field mt-14"><label>Website embed code</label><div class="embed-code-block" id="embedCodeBlock"><code id="embedCodeInline"></code><button class="embed-copy-btn" id="embedCodeCopy" type="button">Copy</button></div></div>
<div class="d-flex gap-8 flex-wrap mt-14"><label class="chk"><input type="checkbox" id="embedTransparent" /> Transparent background</label><label class="chk"><input type="checkbox" id="embedHideBranding" /> Hide branding</label></div>
<h3 class="m-0 mt-18 mb-8 font-14 fw-700">Share on social</h3>
<div class="share-cards" id="shareCards"><button class="share-card share-card--x" id="shareX" type="button"><span>Share on X</span></button><button class="share-card share-card--discord" id="shareDiscord" type="button"><span>Share on Discord</span></button><button class="share-card share-card--twitch" id="shareTwitch" type="button"><span>Share on Twitch</span></button><button class="share-card share-card--copy" id="shareCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy link</span></button></div>
<div class="api-access locked" id="apiAccess"><div><b class="font-14">API Access</b><p class="hint mt-4">REST API for programmatic board management</p></div><span class="api-lock-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Pro</span></div>
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
<div class="preview-header-text"><h2>Live preview</h2><p class="preview-sub">Click elements on the board to edit them directly.</p></div>
<div class="preview-actions">
<div class="preview-tabs" role="tablist" aria-label="Preview device"><button class="preview-tab is-active" data-width="1100" data-device="desktop" type="button" role="tab" aria-selected="true">Desktop</button><button class="preview-tab" data-width="390" data-device="mobile" type="button" role="tab" aria-selected="false">Mobile</button></div>
</div>
</div>
<div class="preview-frame" id="previewFrame"><div class="preview-stage" id="previewStage"><iframe id="designPreview" src="" loading="eager" title="Live preview" sandbox="allow-scripts allow-same-origin allow-popups-to-escape-sandbox"></iframe></div><div class="preview-error" id="previewError" hidden><p>Preview could not load. <button class="btn btn--sm" id="previewRetry" type="button">Retry</button></p></div></div>
</div>
</div>
</div>
</section>
<section class="lb-page" data-page="performance">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="lb-bento">
<div class="lb-widget lb-widget--full perf-header">
  <div>
    <h2>Analytics</h2>
    <p class="card-sub">Views, clicks, copies and where your traffic comes from.</p>
  </div>
  <div class="perf-filter" id="perfRangeFilter" role="group" aria-label="Date range">
    <button class="btn btn--xs" type="button" data-range="7">7 days</button>
    <button class="btn btn--xs is-active" type="button" data-range="14">14 days</button>
    <button class="btn btn--xs" type="button" data-range="30">30 days</button>
  </div>
</div>
<div class="lb-widget lb-widget--full">
  <div class="kpi-row">
    <div class="kpi-card"><span class="kpi-lbl" id="perfKpiViewsLbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></span>Views · 14d</span><span class="kpi-val" id="perfKpiViews">–</span></div>
    <div class="kpi-card"><span class="kpi-lbl" id="perfKpiClicksLbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg></span>Clicks · 14d</span><span class="kpi-val" id="perfKpiClicks">–</span></div>
    <div class="kpi-card"><span class="kpi-lbl" id="perfKpiCopiesLbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></span>Copies · 14d</span><span class="kpi-val" id="perfKpiCopies">–</span></div>
    <div class="kpi-card"><span class="kpi-lbl" id="perfKpiCtrLbl"><span class="kpi-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6"/><path d="M6 20V10"/><path d="M18 20V4"/></svg></span>CTR · 14d</span><span class="kpi-val" id="perfKpiCtr">–</span></div>
  </div>
</div>
<div class="lb-widget lb-widget--wide">
  <div class="lb-cardhd"><h2>Activity</h2><a class="btn btn--xs btn--ghost" href="/api/site/stats/export" id="perfExport">Export CSV</a></div>
  <div class="stat-chart"><div class="stat-bars" id="statBars" title="Daily activity"></div><div class="stat-chart-lbl"><span id="statFrom"></span><span>today</span></div></div>
  <p class="hint" id="statsEmpty" hidden>No activity yet — share your page link in your stream panels and Discord to get it moving.</p>
  <div class="stat-legend"><span class="stat-legend-item views">Views</span><span class="stat-legend-item copies">Copies</span><span class="stat-legend-item clicks">Clicks</span></div>
</div>
<div class="lb-widget lb-widget--narrow" id="perfHeatmap">
  <div class="lb-cardhd"><h2>Activity map</h2></div>
  <p class="hint m-0 mb-8">Views by day and hour (last 30 days).</p>
  <div class="heatmap-wrap"><div class="heatmap" id="perfHeatmapGrid"><p class="heatmap-loading">Loading…</p></div></div>
</div>
<div class="lb-widget lb-widget--narrow">
  <div class="lb-cardhd"><h2>Top referrers</h2></div>
  <table class="ref-table"><thead><tr><th>Domain</th><th class="ta-r">Views</th></tr></thead><tbody id="perfReferrersBody"></tbody></table>
  <p class="empty" id="perfReferrersEmpty" hidden>No referrer data yet.</p>
</div>
<div class="lb-widget lb-widget--half" id="refCard">
  <h2>Referrals</h2>
  <p class="card-sub">Share your link. Every sign-up adds 31 days of Pro.</p>
  <div class="d-flex gap-8 flex-wrap items-center mt-12"><input id="refLink" class="overlay-url min-w-220" readonly value="…" /><button class="btn btn--accent" id="refCopy" type="button">Copy link</button></div>
  <div class="stat-tiles mt-18">
    <div class="stat-tile"><span class="stat-num" id="refCount">–</span><span class="stat-lbl">People signed up</span></div>
    <div class="stat-tile"><span class="stat-num" id="refDays">–</span><span class="stat-lbl">Free days earned</span></div>
    <div class="stat-tile"><span class="stat-num" id="refSaved">–</span><span class="stat-lbl">Value earned ($)</span></div>
  </div>
  <p class="status" id="refStatus" role="status" aria-live="polite"></p>
</div>
<div class="lb-widget lb-widget--half">
  <div class="lb-cardhd"><h2>Events</h2></div>
  <ul class="events-list" id="eventsList"><li class="hint">Recent postbacks, score updates and link copies will appear here.</li></ul>
  <p class="empty" id="eventsEmpty" hidden>No events yet.</p>
</div>
</div>
</section>
<section class="lb-page" data-page="settings">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button></div>
<div class="lb-bento">
<div class="lb-widget lb-widget--full settings-nav">
  <nav aria-label="Settings sections">
    <a class="btn btn--xs btn--ghost" href="#settings-profile">Profile</a>
    <a class="btn btn--xs btn--ghost" href="#settings-plan">Plan &amp; billing</a>
    <a class="btn btn--xs btn--ghost" href="#settings-integrations">Integrations</a>
    <a class="btn btn--xs btn--ghost" href="#settings-compliance">Compliance</a>
    <a class="btn btn--xs btn--ghost" href="#settings-account">Account</a>
  </nav>
</div>
<div class="lb-widget lb-widget--full" id="settings-profile">
  <h2>Profile</h2>
  <p class="card-sub">Your password and active sessions.</p>
  <div class="field"><label for="accCurrentPassword">Current password</label><input type="password" id="accCurrentPassword" autocomplete="current-password" /></div>
  <div class="field"><label for="accNewPassword">New password</label><input type="password" id="accNewPassword" autocomplete="new-password" minlength="8" /></div>
  <div class="d-flex gap-8 items-center flex-wrap">
    <button class="btn btn--accent" id="accChangePassword" type="button">Update password</button>
    <span class="hint" id="accPasswordStatus" role="status" aria-live="polite"></span>
  </div>
  <hr class="hr" />
  <div class="d-flex justify-between items-center mb-12"><h3 class="m-0">Active sessions</h3><button class="btn btn--ghost btn--sm" id="accRevokeSessions" type="button">Sign out other sessions</button></div>
  <div id="accSessions"><p class="hint">Loading…</p></div>
  <p class="hint" id="accSessionsStatus" role="status" aria-live="polite"></p>
</div>
<div class="lb-widget lb-widget--full" id="settings-plan">
  <h2>Plan &amp; billing</h2>
  <p class="card-sub">Pick the plan that fits your stream, or start a free Pro trial.</p>
  <div class="plan-summary" id="planSummary"></div>
  <div class="plan-banner" id="planBanner" role="status" aria-live="polite" hidden></div>
  <div id="cancelWrap" hidden>
    <p class="hint" id="cancelStatus" role="status" aria-live="polite"></p>
    <button class="btn btn--sm btn--danger" id="cancelBtn" type="button">Cancel subscription</button>
  </div>
  <div class="plan-grid" id="planGrid"></div>
  <div class="plan-trial" id="planTrial" hidden><p class="hint">Not ready to pay? Try every Pro feature free for 7 days.</p><button class="btn btn--accent" id="trialBtn" type="button">Start free Pro trial</button><p class="status" id="trialStatus" role="status" aria-live="polite"></p></div>
  <p class="hint" id="planHint">Paid plans are billed in crypto (BTC, ETH, USDT and 100+ more) and activate automatically once the network confirms.</p>
  <div id="historyCard" hidden>
    <h3 class="m-0 mt-18 mb-4">Payment history</h3>
    <p class="card-sub">Your past payments and receipts.</p>
    <table class="admin-table" id="historyTable"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead><tbody id="historyBody"></tbody></table>
    <div class="empty" id="historyEmpty" hidden>No payments yet.</div>
    <p class="hint">Receipts are also emailed to your account address after each successful payment.</p>
  </div>
</div>
<div class="lb-widget lb-widget--full" id="settings-integrations">
  <h2>Integrations</h2>
  <p class="card-sub">Stream tools, webhooks, postbacks and Kick rewards.</p>
  <div class="grid2">
    <div class="card" id="kickRewardsCard">
      <h3>Kick rewards</h3>
      <p class="card-sub">Let viewers earn credits by redeeming Kick channel rewards.</p>
      <p class="hint" id="kickStatus">Loading…</p>
      <div class="d-flex gap-8 flex-wrap mt-14">
        <a class="btn btn--sm btn--accent" href="/dashboard/credits" id="kickRewardsLink">Open Kick rewards →</a>
      </div>
    </div>
    <div class="card" id="postbacksCard">
      <h3>Postbacks</h3>
      <p class="card-sub">Receive automatic score updates from your sponsor via postback URLs.</p>
      <p class="hint" id="postbackStatus">Manage postback keys and endpoints in the <a href="/bot/dashboard" target="_blank" rel="noopener noreferrer">bot dashboard</a>.</p>
    </div>
  </div>
  <hr class="hr" />
  <div class="card">
    <h3>Notifications <span class="pill pill--info ml-6">PRO</span></h3>
    <p class="card-sub">Optional alerts when your leaderboard resets or a player breaks into the top 3.</p>
    <div id="notifyBody">
      <div class="field"><label>Events that trigger notifications</label>
        <div class="d-flex gap-8 flex-wrap mb-4">
          <span class="pill pill--muted ic-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>Leaderboard reset</span>
          <span class="pill pill--muted ic-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>Player enters top 3</span>
        </div>
      </div>
      <div class="field"><label for="f_webhook">Discord webhook URL</label>
        <input id="f_webhook" placeholder="https://discord.com/api/webhooks/..." />
        <span class="hint">Create a webhook in your Discord server settings → Integrations → Webhooks. Paste the URL here.</span>
      </div>
      <div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
        <button class="btn btn--sm ic-btn" id="testDiscord" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>Test Discord</button>
        <span class="hint" id="testDiscordStatus" role="status" aria-live="polite"></span>
      </div>
      <div class="field"><label for="f_tgChatId">Telegram chat/group ID</label>
        <input id="f_tgChatId" placeholder="-1001234567890" />
        <span class="hint">The chat or group ID where notifications should be sent. Use <code>/start</code> in your bot chat or add the bot to a group to get the ID.</span>
      </div>
      <div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
        <label class="hint chk"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label>
        <button class="btn btn--sm ic-btn" id="testTelegram" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>Test Telegram</button>
        <span class="hint" id="testTelegramStatus" role="status" aria-live="polite"></span>
      </div>
    </div>
    <div class="empty" id="notifyLock" hidden>Notifications are a Pro feature. <a href="#" id="notifyUpgrade">Upgrade to unlock them</a>.</div>
  </div>
  <hr class="hr" />
  <div id="overlayBody">
    <div class="field"><label>Overlay URL</label>
      <div class="d-flex gap-8 items-center flex-wrap">
        <code id="overlayUrl" class="overlay-url"></code>
        <button class="btn btn--sm btn--accent ic-btn" id="overlayCopy" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy</button>
      </div>
      <span class="hint">Add this as a <b>Browser Source</b> in OBS. Set width to <b>320px</b>, height auto. Check "Shutdown source when not visible" off for live updates.</span>
    </div>
    <div class="mt-14 d-flex gap-8 flex-wrap"><a class="btn btn--sm" id="overlayPreview" href="#" target="_blank" rel="noopener noreferrer">Preview overlay →</a></div>
  </div>
  <div class="empty" id="overlayLock" hidden>OBS Overlay is a Pro feature. <a href="#" id="overlayUpgrade">Upgrade to unlock it</a>.</div>
  <hr class="hr" />
  <div id="domainBody">
    <div class="field"><label for="f_domain">Your domain</label><input id="f_domain" placeholder="board.mystream.com" />
      <span class="hint">Point a <b>CNAME record</b> for your domain to <span class="mono">yourrank.site</span>. Then enter the domain here and click <b>Verify &amp; Provision TLS</b>.</span>
    </div>
    <div class="mt-8 d-flex gap-8 items-center flex-wrap">
      <button class="btn btn--sm btn--accent" id="domainVerify" type="button">Verify &amp; Provision TLS</button>
    </div>
    <div id="domainStatus" class="hint mt-8 min-h-18" role="status" aria-live="polite"></div>
  </div>
  <div class="empty" id="domainLock" hidden>Custom domains are a Pro feature. <a href="#" id="domainUpgrade">Upgrade to unlock it</a>.</div>
</div>
<div class="lb-widget lb-widget--full" id="settings-compliance">
  <h2>Compliance</h2>
  <p class="card-sub">Company identity, legal pages and responsible-gaming messaging.</p>
  <div class="info-notice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg><span>Leave any field blank to use the default legal text provided by YourRank. Your custom text will be shown on your public page at <code>/terms</code>, <code>/privacy</code>, etc.</span></div>
  <div class="legal-editor" id="legalList"></div>
  <div class="legal-footer-preview" id="legalFooterPreview"><b>Footer links preview:</b> <a href="#" onclick="return false">Terms</a> · <a href="#" onclick="return false">Privacy</a> · <a href="#" onclick="return false">Responsible Gaming</a> · <a href="#" onclick="return false">Cookies</a> · <a href="#" onclick="return false">Refund</a> · <a href="#" onclick="return false">Contact</a></div>
</div>
<div class="lb-widget lb-widget--full lb-widget--danger" id="settings-account">
  <h2>Account</h2>
  <p class="card-sub">Export your data or permanently delete your account.</p>
  <div class="d-flex gap-8 items-center flex-wrap">
    <button class="btn btn--accent" id="accExportData" type="button">Download my data</button>
    <span class="hint" id="accExportStatus" role="status" aria-live="polite"></span>
  </div>
  <hr class="hr" />
  <h3 class="m-0 mt-18 mb-4">Danger zone</h3>
  <p class="card-sub">Permanently delete your account and all associated data. This cannot be undone.</p>
  <button class="btn btn--danger" id="deleteAccountBtn" type="button">Delete my account</button>
</div>
<div class="modal" id="deleteAccountModal" role="dialog" aria-modal="true" aria-labelledby="deleteAccountModalTitle" hidden>
  <div class="modal-card">
    <h3 id="deleteAccountModalTitle">Delete your account?</h3>
    <p>This will remove all your data — leaderboards, players, archives, subscriptions, and connected bots. This cannot be undone.</p>
    <div class="field"><label for="deleteAccountConfirm">Type <b>DELETE</b> to confirm</label><input id="deleteAccountConfirm" autocomplete="off" placeholder="DELETE" /></div>
    <div class="field" id="deleteAccountPasswordWrap" hidden><label for="deleteAccountPassword">Enter your password</label><input id="deleteAccountPassword" type="password" autocomplete="current-password" placeholder="Password" /></div>
    <div class="d-flex gap-10 flex-wrap">
      <button class="btn btn--danger" id="deleteAccountConfirmBtn" type="button">Delete my account</button>
      <button class="btn btn--ghost" id="deleteAccountCancelBtn" type="button">Cancel</button>
    </div>
    <p class="status" id="deleteAccountModalStatus" role="status" aria-live="polite"></p>
  </div>
</div>
</div>
</section>
<section class="lb-page" data-page="boards">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><button class="btn btn--sm" id="addBoardFromBoards" type="button">+ New board</button></div>
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
</div>
      </div>
      <div class="savebar" id="savebar" hidden><span class="savebar-hint">Unsaved changes</span><button class="btn btn--accent" id="save" type="button">Save changes</button></div>
      </div>
    </>
  );
}
