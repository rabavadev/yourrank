export const SPONSOR_CSS = `
:root{
  --bg:#07090d;
  --violet-1:#171d27;
  --violet-2:#0b0e14;
  --panel:#10141b;
  --panel-2:#161c25;
  --line:rgba(255,255,255,.09);
  --line-2:rgba(255,255,255,.18);
  --ink:#f6f7f9;
  --ink-soft:#b6bdc8;
  --ink-mute:#737c8b;
  --cy:#ff4d4d;
  --bl:#ff9f43;
  --grad-name:linear-gradient(100deg,#ffffff 0%,#ff4d4d 58%,#ff9f43 100%);
  --grad-cta:linear-gradient(100deg,#e83e3e,#f58b32);
  --gold:#ffc857;
  --radius:12px;
  --radius-sm:8px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  linear-gradient(115deg,rgba(255,77,77,.16) 0 30%,transparent 30% 100%),
  linear-gradient(115deg,transparent 0 30%,rgba(255,159,67,.05) 30% 31%,transparent 31%),
  repeating-linear-gradient(0deg,rgba(255,255,255,.014) 0 1px,transparent 1px 3px),
  linear-gradient(180deg,#12161d 0%,var(--bg) 70%)}
.nav{border-bottom:1px solid var(--line)}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.19em}
.hero-name{letter-spacing:-.04em}
.btn--grad{color:#fff}
.panel,.table,.t3,.timer-grid{box-shadow:0 22px 60px rgba(0,0,0,.28)}
.panel{border-top:3px solid var(--cy)}
.panel-badge{border-radius:4px;color:#fff}
.t-head{border-left:4px solid var(--cy)}
.t3--1{border-top:3px solid var(--gold)}
/* signature: left-aligned campaign header + ticker rule */
.hero{text-align:left}
.hero .stream-window{margin-left:0}
.hero-sub{margin-left:0;margin-right:0}
.hero-cta{justify-content:flex-start}
.hero-timer{margin-left:0}
.hero-name::after{content:"";display:block;width:96px;height:4px;margin-top:14px;background:var(--grad-cta)}
.board-head{border-left:4px solid var(--cy);padding-left:16px}
`;
