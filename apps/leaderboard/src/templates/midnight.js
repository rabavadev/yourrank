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
  radial-gradient(1100px 620px at 50% -12%,var(--violet-1) 0%,transparent 62%),
  radial-gradient(820px 520px at 85% 8%,rgba(240,194,75,.10) 0%,transparent 55%),
  radial-gradient(700px 500px at 12% 22%,rgba(240,194,75,.05) 0%,transparent 55%),
  linear-gradient(180deg,var(--violet-2) 0%,var(--bg) 55%)}
.nav{border-bottom:1px solid var(--line)}
.hero-kicker{color:var(--gold);text-transform:uppercase;letter-spacing:.22em;font-size:.78rem}
.hero-name{text-transform:uppercase;letter-spacing:.03em}
.btn--grad{color:#1a1206;font-weight:800;box-shadow:0 6px 28px rgba(240,194,75,.22)}
.code-box{border:1px dashed var(--line-2)}
.tcell b{color:var(--gold)}
.panel,.board{box-shadow:0 0 0 1px var(--line),0 30px 80px rgba(0,0,0,.5)}
.t-head{border-bottom:1px solid var(--line-2)}
`;
