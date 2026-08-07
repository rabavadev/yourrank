/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Broadcaster" — live sports lower-third: an ON AIR top bar, a scorebug
// hero with an oversized tabular pool number, a scrolling ticker strip, and
// dense broadcast-graphic standings. Socials sit right under the hero (the
// opposite end of <main> from noir, which keeps them last) — the template
// owns section order. Shares the buildParts() data contract (every data-*
// hook appears exactly once) but owns its page structure, chrome, typography
// and tokens.

// Convention: every rule is scoped under body[data-template="broadcaster"]
// so templates can never leak into each other (preview compare, live switching).
const BROADCASTER_CSS = `
body[data-template="broadcaster"]{
  --bg:#0a0c10;
  --violet-1:#0d1016;
  --violet-2:#0a0c10;
  --panel:#11151c;
  --panel-2:#161b24;
  --line:rgba(232,50,30,.16);
  --line-2:rgba(232,50,30,.38);
  --ink:#f2f6fc;
  --ink-soft:#c3cede;
  --ink-mute:#8b98ad;
  --cy:var(--opt-accent,#e8321e);
  --bl:#b81f10;
  --grad-name:linear-gradient(100deg,#f2f6fc,var(--opt-accent,#e8321e));
  --grad-cta:linear-gradient(100deg,var(--opt-accent,#e8321e),#b81f10);
  --gold:var(--opt-accent,#e8321e);
  --primary:var(--opt-accent,#e8321e);
  --radius:6px;
  font-family:"Barlow",system-ui,sans-serif;
}
/* ON AIR top bar */
body[data-template="broadcaster"] .bc-topbar{background:var(--panel);border-bottom:3px solid var(--cy);position:sticky;top:0;z-index:20}
/* The topbar is already sticky, so the multi-board switcher must not pin over it */
body[data-template="broadcaster"] .board-tabs{position:static;margin-top:1rem}
body[data-template="broadcaster"] .bc-topbar-inner{display:flex;align-items:center;justify-content:space-between;gap:1rem;max-width:1100px;margin:0 auto;padding:.55rem 1rem}
body[data-template="broadcaster"] .bc-brand{display:flex;align-items:center;gap:.6rem;color:var(--ink);text-decoration:none;font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.08em;font-size:1.05rem}
body[data-template="broadcaster"] .bc-brand .nav-logo{width:30px;height:30px;border-radius:4px}
body[data-template="broadcaster"] .bc-onair{display:inline-flex;align-items:center;gap:.35rem;background:var(--cy);color:#fff;font-size:.68rem;font-weight:700;letter-spacing:.14em;padding:.2rem .5rem;border-radius:3px}
body[data-template="broadcaster"] .bc-onair-dot{width:7px;height:7px;border-radius:50%;background:#fff}
body[data-template="broadcaster"] .bc-nav{display:flex;gap:1.2rem}
body[data-template="broadcaster"] .bc-nav a{color:var(--ink-mute);text-decoration:none;font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.1em;font-size:.8rem}
body[data-template="broadcaster"] .bc-nav a:hover{color:var(--cy)}
/* Social strip pinned under the header */
body[data-template="broadcaster"] .bc-social-strip{background:var(--panel-2);border-bottom:1px solid var(--line);padding:.7rem 1rem}
body[data-template="broadcaster"] .bc-social-strip .socials-sec{margin:0;padding:0}
body[data-template="broadcaster"] .bc-social-strip .sec-title{font-family:"Oswald",sans-serif;font-size:.85rem;letter-spacing:.14em;text-transform:uppercase;margin:0 0 .5rem;color:var(--ink-soft)}
body[data-template="broadcaster"] .bc-social-strip .sec-sub{display:none}
body[data-template="broadcaster"] .bc-social-strip .social-cards{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center}
body[data-template="broadcaster"] .bc-social-strip .scard{display:flex;align-items:center;gap:.5rem;padding:.35rem .7rem;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
/* Scorebug hero */
body[data-template="broadcaster"] .hero--bc{padding:2.2rem 1rem 1.4rem;display:flex;flex-direction:column;align-items:center}
body[data-template="broadcaster"] .bc-scorebug{width:min(860px,100%);background:var(--panel);border:1px solid var(--line-2);border-radius:var(--radius);overflow:hidden;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.35)}
body[data-template="broadcaster"] .bc-bug-top{display:flex;align-items:center;justify-content:space-between;background:var(--cy);color:#fff;padding:.35rem .9rem;font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:.8rem}
body[data-template="broadcaster"] .bc-bug-top .live-badge{color:#fff}
body[data-template="broadcaster"] .bc-name{font-family:"Oswald",sans-serif;font-size:clamp(2rem,6vw,3.4rem);text-transform:uppercase;letter-spacing:.04em;margin:.9rem 1rem .2rem;line-height:1.05}
body[data-template="broadcaster"] .bc-pool-line{margin:.4rem 0 .2rem}
body[data-template="broadcaster"] .bc-pool-num{font-family:"Oswald",sans-serif;font-variant-numeric:tabular-nums;font-weight:700;font-size:clamp(2.4rem,7vw,4rem);color:var(--cy);display:block;line-height:1}
body[data-template="broadcaster"][data-opt-statsize="normal"] .bc-pool-num{font-size:clamp(1.6rem,4vw,2.4rem)}
body[data-template="broadcaster"] .bc-pool-label{font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.22em;font-size:.75rem;color:var(--ink-mute)}
body[data-template="broadcaster"] .bc-meta{color:var(--ink-soft);margin:.7rem 1rem 1rem;font-size:.95rem}
body[data-template="broadcaster"] .bc-meta b{color:var(--ink);font-variant-numeric:tabular-nums}
body[data-template="broadcaster"] .hero-cta{margin:0 0 1.2rem}
body[data-template="broadcaster"] .btn--bc{background:var(--grad-cta);border-radius:var(--radius);font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.1em}
body[data-template="broadcaster"] .hero-timer{padding:0 1rem 1.2rem}
/* Ticker strip */
body[data-template="broadcaster"] .bc-ticker{overflow:hidden;border-block:2px solid var(--line-2);background:var(--panel)}
body[data-template="broadcaster"] .bc-ticker-track{display:inline-flex;white-space:nowrap;animation:bc-scroll 28s linear infinite;padding:.45rem 0}
body[data-template="broadcaster"] .bc-ticker-track>span{font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:.82rem;color:var(--ink-soft);padding-right:3rem}
body[data-template="broadcaster"] .bc-ticker-track b{color:var(--cy)}
@keyframes bc-scroll{to{transform:translateX(-50%)}}
body[data-template="broadcaster"][data-opt-ticker="false"] .bc-ticker{display:none}
/* Dense broadcast standings */
body[data-template="broadcaster"] .board{padding-top:1.6rem}
body[data-template="broadcaster"] .board-head .sec-title{font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.12em}
body[data-template="broadcaster"] .top3{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem}
body[data-template="broadcaster"] .t3{background:var(--panel);border:1px solid var(--line);border-top:4px solid var(--cy);border-radius:var(--radius);box-shadow:none}
body[data-template="broadcaster"] .t3-medal{font-family:"Oswald",sans-serif;background:var(--cy);color:#fff;border-radius:3px}
body[data-template="broadcaster"] .t3-name{font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.05em}
body[data-template="broadcaster"] .t3-wager{font-variant-numeric:tabular-nums;font-weight:600}
body[data-template="broadcaster"] .table{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel)}
body[data-template="broadcaster"] .t-head{background:var(--panel-2);font-family:"Oswald",sans-serif;text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;color:var(--ink-mute)}
body[data-template="broadcaster"] .t-head,
body[data-template="broadcaster"] .t-row{grid-template-columns:64px 1fr 140px 100px;padding:.55rem .8rem}
body[data-template="broadcaster"] .t-row{border-bottom:1px solid var(--line);background:transparent;box-shadow:none}
body[data-template="broadcaster"] .t-row:nth-child(even){background:rgba(255,255,255,.02)}
body[data-template="broadcaster"] .t-row:hover{background:rgba(232,50,30,.06)}
body[data-template="broadcaster"] .tr-rank{font-family:"Oswald",sans-serif;color:var(--cy);font-weight:600}
body[data-template="broadcaster"] .tr-name{font-weight:600}
body[data-template="broadcaster"] .tr-wager{font-variant-numeric:tabular-nums}
body[data-template="broadcaster"] .tr-bar{display:none}
body[data-template="broadcaster"] .find-rank-input{font-family:"Barlow",sans-serif;background:var(--panel);border:1px solid var(--line-2);border-radius:var(--radius)}
body[data-template="broadcaster"] .rules{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel)}
@media (max-width:720px){
  body[data-template="broadcaster"] .top3{grid-template-columns:1fr}
  body[data-template="broadcaster"] .t-head,
  body[data-template="broadcaster"] .t-row{grid-template-columns:48px 1fr 96px 76px}
  body[data-template="broadcaster"] .bc-brand span[data-brand-name]{display:none}
}
`;

