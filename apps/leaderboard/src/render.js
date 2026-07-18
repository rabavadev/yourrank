// Server-render a streamer's leaderboard page from their data.
import { templateCss, validTemplate } from "./templates/index.js";
import { DEFAULT_EXTRA } from "./site.js";
import { applyCasinoText, CASINO_COMPOSERS, CASINO_FULL, frameCss } from "./templates/casino.js";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// E2E-009: Sanitize user-supplied URLs for href attributes.
// Only allows https:// URLs (rejects http://, javascript:, data:, vbscript:).
// Also escapes HTML entities to prevent attribute breakout XSS.
const safeUrl = (u) => {
  const s = String(u ?? "").trim();
  if (!/^https:\/\//i.test(s)) return "#";
  return encodeURI(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const shareCss = `
.share-sec{padding:24px 4vw;max-width:var(--wrap,1140px);margin:0 auto;text-align:center;border-top:1px solid var(--line,rgba(150,120,220,.3))}
.share-title{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute,#9a9aa2);margin:0 0 12px}
.share-btns{display:inline-flex;flex-wrap:wrap;gap:10px;justify-content:center}
.share-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;padding:8px 16px;border-radius:8px;border:1px solid var(--line,rgba(150,120,220,.3));background:var(--panel-2,#141417);color:var(--ink,#ededf0);font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;transition:border-color .15s,transform .05s}
.share-btn:hover{border-color:var(--accent,#c8ff00);color:var(--accent,#c8ff00)}
.share-btn:active{transform:translateY(1px)}
`;

function shareSection(pageUrl, name) {
  const u = encodeURIComponent(pageUrl);
  const text = encodeURIComponent(`Check out ${name} leaderboard`);
  const safe = (s) => String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<section class="share-sec" aria-label="Share this board">
<h3 class="share-title">Share this board</h3>
<div class="share-btns">
  <button class="share-btn" data-share="copy" data-url="${safe(pageUrl)}" type="button">Copy link</button>
  <a class="share-btn" href="https://twitter.com/intent/tweet?url=${u}&text=${text}" target="_blank" rel="noopener">𝕏</a>
  <a class="share-btn" href="https://t.me/share/url?url=${u}&text=${text}" target="_blank" rel="noopener">Telegram</a>
  <a class="share-btn" href="https://api.whatsapp.com/send?text=${text}%20${u}" target="_blank" rel="noopener">WhatsApp</a>
</div>
</section>`;
}

// ---------------------------------------------------------------------------
// Page composition. Every template shares the same client contract (each
// data-* hook appears exactly once per page for single-element hooks like
// data-rows/data-top3/data-timer-grid/data-countdown/data-count), but the
// reference-based templates each get their OWN page structure: a different
// hero, prize/countdown treatment, section order and framing. buildParts()
// produces the shared, escaped building blocks; composeMain() assembles them
// per template. The default composition preserves the classic page exactly.
// ---------------------------------------------------------------------------
function buildParts(c) {
  const { b, hasCasino, casino, period, pool, hasCta, ctaHref, hasPartner, hasCode, code, blurb, whyStats, socials } = c;
  const name = esc(b.name);
  const streamWindow = `<div class="stream-window" aria-hidden="true"><div class="sw-bar"><span class="sw-dots"><i></i><i></i><i></i></span><span class="sw-title">Kick Stream</span></div>
<div class="sw-body"><div class="sw-live"><span class="live-dot"></span> LIVE</div><div class="sw-play"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div class="sw-name" data-brand-name>${name}</div></div></div>`;
  const ctaBtn = (label, cls = "btn btn--grad") => hasCta ? `<a class="${cls}" data-cta href="${ctaHref}" target="_blank" rel="noopener">${label}</a>` : "";
  const joinLabel = hasCasino ? `Join <span data-casino>${esc(casino)}</span>` : "Join now";
  const timerGrid = `<div class="timer-grid" data-timer-grid><div class="tcell"><b data-t="d">--</b><span>Days</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="h">--</b><span>Hours</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="m">--</b><span>Mins</span></div><div class="tsep">:</div>
<div class="tcell"><b data-t="s">--</b><span>Secs</span></div></div>`;
  const partnerPanel = hasPartner ? `<section id="partner" class="panel">${hasCasino ? `<div class="panel-badge">Official Partner</div>` : ""}<div class="panel-grid">
<div class="pcol pcol-about"><p class="pcol-blurb" data-partner-blurb>${esc(blurb)}</p><ul class="chips" data-chips></ul></div>
${hasCode ? `<div class="pcol pcol-code"><span class="pcol-label">Exclusive Code</span><div class="code-box"><span class="code-val" data-code>${esc(code)}</span></div>
<button class="btn btn--full btn--code" data-copy-code>Copy Code</button><span class="sr-only" data-copy-status aria-live="polite"></span>
${hasCta ? `<a class="btn btn--full btn--grad" data-cta href="${ctaHref}" target="_blank" rel="noopener">${hasCasino ? `Join us on <span data-casino>${esc(casino)}</span>` : "Join now"}</a>` : ""}</div>` : ""}
${whyStats.length ? `<div class="pcol pcol-why"><span class="pcol-label">Why ${hasCasino ? `<span data-casino>${esc(casino)}</span>` : "us"}</span><div class="why-grid" data-why></div></div>` : ""}</div></section>` : "";
  const announce = `<div class="sr-only" aria-live="polite" id="lb-announce"></div>`;
  const payouts = `<div class="payouts" data-payouts hidden></div>`;
  const top3 = `<div class="top3" data-top3></div>`;
  const findRank = `<div class="find-rank-bar"><div class="find-rank-wrap"><button type="button" aria-label="Search" class="find-rank-icon"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg></button><input class="find-rank-input" type="text" placeholder="Find your rank..." data-find-rank aria-label="Search for your rank" /></div><span class="find-rank-result" data-find-result role="status" aria-live="polite"></span></div>`;
  const table = `<div class="table" role="table" aria-label="Leaderboard standings"><div class="t-head" role="row"><span role="columnheader">#</span><span role="columnheader">Player</span><span class="ta-r" role="columnheader">Wagered</span><span class="ta-r" role="columnheader">Prize</span></div>
<div class="t-rows" role="rowgroup" data-rows></div></div>`;
  const rules = `<details class="rules"><summary>Leaderboard rules — how wager counts</summary><ol class="rules-list" data-rules></ol></details>`;
  const pastSec = `<section id="past" class="past-sec" data-past hidden><h2 class="sec-title center">Past Winners</h2><p class="sec-sub center">Every closed-out period, on the record.</p>
<div class="past-grid" data-past-grid></div></section>`;
  const socialsSec = socials.length ? `<section id="socials" class="socials-sec"><h2 class="sec-title center">Join the Socials</h2><p class="sec-sub center">More giveaways and promotions across every platform.</p>
<div class="social-cards" data-socials></div></section>` : "";
  const titleGroup = `<div class="board-title-group"><h2 class="sec-title">Standings</h2><span class="player-count-badge" data-player-count-badge></span><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></div>`;
  const poolSpan = pool ? `<span data-pool>${esc(pool)}</span>` : `<span data-pool></span>`;
  const periodSpan = `<span data-period>${esc(period)}</span>`;
  return { ...c, name, streamWindow, ctaBtn, joinLabel, timerGrid, partnerPanel, announce, payouts, top3, findRank, table, rules, pastSec, socialsSec, titleGroup, poolSpan, periodSpan };
}

// The classic page: stream-window hero, partner panel, board, past, socials.
function composeDefault(p) {
  const { name, heroLogo, hasCasino, casino, period, pool, ctaBtn, joinLabel, timerGrid } = p;
  return `<section class="hero">${p.streamWindow}
${heroLogo}<p class="hero-kicker">Welcome to</p><h1 class="hero-name" data-brand-name>${name}</h1>
<p class="hero-sub">${hasCasino ? `<span data-casino>${esc(casino)}</span> partner · ` : ""}<span data-period>${esc(period)}</span> leaderboard</p>
<div class="hero-cta">${ctaBtn(joinLabel)}<a class="btn btn--ghost" href="#board">Leaderboard</a></div>
<div class="hero-timer" data-timer><p class="timer-label">${pool ? `<span data-pool>${esc(pool)}</span> leaderboard resets in` : "Leaderboard resets in"}</p>
${timerGrid}</div></section>
${p.partnerPanel}
${p.announce}<section id="board" class="board"><div class="board-head">
<p class="eyebrow">${pool ? `<span data-pool>${esc(pool)}</span> · ` : ""}<span data-period>${esc(period)}</span> Leaderboard</p>
${p.titleGroup}<div class="board-meta">
<span class="bm"><b class="countdown" data-countdown>--</b><span>Resets in</span></span>
<span class="bm"><b data-count>0</b><span>Players</span></span></div></div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.pastSec}
${p.socialsSec}`;
}

// quest — app-style: compact centered header with info chips, standings first,
// partner content demoted below the board.
function composeQuest(p) {
  return `<section class="hero hero--app">${p.heroLogo}<h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.hasCasino ? `<span data-casino>${esc(p.casino)}</span> partner · ` : ""}${p.periodSpan} leaderboard</p>
<div class="app-chips"><span class="app-chip app-chip--pool">🏆 ${p.poolSpan}</span><span class="app-chip">⏳ <b class="countdown" data-countdown>--</b></span><span class="app-chip"><b data-count>0</b> players</span></div>
<div class="hero-cta">${p.ctaBtn(p.joinLabel)}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head board-head--center">
${p.titleGroup}</div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// vault — split hero: pitch on the left, a boxed prize-pool + race-countdown
// card on the right, then a stat strip. Matches the approved casino mockup.
function composeVault(p) {
  return `<section class="hero hero--split"><div class="split-grid">
<div class="split-copy">${p.heroLogo}<p class="hero-kicker">${p.hasCasino ? `<span data-casino>${esc(p.casino)}</span> partner board` : "Wager race"}</p><h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.periodSpan} wager race — climb the board, take the prizes.</p>
<div class="hero-cta">${p.ctaBtn(p.joinLabel)}<a class="btn btn--ghost" href="#board">Standings</a></div></div>
<div class="prize-card"><span class="prize-card-label">Prize pool</span><b class="prize-card-pool">${p.poolSpan}</b>
<div class="hero-timer" data-timer><p class="timer-label">Race ends in</p>
${p.timerGrid}</div></div></div>
<div class="stat-strip"><div class="ss"><span class="ss-label">Players</span><b class="ss-val" data-count>0</b></div><div class="ss"><span class="ss-label">Period</span><b class="ss-val">${p.periodSpan}</b></div><div class="ss"><span class="ss-label">Status</span><b class="ss-val"><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></b></div></div></section>
${p.announce}<section id="board" class="board"><div class="board-head board-head--center">
<div class="board-title-group"><h2 class="sec-title">Standings</h2><span class="player-count-badge" data-player-count-badge></span></div></div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// tournament — the countdown IS the hero: giant race clock front and center,
// prize pool as the supporting line.
function composeTournament(p) {
  return `<section class="hero hero--clock">${p.heroLogo}<p class="hero-kicker" data-brand-name>${p.name}</p>
<h1 class="clock-title">Race ends in</h1>
<div class="hero-timer" data-timer>${p.timerGrid}</div>
<p class="clock-sub">${p.poolSpan} prize pool · ${p.periodSpan} race · <b data-count>0</b> players</p>
<div class="hero-cta">${p.ctaBtn(p.joinLabel)}<a class="btn btn--ghost" href="#board">Standings</a></div></section>
${p.announce}<section id="board" class="board"><div class="board-head board-head--center">
${p.titleGroup}</div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// champion — broadcast-banner hero: identity left, prize + clock right, then
// straight into the pedestal stage. Partner panel demoted below the board.
function composeChampion(p) {
  return `<section class="hero hero--banner"><div class="banner-grid">
<div class="banner-id">${p.heroLogo}<h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.hasCasino ? `<span data-casino>${esc(p.casino)}</span> partner · ` : ""}${p.periodSpan} leaderboard</p></div>
<div class="banner-facts"><div class="bf"><span class="bf-label">Prize pool</span><b class="bf-val">${p.poolSpan}</b></div>
<div class="bf"><span class="bf-label">Ends in</span><b class="bf-val countdown" data-countdown>--</b></div>
<div class="bf"><span class="bf-label">Players</span><b class="bf-val" data-count>0</b></div>
${p.ctaBtn(p.joinLabel)}</div></div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head board-head--center">
${p.titleGroup}</div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// terminal — the whole board lives inside one terminal window: title bar,
// prompt-style status lines, dense table. No marketing hero at all.
function composeTerminal(p) {
  return `<div class="term-window"><div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title">~/leaderboard — <span data-brand-name>${p.name}</span></span></div>
<div class="term-body"><section class="hero hero--term"><p class="term-line"><span class="term-prompt">$</span> race --period ${p.periodSpan}${p.pool ? ` --pool ${p.poolSpan}` : `${p.poolSpan}`}</p>
<p class="term-line term-line--dim">resets_in <b class="countdown" data-countdown>--</b> · players <b data-count>0</b> · <span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></p>
<div class="hero-cta">${p.ctaBtn(`&gt; ${p.hasCasino ? `join <span data-casino>${esc(p.casino)}</span>` : "join now"}`, "btn btn--term")}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head"><h2 class="sec-title"><span class="term-prompt">$</span> standings</h2><span class="player-count-badge" data-player-count-badge></span></div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section></div></div>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// rewards — one centered treasure card: prize pool + race clock + CTA in a
// single hero card, then podium and standings.
function composeRewards(p) {
  return `<section class="hero hero--card">${p.heroLogo}<h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.hasCasino ? `<span data-casino>${esc(p.casino)}</span> partner · ` : ""}${p.periodSpan} rewards race</p>
<div class="reward-card"><span class="reward-label">🎁 Prize pool</span><b class="reward-pool">${p.poolSpan}</b>
<div class="hero-timer" data-timer><p class="timer-label">Ends in</p>
${p.timerGrid}</div>
${p.ctaBtn(p.joinLabel, "btn btn--grad btn--full")}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head board-head--center">
${p.titleGroup}</div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

// amber — command-rail layout: a sticky left rail carries the identity,
// prize, clock and partner code; standings own the right column.
function composeAmber(p) {
  return `<div class="rail-layout"><aside class="rail"><section class="hero hero--rail">${p.heroLogo}<h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.hasCasino ? `<span data-casino>${esc(p.casino)}</span> partner · ` : ""}${p.periodSpan} race</p>
<div class="rail-fact"><span class="rail-label">Prize pool</span><b class="rail-val">${p.poolSpan}</b></div>
<div class="rail-fact"><span class="rail-label">Resets in</span><b class="rail-val countdown" data-countdown>--</b></div>
<div class="rail-fact"><span class="rail-label">Players</span><b class="rail-val" data-count>0</b></div>
<div class="hero-cta">${p.ctaBtn(p.joinLabel, "btn btn--grad btn--full")}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.partnerPanel}</aside>
<div class="rail-main">${p.announce}<section id="board" class="board"><div class="board-head">
${p.titleGroup}</div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section></div></div>
${p.pastSec}
${p.socialsSec}`;
}

// copper — winners' gallery: the top-3 podium lives inside the hero as the
// page's centerpiece; the table below is a quiet "top users" ledger.
function composeCopper(p) {
  return `<section class="hero hero--gallery">${p.heroLogo}<p class="hero-kicker">${p.periodSpan} champions</p><h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.poolSpan} prize pool · resets in <b class="countdown" data-countdown>--</b></p>
${p.top3}
<div class="hero-cta">${p.ctaBtn(p.joinLabel)}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head">
<div class="board-title-group"><h2 class="sec-title">Top players</h2><span class="player-count-badge" data-player-count-badge></span><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></div></div>
${p.payouts}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}
${p.socialsSec}`;
}

const COMPOSERS = {
  quest: composeQuest,
  vault: composeVault,
  tournament: composeTournament,
  champion: composeChampion,
  terminal: composeTerminal,
  rewards: composeRewards,
  amber: composeAmber,
  copper: composeCopper,
  ...CASINO_COMPOSERS,
};

function composeMain(tpl, parts, text) {
  let html = (COMPOSERS[tpl] || composeDefault)(parts);
  if (CASINO_FULL.has(tpl)) html = applyCasinoText(html, tpl, text);
  return html;
}

function footerDisclaimer(hasCasino, name, casino) {
  const base = "18+ only. For entertainment purposes only.";
  const gambling = hasCasino ? " Gambling can be addictive. Please play responsibly. BeGambleAware.org." : "";
  const affiliate = hasCasino && name && casino ? ` ${esc(name)} is not affiliated with ${esc(casino)}.` : "";
  const nonCasino = !hasCasino ? " Play responsibly." : "";
  return `${base}${gambling}${nonCasino}${affiliate}`;
}

export function renderLeaderboard(data, opts = {}) {
  const b = data.brand || {};
  const br = data.branding || {};
  // Template: which visual skin renders this page. Falls back to "classic".
  const tpl = validTemplate(br.template);
  const fullPage = CASINO_FULL.has(tpl);
  const frameCssStr = fullPage ? frameCss(tpl) : "";
  const tplCssStr = templateCss(tpl) + frameCssStr;
  const tplCss = tplCssStr ? `<style nonce="${opts.nonce}" data-template="${tpl}">${tplCssStr}</style>` : "";
  const previewCss = opts.preview ? `<style nonce="${opts.nonce}">
html{background:var(--bg)}body[data-preview]{min-width:1100px;overflow:hidden}
body[data-preview] .nav,body[data-preview] .field,body[data-preview] .watermarks,body[data-preview] .stream-window,
body[data-preview] .panel,body[data-preview] .find-rank-bar,body[data-preview] .rules,body[data-preview] .past-sec,
body[data-preview] .socials-sec,body[data-preview] .ftr,body[data-preview] .rk-badge,body[data-preview] .share-sec{display:none!important}
body[data-preview] .hero{min-height:350px;padding:58px 4vw 24px}
body[data-preview] .hero-name{font-size:88px}
body[data-preview] .hero-sub{margin:.65rem auto 1rem}
body[data-preview] .hero-timer{margin-top:1rem}
body[data-preview] .board{width:92%;padding:28px 0 50px}
body[data-preview] .board-head{margin-bottom:18px}
body[data-preview] .top3{margin-bottom:14px}
</style>` : "";
  // Free-plan pages carry the badge — it's how YourRank spreads.
  const badge = opts.watermark
    ? `<aside aria-label="YourRank branding"><a class="rk-badge" href="${esc(opts.homeUrl || "/")}" target="_blank" rel="noopener">⚡ Powered by <b>YourRank</b></a></aside>`
    : "";
  // Pro theme: one gradient pair drives the page accents. Validated hex only.
  const themeCss = (!opts.watermark && HEX.test(br.accentA || "") && HEX.test(br.accentB || ""))
    ? `<style nonce="${opts.nonce}">:root{--cy:${br.accentA};--bl:${br.accentB};--grad-name:linear-gradient(100deg,${br.accentA} 0%,${br.accentB} 100%);--grad-cta:linear-gradient(100deg,${br.accentA},${br.accentB})}</style>`
    : "";
  // Public hub: when the streamer runs more than one published board (e.g. one
  // per sponsor), render a tab strip so viewers can switch between them. Links
  // are relative to the primary domain, so they only render off custom domains.
  const boards = Array.isArray(opts.boards) ? opts.boards : [];
  const boardTabs = boards.length > 1
    ? `<nav class="board-tabs" aria-label="Leaderboards"><div class="board-tabs-inner">${boards.map((bd) => {
        const active = bd.slug === opts.slug;
        return `<a class="board-tab${active ? " board-tab--active" : ""}"${active ? ' aria-current="page"' : ""} href="/${esc(bd.slug)}">${esc(bd.name)}</a>`;
      }).join("")}</div></nav>`
    : "";
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const heroLogo = logo ? `<img class="hero-logo" src="${logo}" alt="${esc(b.name)} logo" />` : "";
  const isCustomDomain = !!opts.isCustomDomain;
  const home = String(opts.homeUrl || "https://yourrank.site").replace(/\/$/, "");
  const pageUrl = isCustomDomain ? home : `${home}/${esc(opts.slug || "")}`;
  const canonicalUrl = esc(pageUrl);
  const legalHref = (page) => isCustomDomain ? `/${page}` : `/${esc(opts.slug || "")}/${page}`;

  // A brand-new board has no casino/code/prize configured yet. Rendering the
  // "Official Partner" badge, casino perks and an empty code box on an
  // unconfigured page publishes claims the owner never made — a trust/legal
  // problem. Gate every partner-specific element on real configuration and fall
  // back to neutral, honest copy until the owner fills things in.
  const casino = (b.casino || "").trim();
  const code = (b.code || "").trim();
  const pool = (b.prizePool || "").trim();
  const period = (b.period || "Monthly");
  const blurb = ((data.partner && data.partner.blurb) || "").trim();
  const whyStats = Array.isArray(data.whyStats) ? data.whyStats : [];
  const socials = Array.isArray(data.socials) ? data.socials : [];
  const chips = Array.isArray(data.partner?.chips) ? data.partner.chips : [];
  const hasCasino = !!casino;
  const hasCode = !!code;
  const ctaHref = opts.slug ? esc(`/go/${opts.slug}`) : safeUrl(b.ctaUrl);
  // Only surface a "Join" CTA when the owner actually configured a referral
  // destination (a casino, a code, or an explicit CTA URL). Otherwise /go/<slug>
  // just loops back to the same page — a dead-end button on a fresh board.
  const hasCta = !!(b.ctaUrl) || hasCasino || hasCode;
  const hasPartner = hasCasino || hasCode || !!blurb || chips.length > 0 || whyStats.length > 0;

  const fullPageHeader = fullPage
    ? `<header class="site-header--full"><a class="site-header--full__brand" href="#top">${navLogo}<span data-brand-name>${esc(b.name)}</span></a><nav class="site-header--full__nav" aria-label="Page sections"><a href="#top">Leaderboard</a><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a><a href="${legalHref("responsible")}">Responsible</a></nav></header>`
    : "";
  const fullPageFooter = fullPage
    ? `<footer class="site-footer--full"><div class="site-footer--full__brand" data-brand-name>${esc(b.name)}</div><div class="site-footer--full__tag" data-tagline>${esc(b.tagline)}</div><p class="site-footer--full__fine">${footerDisclaimer(hasCasino, b.name, casino)}</p><div class="site-footer--full__links"><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a><a href="${legalHref("responsible")}">Responsible</a><a href="${legalHref("cookies")}">Cookies</a><a href="${legalHref("refund")}">Refund</a><a href="${legalHref("contact")}">Contact</a></div><p class="site-footer--full__copy">© <span data-year></span> <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`
    : "";

  // Homepage/brand fallback preview image (1200×630). Served by the Worker at
  // /og.png so shares don't render blank. A board's own logo still wins.
  const ogFallback = `${esc(home)}/og.png`;
  const ogImageUrl = logo || ogFallback;
  const shareHtml = shareSection(pageUrl, b.name || "Leaderboard");
  const ogImage = `<meta property="og:image" content="${ogImageUrl}" /><meta name="twitter:image" content="${ogImageUrl}" />`;
  const twitterCard = logo ? "summary_large_image" : "summary";
  const title = hasCasino ? `${esc(b.name)} | ${esc(casino)} Leaderboard` : `${esc(b.name)} — Leaderboard`;
  const ogTitle = hasCasino ? `${esc(b.name)} | ${esc(casino)}` : `${esc(b.name)} — Leaderboard`;
  const desc = (hasCasino && hasCode)
    ? `${esc(b.name)} x ${esc(casino)}. Use code ${esc(code)} and compete in the ${esc(pool ? pool + " " : "")}${esc(period.toLowerCase())} leaderboard.`
    : `${esc(b.name)}'s ${esc(period.toLowerCase())} leaderboard${pool ? ` — compete for the ${esc(pool)} prize pool` : ""}.`;
  const dataJson = JSON.stringify(data).replace(/</g, "\\u003c");
  const sections = { ...DEFAULT_EXTRA.sections, ...(data.sections || {}) };
  const textOverrides = (br && br.text) || {};
  const sectionAttrs = Object.entries(sections).map(([k, v]) => `data-sections-${k}="${String(v)}"`).join(" ");
  const sectionCss = `<style nonce="${opts.nonce}">
body[data-sections-hero="false"] .hero,
body[data-sections-top3="false"] .top3,
body[data-sections-search="false"] .find-rank-bar,
body[data-sections-rules="false"] .rules,
body[data-sections-partner="false"] #partner,
body[data-sections-socials="false"] .socials-sec,
body[data-sections-pastWinners="false"] .past-sec,
body[data-sections-countdown="false"] .hero-timer,
body[data-sections-countdown="false"] .countdown,
body[data-sections-cta="false"] .hero-cta,
body[data-sections-payouts="false"] .payouts { display: none !important; }
</style>`;
  const profileLinkCss = `<style nonce="${opts.nonce}">.yr-profile-link{color:inherit;text-decoration:none;cursor:pointer}.yr-profile-link:hover{text-decoration:underline;opacity:.85}</style>`;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title><meta name="description" content="${desc}" />
<meta property="og:title" content="${ogTitle}" /><meta property="og:description" content="${desc}" /><meta property="og:type" content="website" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta name="twitter:card" content="${twitterCard}" /><meta name="twitter:title" content="${ogTitle}" /><meta name="twitter:description" content="${desc}" />${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&family=Press+Start+2P&family=Fredoka+One&family=Orbitron:wght@400;700;900&family=Pacifico&family=Baloo+2:wght@400;600;800&family=Cormorant+Garamond:wght@400;600;700&family=Rye&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" media="print" data-async />
<script nonce="${opts.nonce}">document.querySelector('link[data-async]').onload=function(){this.media='all'};</script>
<noscript><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&family=Press+Start+2P&family=Fredoka+One&family=Orbitron:wght@400;700;900&family=Pacifico&family=Baloo+2:wght@400;600;800&family=Cormorant+Garamond:wght@400;600;700&family=Rye&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" /></noscript>
${fullPage ? "" : `<link rel="stylesheet" href="/assets/leaderboard.css" />`}
${tplCss}
${themeCss}
${profileLinkCss}
${sectionCss}
${previewCss}
<style nonce="${opts.nonce}">${shareCss}</style>
<script nonce="${opts.nonce}" type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":${JSON.stringify(title)},"description":${JSON.stringify(desc)},"numberOfItems":${data.players ? data.players.length : 0}}</script>
</head><body data-template="${tpl}"${opts.preview ? " data-preview" : ""}${opts.demo ? " data-demo" : ""} ${sectionAttrs}>
<noscript><p class="noscript-noscroll">This leaderboard requires JavaScript for live updates. The data shown below may not refresh automatically.</p></noscript>
${opts.demo ? `<div class="demo-bar" role="region" aria-label="Demo notice"><span class="demo-bar-txt">You're viewing a live <b>YourRank</b> demo board.</span><a class="demo-bar-cta" href="${esc(`${opts.homeUrl || ""}/signup`)}" target="_top">Create your free page →</a><a class="demo-bar-home" href="${esc(opts.homeUrl || "/")}" target="_top">Back to YourRank</a></div>` : ""}
<a class="skip-link" href="#board">Skip to leaderboard</a>
${fullPageHeader}
${fullPage ? "" : `<div class="field" aria-hidden="true"></div><div class="watermarks" data-watermarks aria-hidden="true"></div>
<header class="nav"><a class="nav-brand" href="#top">${navLogo}<span data-brand-name>${esc(b.name)}</span></a>
<button class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
<nav class="nav-links" aria-label="Page sections">${hasPartner ? `<a href="#partner">Partner</a>` : ""}<a href="#board">Leaderboard</a>${socials.length ? `<a href="#socials">Socials</a>` : ""}</nav></header>`}
${boardTabs}
<main id="top">
${composeMain(tpl, buildParts({ b, esc, heroLogo, hasCasino, casino, period, pool, hasCta, ctaHref, hasPartner, hasCode, code, blurb, whyStats, socials }), textOverrides)}</main>
${shareHtml}
${fullPageFooter}
${fullPage ? "" : `<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div>
<p class="ftr-fine">${footerDisclaimer(hasCasino, b.name, casino)}</p>
<p class="ftr-copy">© <span data-year></span> <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`}
${badge}${fullPage ? `<script src="/assets/casino/${tpl}.js" nonce="${opts.nonce}"></script>` : ""}<script nonce="${opts.nonce}">window.__SITE_DATA__=${dataJson};window.__SLUG__=${JSON.stringify(opts.slug || "")};</script><script src="/assets/leaderboard.js"></script>
</body></html>`;
}

const LEGAL_TITLES = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  responsible: "Responsible Gaming",
  cookies: "Cookie Policy",
  refund: "Refund & Cancellation Policy",
  contact: "Contact",
};

function defaultLegalBody(page, brand) {
  const name = esc(brand || "This leaderboard");
  switch (page) {
    case "terms":
      return `<h2>Terms of Service</h2><p>Welcome to the ${name} leaderboard page. By viewing or participating you agree to these terms.</p><p>${name} is responsible for the rules, prizes, and player standings shown here. YourRank provides the hosting platform only and does not operate any gambling or wagering services.</p><p>You must be 18 or older to participate. ${name} may update these terms at any time. For questions, use the Contact page.</p>`;
    case "privacy":
      return `<h2>Privacy Policy</h2><p>${name} values your privacy. This page collects only the information needed to display the leaderboard, such as player names and scores.</p><p>Public pages are visible to anyone with the link. Do not share personal information you do not want made public.</p><p>We use essential cookies and basic analytics to keep the service running. You can contact ${name} through the Contact page for data questions.</p>`;
    case "responsible":
      return `<h2>Responsible Gaming</h2><p>${name} is provided for entertainment purposes only. Gambling can be addictive and should be enjoyed in moderation, never as a source of income.</p><p>If you or someone you know needs help, reach out to a local responsible-gaming organisation:</p><ul><li><a href="https://www.begambleaware.org" target="_blank" rel="noopener">BeGambleAware</a> — UK advice and support</li><li><a href="https://www.loketkansspel.nl" target="_blank" rel="noopener">Loket Kansspel</a> — Netherlands (in Dutch)</li><li><a href="https://www.connexontario.ca" target="_blank" rel="noopener">ConnexOntario</a> — Canada</li><li><a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener">Gambling Therapy</a> — international, multilingual</li></ul><p>This page is intended for adults 18 and older only.</p>`;
    case "cookies":
      return `<h2>Cookie Policy</h2><p>${name} uses cookies and similar technologies to provide the leaderboard service and to understand how visitors use the page.</p><p>Essential cookies are required for the page to function. Analytics cookies help us improve the experience. You can adjust your browser settings to manage cookies.</p>`;
    case "refund":
      return `<h2>Refund & Cancellation Policy</h2><p>${name} sets its own refund policy for any prizes, subscriptions, or promotions offered through this page.</p><p>If you have questions about a specific prize or payment, please contact ${name} through the Contact page. YourRank subscription payments made in cryptocurrency are final once confirmed on the blockchain.</p>`;
    case "contact":
      return `<h2>Contact</h2><p>For questions about this leaderboard, its rules, or prizes, please reach out to ${name} directly through the social channels shown on the leaderboard.</p><p>For platform issues with YourRank, email contact@yourrank.site.</p>`;
    default:
      return `<p>Legal page for ${name}.</p>`;
  }
}

