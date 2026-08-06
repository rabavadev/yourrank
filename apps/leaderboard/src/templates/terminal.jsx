/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Terminal" — the whole board lives inside one terminal window: title bar
// with dots, prompt-style status lines instead of a marketing hero, dense
// monospace table with bracketed ranks, partner panel demoted below the
// window. Shares the buildParts() data contract (every data-* hook appears
// exactly once) but owns its page structure, typography and tokens.

// Convention: every rule is scoped under body[data-template="terminal"] so
// templates can never leak into each other (preview compare, live switching).
const TERMINAL_CSS = `
body[data-template="terminal"]{
  --bg:#05070a;
  --violet-1:#080b10;
  --violet-2:#05070a;
  --panel:#0a0f14;
  --panel-2:#0e141b;
  --line:rgba(57,217,138,.16);
  --line-2:rgba(57,217,138,.34);
  --ink:#d7ffe9;
  --ink-soft:#7fbf9c;
  --ink-mute:#5e8a70;
  --cy:var(--opt-accent,#39d98a);
  --bl:#2fae6e;
  --grad-name:linear-gradient(100deg,var(--opt-accent,#39d98a),#2fae6e);
  --grad-cta:linear-gradient(100deg,var(--opt-accent,#39d98a),#2fae6e);
  --gold:#e8c14c;
  --radius:8px;
  --radius-sm:6px;
  font-family:"JetBrains Mono",ui-monospace,monospace;
}
body[data-template="terminal"] .field{background:var(--bg)}
body[data-template="terminal"] .watermarks{display:none}
body[data-template="terminal"] .nav{border-bottom:1px solid var(--line)}
body[data-template="terminal"] .sec-title,
body[data-template="terminal"] .hero-name,
body[data-template="terminal"] .btn{font-family:"JetBrains Mono",ui-monospace,monospace}
/* Terminal window frame */
body[data-template="terminal"] .term-window{width:min(1100px,94%);margin:2.4rem auto;border:1px solid var(--line-2);border-radius:10px;background:var(--panel);box-shadow:0 40px 90px -50px rgba(57,217,138,.35);overflow:hidden}
body[data-template="terminal"] .term-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--panel-2);border-bottom:1px solid var(--line)}
body[data-template="terminal"] .term-dots{display:inline-flex;gap:6px}
body[data-template="terminal"] .term-dots i{width:11px;height:11px;border-radius:50%;background:#2a3f33}
body[data-template="terminal"] .term-dots i:first-child{background:#ff5f56}
body[data-template="terminal"] .term-dots i:nth-child(2){background:#ffbd2e}
body[data-template="terminal"] .term-dots i:last-child{background:#27c93f}
body[data-template="terminal"] .term-title{font-size:.82rem;color:var(--ink-soft)}
body[data-template="terminal"] .term-body{padding:8px 24px 32px}
/* Prompt lines instead of a hero */
body[data-template="terminal"] .hero--term{min-height:0;padding:1.6rem 0 .6rem;text-align:left;display:block}
body[data-template="terminal"] .term-line{font-size:1rem;color:var(--ink);margin:.45rem 0;overflow-wrap:anywhere}
body[data-template="terminal"] .term-line--dim{color:var(--ink-soft)}
body[data-template="terminal"] .term-prompt{color:var(--cy);font-weight:700}
body[data-template="terminal"] .term-line b{color:var(--cy);font-variant-numeric:tabular-nums}
body[data-template="terminal"] .term-line [data-pool]{color:var(--gold)}
body[data-template="terminal"] .hero--term .hero-cta{justify-content:flex-start;margin:1rem 0 0}
body[data-template="terminal"] .btn--term{background:transparent;border:1px solid var(--line-2);color:var(--cy);border-radius:var(--radius);padding:.55rem 1.1rem;font-size:.9rem}
body[data-template="terminal"] .btn--term:hover{background:rgba(57,217,138,.08)}
/* Board inside the window */
body[data-template="terminal"] .board{width:100%;padding:1rem 0 0}
body[data-template="terminal"] .board-head{margin-bottom:12px}
body[data-template="terminal"] .board-head .sec-title{font-size:1.1rem;letter-spacing:0;text-transform:none}
/* Compact top-3 readout, no card fanfare */
body[data-template="terminal"] .top3{grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 14px}
body[data-template="terminal"] .t3{border-radius:var(--radius);padding:14px;text-align:left;background:var(--panel-2);border:1px solid var(--line)}
body[data-template="terminal"] .t3-av{display:none}
body[data-template="terminal"] .t3-medal{font-size:.72rem;letter-spacing:.14em;color:var(--ink-mute)}
body[data-template="terminal"] .t3--1{border-color:rgba(232,193,76,.5)}
body[data-template="terminal"] .t3--1 .t3-medal,
body[data-template="terminal"] .t3--1 .t3-wager{color:var(--gold)}
body[data-template="terminal"] .t3--2 .t3-medal{color:#aab4c8}
body[data-template="terminal"] .t3--3 .t3-medal{color:#cf9160}
body[data-template="terminal"] .t3-name{font-size:1rem}
/* Dense bracketed table */
body[data-template="terminal"] .table{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel-2)}
body[data-template="terminal"] .t-head,
body[data-template="terminal"] .t-row{grid-template-columns:72px 1fr 150px 100px;padding:.5rem 1rem}
body[data-template="terminal"] .t-head{background:transparent;border-bottom:1px solid var(--line-2);color:var(--ink-mute);letter-spacing:.1em}
body[data-template="terminal"] .t-row{border-bottom:1px dashed var(--line)}
body[data-template="terminal"] .t-row:hover{background:rgba(57,217,138,.05)}
body[data-template="terminal"] .tr-rank{color:var(--cy)}
body[data-template="terminal"] .tr-rank::before{content:"["}
body[data-template="terminal"] .tr-rank::after{content:"]"}
body[data-template="terminal"] .tr-av{display:none}
body[data-template="terminal"] .tr-name{font-family:"JetBrains Mono",ui-monospace,monospace;font-weight:500}
body[data-template="terminal"] .t-row[data-position="1"] .tr-rank{color:var(--gold)}
body[data-template="terminal"] .tr-prize.has{color:var(--gold)}
body[data-template="terminal"] .find-rank-input{font-family:"JetBrains Mono",ui-monospace,monospace}
@media (max-width:720px){
  body[data-template="terminal"] .top3{grid-template-columns:1fr}
  body[data-template="terminal"] .t-head,
  body[data-template="terminal"] .t-row{grid-template-columns:52px 1fr 110px 84px}
}
/* ── Editable schema options (dashboard) ──────────────────────────── */
/* CRT scanlines overlay over the terminal window */
body[data-template="terminal"][data-opt-scanlines="true"] .term-body{position:relative}
body[data-template="terminal"][data-opt-scanlines="true"] .term-body::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
/* Cozy table density (default is compact) */
body[data-template="terminal"][data-opt-density="cozy"] .t-head,
body[data-template="terminal"][data-opt-density="cozy"] .t-row{padding:.95rem 1.2rem}
body[data-template="terminal"][data-opt-density="cozy"] .t3{padding:22px 16px}
body[data-template="terminal"][data-opt-density="cozy"] .term-body{padding:16px 32px 44px}
`;

