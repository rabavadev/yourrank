// "Amber Arena" — dark board with a single warm amber accent, a raised podium,
// and prize pills under the leaders. CSS only over the shared markup.
export const AMBER_CSS = `
:root{
  --bg:#0c0a08;
  --violet-1:#171009;
  --violet-2:#0d0a07;
  --panel:#16110c;
  --panel-2:#1e1710;
  --line:rgba(240,170,70,.16);
  --line-2:rgba(240,170,70,.34);
  --ink:#f6efe6;
  --ink-soft:#cbb79f;
  --ink-mute:#8c7a63;
  --cy:#ff9f2e;
  --bl:#ffb84d;
  --grad-name:linear-gradient(100deg,#ffb84d,#ff8a1e);
  --grad-cta:linear-gradient(100deg,#ffb84d,#ff8a1e);
  --gold:#ffb84d;
  --radius:16px;
  --radius-sm:12px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:radial-gradient(1000px 560px at 50% -8%,rgba(255,159,46,.16),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
.timer-label [data-pool]{color:var(--gold)}
.tcell:last-of-type b{color:var(--gold)}
/* Podium 2·1·3, amber leader */
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:2.2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:34px 16px 26px;border-color:rgba(255,184,77,.45);box-shadow:0 30px 70px -34px rgba(255,159,46,.5)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:64px;height:64px;margin:.2rem auto .6rem;border-radius:14px;place-items:center;font-weight:800;font-size:1.3rem;color:#0c0a08;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:82px;height:82px;font-size:1.7rem;box-shadow:0 0 0 3px rgba(255,184,77,.3)}
.t3--2 .t3-av{background:linear-gradient(180deg,#dfe6f2,#aab4c8)}
.t3--3 .t3-av{background:linear-gradient(180deg,#e6b98d,#cf9160)}
.t3-wager{color:var(--gold)}
.t3-prize{color:var(--gold);background:rgba(255,184,77,.12)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:9px;background:rgba(255,159,46,.16);color:var(--gold);border-color:transparent}
.tr-wager{color:var(--gold)}
.t-row:hover{background:rgba(255,159,46,.06)}
`;
