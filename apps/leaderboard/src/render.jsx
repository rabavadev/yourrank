/** @jsxImportSource hono/jsx */
// Server-render a streamer's leaderboard page from their data.
import { templateCss, validTemplate } from "./templates/index.js";
import { DEFAULT_EXTRA, FONT_FAMILIES } from "./site.js";
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
const LOGO_WIDTHS = [64, 128, 256, 512];
const GOOGLE_FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />`;
const FONT_BASE_STYLE = `:root{--yr-font:FAMILY;--yr-font-fallback:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif}body{font-family:var(--yr-font),var(--yr-font-fallback)}.font-sans{font-family:var(--yr-font),ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif}`;
function fontCss(br, nonce) {
  const family = FONT_FAMILIES[br?.font] || FONT_FAMILIES.Inter;
  return `<style nonce="${nonce}">${FONT_BASE_STYLE.replace("FAMILY", family)}</style>`;
}

function logoSrcSet(baseUrl) {
  if (!baseUrl) return "";
  const sep = baseUrl.includes("?") ? "&" : "?";
  return LOGO_WIDTHS.map((w) => `${esc(baseUrl)}${sep}w=${w} ${w}w`).join(", ");
}

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
  const text = encodeURIComponent(`Check out ${name}`);
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

function shareScriptNonce(nonce) {
  return `<script nonce="${nonce}">document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("[data-share='copy']").forEach(function(btn){btn.addEventListener("click",async function(){try{await navigator.clipboard.writeText(btn.dataset.url||location.href);var p=btn.textContent;btn.textContent="Copied!";setTimeout(function(){btn.textContent=p},1300)}catch(e){}})});});</script>`;
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
  const { b, hasCasino, casino, period, pool, hasCta, ctaHref, hasPartner, hasCode, code, blurb, whyStats, socials, prizes, currency, hidePrizeAmounts, players: rawPlayers } = c;
  const name = esc(b.name);
  const cur = String(currency || b.currency || "$").slice(0, 6);
  const hidePrizes = hidePrizeAmounts || b.hidePrizeAmounts || false;
  const prizePoolLabel = esc((prizes && prizes.prizePoolLabel) || b.prizePoolLabel || "Prize pool");
  const countdownLabelValue = String((prizes && prizes.countdownLabel) || b.countdownLabel || "").slice(0, 40);
  const payoutsLabel = esc((prizes && prizes.payoutsLabel) || b.payoutsLabel || "Payouts");
  const countdownLabel = countdownLabelValue || null;
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
  const findRank = `<div class="find-rank-bar"><div class="find-rank-wrap"><button type="button" aria-label="Search" class="find-rank-icon"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg></button><input class="find-rank-input" type="text" placeholder="Find your rank..." data-find-rank aria-label="Search for your rank" /></div><span class="find-rank-result" data-find-result role="status" aria-live="polite"></span></div>`;
  // Server-render player rows, top3, and count so crawlers, no-JS users,
  // and social previews see a populated board. leaderboard.js overwrites
  // these containers on hydration (it uses innerHTML).
  const sortedPlayers = Array.isArray(rawPlayers) ? rawPlayers.slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0)) : [];
  const playerCount = sortedPlayers.length;
  const sCount = String(playerCount);
  const cur2 = String(currency || b.currency || "$").slice(0, 6);
  const initials = (name) => { const parts = String(name || "").trim().split(/\s+/); return (parts[0]?.[0] || "?") + (parts[1]?.[0] || ""); };
  const moneyS = (n) => cur2 + (Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const moneyShortS = (n) => { const v = Number(n) || 0; if (v >= 1e6) return cur2 + (v / 1e6).toFixed(1) + "M"; if (v >= 1e3) return cur2 + (v / 1e3).toFixed(1) + "K"; return cur2 + v; };
  const moneyPrizeS = (n) => { if (hidePrizes) return "—"; return moneyS(n); };
  const playerHrefS = "#"; // placeholder — leaderboard.js replaces with real links on hydration
  const top3Srv = sortedPlayers.slice(0, 3).map((pl, i) => {
    const rank = i + 1;
    return `<div class="t3 t3--${rank}"><span class="t3-medal">RANK ${String(rank).padStart(2, "0")}</span><span class="t3-av" aria-hidden="true">${esc(initials(pl.name))}</span><a class="t3-name" href="${playerHrefS}">${esc(pl.name)}</a><div class="t3-wager">${moneyS(pl.wagered)}</div><span class="t3-prize">${pl.prize ? moneyPrizeS(pl.prize) : "—"}</span></div>`;
  }).join("");
  const rowsSrv = sortedPlayers.slice(3).map((pl, i) => {
    const rank = i + 4;
    const prize = pl.prize ? `<span class="tr-prize has ta-r" role="cell">${moneyPrizeS(pl.prize)}</span>` : `<span class="tr-prize no ta-r" role="cell">—</span>`;
    return `<div class="t-row" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}">
      <span class="tr-rank" role="cell">${String(rank).padStart(2, "0")}</span>
      <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><a class="tr-name" href="${playerHrefS}">${esc(pl.name)}</a></span>
      <span class="tr-wager" role="cell"><span class="w-lg">${moneyS(pl.wagered)}</span><span class="w-sm">${moneyShortS(pl.wagered)}</span></span>${prize}<span class="tr-bar" aria-hidden="true"><i></i></span></div>`;
  }).join("");

  const table = `<div class="table" role="table" aria-label="Leaderboard standings"><div class="t-head" role="row"><span role="columnheader">#</span><span role="columnheader">Player</span><span class="ta-r" role="columnheader">Wagered</span><span class="ta-r" role="columnheader">Prize</span></div>
<div class="t-rows" role="rowgroup" data-rows>${rowsSrv}</div></div>`;
  const rules = `<details class="rules"><summary>Leaderboard rules — how wager counts</summary><ol class="rules-list" data-rules></ol></details>`;
  const pastSec = `<section id="past" class="past-sec" data-past hidden><h2 class="sec-title center">Past Winners</h2><p class="sec-sub center">Every closed-out period, on the record.</p>
