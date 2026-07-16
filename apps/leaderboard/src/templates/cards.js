// "Card Grid" — the top 3 render as large cards and everyone else as a
// responsive grid of player cards instead of table rows. Good for many players
// and for mobile. Uses the theme accent vars so color presets still apply.
export const CARDS_CSS = `
:root{
  --bg:#0c0910;
  --violet-1:#2a1526;
  --violet-2:#160c14;
  --panel:#181019;
  --panel-2:#221525;
  --line:rgba(255,120,200,.15);
  --line-2:rgba(255,120,200,.32);
  --ink:#fdeef7;
  --ink-soft:#d3b6ca;
  --ink-mute:#9b7c92;
  --gold:#ffd15c;
  --radius:18px;
  --radius-sm:14px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(1000px 560px at 50% -6%,rgba(255,95,174,.20),transparent 60%),
  radial-gradient(720px 460px at 85% 20%,rgba(255,179,71,.10),transparent 55%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.watermarks{opacity:.02}
.hero .stream-window{display:none}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.2em}
/* Bigger top-3 cards with an avatar. */
.top3{gap:1rem;margin-bottom:1.4rem}
.t3{border-radius:22px;padding:26px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel))}
.t3-av{display:grid;width:76px;height:76px;margin:.4rem auto .8rem;border-radius:50%;background:var(--grad-cta);color:#0c0910;font-family:"Sora";font-weight:800;font-size:1.7rem;place-items:center;border:0}
.t3-wager{font-size:1rem}
.t3--1 .t3-wager{color:var(--gold)}
/* Turn the ranked list into a card grid; hide the table header. */
.table .t-head{display:none}
body:not([data-preview]) .t-rows{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:0}
body:not([data-preview]) .t-row{
  display:flex;flex-direction:column;align-items:flex-start;gap:.35rem;
  padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--panel)}
body:not([data-preview]) .t-row:hover{background:var(--panel-2)}
body:not([data-preview]) .tr-rank{font-family:"Sora";font-weight:800;font-size:.95rem;color:var(--ink-mute)}
body:not([data-preview]) .tr-player{width:100%}
body:not([data-preview]) .tr-name{font-family:"Sora";font-weight:700;font-size:1rem}
body:not([data-preview]) .tr-wager{text-align:left;font-size:1.15rem;font-weight:800;color:var(--ink)}
body:not([data-preview]) .tr-prize{text-align:left;font-size:.8rem}
body:not([data-preview]) .tr-gap{display:none}
/* The top 3 already appear as big cards above the grid. */
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
@media (max-width:900px){body:not([data-preview]) .t-rows{grid-template-columns:repeat(2,1fr)}}
@media (max-width:520px){body:not([data-preview]) .t-rows{grid-template-columns:1fr}}
`;
