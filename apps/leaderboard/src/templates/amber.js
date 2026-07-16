// "Amber Arena" — command-rail structure (see composeAmber in render.js):
// a sticky left rail carries identity, prize, clock and the partner code;
// standings own the right column.
export const AMBER_CSS = `
:root{
  --bg:#0d0904;
  --violet-1:#171008;
  --violet-2:#0f0a05;
  --panel:#181109;
  --panel-2:#20160c;
  --line:rgba(255,184,77,.14);
  --line-2:rgba(255,184,77,.32);
  --ink:#f7efe2;
  --ink-soft:#c6b394;
  --ink-mute:#8a7a5e;
  --cy:#ffb84d;
  --bl:#ff8a1e;
  --grad-name:linear-gradient(100deg,#ffb84d,#ff8a1e);
  --grad-cta:linear-gradient(100deg,#ffb84d,#ff8a1e);
  --gold:#ffb84d;
  --radius:14px;
  --radius-sm:10px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(800px 480px at 12% 0%,rgba(255,159,46,.10),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
/* Rail layout */
.rail-layout{display:grid;grid-template-columns:340px 1fr;gap:32px;width:min(1220px,94%);margin:2.4rem auto 0;align-items:start}
.rail{position:sticky;top:84px;display:flex;flex-direction:column;gap:24px}
.hero--rail{min-height:0;display:block;text-align:left;padding:28px;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line);border-radius:var(--radius)}
.hero--rail .hero-name{font-size:clamp(1.7rem,2.6vw,2.2rem);letter-spacing:-.02em}
.hero--rail .hero-sub{margin:.5rem 0 1.2rem;font-size:.95rem}
.rail-fact{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:.7rem 0;border-top:1px solid var(--line)}
.rail-label{font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.rail-val{font-weight:800;font-size:1.15rem;font-variant-numeric:tabular-nums}
.rail-fact:first-of-type .rail-val{color:var(--gold);font-size:1.35rem}
.hero--rail .hero-cta{justify-content:stretch;margin:1.1rem 0 0}
.hero--rail .btn{width:100%;color:#160d04}
/* Partner panel stacks in the rail */
.rail .panel{width:100%;margin:0;padding:24px}
.rail .panel-grid{grid-template-columns:1fr;gap:20px}
.rail .panel-badge{left:24px}
/* Standings column */
.rail-main .board{width:100%;padding:0 0 40px;margin:0}
.rail-main .board-head{margin-bottom:14px}
/* Horizontal top-3 strip: rank chips left, numbers right */
.top3{grid-template-columns:1fr;gap:10px;margin:0 0 14px}
.t3{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:16px;text-align:left;padding:14px 18px;border-radius:var(--radius);background:linear-gradient(90deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3-medal{font-size:0;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;border:1px solid var(--line)}
.t3-medal::after{font-size:1rem;font-weight:800}
.t3--1 .t3-medal,.t3--2 .t3-medal,.t3--3 .t3-medal{font-size:0}
.t3--1 .t3-medal{background:rgba(255,184,77,.18);border-color:rgba(255,184,77,.5)}.t3--1 .t3-medal::after{content:"1";color:var(--gold)}
.t3--2 .t3-medal{background:rgba(198,205,218,.12)}.t3--2 .t3-medal::after{content:"2";color:#c6cdda}
.t3--3 .t3-medal{background:rgba(209,154,106,.12)}.t3--3 .t3-medal::after{content:"3";color:#d19a6a}
.t3-av{display:grid;width:44px;height:44px;margin:0;border-radius:12px;place-items:center;font-weight:800;font-size:1rem;color:#160d04;background:var(--grad-cta);border:0}
.t3-name{margin:0;font-size:1.05rem}
.t3-wager{margin:0;font-size:1.1rem}
.t3--1{border-color:rgba(255,184,77,.45)}
.t3--1 .t3-wager{color:var(--gold)}
.t3-prize{display:none}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:9px;background:rgba(255,159,46,.16);color:var(--gold);border-color:transparent}
.t-row:hover{background:rgba(255,159,46,.06)}
.tr-prize.has{color:var(--gold)}
@media (max-width:980px){.rail-layout{grid-template-columns:1fr}.rail{position:static}}
`;
