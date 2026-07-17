export const OCEAN_CSS = `
:root{
  --bg:#020a12;
  --violet-1:#073c52;
  --violet-2:#041b2b;
  --panel:#071827;
  --panel-2:#0a2133;
  --line:rgba(81,219,255,.14);
  --line-2:rgba(81,219,255,.30);
  --ink:#effcff;
  --ink-soft:#a7cad5;
  --ink-mute:#6f96a3;
  --cy:#51dbff;
  --bl:#4776ff;
  --grad-name:linear-gradient(100deg,#baf5ff 0%,#51dbff 48%,#4776ff 100%);
  --grad-cta:linear-gradient(100deg,#24bfe8,#315ee8);
  --gold:#ffd166;
  --radius:18px;
  --radius-sm:11px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(1200px 800px at 50% 125%,rgba(71,118,255,.26),transparent 58%),
  radial-gradient(1000px 560px at 50% -12%,rgba(81,219,255,.22),transparent 60%),
  repeating-linear-gradient(180deg,transparent 0 38px,rgba(81,219,255,.02) 38px 39px),
  linear-gradient(180deg,#03141f 0%,var(--bg) 68%)}
.watermarks{opacity:.025}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.18em}
.hero-name{letter-spacing:-.04em}
.btn--grad{color:#fff}
.panel,.table,.t3,.timer-grid{box-shadow:0 24px 70px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.04)}
.panel{background:linear-gradient(145deg,rgba(10,33,51,.96),rgba(7,24,39,.96))}
.panel-badge{color:#03131d}
.t-head{background:linear-gradient(90deg,rgba(81,219,255,.07),rgba(71,118,255,.08))}
.t3--1{border-color:rgba(81,219,255,.44)}
/* signature: rounded "glass" framing + centered wide table */
.table{border:1px solid var(--line-2);border-radius:22px;overflow:hidden;backdrop-filter:blur(2px);box-shadow:0 30px 80px rgba(0,0,0,.30)}
.t-head{backdrop-filter:blur(2px)}
.t-row{border-bottom:1px solid rgba(81,219,255,.08)}
.t-row:hover{background:rgba(81,219,255,.06)}
.t-row[data-position="1"]{background:linear-gradient(90deg,rgba(81,219,255,.14),transparent 70%)}
.board .sec-title::after{content:" 🌊";font-size:.8em}
`;
