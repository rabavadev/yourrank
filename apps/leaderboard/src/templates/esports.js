export const ESPORTS_CSS = `
:root{
  --bg:#070706;
  --violet-1:#2a3003;
  --violet-2:#101201;
  --panel:#11120e;
  --panel-2:#191b13;
  --line:rgba(205,255,31,.14);
  --line-2:rgba(205,255,31,.32);
  --ink:#f8fbe8;
  --ink-soft:#c3c9a9;
  --ink-mute:#81876c;
  --cy:#cdff1f;
  --bl:#82ff47;
  --grad-name:linear-gradient(100deg,#f7ffe0 0%,#cdff1f 52%,#72ff3d 100%);
  --grad-cta:linear-gradient(100deg,#cdff1f,#72ff3d);
  --gold:#ffd43b;
  --radius:2px;
  --radius-sm:2px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  repeating-linear-gradient(115deg,transparent 0 54px,rgba(205,255,31,.06) 54px 58px),
  repeating-linear-gradient(-115deg,transparent 0 54px,rgba(114,255,61,.035) 54px 58px),
  radial-gradient(950px 580px at 100% 0%,rgba(205,255,31,.16),transparent 58%),
  linear-gradient(160deg,#0b0d02 0%,var(--bg) 62%)}
.hero-kicker,.eyebrow,.pcol-label,.t-head{text-transform:uppercase;font-style:italic;letter-spacing:.18em}
.hero-name{text-transform:uppercase;font-style:italic;letter-spacing:-.045em}
.btn{border-radius:1px;transform:skewX(-5deg)}
.btn>*{transform:skewX(5deg)}
.btn--grad{color:#0c1002}
.panel,.table,.t3,.timer-grid,.rules{clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)}
.panel-badge{border-radius:0;color:#0c1002}
.t-head{background:rgba(205,255,31,.07)}
.t3--1{box-shadow:inset 0 -3px var(--gold)}
/* signature: left-aligned team header + big italic ranks */
.hero{text-align:left}
.hero .stream-window{margin-left:0}
.hero-sub{margin-left:0}
.hero-cta{justify-content:flex-start}
.hero-timer{margin-left:0}
.tr-rank{font-style:italic;font-weight:800;font-size:1.25rem;color:var(--cy)}
.tr-name{text-transform:uppercase;letter-spacing:.02em}
.t-row{border-left:3px solid transparent}
.t-row:hover{border-left-color:var(--cy);background:rgba(205,255,31,.05)}
.t-row[data-position="1"]{border-left-color:var(--gold);background:linear-gradient(90deg,rgba(205,255,31,.14),transparent 65%)}
`;
