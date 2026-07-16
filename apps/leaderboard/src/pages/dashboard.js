import { leaderboardPageHtml } from "../../../../shared/page-shell.js";

// dashboard page
export const dashboardPage = leaderboardPageHtml({
  title: "Dashboard · YourRank",
  canonical: "https://yourrank.site/dashboard",
  reqId: "{{REQ_ID}}",
  noscript: "<p>YourRank requires JavaScript</p><p>Please enable JavaScript in your browser settings to use the dashboard.</p>",
  scripts: ['<script src="/assets/dashboard.js?v=4" type="module"></script>'],
  content: `<div id="loading" class="py-26">
<div class="skel-header"><div><div class="skeleton skeleton-text--lg skel-w-180"></div><div class="skeleton skeleton-text--sm skel-w-260 mt-8"></div></div><div class="skeleton skeleton-text skel-w-90"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-200"></div></div>
<div class="card mt-18"><div class="skeleton skeleton-block skel-h-300"></div></div>
</div>
<div id="dash" hidden>
<div class="toast" id="status" role="status" aria-live="polite"></div>
<div class="lb-shell">
<aside class="lb-side" id="lbSide" aria-label="Dashboard sections">
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
<div class="field field-flex"><label for="nb_casino">Casino</label><input id="nb_casino" placeholder="Stake" /></div>
<div class="field field-flex"><label for="nb_code">Referral code</label><input id="nb_code" placeholder="BTZ" /></div>
<div class="lb-board-form-actions"><button class="btn btn--sm btn--accent" id="nb_create" type="button">Create</button><button class="btn btn--sm btn--ghost" id="nb_cancel" type="button">Cancel</button><div class="hint w-full" id="nb_err" role="alert" aria-live="assertive"></div></div>
</div>
</div>
</div>
<button class="lb-side-close" type="button" aria-label="Close navigation" data-close-side>×</button>
<span class="lb-side-grp">Manage</span>
<button class="lb-nav is-on" type="button" data-nav="overview" aria-current="page"><span class="lb-nav-ic" aria-hidden="true">◱</span>Overview</button>
<button class="lb-nav" type="button" data-nav="boards"><span class="lb-nav-ic" aria-hidden="true">☰</span>Boards</button>
<button class="lb-nav" type="button" data-nav="board"><span class="lb-nav-ic" aria-hidden="true">🏆</span>Prize &amp; players</button>
<button class="lb-nav" type="button" data-nav="design"><span class="lb-nav-ic" aria-hidden="true">🎨</span>Design</button>
<span class="lb-side-grp">Grow</span>
<button class="lb-nav" type="button" data-nav="growth"><span class="lb-nav-ic" aria-hidden="true">📈</span>Analytics</button>
<span class="lb-side-grp">Advanced</span>
<button class="lb-nav" type="button" data-nav="integrations"><span class="lb-nav-ic" aria-hidden="true">🔌</span>Overlay &amp; domain</button>
<button class="lb-nav" type="button" data-nav="manage"><span class="lb-nav-ic" aria-hidden="true">⚙</span>Periods &amp; plan</button>
<div class="lb-side-foot"><span class="label">Editing</span><p class="live-link"><a id="liveLink" href="#" target="_blank">…</a></p><span class="label" id="planBadge">FREE PLAN</span></div>
</aside>
<div class="lb-main">
<section class="lb-page is-on" data-page="overview">
<div class="lb-phead"><button class="lb-menu" id="lbMenu" type="button" aria-label="Show sections" aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Overview</h1><p class="lb-psub">Your leaderboard at a glance</p></div></div>
<div class="lb-qa" aria-label="Quick actions">
<button type="button" data-jump="board"><span class="lb-qa-t">Add players</span><span class="lb-qa-d">Type them in or paste from a spreadsheet</span></button>
<button type="button" data-jump="board"><span class="lb-qa-t">Set the prize</span><span class="lb-qa-d">Prize pool, casino and your code</span></button>
<button type="button" data-jump="design"><span class="lb-qa-t">Pick a design</span><span class="lb-qa-d">One click publishes it</span></button>
<button type="button" id="ov_copyLink"><span class="lb-qa-t">Copy your page link</span><span class="lb-qa-d">Share it anywhere</span></button>
</div>
<div class="stat-tiles">
<div class="stat-tile"><span class="stat-num" id="ov_pool">–</span><span class="stat-lbl">Prize pool</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_players">–</span><span class="stat-lbl">Players</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_views7">–</span><span class="stat-lbl">Views · 7d</span></div>
<div class="stat-tile"><span class="stat-num" id="ov_resets">–</span><span class="stat-lbl">Resets in</span></div>
</div>
<div class="card"><div class="lb-cardhd"><h2>Daily views · 14 days</h2><a href="/dashboard/analytics" class="lb-cardlink">Full analytics →</a></div><div class="stat-chart"><div class="stat-bars" id="ov_bars" title="Daily views, last 14 days"></div><div class="stat-chart-lbl"><span id="ov_barsFrom"></span><span>today</span></div></div><p class="hint" id="ov_barsEmpty" hidden>No views yet — share your page link to get it moving.</p></div>
<div class="card"><div class="lb-cardhd"><h2>Top players</h2><button class="lb-cardlink" type="button" data-jump="board">Manage all →</button></div><div class="lb-toplist" id="ov_top"></div><div class="empty" id="ov_topEmpty" hidden>No players yet. <button class="lb-linkbtn" type="button" data-jump="board">Add your first one →</button></div></div>
<div class="card"><h2>Finish setup</h2><p class="card-sub">A few steps to a page worth sharing.</p><div class="lb-steps" id="ov_steps">
<div class="lb-step" id="ov_step_brand"><span class="lb-step-n">Step 1</span><span class="lb-step-t">Brand &amp; prize</span><span class="lb-step-d">Set your name, code and prize in <button class="lb-linkbtn" type="button" data-jump="board">Prize &amp; players</button>.</span></div>
<div class="lb-step" id="ov_step_players"><span class="lb-step-n">Step 2</span><span class="lb-step-t">Add players</span><span class="lb-step-d">Add or import your ranked list.</span></div>
<div class="lb-step" id="ov_step_share"><span class="lb-step-n">Step 3</span><span class="lb-step-t">Share your link</span><span class="lb-step-d">Drop your page URL in your stream panels and Discord.</span></div>
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
</section>
<section class="lb-page" data-page="board">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Prize &amp; players</h1><p class="lb-psub">The daily job — headline details and your ranked list</p></div></div>
<div class="card"><h2>Brand &amp; prize</h2><p class="card-sub">The headline details on your page.</p><div class="grid2">
<div class="field"><label for="f_name">Display name</label><input id="f_name" /></div>
<div class="field"><label for="f_tagline">Tagline</label><input id="f_tagline" placeholder="Casino streamer & Stake partner" /></div>
<div class="field"><label for="f_casino">Casino</label><input id="f_casino" placeholder="Stake" /></div>
<div class="field"><label for="f_code">Referral code</label><input id="f_code" placeholder="BTZ" /></div>
<div class="field"><label for="f_cta">Referral link</label><input id="f_cta" placeholder="https://stake.com/?c=BTZ" /></div>
<div class="field"><label for="f_pool">Prize pool</label><input id="f_pool" placeholder="$3,500" /></div>
<div class="field"><label for="f_period">Period</label><select id="f_period"><option>Weekly</option><option selected>Monthly</option><option>Season</option></select></div>
<div class="field"><label for="f_ends">Countdown ends (UTC)</label><input id="f_ends" type="datetime-local" /><span class="hint">When the leaderboard resets. Powers the live timer.</span></div></div>
<div class="field"><label for="f_blurb">Partner blurb</label><textarea id="f_blurb" rows="2" placeholder="Short pitch about the casino and your code."></textarea></div></div>
<div class="card"><h2>Players</h2><p class="card-sub">The board auto-sorts by wagered, highest first. Prize <span class="mono">0</span> shows a dash. Names can be masked (keep the <span class="mono">***</span>). <span class="mono" id="pCount"></span></p>
<div class="players-wrap"><table class="players"><thead><tr><th class="rank">#</th><th>Player</th><th class="ta-r">Wagered</th><th class="ta-r">Prize</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
<div id="playersEmpty" class="empty" hidden>No players yet. Add your first one.</div>
<div class="mt-14 d-flex gap-8 flex-wrap items-center"><button class="btn btn--sm" id="addRow">+ Add player</button><button class="btn btn--sm" id="importBtn" type="button">Paste from spreadsheet</button><button class="btn btn--sm" id="csvImportBtn" type="button">📁 Import CSV</button><button class="btn btn--sm btn--ghost" id="csvTemplateBtn" type="button">Download template</button><input type="file" id="csvFileInput" accept=".csv,.tsv,.txt" hidden /><span id="limitMsg" class="hint ml-auto c-muted" role="status" aria-live="polite"></span></div>
<div class="import" id="importPanel" hidden>
<p class="hint mb-8">One player per line: <span class="mono">name, wagered, prize</span> — commas or tabs. Copying straight out of Excel or Google Sheets works. Prize is optional.</p>
<textarea id="importText" rows="6" spellcheck="false" placeholder="*****ess&#9;152000&#9;1500&#10;*****y&#9;98000&#9;700&#10;*****k&#9;61250"></textarea>
<div class="import-foot"><span class="hint" id="importPreview">0 players detected</span>
<label class="hint chk"><input type="checkbox" id="importReplace" checked /> Replace current list</label>
<button class="btn btn--sm btn--accent" id="importApply" type="button" disabled>Add to table</button></div></div></div>
</section>
<section class="lb-page" data-page="design">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Design</h1><p class="lb-psub">How your public page looks</p></div></div>
<div class="card" id="templateCard"><h2>Page template</h2><p class="card-sub">Live previews use this board's real name, prize pool and players. Click a design to publish it instantly.</p>
<input type="hidden" id="f_template" value="classic" />
<div class="template-grid" id="templateGallery" aria-label="Page templates"></div>
<p class="hint template-status" id="templateStatus" role="status" aria-live="polite"></p></div>
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
</div></div>
<div class="empty" id="brandLock" hidden>Branding is a Pro feature. <a href="#" id="brandUpgrade">Upgrade to unlock it</a>.</div></div>
</section>
<section class="lb-page" data-page="integrations">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Overlay &amp; domain</h1><p class="lb-psub">Extras for your stream and site — overlay, your own domain, and alerts</p></div></div>
<div class="card" id="overlayCard"><h2>OBS Stream Overlay <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Add a live leaderboard overlay to your stream. It auto-updates every 15 seconds with smooth rank animations.</p>
<div id="overlayBody">
<div class="field"><label>Overlay URL</label>
<div class="d-flex gap-8 items-center flex-wrap">
<code id="overlayUrl" class="overlay-url"></code>
<button class="btn btn--sm btn--accent" id="overlayCopy" type="button">📋 Copy</button>
</div>
<span class="hint">Add this as a <b>Browser Source</b> in OBS. Set width to <b>320px</b>, height auto. Check "Shutdown source when not visible" off for live updates.</span></div>
<div class="mt-14 d-flex gap-8 flex-wrap">
<a class="btn btn--sm" id="overlayPreview" href="#" target="_blank">Preview overlay →</a>
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
<div class="card" id="notifyCard"><h2>Notifications <span class="pill pill--info ml-6">PRO</span></h2><p class="card-sub">Get alerted when your leaderboard resets or a player breaks into the top 3. Discord and Telegram supported.</p>
<div id="notifyBody">
<div class="field"><label>Events that trigger notifications</label>
<div class="d-flex gap-8 flex-wrap mb-4">
<span class="pill pill--muted">🔄 Leaderboard reset</span>
<span class="pill pill--muted">🏆 Player enters top 3</span>
</div></div>
<div class="field"><label for="f_webhook">Discord webhook URL</label>
<input id="f_webhook" placeholder="https://discord.com/api/webhooks/..." />
<span class="hint">Create a webhook in your Discord server settings → Integrations → Webhooks. Paste the URL here.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<button class="btn btn--sm" id="testDiscord" type="button">📨 Test Discord</button>
<span class="hint" id="testDiscordStatus" role="status" aria-live="polite"></span>
</div>
<div class="field"><label for="f_tgChatId">Telegram chat/group ID</label>
<input id="f_tgChatId" placeholder="-1001234567890" />
<span class="hint">The chat or group ID where notifications should be sent. Use <code>/start</code> in your bot chat or add the bot to a group to get the ID.</span></div>
<div class="d-flex gap-8 items-center flex-wrap mt-n8 mb-16">
<label class="hint chk"><input type="checkbox" id="f_tgNotify" /> Enable Telegram notifications</label>
<button class="btn btn--sm" id="testTelegram" type="button">📨 Test Telegram</button>
<span class="hint" id="testTelegramStatus" role="status" aria-live="polite"></span>
</div>
</div>
<div class="empty" id="notifyLock" hidden>Notifications are a Pro feature. <a href="#" id="notifyUpgrade">Upgrade to unlock them</a>.</div></div>
</section>
<section class="lb-page" data-page="manage">
<div class="lb-phead"><button class="lb-menu" type="button" aria-label="Show sections" data-menu aria-expanded="false" aria-controls="lbSide">☰</button><div><h1 tabindex="-1">Periods &amp; plan</h1><p class="lb-psub">Close out a period and manage your plan</p></div></div>
<div class="card" id="archiveCard"><h2>Past winners</h2><p class="card-sub">When a period ends, close it out: the current board is saved and shown on your page under "Past Winners". Saves your unsaved edits first.</p>
<div class="arch-form">
<div class="field field-flex"><label for="a_label">Label</label><input id="a_label" placeholder="July 2026" /></div>
<div class="field m-0"><label for="a_clear">Then</label><select id="a_clear"><option value="wagers">Reset all wagers to 0</option><option value="players">Clear the player list</option><option value="none">Keep the board as is</option></select></div>
<button class="btn btn--accent self-end" id="a_go" type="button">Close out period</button></div>
<div class="arch-list" id="archList"></div>
<div class="empty" id="archEmpty" hidden>No closed-out periods yet. Your first one shows up here and on your page.</div></div>
<div class="card" id="planCard"><h2>Plan &amp; billing</h2><p class="card-sub">Upgrade to unlock more players, boards and features.</p>
<div class="plan-row"><div><div class="plan-name" id="planName">Free</div><div class="hint" id="planMeta">Up to 10 players · YourRank badge on your page</div></div>
<button class="btn btn--accent" id="goPro">Upgrade</button></div>
<p class="hint" id="planHint">Pay with crypto (BTC, ETH, USDT and 100+ more). Activates automatically once the network confirms — usually a few minutes. <a href="/dashboard/billing">See all plans</a>.</p></div>
</section>
</div>
</div>
<div class="savebar" id="savebar" hidden><span class="savebar-hint">Unsaved changes</span><button class="btn btn--accent" id="save" type="button">Save changes</button></div></div>`
});
