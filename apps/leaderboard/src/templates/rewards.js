// "Rewards" — reward-app styling: three pedestal cards with prize pills up top,
// a violet gradient field, and prize pills down the standings. CSS only.
export const REWARDS_CSS = `
:root{
  --bg:#0a0812;
  --violet-1:#171033;
  --violet-2:#0c0a18;
  --panel:#150f26;
  --panel-2:#1c1436;
  --line:rgba(150,120,255,.16);
  --line-2:rgba(150,120,255,.32);
  --ink:#f1eefb;
  --ink-soft:#bcb2dd;
  --ink-mute:#7c729c;
  --cy:#7c5cff;
  --bl:#4aa0ff;
  --grad-name:linear-gradient(100deg,#7c5cff,#4aa0ff);
  --grad-cta:linear-gradient(100deg,#7c5cff,#4aa0ff);
  --gold:#ffd15c;
  --radius:18px;
  --radius-sm:12px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(1000px 560px at 15% -10%,rgba(74,160,255,.16),transparent 55%),radial-gradient(900px 520px at 85% 6%,rgba(124,92,255,.20),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.02}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
.tcell:last-of-type b{color:var(--cy)}
/* Pedestal cards with prize pills, 2·1·3 */
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:2.2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:34px 16px 26px;border-color:rgba(255,209,92,.42);box-shadow:0 30px 70px -34px rgba(124,92,255,.5)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:64px;height:64px;margin:.2rem auto .6rem;border-radius:20px;place-items:center;font-weight:800;font-size:1.3rem;color:#0c0a18;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:82px;height:82px;font-size:1.7rem;background:var(--gold);box-shadow:0 0 0 3px rgba(255,209,92,.28)}
.t3-medal::before{display:block;font-size:1.3rem;margin-bottom:.2rem;content:"🏆"}
.t3--1 .t3-medal{color:var(--gold)}
.t3-prize{background:rgba(124,92,255,.16);color:var(--ink)}
.t3--1 .t3-prize{color:var(--gold);background:rgba(255,209,92,.14)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:12px;background:rgba(124,92,255,.18);color:#c9baff;border-color:transparent}
/* Prize as a pill on each row */
.tr-prize.has{color:var(--gold);background:rgba(255,209,92,.12);border-radius:8px;padding:.12rem .55rem}
`;