<div class="past-grid" data-past-grid></div></section>`;
  const socialsSec = socials.length ? `<section id="socials" class="socials-sec"><h2 class="sec-title center">Join the Socials</h2><p class="sec-sub center">More giveaways and promotions across every platform.</p>
<div class="social-cards" data-socials></div></section>` : "";
  const titleGroup = `<div class="board-title-group"><h2 class="sec-title">Standings</h2><span class="player-count-badge" data-player-count-badge>${sCount} players</span><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></div>`;
  const poolSpan = hidePrizes ? '<span data-pool hidden></span>' : (pool ? `<span data-pool>${esc(pool)}</span>` : `<span data-pool></span>`);
  const periodSpan = `<span data-period>${esc(period)}</span>`;
  const payouts = hidePrizes ? `<div class="payouts" data-payouts hidden data-hide-prizes></div>` : `<div class="payouts" data-payouts hidden></div>`;
  const top3 = `<div class="top3" data-top3 data-hide-prizes="${hidePrizes ? "true" : "false"}">${top3Srv}</div>`;
  return { ...c, name, streamWindow, ctaBtn, joinLabel, timerGrid, partnerPanel, announce, payouts, top3, findRank, table, rules, pastSec, socialsSec, titleGroup, poolSpan, periodSpan, cur, hidePrizes, prizePoolLabel, countdownLabel, payoutsLabel, sCount };
}

// The classic page: stream-window hero, partner panel, board, past, socials.
function composeDefault(p) {
  const { name, heroLogo, hasCasino, casino, period, pool, ctaBtn, joinLabel, timerGrid } = p;
  return (
    <>
      <section class="hero">
        <div dangerouslySetInnerHTML={{ __html: p.streamWindow }} />
        <div dangerouslySetInnerHTML={{ __html: heroLogo }} />
        <p class="hero-kicker">Welcome to</p>
        <h1 class="hero-name" data-brand-name>{name}</h1>
        <p class="hero-sub">
          {hasCasino ? <><span data-casino>{casino}</span> partner · </> : ""}
          <span data-period>{period}</span> leaderboard
        </p>
        <div class="hero-cta">
          <div dangerouslySetInnerHTML={{ __html: ctaBtn(joinLabel) }} />
          <a class="btn btn--ghost" href="#board">Leaderboard</a>
        </div>
        <div class="hero-timer" data-timer>
          <p class="timer-label">
            {pool ? <><span data-pool>{pool}</span> leaderboard resets in</> : "Leaderboard resets in"}
          </p>
          <div dangerouslySetInnerHTML={{ __html: timerGrid }} />
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.partnerPanel }} />
      <div dangerouslySetInnerHTML={{ __html: p.announce }} />
      <section id="board" class="board">
        <div class="board-head">
          <p class="eyebrow">
            {pool ? <><span data-pool>{pool}</span> · </> : ""}
            <span data-period>{period}</span> Leaderboard
          </p>
          <div dangerouslySetInnerHTML={{ __html: p.titleGroup }} />
          <div class="board-meta">
            <span class="bm"><b class="countdown" data-countdown>--</b><span>{p.countdownLabel || "Resets in"}</span></span>
            <span class="bm"><b data-count>{p.sCount}</b><span>Players</span></span>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: p.payouts }} />
        <div dangerouslySetInnerHTML={{ __html: p.top3 }} />
        <div dangerouslySetInnerHTML={{ __html: p.findRank }} />
        <div dangerouslySetInnerHTML={{ __html: p.table }} />
        <div dangerouslySetInnerHTML={{ __html: p.rules }} />
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.pastSec }} />
      <div dangerouslySetInnerHTML={{ __html: p.socialsSec }} />
    </>
  );
}

// quest — app-style: compact centered header with info chips, standings first,
// partner content demoted below the board.
function composeQuest(p) {
  return (
    <>
      <section class="hero hero--app">
        <div dangerouslySetInnerHTML={{ __html: p.heroLogo }} />
        <h1 class="hero-name" data-brand-name>{p.name}</h1>
        <p class="hero-sub">
          {p.hasCasino ? <><span data-casino>{p.casino}</span> partner · </> : ""}
          <span dangerouslySetInnerHTML={{ __html: p.periodSpan }} /> leaderboard
        </p>
        <div class="app-chips">
          {p.hidePrizes ? "" : <span class="app-chip app-chip--pool">🏆 <span dangerouslySetInnerHTML={{ __html: p.poolSpan }} /></span>}
          <span class="app-chip">⏳ <b class="countdown" data-countdown>--</b></span>
          <span class="app-chip"><b data-count>{p.sCount}</b> players</span>
        </div>
        <div class="hero-cta">
          <div dangerouslySetInnerHTML={{ __html: p.ctaBtn(p.joinLabel) }} />
        </div>
        <div class="hero-timer" data-timer hidden>
          <div dangerouslySetInnerHTML={{ __html: p.timerGrid }} />
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.announce }} />
      <section id="board" class="board">
        <div class="board-head board-head--center">
          <div dangerouslySetInnerHTML={{ __html: p.titleGroup }} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: p.payouts }} />
        <div dangerouslySetInnerHTML={{ __html: p.top3 }} />
        <div dangerouslySetInnerHTML={{ __html: p.findRank }} />
        <div dangerouslySetInnerHTML={{ __html: p.table }} />
        <div dangerouslySetInnerHTML={{ __html: p.rules }} />
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.partnerPanel }} />
      <div dangerouslySetInnerHTML={{ __html: p.pastSec }} />
      <div dangerouslySetInnerHTML={{ __html: p.socialsSec }} />
    </>
  );
}

// vault — split hero: pitch on the left, a boxed prize-pool + race-countdown
// card on the right, then a stat strip. Matches the approved casino mockup.
function composeVault(p) {
  return (
    <>
      <section class="hero hero--split">
        <div class="split-grid">
          <div class="split-copy">
            <div dangerouslySetInnerHTML={{ __html: p.heroLogo }} />
            <p class="hero-kicker">
              {p.hasCasino ? <><span data-casino>{p.casino}</span> partner board</> : "Wager race"}
            </p>
            <h1 class="hero-name" data-brand-name>{p.name}</h1>
            <p class="hero-sub"><span dangerouslySetInnerHTML={{ __html: p.periodSpan }} /> wager race — climb the board, take the prizes.</p>
            <div class="hero-cta">
              <div dangerouslySetInnerHTML={{ __html: p.ctaBtn(p.joinLabel) }} />
              <a class="btn btn--ghost" href="#board">Standings</a>
            </div>
          </div>
          <div class="prize-card">
            <span class="prize-card-label">{p.prizePoolLabel || "Prize pool"}</span>
            <b class="prize-card-pool"><span dangerouslySetInnerHTML={{ __html: p.poolSpan }} /></b>
            <div class="hero-timer" data-timer>
              <p class="timer-label">{p.countdownLabel || "Race ends in"}</p>
              <div dangerouslySetInnerHTML={{ __html: p.timerGrid }} />
            </div>
          </div>
        </div>
        <div class="stat-strip">
          <div class="ss"><span class="ss-label">Players</span><b class="ss-val" data-count>{p.sCount}</b></div>
          <div class="ss"><span class="ss-label">Period</span><b class="ss-val"><span dangerouslySetInnerHTML={{ __html: p.periodSpan }} /></b></div>
          <div class="ss"><span class="ss-label">Status</span><b class="ss-val"><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></b></div>
        </div>
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.announce }} />
      <section id="board" class="board">
        <div class="board-head board-head--center">
          <div class="board-title-group">
            <h2 class="sec-title">Standings</h2>
            <span class="player-count-badge" data-player-count-badge></span>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: p.payouts }} />
        <div dangerouslySetInnerHTML={{ __html: p.top3 }} />
        <div dangerouslySetInnerHTML={{ __html: p.findRank }} />
        <div dangerouslySetInnerHTML={{ __html: p.table }} />
        <div dangerouslySetInnerHTML={{ __html: p.rules }} />
      </section>
      <div dangerouslySetInnerHTML={{ __html: p.partnerPanel }} />
      <div dangerouslySetInnerHTML={{ __html: p.pastSec }} />
      <div dangerouslySetInnerHTML={{ __html: p.socialsSec }} />
    </>
  );
}

// tournament — the countdown IS the hero: giant race clock front and center,
// prize pool as the supporting line.
function composeTournament(p) {
  return `<section class="hero hero--clock">${p.heroLogo}<p class="hero-kicker" data-brand-name>${p.name}</p>
