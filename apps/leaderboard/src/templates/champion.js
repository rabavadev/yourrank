// "Champion Stage" — broadcast-banner structure (see composeChampion in
// render.js): identity left / prize + clock + CTA right in a wide banner,
// then straight into a solid pedestal stage of increasing heights.
export const CHAMPION_CSS = `
:root{
  --bg:#0b0d13;
  --violet-1:#12151f;
  --violet-2:#0c0f16;
  --panel:#141824;
  --panel-2:#1a2032;
  --line:rgba(150,170,210,.13);
  --line-2:rgba(150,170,210,.28);
  --ink:#edf1fa;
  --ink-soft:#adb6c9;
  --ink-mute:#707a90;
  --cy:#f4c85a;
  --bl:#f0972f;
  --grad-name:linear-gradient(100deg,#f4c85a,#f0972f);
  --grad-cta:linear-gradient(100deg,#f4c85a,#f0972f);
  --gold:#f4c85a;
  --radius:12px;
  --radius-sm:10px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(900px 480px at 20% -8%,rgba(244,200,90,.08),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
/* Banner hero */
.hero--banner{padding:3.2rem 0 1.6rem;text-align:left;width:min(1160px,92%);margin:0 auto}
.banner-grid{display:grid;grid-template-columns:1.1fr auto;gap:32px;align-items:center;background:linear-gradient(120deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:var(--radius);padding:32px}
.banner-id .hero-name{font-size:clamp(2rem,3.8vw,3rem);letter-spacing:-.02em}
.banner-id .hero-sub{margin:.6rem 0 0}
.banner-facts{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.bf{display:flex;flex-direction:column;gap:.25rem;text-align:right}
.bf-label{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.bf-val{font-weight:800;font-size:1.35rem;font-variant-numeric:tabular-nums}
.bf:first-child .bf-val{color:var(--gold)}
.banner-facts .btn{margin-left:8px;color:#0c0f16}
/* Pedestal stage */
.board{padding-top:.6rem}
.board-head--center{justify-content:center;text-align:center}
.top3{grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:14px;margin:1.8rem auto 1.6rem}
.t3{border-radius:var(--radius) var(--radius) 0 0;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-bottom:0;position:relative}
.t3-medal{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;font-size:0;background:var(--panel-2);border:1px solid var(--line);margin-bottom:.4rem}
.t3-medal::after{font-size:.85rem;font-weight:800;color:var(--ink)}
.t3--1 .t3-medal,.t3--2 .t3-medal,.t3--3 .t3-medal{font-size:0}
.t3--1 .t3-medal{background:var(--gold);border-color:transparent}.t3--1 .t3-medal::after{content:"1";color:#0c0f16}
.t3--2 .t3-medal{background:#c6cdda;border-color:transparent}.t3--2 .t3-medal::after{content:"2";color:#0c0f16}
.t3--3 .t3-medal{background:#d19a6a;border-color:transparent}.t3--3 .t3-medal::after{content:"3";color:#0c0f16}
.t3-av{display:grid;width:66px;height:66px;margin:.4rem auto .5rem;border-radius:18px;place-items:center;font-weight:800;font-size:1.35rem;color:#0c0f16;background:var(--grad-cta);border:0}
.t3--1{order:2;padding:30px 16px 44px;border-color:rgba(244,200,90,.42);box-shadow:0 -1px 0 rgba(244,200,90,.5) inset}
.t3--2{order:1;padding:26px 16px 30px}
.t3--3{order:3;padding:26px 16px 20px}
.t3--1 .t3-av{width:84px;height:84px;font-size:1.7rem;box-shadow:0 0 0 3px rgba(244,200,90,.3)}
.t3--2 .t3-av{background:linear-gradient(180deg,#dfe6f2,#aab4c8)}
.t3--3 .t3-av{background:linear-gradient(180deg,#e6b98d,#cf9160)}
.t3--1 .t3-wager{color:var(--gold)}
/* Table sits flush against the stage */
.table{border-top:2px solid var(--line-2)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:10px;background:rgba(244,200,90,.14);color:var(--gold);border-color:transparent}
.tr-prize.has{color:var(--gold)}
@media (max-width:900px){.banner-grid{grid-template-columns:1fr}.bf{text-align:left}}
`;
