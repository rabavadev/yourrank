// "Terminal" — a monospace, green-on-black trading-terminal look with a dense
// standings table and bracketed ranks. CSS only over the shared markup.
export const TERMINAL_CSS = `
:root{
  --bg:#05070a;
  --violet-1:#080c10;
  --violet-2:#05070a;
  --panel:#0a0f14;
  --panel-2:#0e141b;
  --line:rgba(80,230,150,.16);
  --line-2:rgba(80,230,150,.34);
  --ink:#d6f5e3;
  --ink-soft:#8fbfa4;
  --ink-mute:#5c7d6b;
  --cy:#39d98a;
  --bl:#2fae6e;
  --grad-name:linear-gradient(100deg,#39d98a,#8ef0b8);
  --grad-cta:linear-gradient(100deg,#39d98a,#2fae6e);
  --gold:#e8d44c;
  --radius:6px;
  --radius-sm:4px;
}
body{font-family:"JetBrains Mono",ui-monospace,monospace}
.field{background:linear-gradient(180deg,#070b0e,var(--bg))}
.watermarks{display:none}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{font-family:"JetBrains Mono";letter-spacing:-.02em;color:var(--cy)}
.hero-kicker,.eyebrow,.pcol-label,.timer-label,.t-head{text-transform:uppercase;letter-spacing:.14em}
.tcell b{background:var(--panel-2);border:1px solid var(--line);border-radius:4px;padding:.3rem .5rem}
/* Top 3: compact framed cards, no podium lift */
.top3{grid-template-columns:repeat(3,1fr);gap:10px;margin:1.6rem auto 1rem}
.t3{border-radius:6px;padding:16px;text-align:left;background:var(--panel);border:1px solid var(--line)}
.t3-av{display:none}
.t3-medal{color:var(--cy)}
.t3--1{border-color:var(--line-2)}
.t3--1 .t3-medal{color:var(--gold)}
.t3-name{font-family:"JetBrains Mono"}
.t3-wager,.t3-prize{font-family:"JetBrains Mono"}
.t3--1 .t3-prize{color:var(--gold);background:rgba(232,212,76,.12)}
/* Dense bracketed table */
.table{border-radius:6px}
.t-head,.t-row{grid-template-columns:64px 1fr 150px 100px;padding:.55rem 1.1rem}
.t-row{border-bottom:1px solid rgba(80,230,150,.08)}
.t-row:hover{background:rgba(57,217,138,.06)}
.tr-av{display:none}
.tr-rank{color:var(--cy)}
.tr-rank::before{content:"["}.tr-rank::after{content:"]"}
.tr-name{font-family:"JetBrains Mono";font-weight:500}
.tr-prize.has{color:var(--gold)}
`;