<h1 class="clock-title">${esc(p.countdownLabel || "Race ends in")}</h1>
<div class="hero-timer" data-timer>${p.timerGrid}</div>
<p class="clock-sub">${p.hidePrizes ? `${p.periodSpan} race` : `${p.poolSpan} ${esc((p.prizePoolLabel || "Prize pool").toLowerCase())} · ${p.periodSpan} race`} · <b data-count>${p.sCount}</b> players</p>
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
<div class="banner-facts"><div class="bf"><span class="bf-label">${esc(p.prizePoolLabel || "Prize pool")}</span><b class="bf-val">${p.poolSpan}</b></div>
<div class="bf"><span class="bf-label">${esc(p.countdownLabel || "Ends in")}</span><b class="bf-val countdown" data-countdown>--</b></div>
<div class="bf"><span class="bf-label">Players</span><b class="bf-val" data-count>${p.sCount}</b></div>
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
<p class="term-line term-line--dim">resets_in <b class="countdown" data-countdown>--</b> · players <b data-count>${p.sCount}</b> · <span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></p>
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
<div class="reward-card"><span class="reward-label">🎁 ${esc(p.prizePoolLabel || "Prize pool")}</span><b class="reward-pool">${p.poolSpan}</b>
<div class="hero-timer" data-timer><p class="timer-label">${esc(p.countdownLabel || "Ends in")}</p>
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
<div class="rail-fact"><span class="rail-label">${esc(p.prizePoolLabel || "Prize pool")}</span><b class="rail-val">${p.poolSpan}</b></div>
<div class="rail-fact"><span class="rail-label">${esc(p.countdownLabel || "Resets in")}</span><b class="rail-val countdown" data-countdown>--</b></div>
<div class="rail-fact"><span class="rail-label">Players</span><b class="rail-val" data-count>${p.sCount}</b></div>
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
<p class="hero-sub">${p.hidePrizes ? "" : `${p.poolSpan} ${esc((p.prizePoolLabel || "prize pool").toLowerCase())} · `}${esc(p.countdownLabel || "resets in")} <b class="countdown" data-countdown>--</b></p>
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