function composeBroadcaster(p) {
  const esc = p.esc;
  const tickerBits = [
    `${esc(String(p.period || "").toUpperCase())} RACE`,
    p.hasPool && !p.hidePrizes ? `<b>${esc(p.pool)}</b> PRIZE POOL` : "",
    `<b>${p.sCount}</b> PLAYERS`,
    p.hasCasino ? `IN PARTNERSHIP WITH <b>${esc(p.casino)}</b>` : "",
    "LIVE STANDINGS",
  ].filter(Boolean).join(" &nbsp;•&nbsp; ");
  const ticker = `<div class="bc-ticker" aria-hidden="true"><div class="bc-ticker-track"><span>${tickerBits}</span><span>${tickerBits}</span></div></div>`;
  return `<section class="hero hero--bc">${p.heroLogo}<div class="bc-scorebug">
<div class="bc-bug-top"><span>${p.periodSpan} race</span><span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></div>
<h1 class="bc-name" data-brand-name>${p.name}</h1>
<div class="bc-pool-line">${p.hasPool && !p.hidePrizes ? `<span class="bc-pool-num">${p.poolSpan}</span><span class="bc-pool-label">${esc(p.prizePoolLabel)}</span>` : p.poolSpan}</div>
<p class="bc-meta"><b data-count>${p.sCount}</b> players &nbsp;·&nbsp; <b class="countdown" data-countdown>--</b> ${esc(p.countdownLabel || "resets in")}${p.hasCasino ? ` &nbsp;·&nbsp; in partnership with <span data-casino>${esc(p.casino)}</span>` : ""}</p>
<div class="hero-cta">${p.ctaBtn(p.hasCasino ? `Join via ${esc(p.casino)}` : p.joinLabel, "btn btn--bc")}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></div></section>
${ticker}
${p.socialsSec ? `<div class="bc-social-strip">${p.socialsSec}</div>` : ""}
${p.announce}<section id="board" class="board"><div class="board-head"><h2 class="sec-title">Standings</h2><span class="player-count-badge" data-player-count-badge></span></div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}`;
}