function composeTerminal(p) {
  const esc = p.esc;
  return `${p.header}<main id="top"><div class="term-window"><div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title">~/leaderboard — <span data-brand-name>${p.name}</span></span></div>
<div class="term-body"><section class="hero hero--term"><p class="term-line"><span class="term-prompt">$</span> race --period ${p.periodSpan}${p.hasPool ? ` --pool ${p.poolSpan}` : ""}</p>
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
${p.socialsSec}</main>
${p.footer}`;
}

export const TERMINAL = {
  id: "terminal",
  name: "Terminal",
  description: "The whole board inside a terminal window: prompt lines, dense monospace table.",
  css: TERMINAL_CSS,
  fonts: ["JetBrains+Mono:wght@400;500;700"],
  presets: [
    { id: "matrix", name: "Matrix", accentA: "#39d98a", accentB: "#2fae6e" },
    { id: "amber", name: "Amber", accentA: "#e8c14c", accentB: "#c8871c" },
    { id: "ice", name: "Ice", accentA: "#5ad9ff", accentB: "#3b82f6" },
  ],
  // Dashboard-editable knobs for this design. The dashboard auto-builds
  // controls from this schema; values arrive as --opt-accent, and as
  // data-opt-scanlines / data-opt-density attributes consumed by the CSS
  // above (also readable in compose() via parts.options).
  schema: {
    accent:    { type: "color",  label: "Terminal accent", default: "#39d98a" },
    scanlines: { type: "toggle", label: "CRT scanlines",   default: false },
    density:   { type: "select", label: "Table density",   options: ["compact", "cozy"], default: "compact" },
  },
  compose: composeTerminal,
};