async function composeMain(tpl, parts, text) {
  let result = (COMPOSERS[tpl] || composeDefault)(parts);
  if (result instanceof Promise) result = await result;
  let html = (typeof result === "string") ? result : result.toString();
  if (html instanceof Promise) html = await html;
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

export async function renderLeaderboard(data, opts = {}) {
  const b = data.brand || {};
  const br = data.branding || {};
  // Template: which visual skin renders this page. Falls back to "classic".
  const tpl = validTemplate(br.template);
  const fullPage = CASINO_FULL.has(tpl);
  const frameCssStr = fullPage ? frameCss(tpl, FONT_FAMILIES[br.font] || FONT_FAMILIES.Inter) : "";
  const tplCssStr = templateCss(tpl) + frameCssStr;
  const tplCss = tplCssStr ? `<style nonce="${opts.nonce}" data-template="${tpl}">${tplCssStr}</style>` : "";
  const previewCss = opts.preview ? `<style nonce="${opts.nonce}">
html{background:var(--bg)}body[data-preview]{min-width:var(--preview-min-width,1100px);overflow:hidden}
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
  const logoSet = logoSrcSet(opts.logoUrl);
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" srcset="${logoSet}" sizes="64px" alt="" />` : "";
  const heroLogo = logo ? `<img class="hero-logo" src="${logo}" srcset="${logoSet}" sizes="(max-width: 640px) 120px, 200px" alt="${esc(b.name)} logo" />` : "";
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
  const previewScript = opts.preview ? `<script nonce="${opts.nonce}">
document.addEventListener("click", (e) => {
  const row = e.target.closest("tr, .player-card, .player-row");
  if (!row) return;
  const nameEl = row.querySelector(".p-name, [data-player-name], .embed-name, .standings-name, .stand-name");
  if (nameEl) {
    const name = nameEl.textContent.trim();
    if (name) window.parent.postMessage({ type: "yr_click_player", name }, "*");
  }
});
</script>` : "";

  const mainHtml = await composeMain(tpl, buildParts({ b, esc, heroLogo, hasCasino, casino, period, pool, hasCta, ctaHref, hasPartner, hasCode, code, blurb, whyStats, socials, prizes: data.prizes, currency: data.brand?.currency, hidePrizeAmounts: data.brand?.hidePrizeAmounts, players: data.players }), textOverrides);
  
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title><meta name="description" content="${desc}" />
<meta property="og:title" content="${ogTitle}" /><meta property="og:description" content="${desc}" /><meta property="og:type" content="website" />
<link rel="canonical" href="${canonicalUrl}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta name="twitter:card" content="${twitterCard}" /><meta name="twitter:title" content="${ogTitle}" /><meta name="twitter:description" content="${desc}" />${ogImage}
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&family=Press+Start+2P&family=Fredoka+One&family=Orbitron:wght@400;700;900&family=Pacifico&family=Baloo+2:wght@400;600;800&family=Cormorant+Garamond:wght@400;600;700&family=Rye&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet" media="print" data-async />
<script nonce="${opts.nonce}">document.querySelector('link[data-async]').onload=function(){this.media='all'};</script>
<noscript><link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&family=Press+Start+2P&family=Fredoka+One&family=Orbitron:wght@400;700;900&family=Pacifico&family=Baloo+2:wght@400;600;800&family=Cormorant+Garamond:wght@400;600;700&family=Rye&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;600;700;800;900&family=Inter:wght@400;600;700;800;900&family=Oswald:wght@400;600;700&family=Rajdhani:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet" /></noscript>
${fullPage ? "" : `<link rel="stylesheet" href="/assets/leaderboard.css" />`}
${tplCss}
${themeCss}
${profileLinkCss}
${sectionCss}
${previewCss}
${fontCss(br, opts.nonce)}
<style nonce="${opts.nonce}">${shareCss}</style>
<script nonce="${opts.nonce}" type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":${JSON.stringify(title)},"description":${JSON.stringify(desc)},"numberOfItems":${data.players ? data.players.length : 0}}</script>
</head><body data-template="${tpl}"${opts.preview ? ` data-preview style="--preview-min-width:${opts.previewDevice === "mobile" ? 390 : 1100}px"` : ""}${opts.demo ? " data-demo" : ""} ${sectionAttrs}>
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
${mainHtml}</main>
${shareHtml}
${fullPageFooter}
${fullPage ? "" : `<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div>
<p class="ftr-fine">${footerDisclaimer(hasCasino, b.name, casino)}</p>
<p class="ftr-copy">© <span data-year></span> <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`}
${badge}${fullPage ? `<script src="/assets/casino/${tpl}.js" nonce="${opts.nonce}"></script>` : ""}<script nonce="${opts.nonce}">window.__SITE_DATA__=${dataJson};window.__SLUG__=${JSON.stringify(opts.slug || "")};</script><script src="/assets/leaderboard.js"></script>
${previewScript}
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
  const logoSet = logoSrcSet(opts.logoUrl);
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" srcset="${logoSet}" sizes="64px" alt="" />` : "";
  const isCustomDomain = !!opts.isCustomDomain;
  const homeHref = isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const legalHref = (p) => isCustomDomain ? `/${p}` : `/${esc(opts.slug || "")}/${p}`;
  const title = LEGAL_TITLES[page] || page;
  const customBody = formatLegalText(data.legal?.[page]);
  const isDefaultLegal = !customBody;
  const bodyHtml = customBody || defaultLegalBody(page, b.name);
  const pageTitle = `${esc(title)} · ${esc(b.name || "YourRank")}`;
  const frameStyles = fullPage ? frameCss(tpl, FONT_FAMILIES[br.font] || FONT_FAMILIES.Inter) : "";
  const legalNoticeCss = isDefaultLegal ? `.legal-notice{display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:14px 16px;margin-bottom:22px;font-size:13px;color:rgba(255,255,255,.85)}.legal-notice b{color:var(--accent,#c8ff00)}.legal-notice a{color:var(--accent,#c8ff00);text-decoration:underline}` : "";
  const templateStyle = (frameStyles || legalNoticeCss) ? `<style nonce="${opts.nonce}" data-template="${tpl}">${frameStyles}${legalNoticeCss}</style>` : "";
  const platformBase = esc(opts.homeUrl || "https://yourrank.site").replace(/\/$/, "");
  const legalNotice = isDefaultLegal ? `<div class="legal-notice"><b>⚠️ Legal pages not configured</b> — ${esc(b.name || "this page")} is currently showing YourRank platform terms. You can also read the platform <a href="${platformBase}/terms">Terms of Service</a>, <a href="${platformBase}/privacy">Privacy Policy</a>, and <a href="${platformBase}/responsible">Responsible Play</a> guidelines.</div>` : "";
  const fontLink = GOOGLE_FONTS_LINK;
  const cssLink = fullPage ? "" : `<link rel="stylesheet" href="/assets/app.css" />`;
  const canonical = `${esc(opts.homeUrl || "https://yourrank.site")}${legalHref(page)}`;
  const fontStyle = fontCss(br, opts.nonce);
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
${fontLink}${cssLink}${templateStyle}${fontStyle}
</head><body data-template="${tpl}" class="${bodyClass}">
<a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main class="${fullPage ? "legal-page__wrap" : "legal"}" id="main-content"><h1>${esc(title)}</h1><p class="${fullPage ? "legal-page__updated" : "legal-updated"}">Last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>${legalNotice}${bodyHtml}<a class="${fullPage ? "legal-page__back" : ""}" href="${homeHref}">← Back to ${esc(b.name || "leaderboard")}</a></main>
${footer}
</body></html>`;
}

function fmtCurrency(n, data = {}, isPrize = false) {
  if (isPrize && data.brand?.hidePrizeAmounts) return "—";
  const v = Number(n) || 0;
  const sym = String(data.brand?.currency || data.prizes?.currency || "$").slice(0, 6);
  return sym + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
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
  const logoSet = logoSrcSet(opts.logoUrl);
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" srcset="${logoSet}" sizes="64px" alt="" />` : "";
  const homeHref = opts.isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const profileHref = (name) => opts.isCustomDomain ? `/player/${encodeURIComponent(name)}` : `/${esc(opts.slug || "")}/player/${encodeURIComponent(name)}`;
  const backHref = playerBackHref(opts);
  const frameStyles = fullPage ? frameCss(tpl, FONT_FAMILIES[br.font] || FONT_FAMILIES.Inter) : "";
  const templateStyle = frameStyles ? `<style nonce="${opts.nonce}" data-template="${tpl}">${frameStyles}</style>` : "";
  const fontLink = GOOGLE_FONTS_LINK;
  const fontStyle = fontCss(br, opts.nonce);
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
    { label: "Wagered", value: fmtCurrency(player.wagered, data) },
    { label: "Prize", value: fmtCurrency(player.prize, data, true) },
    { label: "Score", value: fmtNumber(player.score) },
    { label: "Hands", value: fmtNumber(player.hands) },
    { label: "Net profit", value: fmtCurrency(player.netProfit, data) },
    { label: "Win rate", value: `${fmtNumber(player.winRate)}%` },
    { label: "Change", value: player.change > 0 ? `+${fmtNumber(player.change)}` : fmtNumber(player.change) },
  ];
  const statsHtml = stats.map((s) => `<div class="pp-stat"><span class="pp-stat-val">${esc(s.value)}</span><span class="pp-stat-label">${esc(s.label)}</span></div>`).join("");

  const historyHtml = history.length
    ? `<table class="pp-history"><thead><tr><th>Period</th><th>Rank</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>${history.map((h) => `<tr><td>${esc(h.label)}</td><td>#${fmtNumber(h.rank)}</td><td>${fmtCurrency(h.wagered, data)}</td><td>${fmtCurrency(h.prize, data, true)}</td></tr>`).join("")}</tbody></table>`
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
${fontLink}${cssLink}${templateStyle}${profileStyle}${shareCss}${fontStyle}
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
  ${shareSection(canonical, player.name)}
  <a class="pp-back" href="${backHref}">← Back to ${esc(b.name || "leaderboard")}</a>
</div>
</main>
${footer}
${shareScriptNonce(opts.nonce)}
</body></html>`;
}

export function renderHallOfFame(data, opts) {
  const b = data.brand || {};
  const br = data.branding || {};
  const tpl = br.template || "classic";
  const fullPage = CASINO_FULL.has(tpl);
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const isCustomDomain = !!opts.isCustomDomain;
  const homeHref = isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const legalHref = (p) => isCustomDomain ? `/${p}` : `/${esc(opts.slug || "")}/${p}`;
  const frameStyles = fullPage ? frameCss(tpl, FONT_FAMILIES[br.font] || FONT_FAMILIES.Inter) : "";
  const templateStyle = frameStyles ? `<style nonce="${opts.nonce}" data-template="${tpl}">${frameStyles}</style>` : "";
  const fontLink = GOOGLE_FONTS_LINK;
  const fontStyle = fontCss(br, opts.nonce);
  const cssLink = fullPage ? "" : `<link rel="stylesheet" href="/assets/app.css" />`;
  const canonical = `${esc(opts.homeUrl || "https://yourrank.site")}${isCustomDomain ? "/hall-of-fame" : `/${esc(opts.slug || "")}/hall-of-fame`}`;
  const header = fullPage
    ? `<header class="site-header--full"><a class="site-header--full__brand" href="${homeHref}">${navLogo}<span data-brand-name>${esc(b.name)}</span></a><nav class="site-header--full__nav" aria-label="Page sections"><a href="${homeHref}">Leaderboard</a><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a></nav></header>`
    : `<header class="topbar"><a class="brand" href="${homeHref}">${esc(b.name || "YourRank")}</a></header>`;
  const footer = fullPage
    ? `<footer class="site-footer--full"><div class="site-footer--full__brand" data-brand-name>${esc(b.name)}</div><div class="site-footer--full__tag" data-tagline>${esc(b.tagline)}</div><p class="site-footer--full__fine">${footerDisclaimer(!!b.casino, b.name, b.casino)}</p><div class="site-footer--full__links"><a href="${legalHref("terms")}">Terms</a><a href="${legalHref("privacy")}">Privacy</a><a href="${legalHref("responsible")}">Responsible</a><a href="${legalHref("cookies")}">Cookies</a><a href="${legalHref("refund")}">Refund</a><a href="${legalHref("contact")}">Contact</a></div><p class="site-footer--full__copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`
    : `<footer class="ftr"><div class="ftr-id"><span class="ftr-name" data-brand-name>${esc(b.name)}</span><span class="ftr-tag" data-tagline>${esc(b.tagline)}</span></div><p class="ftr-fine">${footerDisclaimer(!!b.casino, b.name, b.casino)}</p><p class="ftr-copy">© ${new Date().getFullYear()} <span data-brand-name>${esc(b.name)}</span>. All rights reserved.</p></footer>`;

  const past = Array.isArray(data.pastWinners) ? data.pastWinners : [];
  const medals = ["gold", "silver", "bronze"];
  const cards = past.map((a) => `<div class="hof-card"><div class="hof-label">${esc(a.label)} <span class="hof-date">${new Date(a.at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span></div><ol class="hof-list">${
    (a.top || []).map((p, i) => `<li class="hof-row"><span class="hof-rank ${medals[i] || ""}">${i + 1}</span><span class="hof-name">${esc(p.name)}</span><span class="hof-val">${fmtCurrency(p.prize || p.wagered || 0, data, true)}</span></li>`).join("")
  }</ol></div>`).join("");
  const body = past.length
    ? `<div class="hof-grid">${cards}</div>`
    : `<p class="hof-empty">No closed-out periods yet. The streamer can close out a period from the dashboard to build the Hall of Fame.</p>`;

  const hofStyle = `<style nonce="${opts.nonce}">
.hof-wrap{max-width:1100px;margin:0 auto;padding:40px 24px}
.hof-title{font-size:clamp(32px,5vw,48px);font-weight:800;letter-spacing:-.03em;margin:0 0 8px}
.hof-sub{color:var(--ink-soft,#9a94b8);margin:0 0 32px}
.hof-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.hof-card{background:var(--panel,#13131a);border:1px solid var(--line-2,rgba(150,120,220,.2));border-radius:12px;padding:18px}
.hof-label{font-family:"JetBrains Mono",monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#9a94b8);border-bottom:1px solid var(--line-2,rgba(150,120,220,.2));padding-bottom:10px;margin-bottom:10px;display:flex;justify-content:space-between;gap:8px}
.hof-date{font-weight:400;text-transform:none;font-family:Inter,sans-serif;letter-spacing:0}
.hof-list{list-style:none;margin:0;padding:0}
.hof-row{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:15px}
.hof-rank{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;background:var(--panel-2,#1a1a22);color:var(--ink,#ededf0)}
.hof-rank.gold{background:linear-gradient(135deg,#ffd700,#ffaa00);color:#000}
.hof-rank.silver{background:linear-gradient(135deg,#e0e0e0,#b0b0b0);color:#000}
.hof-rank.bronze{background:linear-gradient(135deg,#cd7f32,#a0522d);color:#fff}
.hof-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hof-val{font-family:"JetBrains Mono",monospace;color:var(--gold,#ffd700);font-weight:700}
.hof-empty{color:var(--ink-soft,#9a94b8);padding:24px 0}
.hof-back{display:inline-block;margin-top:24px;color:var(--ink-soft,#9a94b8);text-decoration:none}
.hof-back:hover{color:var(--ink,#ededf0)}
</style>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(b.name || "YourRank")} — Hall of Fame</title><meta name="description" content="Past winners and closed-out periods for ${esc(b.name || "YourRank")}." />
<link rel="canonical" href="${canonical}" />
${fontLink}${cssLink}${templateStyle}${hofStyle}${fontStyle}
</head><body data-template="${tpl}" class="${fullPage ? "legal-page" : "legal"}">
<a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main class="${fullPage ? "legal-page__wrap" : "legal"}" id="main-content">
<div class="hof-wrap">
  <h1 class="hof-title">Hall of Fame</h1>
  <p class="hof-sub">Every closed-out period, on the record.</p>
  ${body}
  <a class="hof-back" href="${homeHref}">← Back to ${esc(b.name || "leaderboard")}</a>
</div>
</main>
${footer}
</body></html>`;
}

