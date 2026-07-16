// "Champion Stage" — a glossy raised podium with medal chips and pedestals,
// then a compact standings list. CSS only over the shared markup.
export const CHAMPION_CSS = `
:root{
  --bg:#0b0e14;
  --violet-1:#12161f;
  --violet-2:#0c0f16;
  --panel:#141922;
  --panel-2:#1a202c;
  --line:rgba(140,160,190,.14);
  --line-2:rgba(140,160,190,.30);
  --ink:#eef1f6;
  --ink-soft:#aab3c4;
  --ink-mute:#6f7a8c;
  --cy:#5ee6a8;
  --bl:#2fb37f;
  --grad-name:linear-gradient(100deg,#f4c85a,#f0972f);
  --grad-cta:linear-gradient(100deg,#f4c85a,#f0972f);
  --gold:#f4c85a;
  --radius:18px;
  --radius-sm:12px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(900px 520px at 50% -6%,rgba(244,200,90,.10),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
.tcell:last-of-type b{color:var(--gold)}
/* Solid pedestals of increasing height, medal number chips */
.top3{grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:14px;margin:2.4rem auto 1.6rem}
.t3{border-radius:var(--radius) var(--radius) 0 0;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-bottom:0;position:relative}
.t3-medal{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;font-size:0;background:var(--panel-2);border:1px solid var(--line);margin-bottom:.4rem}
.t3-medal::after{font-size:.85rem;font-weight:800;color:var(--ink)}
.t3--1 .t3-medal{background:var(--gold);border-color:transparent}.t3--1 .t3-medal::after{content:"1";color:#0c0f16}
.t3--2 .t3-medal{background:#c6cdda;border-color:transparent}.t3--2 .t3-medal::after{content:"2";color:#0c0f16}
.t3--3 .t3-medal{background:#d19a6a;border-color:transparent}.t3--3 .t3-medal::after{content:"3";color:#0c0f16}
.t3-av{display:grid;width:66px;height:66px;margin:.4rem auto .5rem;border-radius:18px;place-items:center;font-weight:800;font-size:1.35rem;color:#0c0f16;background:var(--grad-cta);border:0}
.t3-name{margin-top:.2rem}
.t3-wager{color:var(--gold);font-weight:700}
.t3--1{order:2;padding:30px 16px 44px;border-color:rgba(244,200,90,.42);box-shadow:0 -1px 0 rgba(244,200,90,.5) inset}
.t3--2{order:1;padding:26px 16px 30px}
.t3--3{order:3;padding:26px 16px 20px}
.t3--1 .t3-av{width:84px;height:84px;font-size:1.7rem;box-shadow:0 0 0 3px rgba(244,200,90,.3)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:10px;background:rgba(244,200,90,.14);color:var(--gold);border-color:transparent}
.tr-prize.has{color:var(--gold)}
`;
