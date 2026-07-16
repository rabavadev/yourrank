// "Neon Arena" — an esports look. Angular skewed rows with big italic rank
// numbers and a wager bar under each name showing how close players are to the
// leader. The bar width comes from the per-row --pct that leaderboard.js sets
// (wager share of #1), so no inline styles are needed.
export const ARENA_CSS = `
:root{
  --bg:#060806;
  --violet-1:#20260a;
  --violet-2:#0c1006;
  --panel:#0e120c;
  --panel-2:#151a11;
  --line:rgba(205,255,31,.16);
  --line-2:rgba(205,255,31,.34);
  --ink:#f6ffe6;
  --ink-soft:#bcc9a4;
  --ink-mute:#7f8b68;
  --gold:#eaff5b;
  --radius:4px;
  --radius-sm:2px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  repeating-linear-gradient(115deg,transparent 0 70px,rgba(205,255,31,.02) 70px 71px),
  radial-gradient(1000px 560px at 50% -10%,rgba(205,255,31,.10),transparent 62%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.watermarks{opacity:.02}
.hero{text-align:left}
.hero .stream-window{display:none}
.hero-kicker,.eyebrow,.pcol-label,.t-head{text-transform:uppercase;font-style:italic;letter-spacing:.18em}
.hero-name{text-transform:uppercase;font-style:italic;letter-spacing:-.05em}
.hero-cta{justify-content:flex-start}
.hero-sub{margin-left:0}
.btn--grad{transform:skewX(-8deg)}
.btn--grad>*{display:inline-block;transform:skewX(8deg)}
/* Angular rows with a wager bar. */
.table{background:transparent;border:0}
.t-head{display:none}
.t-rows{display:flex;flex-direction:column;gap:10px}
.t-row{
  grid-template-columns:72px 1fr 160px;
  grid-template-areas:"rank player wager" "rank bar prize";
  column-gap:16px;row-gap:6px;align-items:center;
  background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--cy);
  border-bottom:1px solid var(--line);padding:14px 20px;transform:skewX(-3deg)}
.t-row:hover{background:var(--panel-2)}
.t-row>*{transform:skewX(3deg)}
.t-row[data-position="1"]{border-left-color:var(--gold);background:linear-gradient(90deg,rgba(205,255,31,.14),transparent)}
.tr-rank{grid-area:rank;font-family:"Sora";font-weight:800;font-style:italic;font-size:2rem;color:var(--ink-mute)}
.t-row[data-position="1"] .tr-rank{color:var(--cy)}
.tr-player{grid-area:player}
.tr-name{font-family:"Sora";font-weight:700;text-transform:uppercase;font-size:1.05rem}
.tr-av{display:none}
.tr-wager{grid-area:wager;text-align:right;font-family:"Sora";font-weight:800;font-size:1.15rem;color:var(--ink)}
.tr-prize{grid-area:prize;text-align:right;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em}
.tr-gap{display:none}
.tr-bar{grid-area:bar;display:block;height:7px;background:var(--panel-2);border-radius:2px;overflow:hidden}
.tr-bar i{display:block;height:100%;width:var(--pct,0%);background:var(--grad-cta)}
.t3--1{border-color:rgba(205,255,31,.44)}
@media (max-width:600px){
  .t-row{grid-template-columns:52px 1fr;grid-template-areas:"rank player" "rank bar" "rank wager" "rank prize"}
  .tr-wager,.tr-prize{text-align:left}
}
`;
