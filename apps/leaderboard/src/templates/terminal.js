// "Terminal" — the whole board lives inside one terminal window (see
// composeTerminal in render.js): title bar with dots, prompt-style status
// lines instead of a hero, dense monospace table with bracketed ranks.
export const TERMINAL_CSS = `
:root{
  --bg:#05070a;
  --violet-1:#080b10;
  --violet-2:#05070a;
  --panel:#0a0f14;
  --panel-2:#0e141b;
  --line:rgba(57,217,138,.16);
  --line-2:rgba(57,217,138,.34);
  --ink:#d7ffe9;
  --ink-soft:#7fbf9c;
  --ink-mute:#4e7a62;
  --cy:#39d98a;
  --bl:#2fae6e;
  --grad-name:linear-gradient(100deg,#39d98a,#2fae6e);
  --grad-cta:linear-gradient(100deg,#39d98a,#2fae6e);
  --gold:#e8c14c;
  --radius:8px;
  --radius-sm:6px;
}
body{font-family:"JetBrains Mono",ui-monospace,monospace}
.field{background:var(--bg)}
.watermarks{display:none}
.nav{border-bottom:1px solid var(--line)}
.sec-title,.hero-name,.btn{font-family:"JetBrains Mono"}
/* Terminal window frame */
.term-window{width:min(1100px,94%);margin:2.4rem auto;border:1px solid var(--line-2);border-radius:10px;background:var(--panel);box-shadow:0 40px 90px -50px rgba(57,217,138,.35);overflow:hidden}
.term-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--panel-2);border-bottom:1px solid var(--line)}
.term-dots{display:inline-flex;gap:6px}
.term-dots i{width:11px;height:11px;border-radius:50%;background:#2a3f33}
.term-dots i:first-child{background:#ff5f56}.term-dots i:nth-child(2){background:#ffbd2e}.term-dots i:last-child{background:#27c93f}
.term-title{font-size:.82rem;color:var(--ink-soft)}
.term-body{padding:8px 24px 32px}
/* Prompt lines instead of a hero */
.hero--term{min-height:0;padding:1.6rem 0 .6rem;text-align:left;display:block}
.term-line{font-size:1rem;color:var(--ink);margin:.45rem 0;overflow-wrap:anywhere}
.term-line--dim{color:var(--ink-soft)}
.term-prompt{color:var(--cy);font-weight:700}
.term-line b{color:var(--cy);font-variant-numeric:tabular-nums}
.term-line [data-pool]{color:var(--gold)}
.hero--term .hero-cta{justify-content:flex-start;margin:1rem 0 0}
.btn--term{background:transparent;border:1px solid var(--line-2);color:var(--cy);border-radius:var(--radius);padding:.55rem 1.1rem;font-size:.9rem}
.btn--term:hover{background:rgba(57,217,138,.08)}
/* Board inside the window */
.board{width:100%;padding:1rem 0 0}
.board-head{margin-bottom:12px}
.board-head .sec-title{font-size:1.1rem;letter-spacing:0;text-transform:none}
/* Compact top-3 readout, no cards fanfare */
.top3{grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 14px}
.t3{border-radius:var(--radius);padding:14px;text-align:left;background:var(--panel-2);border:1px solid var(--line)}
.t3-av{display:none}
.t3-medal{font-size:.72rem;letter-spacing:.14em;color:var(--ink-mute)}
.t3--1{border-color:rgba(232,193,76,.5)}
.t3--1 .t3-medal,.t3--1 .t3-wager{color:var(--gold)}
.t3--2 .t3-medal{color:#aab4c8}.t3--3 .t3-medal{color:#cf9160}
.t3-name{font-size:1rem}
/* Dense bracketed table */
.table{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel-2)}
.t-head,.t-row{grid-template-columns:72px 1fr 150px 100px;padding:.5rem 1rem}
.t-head{background:transparent;border-bottom:1px solid var(--line-2);color:var(--ink-mute);letter-spacing:.1em}
.t-row{border-bottom:1px dashed var(--line)}
.t-row:hover{background:rgba(57,217,138,.05)}
.tr-rank{color:var(--cy)}
.tr-rank::before{content:"["}.tr-rank::after{content:"]"}
.tr-av{display:none}
.tr-name{font-family:"JetBrains Mono";font-weight:500}
.t-row[data-position="1"] .tr-rank{color:var(--gold)}
.tr-prize.has{color:var(--gold)}
.find-rank-input{font-family:"JetBrains Mono"}
`;
