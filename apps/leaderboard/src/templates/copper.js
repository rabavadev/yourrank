// "Copper Glow" — winners' gallery structure (see composeCopper in
// render.js): the top-3 podium lives inside the hero as the centerpiece;
// the table below is a quiet "top players" ledger.
export const COPPER_CSS = `
:root{
  --bg:#120b06;
  --violet-1:#1d1209;
  --violet-2:#140c07;
  --panel:#1d130b;
  --panel-2:#271a0e;
  --line:rgba(240,169,90,.14);
  --line-2:rgba(240,169,90,.32);
  --ink:#f8efe4;
  --ink-soft:#cbb69c;
  --ink-mute:#907c62;
  --cy:#f0a95a;
  --bl:#d1702a;
  --grad-name:linear-gradient(100deg,#f0b45a,#d1702a);
  --grad-cta:linear-gradient(100deg,#f0a95a,#d1702a);
  --gold:#f0b45a;
  --radius:16px;
  --radius-sm:12px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(1000px 560px at 50% -10%,rgba(240,169,90,.14),transparent 60%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
/* Gallery hero: podium is the centerpiece */
.hero--gallery{text-align:center;padding:3.4rem 0 1.4rem}
.hero--gallery .hero-kicker{letter-spacing:.24em;text-transform:uppercase;font-size:.8rem;color:var(--ink-mute)}
.hero--gallery .hero-name{font-size:clamp(2.2rem,4.2vw,3.4rem)}
.hero--gallery .hero-sub{margin:.6rem auto 0}
.hero--gallery .hero-sub [data-pool]{color:var(--gold);font-weight:800}
.hero--gallery .hero-sub .countdown{color:var(--ink);font-variant-numeric:tabular-nums}
.hero--gallery .top3{width:min(880px,92%);grid-template-columns:1fr 1.18fr 1fr;align-items:end;gap:18px;margin:2rem auto 1.6rem}
.hero--gallery .hero-cta{margin:0 0 .6rem}
.t3{border-radius:var(--radius);padding:26px 16px 22px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:34px 16px 28px;border-color:rgba(240,180,90,.4);box-shadow:0 36px 80px -40px rgba(240,169,90,.55)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:76px;height:76px;margin:.2rem auto .7rem;border-radius:50%;place-items:center;font-weight:800;font-size:1.6rem;color:#140c07;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:100px;height:100px;font-size:2rem;box-shadow:0 0 0 4px rgba(240,180,90,.3)}
.t3--2 .t3-av{background:linear-gradient(180deg,#dfe6f2,#9aa5ba)}
.t3--3 .t3-av{background:linear-gradient(180deg,#e6b98d,#b8794a)}
.t3--1 .t3-medal::before{content:"🥇 "}
.t3--2 .t3-medal::before{content:"🥈 "}
.t3--3 .t3-medal::before{content:"🥉 "}
.t3--1 .t3-wager{color:var(--gold)}
/* Quiet ledger below */
.board{padding-top:.4rem}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:50%;background:rgba(240,169,90,.16);color:var(--gold);border-color:transparent}
.t-row:hover{background:rgba(240,169,90,.05)}
.tr-prize.has{color:var(--gold)}
`;
