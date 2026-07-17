export const NEON_CSS = `
:root{
  --bg:#02030a;
  --violet-1:#051c21;
  --violet-2:#050513;
  --panel:#080b18;
  --panel-2:#0c1124;
  --line:rgba(0,255,209,.16);
  --line-2:rgba(255,44,208,.32);
  --ink:#f4ffff;
  --ink-soft:#a9c9d0;
  --ink-mute:#71858e;
  --cy:#00ffd1;
  --bl:#ff2cd0;
  --grad-name:linear-gradient(100deg,#00ffd1 0%,#54a9ff 48%,#ff2cd0 100%);
  --grad-cta:linear-gradient(100deg,#00d9b4,#d91db4);
  --gold:#ffe66d;
  --radius:8px;
  --radius-sm:6px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  linear-gradient(rgba(0,255,209,.08) 1px,transparent 1px),
  linear-gradient(90deg,rgba(0,255,209,.08) 1px,transparent 1px),
  radial-gradient(1100px 640px at 50% 118%,rgba(255,44,208,.24),transparent 58%),
  radial-gradient(1000px 560px at 50% -8%,rgba(0,255,209,.18),transparent 60%),
  linear-gradient(180deg,#070417,var(--bg));
  background-size:44px 44px,44px 44px,auto,auto,auto}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.22em}
.hero-name{text-transform:uppercase;letter-spacing:.01em;text-shadow:0 0 42px rgba(0,255,209,.18)}
.btn,.panel,.board,.table,.t3{box-shadow:0 0 0 1px rgba(0,255,209,.05),0 0 30px rgba(255,44,208,.05)}
.btn--grad{color:#02110e}
.timer-grid,.code-box{box-shadow:inset 0 0 24px rgba(0,255,209,.06)}
.t-head{background:linear-gradient(90deg,rgba(0,255,209,.07),rgba(255,44,208,.07))}
/* signature: neon-outlined rows + glowing rule */
.table{border:1px solid var(--line-2);box-shadow:0 0 40px -12px rgba(0,255,209,.4),inset 0 0 0 1px rgba(255,44,208,.05)}
.t-row{border-left:2px solid transparent;transition:border-color .15s,background .15s}
.t-row:hover{border-left-color:var(--cy);background:rgba(0,255,209,.05)}
.t-row[data-position="1"]{border-left-color:var(--bl);background:linear-gradient(90deg,rgba(255,44,208,.12),transparent 70%)}
.sec-title{text-shadow:0 0 24px rgba(0,255,209,.5)}
`;