function formatLegalText(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  return raw
    .split(/\n\n+/)
    .map((p) => `<p>${esc(p).split(/\n/).join("<br>")}</p>`)
    .join("\n");
}

export function renderLegalPage(data, page, opts) {
  const b = data.brand || {};
  const br = data.branding || {};
  const tpl = br.template || "classic";
  const fullPage = CASINO_FULL.has(tpl);
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const isCustomDomain = !!opts.isCustomDomain;
  const homeHref = isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const legalHref = (p) => isCustomDomain ? `/${p}` : `/${esc(opts.slug || "")}/${p}`;
  const title = LEGAL_TITLES[page] || page;
  const customBody = formatLegalText(data.legal?.[page]);
  const bodyHtml = customBody || defaultLegalBody(page, b.name);
  const pageTitle = `${esc(title)} · ${esc(b.name || "YourRank")}`;
  const frameStyles = fullPage ? frameCss(tpl) : "";
  const templateStyle = frameStyles ? `<style nonce="${opts.nonce}" data-template="${tpl}">${frameStyles}</style>` : "";
  const fontLink = fullPage
    ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />`
    : `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />`;
  const cssLink = fullPage ? "" : `<link rel="stylesheet" href="/assets/app.css" />`;
  const canonical = `${esc(opts.homeUrl || "https://yourrank.site")}${legalHref(page)}`;
  const header = fullPage
    ? `<header class="site-header--full"><a class="site-header--full__brand" href="${homeHref}">${navLogo}<span data-brand-name>${esc(b.name)}</span></a><nav class="site-header--full__nav" aria-label="Page sections"><a href="${homeHref}">Leaderboard</a><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a><a href="${legalHref("responsible")}">Responsible</a></nav></header>`
    : `<header class="topbar"><a class="brand" href="${homeHref}">${esc(b.name || "YourRank")}</a></header>`;
  const legalHasCasino = !!b.casino;
  const footer = fullPage
    ? `<footer class="site-footer--full"><div class="site-footer--full__brand" data-brand-name>${esc(b.name)}</div><div class="site-footer--full__tag" data-tagline>${esc(b.tagline)}</div><p class="site-footer--full__fine">${footerDisclaimer(legalHasCasino, b.name, b.casino)}</p><div class="site-footer--full__links"><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a><a href="${legalHref("responsible")}">Responsible</a><a href="${legalHref("cookies")}">Cookies</a><a href="${legalHref("refund")}">Refund</a><a href="${legalHref("contact")}">Contact</a></div><p class="site-footer--full__copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`
    : `<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div><p class="ftr-fine">${footerDisclaimer(legalHasCasino, b.name, b.casino)}</p><p class="ftr-copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`;
  const bodyClass = fullPage ? `legal-page` : "legal";
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title><meta name="description" content="${esc(title)} for ${esc(b.name || "YourRank")}." />
<link rel="canonical" href="${canonical}" />
${fontLink}${cssLink}${templateStyle}
</head><body data-template="${tpl}" class="${bodyClass}">
<a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main class="${fullPage ? "legal-page__wrap" : "legal"}" id="main-content"><h1>${esc(title)}</h1><p class="${fullPage ? "legal-page__updated" : "legal-updated"}">Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>${bodyHtml}<a class="${fullPage ? "legal-page__back" : ""}" href="${homeHref}">← Back to ${esc(b.name || "leaderboard")}</a></main>
${footer}
</body></html>`;
}

function fmtCurrency(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtNumber(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function playerBackHref(opts) {
  return opts.isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
}

export function renderPlayerProfile(data, player, history, opts) {
  const b = data.brand || {};
  const br = data.branding || {};
  const tpl = br.template || "classic";
  const fullPage = CASINO_FULL.has(tpl);
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const homeHref = opts.isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const profileHref = (name) => opts.isCustomDomain ? `/player/${encodeURIComponent(name)}` : `/${esc(opts.slug || "")}/player/${encodeURIComponent(name)}`;
  const backHref = playerBackHref(opts);
  const frameStyles = fullPage ? frameCss(tpl) : "";
  const templateStyle = frameStyles ? `<style nonce="${opts.nonce}" data-template="${tpl}">${frameStyles}</style>` : "";
  const fontLink = fullPage
    ? `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />`
    : `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />`;
  const cssLink = fullPage ? "" : `<link rel="stylesheet" href="/assets/app.css" />`;
  const legalHref = (page) => opts.isCustomDomain ? `/${page}` : `/${esc(opts.slug || "")}/${page}`;
  const header = fullPage
    ? `<header class="site-header--full"><a class="site-header--full__brand" href="${homeHref}">${navLogo}<span data-brand-name>${esc(b.name)}</span></a><nav class="site-header--full__nav" aria-label="Page sections"><a href="${homeHref}">Leaderboard</a><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a></nav></header>`
    : `<header class="topbar"><a class="brand" href="${homeHref}">${esc(b.name || "YourRank")}</a></header>`;
  const footer = fullPage
    ? `<footer class="site-footer--full"><div class="site-footer--full__brand" data-brand-name>${esc(b.name)}</div><div class="site-footer--full__tag" data-tagline>${esc(b.tagline)}</div><p class="site-footer--full__fine">18+ only. Gambling can be addictive. Please play responsibly. BeGambleAware.org.</p><p class="site-footer--full__copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`
    : `<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div><p class="ftr-fine">18+ only. Gambling can be addictive. Please play responsibly. BeGambleAware.org.</p><p class="ftr-copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`;
  const pageTitle = `${esc(player.name)} · ${esc(b.name || "YourRank")}`;
  const canonical = `${esc(opts.homeUrl || "https://yourrank.site")}${profileHref(player.name)}`;

  const stats = [
    { label: "Wagered", value: fmtCurrency(player.wagered) },
    { label: "Prize", value: fmtCurrency(player.prize) },
    { label: "Score", value: fmtNumber(player.score) },
    { label: "Hands", value: fmtNumber(player.hands) },
    { label: "Net profit", value: fmtCurrency(player.netProfit) },
    { label: "Win rate", value: `${fmtNumber(player.winRate)}%` },
    { label: "Change", value: player.change > 0 ? `+${fmtNumber(player.change)}` : fmtNumber(player.change) },
  ];
  const statsHtml = stats.map((s) => `<div class="pp-stat"><span class="pp-stat-val">${esc(s.value)}</span><span class="pp-stat-label">${esc(s.label)}</span></div>`).join("");

  const historyHtml = history.length
    ? `<table class="pp-history"><thead><tr><th>Period</th><th>Rank</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>${history.map((h) => `<tr><td>${esc(h.label)}</td><td>#${fmtNumber(h.rank)}</td><td>${fmtCurrency(h.wagered)}</td><td>${fmtCurrency(h.prize)}</td></tr>`).join("")}</tbody></table>`
    : `<p class="pp-empty">No archived history yet. This page will show past rankings once the streamer closes out a leaderboard period.</p>`;

  const profileStyle = `<style nonce="${opts.nonce}">
.pp-wrap{max-width:760px;margin:0 auto;padding:32px 24px}
.pp-card{background:var(--panel,#13131a);border:1px solid var(--line-2,rgba(150,120,220,.2));border-radius:16px;padding:28px;margin-bottom:20px}
.pp-title{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-.02em;margin:0 0 6px}
.pp-rank{display:inline-block;background:var(--accent,#c8ff00);color:#000;font-weight:700;padding:6px 14px;border-radius:999px;font-size:13px}
.pp-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;margin-top:22px}
.pp-stat{background:var(--panel-2,#1a1a22);border:1px solid var(--line,rgba(150,120,220,.15));border-radius:10px;padding:14px}
.pp-stat-val{display:block;font-size:18px;font-weight:700;margin-bottom:4px}
.pp-stat-label{display:block;font-size:12px;color:var(--ink-soft,#9a94b8)}
.pp-history{width:100%;border-collapse:collapse;font-size:14px}
.pp-history th,.pp-history td{padding:10px 8px;border-bottom:1px solid var(--line-2,rgba(150,120,220,.2));text-align:left}
.pp-history th{color:var(--ink-soft,#9a94b8);font-weight:600}
.pp-empty{color:var(--ink-soft,#9a94b8);font-size:14px}
.pp-back{display:inline-block;margin-top:18px;color:var(--ink-soft,#9a94b8);text-decoration:none}
.pp-back:hover{color:var(--ink,#ededf0)}
</style>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title><meta name="description" content="${esc(player.name)} profile on ${esc(b.name || "YourRank")}." />
<link rel="canonical" href="${canonical}" />
${fontLink}${cssLink}${templateStyle}${profileStyle}
</head><body data-template="${tpl}" class="${fullPage ? "legal-page" : "legal"}">
<a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main class="${fullPage ? "legal-page__wrap" : "legal"}" id="main-content">
<div class="pp-wrap">
  <div class="pp-card">
    <h1 class="pp-title">${esc(player.name)}</h1>
    <span class="pp-rank">Rank #${fmtNumber(player.rank)}</span>
    <div class="pp-stats">${statsHtml}</div>
  </div>
  <div class="pp-card">
    <h2 class="sec-title">History</h2>
    ${historyHtml}
  </div>
  <a class="pp-back" href="${backHref}">← Back to ${esc(b.name || "leaderboard")}</a>
</div>
</main>
${footer}
</body></html>`;
}