export function renderStreamerProfile(data, opts) {
  const b = data.brand || {};
  const br = data.branding || {};
  const tpl = br.template || "classic";
  const fullPage = CASINO_FULL.has(tpl);
  const logo = opts.logoUrl ? esc(opts.logoUrl) : null;
  const navLogo = logo ? `<img class="nav-logo" src="${logo}" alt="" />` : "";
  const homeHref = opts.isCustomDomain ? "/" : `/${esc(opts.slug || "")}`;
  const profileHref = opts.isCustomDomain ? "/profile" : `/${esc(opts.slug || "")}/profile`;
  const boardHref = (slug) => opts.isCustomDomain ? `https://yourrank.site/${esc(slug)}` : `/${esc(slug)}`;
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

  const socials = (data.socials || []).filter((s) => s.enabled !== false && s.url && s.url !== "#" && s.url !== "");
  const socialIcons = {
    twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2 3 6v13h4v3h3l3-3h4l5-5V2H4Zm16 10-3 3h-4l-3 3v-3H7V4h13v8Zm-3-6h-2v5h2V6Zm-5 0h-2v5h2V6Z"/></svg>`,
    kick: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h5v5h2V6h2V4h2V3h4v6h-2v2h-2v2h2v2h2v6h-4v-1h-2v-2h-2v-2H8v5H3V3Z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9L18 6.1c.4-.3-.1-.5-.6-.2L6.6 12.7l-4.7-1.5c-1-.3-1-.9.2-1.4L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L1.9 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.9H5.2L17.7 20Z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.5A16.8 16.8 0 0 0 15.9 3c-.2.4-.4.8-.5 1.2a15.6 15.6 0 0 0-4.8 0c-.2-.4-.3-.8-.5-1.2a16.8 16.8 0 0 0-4.4 1.5C.5 10 .2 15 1.1 19.9c2.5 1.9 4.9 3 7.3 3.3.6-.8 1.1-1.7 1.5-2.6-.8-.3-1.6-.7-2.3-1.2l.6-.5a11.7 11.7 0 0 0 10.1 0l.6.5c-.7.5-1.5.9-2.3 1.2.4.9.9 1.8 1.5 2.6 2.4-.3 4.8-1.4 7.3-3.3.9-4.9.5-9.9-2.7-15.4ZM8.7 16.5c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Zm6.6 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3Z"/></svg>`,
  };
  const socialsHtml = socials.length
    ? `<div class="sp-socials">${socials.map((s) => {
        const icon = socialIcons[s.brand] || socialIcons.x;
        const label = esc(s.name || s.brand || "Link");
        return `<a class="sp-social" href="${safeUrl(s.url)}" target="_blank" rel="noopener">${icon}<span>${label}</span></a>`;
      }).join("")}</div>`
    : `<p class="sp-empty">No channel links yet.</p>`;

  const boards = (opts.boards || []).filter((b) => b.slug && b.name);
  const boardsHtml = boards.length
    ? `<ul class="sp-boards">${boards.map((b) => `<li><a href="${boardHref(b.slug)}">${esc(b.name || b.slug)}</a><span>/${esc(b.slug)}</span></li>`).join("")}</ul>`
    : `<p class="sp-empty">No public leaderboards yet.</p>`;

  const archives = (data.pastWinners || []).slice(0, 10);
  const archivesHtml = archives.length
    ? `<ul class="sp-archives">${archives.map((a) => `<li><span>${esc(a.label || "Past board")}</span><span>${a.players || 0} players</span></li>`).join("")}</ul>`
    : `<p class="sp-empty">No past boards yet.</p>`;

  const botCta = opts.botUsername
    ? `<div class="sp-cta"><p>Get leaderboard updates in Telegram.</p><a class="btn" href="https://t.me/${esc(opts.botUsername)}" target="_blank" rel="noopener">Subscribe to @${esc(opts.botUsername)}</a></div>`
    : "";

  const pageTitle = `${esc(b.name || "YourRank")} · Streamer profile`;
  const canonical = `${esc(opts.homeUrl || "https://yourrank.site")}${profileHref}`;
  const profileStyle = `<style nonce="${opts.nonce}">
.sp-wrap{max-width:800px;margin:0 auto;padding:32px 24px}
.sp-hero{display:flex;align-items:center;gap:20px;margin-bottom:28px}
.sp-hero img{width:80px;height:80px;border-radius:16px;object-fit:cover;background:var(--panel-2,#1a1a22)}
.sp-hero h1{font-size:clamp(28px,4vw,44px);font-weight:800;margin:0 0 4px}
.sp-hero p{margin:0;color:var(--ink-mute,#9a94b8)}
.sp-sec{margin-bottom:28px}
.sp-sec h2{font-size:18px;font-weight:700;margin:0 0 12px}
.sp-socials{display:flex;flex-wrap:wrap;gap:12px}
.sp-social{display:inline-flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;background:var(--panel-2,#1a1a22);border:1px solid var(--line,rgba(150,120,220,.15));color:var(--ink,#ededf0);text-decoration:none;font-weight:600}
.sp-social:hover{border-color:var(--accent,#c8ff00);color:var(--accent,#c8ff00)}
.sp-social svg{width:22px;height:22px}
.sp-boards,.sp-archives{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.sp-boards li,.sp-archives li{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;background:var(--panel-2,#1a1a22);border:1px solid var(--line,rgba(150,120,220,.15))}
.sp-boards a{color:var(--ink,#ededf0);text-decoration:none;font-weight:600}
.sp-boards a:hover{color:var(--accent,#c8ff00)}
.sp-boards span{font-size:12px;color:var(--ink-mute,#9a94b8)}
.sp-archives span:first-child{font-weight:600}
.sp-archives span:last-child{font-size:12px;color:var(--ink-mute,#9a94b8)}
.sp-empty{color:var(--ink-mute,#9a94b8);font-size:14px}
.sp-cta{margin-top:28px;padding:18px;border-radius:12px;background:linear-gradient(135deg,rgba(200,255,0,.1),rgba(90,217,255,.1));border:1px solid var(--line,rgba(150,120,220,.2));display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.sp-cta p{margin:0;font-weight:600}
.sp-cta .btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:10px 18px;border-radius:8px;background:var(--accent,#c8ff00);color:#000;font-weight:700;text-decoration:none}
</style>`;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${pageTitle}</title><meta name="description" content="${esc(b.tagline || b.name || "YourRank")} streamer profile." />
<link rel="canonical" href="${canonical}" />
${fontLink}${cssLink}${templateStyle}${profileStyle}${shareCss}
</head><body data-template="${tpl}" class="${fullPage ? "legal-page" : "legal"}">
<a class="skip-link" href="#main-content">Skip to content</a>
${header}
<main class="${fullPage ? "legal-page__wrap" : "legal"}" id="main-content">
<div class="sp-wrap">
  <div class="sp-hero">
    ${logo ? `<img src="${logo}" alt="" />` : ""}
    <div>
      <h1 data-brand-name>${esc(b.name || "Streamer")}</h1>
      <p data-tagline>${esc(b.tagline || b.casino || "")}</p>
    </div>
  </div>
  <section class="sp-sec" aria-label="Channel links">
    <h2>Channels</h2>
    ${socialsHtml}
  </section>
  <section class="sp-sec" aria-label="Leaderboards">
    <h2>Current boards</h2>
    ${boardsHtml}
  </section>
  <section class="sp-sec" aria-label="Past boards">
    <h2>Past boards</h2>
    ${archivesHtml}
  </section>
  ${shareSection(canonical, b.name || "this streamer")}
  ${botCta}
</div>
</main>
${footer}
${shareScriptNonce(opts.nonce)}
</body></html>`;
}

export function renderEmbed(data, opts) {
  const br = (data && data.brand) || {};
  const players = Array.isArray(data.players) ? data.players.slice().sort((a, b) => (b.wagered || 0) - (a.wagered || 0)) : [];
  const top3 = players.slice(0, 3);
  const rest = players.slice(3);
  const accent = br.accentA && br.accentB
    ? `:root{--accent-start:${br.accentA};--accent-end:${br.accentB}}`
    : ":root{--accent-start:#c8ff00;--accent-end:#5ad9ff}}";
  const top3Html = top3.length
    ? `<div class="embed-top3">${top3.map((p, i) => {
        const medal = ["🥇", "🥈", "🥉"][i] || "";
        return `<div class="embed-top3-card"><span class="embed-medal">${medal}</span><span class="embed-name">${esc(p.name)}</span><span class="embed-wagered">${fmtCurrency(p.wagered)}</span><span class="embed-prize">${fmtCurrency(p.prize)}</span></div>`;
      }).join("")}</div>`
    : "";
  const rowsHtml = rest.length
    ? `<table class="embed-rows"><thead><tr><th>#</th><th>Player</th><th>Wagered</th><th>Prize</th></tr></thead><tbody>${rest.map((p, i) => `<tr><td class="embed-rank">${i + 4}</td><td class="embed-name">${esc(p.name)}</td><td class="embed-wagered">${fmtCurrency(p.wagered)}</td><td class="embed-prize">${fmtCurrency(p.prize)}</td></tr>`).join("")}</tbody></table>`
    : "";
  const endsAt = data.endsAt ? `<p class="embed-ends">Resets ${new Date(data.endsAt).toUTCString()}</p>` : "";
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="refresh" content="60" />
<title>${esc(br.name || opts.slug)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;padding:12px;font-family:Inter,system-ui,sans-serif;background:#0b0b12;color:#ededf0}
.embed-wrap{max-width:520px;margin:0 auto;border:1px solid rgba(150,120,220,.25);border-radius:12px;background:#13131a;overflow:hidden}
.embed-head{padding:14px 16px;background:linear-gradient(100deg,var(--accent-start),var(--accent-end));color:#000}
.embed-title{font-size:18px;font-weight:800;margin:0 0 4px}
.embed-meta{font-size:12px;opacity:.8;margin:0}
.embed-top3{display:flex;gap:8px;padding:12px;justify-content:center;background:#0f0f16}
.embed-top3-card{flex:1;min-width:0;text-align:center;padding:10px 6px;border-radius:8px;background:#1a1a22;border:1px solid rgba(150,120,220,.15)}
.embed-medal{display:block;font-size:20px;margin-bottom:4px}
.embed-name{display:block;font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:6px}
.embed-wagered,.embed-prize{display:block;font-size:11px}
.embed-prize{color:var(--accent-start)}
.embed-rows{width:100%;border-collapse:collapse;font-size:13px}
.embed-rows th{text-align:left;padding:8px 12px;background:#1a1a22;color:#9a94b8;font-weight:600;border-bottom:1px solid rgba(150,120,220,.15)}
.embed-rows td{padding:8px 12px;border-bottom:1px solid rgba(150,120,220,.1)}
.embed-rank{width:28px;color:#9a94b8}
.embed-name{max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.embed-wagered,.embed-prize{text-align:right;font-variant-numeric:tabular-nums}
.embed-prize{color:var(--accent-start)}
.embed-ends{padding:10px 12px;font-size:11px;color:#9a94b8;text-align:center;margin:0;border-top:1px solid rgba(150,120,220,.15)}
.empty{padding:40px 12px;text-align:center;color:#9a94b8}
</style><style nonce="${opts.nonce}">${accent}</style></head><body>
<div class="embed-wrap">
<div class="embed-head"><h1 class="embed-title">${esc(br.name || opts.slug)}</h1><p class="embed-meta">${esc(br.period || "")} · ${esc(br.prizePool || "")}</p></div>
${top3.length ? top3Html : '<p class="empty">No players yet.</p>'}
${rowsHtml}
${endsAt}
</div>
</body></html>`;
}
export function renderPasswordGate(site, opts, error = "") {
  const name = esc(site.name || "Private board");
  const slug = esc(site.slug || "");
  const action = opts.isCustomDomain ? "/password" : `/${slug}/password`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${name} · Password required</title>
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/app.css" />
<style nonce="${opts.nonce}">
.pw-wrap{max-width:420px;margin:0 auto;padding:80px 24px;text-align:center}
.pw-title{font-size:clamp(26px,4vw,36px);font-weight:800;letter-spacing:-.03em;margin:0 0 8px}
.pw-sub{color:var(--ink-soft,#9a94b8);margin:0 0 32px}
.pw-form{background:var(--panel,#13131a);border:1px solid var(--line-2,rgba(150,120,220,.2));border-radius:14px;padding:24px;display:flex;flex-direction:column;gap:16px}
.pw-form label{text-align:left;color:var(--ink-soft,#9a94b8);font-size:14px}
.pw-form input{width:100%;padding:12px;border:1px solid var(--line-2,rgba(150,120,220,.2));border-radius:8px;background:var(--panel-2,#1a1a22);color:var(--ink,#ededf0);font-size:15px}
.pw-form button{padding:12px;border:none;border-radius:8px;background:var(--accent,#c8ff00);color:#000;font-weight:700;cursor:pointer}
.pw-error{color:#ff6b6b;font-size:14px;margin-top:-8px}
</style></head><body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="topbar"><a class="brand" href="/">Your<b>Rank</b></a></header>
<main class="pw-wrap" id="main-content">
<h1 class="pw-title">${name}</h1>
<p class="pw-sub">This leaderboard is private. Enter the password to continue.</p>
<form class="pw-form" method="POST" action="${action}">
${error ? `<p class="pw-error">${esc(error)}</p>` : ""}
<label for="board-password">Password</label>
<input id="board-password" name="password" type="password" placeholder="Password" required autocomplete="off" />
<button type="submit">Unlock</button>
</form>
</main></body></html>`;
}
