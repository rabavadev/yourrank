/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Tournament" — countdown-first broadcast structure: a giant race clock is
// the hero, the prize pool is the supporting line, trophy podium for the
// top 3, numbered standings below, partner panel demoted under the board.
// Shares the buildParts() data contract but owns its page structure and
// tokens — Sora type, deep-blue palette, trophy podium ordering.

// Convention: every rule is scoped under body[data-template="tournament"] so
// templates can never leak into each other (preview compare, live switching).
const TOURNAMENT_CSS = `
body[data-template="tournament"]{
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
  --cy:var(--opt-accent,#4fc3f7);
  --bl:#3b82f6;
  --grad-name:linear-gradient(100deg,var(--opt-accent,#4fc3f7),#3b82f6);
  --grad-cta:linear-gradient(100deg,var(--opt-accent,#4fc3f7),#3b82f6);
  --gold:#ffd15c;
  --radius:14px;
  --radius-sm:10px;
  font-family:"Sora",system-ui,sans-serif;
}
body[data-template="tournament"] .field{background:radial-gradient(1000px 560px at 50% -12%,rgba(79,195,247,.12),transparent 60%),linear-gradient(180deg,var(--violet-1),var(--bg))}
body[data-template="tournament"] .watermarks{opacity:.03}
/* Clock hero */
body[data-template="tournament"] .hero--clock{text-align:center;padding:4rem 0 2.4rem;min-height:0;display:block}
body[data-template="tournament"] .hero--clock .hero-kicker{font-size:1rem;color:var(--ink-soft);letter-spacing:.1em}
body[data-template="tournament"] .clock-title{font-size:clamp(1.2rem,2vw,1.5rem);letter-spacing:.3em;text-transform:uppercase;color:var(--ink-mute);font-weight:600;margin:.8rem 0 1.2rem}
body[data-template="tournament"] .hero--clock .hero-timer{margin-top:0}
body[data-template="tournament"] .hero--clock .timer-grid{gap:.6rem}
body[data-template="tournament"] .hero--clock .tcell b{font-size:clamp(2.6rem,6vw,4.2rem);background:var(--panel-2);border:1px solid var(--line);border-radius:14px;padding:.45rem .8rem;min-width:2.4ch;font-variant-numeric:tabular-nums;box-shadow:0 20px 50px -30px rgba(79,195,247,.5)}
body[data-template="tournament"] .hero--clock .tcell span{margin-top:.55rem;letter-spacing:.2em}
body[data-template="tournament"] .hero--clock .tsep{font-size:2.4rem;color:var(--ink-mute);align-self:flex-start;padding-top:.8rem}
body[data-template="tournament"] .clock-sub{margin:1.4rem auto 1.2rem;color:var(--ink-soft);font-size:1.05rem}
body[data-template="tournament"] .clock-sub [data-pool]{color:var(--gold);font-weight:800;font-size:1.2rem}
body[data-template="tournament"] .clock-sub b[data-count]{color:var(--ink)}
/* Trophy podium top-3: winner centered and taller */
body[data-template="tournament"] .board-head--center{justify-content:center;text-align:center}
body[data-template="tournament"] .top3{grid-template-columns:1fr 1.12fr 1fr;align-items:end;gap:16px;margin:1.6rem auto 1.4rem}
body[data-template="tournament"] .t3{border-radius:var(--radius);padding:24px 16px 18px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
body[data-template="tournament"] .t3--1{order:2;padding:32px 16px 26px;border-color:rgba(255,209,92,.42)}
body[data-template="tournament"] .t3--2{order:1}
body[data-template="tournament"] .t3--3{order:3}
body[data-template="tournament"] .t3-medal,
body[data-template="tournament"] .t3--1 .t3-medal,
body[data-template="tournament"] .t3--2 .t3-medal,
body[data-template="tournament"] .t3--3 .t3-medal{font-size:0}
body[data-template="tournament"] .t3--1 .t3-medal::before{content:"🏆";font-size:1.7rem}
body[data-template="tournament"] .t3--2 .t3-medal::before{content:"🥈";font-size:1.4rem}
body[data-template="tournament"] .t3--3 .t3-medal::before{content:"🥉";font-size:1.4rem}
body[data-template="tournament"] .t3--1 .t3-wager{color:var(--gold)}
/* Numbered standings, no avatars */
body[data-template="tournament"] .tr-av{display:none}
body[data-template="tournament"] .tr-rank{font-family:"JetBrains Mono",ui-monospace,monospace;color:var(--cy)}
body[data-template="tournament"] .t-row[data-position="1"] .tr-rank,
body[data-template="tournament"] .t-row[data-position="2"] .tr-rank,
body[data-template="tournament"] .t-row[data-position="3"] .tr-rank{color:var(--gold)}
body[data-template="tournament"] .t-row:hover{background:rgba(79,195,247,.05)}
@media (max-width:720px){
  body[data-template="tournament"] .top3{grid-template-columns:1fr;align-items:stretch}
  body[data-template="tournament"] .t3--1{order:1}
  body[data-template="tournament"] .t3--2{order:2}
  body[data-template="tournament"] .t3--3{order:3}
}
/* ── Editable schema options (dashboard) ── */
body[data-template="tournament"][data-opt-medals="false"] .t3-medal::before{content:none}
body[data-template="tournament"][data-opt-clocksize="huge"] .hero--clock .tcell b{font-size:clamp(3.4rem,8vw,5.6rem)}
body[data-template="tournament"][data-opt-clocksize="huge"] .hero--clock .tsep{font-size:3rem}
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
  fonts: [
    "Sora:wght@400;600;700;800",
    "JetBrains+Mono:wght@500;700",
  ],
  presets: [
    { id: "signal", name: "Signal", accentA: "#4fc3f7", accentB: "#3b82f6" },
    { id: "lime", name: "Lime", accentA: "#a3e635", accentB: "#22c55e" },
    { id: "flare", name: "Flare", accentA: "#ff9f43", accentB: "#ff5f6d" },
  ],
  schema: {
    accent:    { type: "color",  label: "Accent",       hint: "Clock, winner and highlight color.", default: "#4fc3f7" },
    medals:    { type: "toggle", label: "Medal emojis", hint: "Trophy and medals on the podium cards.", default: true },
    clocksize: { type: "select", label: "Clock size",   hint: "How loud the countdown hero shouts.", options: ["normal", "huge"], default: "normal" },
  },
  compose: composeTournament,
};
