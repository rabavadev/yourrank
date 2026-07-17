export const ROYALE_CSS = `
:root{
  --bg:#10050b;
  --violet-1:#3b0b28;
  --violet-2:#1c0714;
  --panel:#210d19;
  --panel-2:#2d1222;
  --line:rgba(255,204,124,.14);
  --line-2:rgba(255,204,124,.30);
  --ink:#fff7ed;
  --ink-soft:#d7bfc8;
  --ink-mute:#9d7d89;
  --cy:#ffcc7c;
  --bl:#ff6a9f;
  --grad-name:linear-gradient(100deg,#fff4cf 0%,#ffcc7c 48%,#ff6a9f 100%);
  --grad-cta:linear-gradient(100deg,#d89a42,#c83f72);
  --gold:#ffd481;
  --radius:22px;
  --radius-sm:14px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(150% 130% at 50% -12%,rgba(171,27,101,.44),transparent 52%),
  repeating-radial-gradient(circle at 50% -60px,transparent 0 44px,rgba(255,204,124,.05) 44px 46px),
  radial-gradient(90% 70% at 50% 120%,rgba(255,204,124,.06),transparent 60%),
  linear-gradient(180deg,#05030a 0%,var(--bg) 60%)}
.hero-kicker,.eyebrow,.pcol-label{letter-spacing:.2em;text-transform:uppercase}
.hero-name{font-family:Georgia,"Times New Roman",serif;font-weight:700;letter-spacing:-.035em}
.btn--grad{color:#240b14}
.panel,.table,.t3,.timer-grid{box-shadow:0 28px 80px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.035)}
.panel-badge{color:#240b14}
.code-box{background:rgba(255,204,124,.06)}
.t-head{background:rgba(255,204,124,.045)}
.t3--1{box-shadow:0 0 48px -18px var(--gold),inset 0 1px rgba(255,255,255,.07)}
/* signature: ornate serif royal framing */
.sec-title,.hero-kicker{font-family:Georgia,"Times New Roman",serif}
.board .sec-title{position:relative}
.board .sec-title::before,.board .sec-title::after{content:"❧";color:var(--gold);opacity:.7;font-size:.9em;padding:0 .5rem}
.table{border:1px solid var(--line-2);border-radius:var(--radius);box-shadow:0 0 0 1px rgba(255,204,124,.10),0 30px 80px rgba(0,0,0,.35)}
.t-row{border-bottom:1px solid rgba(255,204,124,.08)}
.t-row[data-position="1"]{background:linear-gradient(90deg,rgba(255,204,124,.14),transparent 70%)}
.tr-name{font-family:Georgia,"Times New Roman",serif}
`;