// Broadcaster chrome: an ON AIR top bar replacing the default nav. Sections
// stay inside <main> where compose() orders them — broadcaster puts socials
// right after the hero (see compose), another template can keep them at the
// bottom like noir does. Placement within <main> is the template's call.
function broadcasterHeader(sp) {
  const esc = sp.esc;
  return `<header class="bc-topbar"><div class="bc-topbar-inner"><a class="bc-brand" href="#top">${sp.navLogo}<span class="bc-onair"><span class="bc-onair-dot"></span>ON AIR</span><span data-brand-name>${esc(sp.b.name)}</span></a>
<nav class="bc-nav" aria-label="Page sections">${sp.hasPartner ? `<a href="#partner">Partner</a>` : ""}<a href="#board">Standings</a>${sp.socials.length ? `<a href="#socials">Socials</a>` : ""}</nav></div></header>`;
}

export const BROADCASTER = {
  id: "broadcaster",
  name: "Broadcaster",
  description: "Live sports lower-third: ON AIR bar, scorebug hero, ticker strip, dense standings.",
  css: BROADCASTER_CSS,
  fonts: [
    "Oswald:wght@400;500;600;700",
    "Barlow:wght@400;500;600;700",
  ],
  presets: [
    { id: "onair", name: "On Air", accentA: "#e8321e", accentB: "#b81f10" },
    { id: "pitchside", name: "Pitchside", accentA: "#1fdd6b", accentB: "#0fa84a" },
    { id: "primetime", name: "Primetime", accentA: "#3b82f6", accentB: "#1d4ed8" },
    { id: "goldlight", name: "Goldlight", accentA: "#f5b301", accentB: "#d18d00" },
  ],
  // Dashboard-editable knobs for this design; consumed via --opt-accent and
  // the data-opt-ticker / data-opt-statsize body attributes above.
  schema: {
    accent:   { type: "color",  label: "Accent",       hint: "Lower-third and highlight color.", default: "#e8321e" },
    ticker:   { type: "toggle", label: "Ticker strip", hint: "Scrolling news ticker under the header.", default: true },
    statsize: { type: "select", label: "Stat size",    hint: "How big the key numbers render.", options: ["normal", "huge"], default: "huge" },
  },
  compose: composeBroadcaster,
  header: broadcasterHeader,
};
