// Template: "Midnight Gold" — black felt, molten gold. The first selectable
// page template. Loaded AFTER /assets/leaderboard.css, so it only overrides
// design tokens plus a few signature flourishes; the base stylesheet keeps
// doing the structural heavy lifting. Pro accent colors (theme_json accentA/B)
// are injected AFTER this layer, so they still win on top of any template.
export const MIDNIGHT_CSS = `
:root{
  --bg:#050504;
  --violet-1:#1b1305;
  --violet-2:#0c0903;
  --panel:#12100a;
  --panel-2:#1a150a;
  --line:rgba(240,194,75,.16);
  --line-2:rgba(240,194,75,.32);
  --ink:#f7f3e6;
  --ink-soft:#cfc7ac;
  --ink-mute:#8d8468;
  --cy:#f5d061;
  --bl:#c9932b;
  --grad-name:linear-gradient(100deg,#f8e7a0 0%,#f0c24b 45%,#c8871c 100%);
  --grad-cta:linear-gradient(100deg,#e8b93e,#b97b12);
  --gold:#f0c24b;
  --radius:14px;
  --radius-sm:9px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
::selection{background:#f0c24b;color:#1a1206}
.field{background:
  radial-gradient(1200px 700px at 50% -18%,rgba(240,194,75,.22) 0%,transparent 58%),
  repeating-linear-gradient(45deg,rgba(240,194,75,.045) 0 1px,transparent 1px 26px),
  repeating-linear-gradient(-45deg,rgba(240,194,75,.045) 0 1px,transparent 1px 26px),
  radial-gradient(130% 110% at 50% 0%,#0f0c05 0%,var(--bg) 62%)}
.nav{border-bottom:1px solid var(--line)}
.hero-kicker{color:var(--gold);text-transform:uppercase;letter-spacing:.22em;font-size:.78rem}
.hero-name{text-transform:uppercase;letter-spacing:.03em}
.btn--grad{color:#1a1206;font-weight:800;box-shadow:0 6px 28px rgba(240,194,75,.22)}
.code-box{border:1px dashed var(--line-2)}
.tcell b{color:var(--gold)}
.panel,.board{box-shadow:0 0 0 1px var(--line),0 30px 80px rgba(0,0,0,.5)}
.t-head{border-bottom:1px solid var(--line-2)}
/* signature: gilded VIP framing */
.sec-title{position:relative;display:inline-block}
.board .sec-title::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;background:var(--grad-name)}
.table{border:1px solid var(--line-2);border-radius:var(--radius)}
.t-row{border-bottom:1px solid rgba(240,194,75,.10)}
.t-row[data-position="1"]{background:linear-gradient(90deg,rgba(240,194,75,.12),transparent 70%)}
.t3--1{box-shadow:0 0 60px -18px var(--gold)}
`;
