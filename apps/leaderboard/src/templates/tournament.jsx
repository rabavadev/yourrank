/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Tournament" — countdown-first broadcast structure: a giant race clock is
// the hero, the prize pool is the supporting line, trophy podium for the
// top 3, numbered standings below, partner panel demoted under the board.
// Shares the buildParts() data contract but owns its page structure and
// tokens — Sora type, deep-blue palette, trophy podium ordering.

const TOURNAMENT_CSS = `
:root{
  --bg:#070b14;
  --violet-1:#0b1322;
  --violet-2:#070c16;
  --panel:#0e1626;
  --panel-2:#131d31;
  --line:rgba(110,150,220,.14);
  --line-2:rgba(110,150,220,.30);
  --ink:#e9f0fb;
  --ink-soft:#a6b4cd;
  --ink-mute:#7d8aa3;
  --cy:#4fc3f7;
  --bl:#3b82f6;
  --grad-name:linear-gradient(100deg,#4fc3f7,#3b82f6);
  --grad-cta:linear-gradient(100deg,#4fc3f7,#3b82f6);
  --gold:#ffd15c;
  --radius:14px;
  --radius-sm:10px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(1000px 560px at 50% -12%,rgba(79,195,247,.12),transparent 60%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
/* Clock hero */
.hero--clock{text-align:center;padding:4rem 0 2.4rem;min-height:0;display:block}
.hero--clock .hero-kicker{font-size:1rem;color:var(--ink-soft);letter-spacing:.1em}
.clock-title{font-size:clamp(1.2rem,2vw,1.5rem);letter-spacing:.3em;text-transform:uppercase;color:var(--ink-mute);font-weight:600;margin:.8rem 0 1.2rem}
.hero--clock .hero-timer{margin-top:0}
.hero--clock .timer-grid{gap:.6rem}
.hero--clock .tcell b{font-size:clamp(2.6rem,6vw,4.2rem);background:var(--panel-2);border:1px solid var(--line);border-radius:14px;padding:.45rem .8rem;min-width:2.4ch;font-variant-numeric:tabular-nums;box-shadow:0 20px 50px -30px rgba(79,195,247,.5)}
.hero--clock .tcell span{margin-top:.55rem;letter-spacing:.2em}
.hero--clock .tsep{font-size:2.4rem;color:var(--ink-mute);align-self:flex-start;padding-top:.8rem}
.clock-sub{margin:1.4rem auto 1.2rem;color:var(--ink-soft);font-size:1.05rem}
.clock-sub [data-pool]{color:var(--gold);font-weight:800;font-size:1.2rem}
.clock-sub b[data-count]{color:var(--ink)}
/* Trophy podium top-3: winner centered and taller */
.board-head--center{justify-content:center;text-align:center}
.top3{grid-template-columns:1fr 1.12fr 1fr;align-items:end;gap:16px;margin:1.6rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 18px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:32px 16px 26px;border-color:rgba(255,209,92,.42)}
.t3--2{order:1}.t3--3{order:3}
.t3-medal,.t3--1 .t3-medal,.t3--2 .t3-medal,.t3--3 .t3-medal{font-size:0}
.t3--1 .t3-medal::before{content:"🏆";font-size:1.7rem}
.t3--2 .t3-medal::before{content:"🥈";font-size:1.4rem}
.t3--3 .t3-medal::before{content:"🥉";font-size:1.4rem}
.t3--1 .t3-wager{color:var(--gold)}
/* Numbered standings, no avatars */
.tr-av{display:none}
.tr-rank{font-family:"JetBrains Mono",ui-monospace,monospace;color:var(--cy)}
.t-row[data-position="1"] .tr-rank,.t-row[data-position="2"] .tr-rank,.t-row[data-position="3"] .tr-rank{color:var(--gold)}
.t-row:hover{background:rgba(79,195,247,.05)}
@media (max-width:720px){
  .top3{grid-template-columns:1fr;align-items:stretch}
  .t3--1{order:1}.t3--2{order:2}.t3--3{order:3}
}
`;

function composeTournament(p) {
  const esc = p.esc;
  return `<section class="hero hero--clock">${p.heroLogo}<p class="hero-kicker" data-brand-name>${p.name}</p>
<h1 class="clock-title">${esc(p.countdownLabel || "Race ends in")}</h1>
<div class="hero-timer" data-timer>${p.timerGrid}</div>
<p class="clock-sub">${p.hidePrizes || !p.hasPool ? `${p.periodSpan} race` : `${p.poolSpan} ${esc((p.prizePoolLabel || "Prize pool").toLowerCase())} · ${p.periodSpan} race`} · <b data-count>${p.sCount}</b> players</p>
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

export const TOURNAMENT = {
  id: "tournament",
  name: "Tournament",
  description: "Countdown-first broadcast page: giant race clock hero, trophy podium.",
  css: TOURNAMENT_CSS,
  presets: [
    { id: "signal", name: "Signal", accentA: "#4fc3f7", accentB: "#3b82f6" },
    { id: "lime", name: "Lime", accentA: "#a3e635", accentB: "#22c55e" },
    { id: "flare", name: "Flare", accentA: "#ff9f43", accentB: "#ff5f6d" },
  ],
  compose: composeTournament,
};
