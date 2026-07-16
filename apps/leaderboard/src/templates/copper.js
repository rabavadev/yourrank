// "Copper Glow" — warm copper/brown gradient field with large top-3 avatars and
// a calm "top users" table. CSS only over the shared markup.
export const COPPER_CSS = `
:root{
  --bg:#0c0906;
  --violet-1:#1a1109;
  --violet-2:#0e0a07;
  --panel:#171009;
  --panel-2:#20160d;
  --line:rgba(214,140,80,.16);
  --line-2:rgba(214,140,80,.32);
  --ink:#f5ece2;
  --ink-soft:#cbb29b;
  --ink-mute:#8b7359;
  --cy:#e08a3c;
  --bl:#c86a2a;
  --grad-name:linear-gradient(100deg,#f0a95a,#d1702a);
  --grad-cta:linear-gradient(100deg,#f0a95a,#d1702a);
  --gold:#f0b45a;
  --radius:18px;
  --radius-sm:12px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(1100px 620px at 50% -6%,rgba(224,138,60,.22),transparent 58%),radial-gradient(700px 480px at 88% 20%,rgba(200,106,42,.14),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
.tcell:last-of-type b{color:var(--gold)}
/* Large top-3 avatars, gentle lift */
.top3{grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:18px;margin:2.2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:32px 16px 26px;border-color:rgba(240,180,90,.4)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:76px;height:76px;margin:.2rem auto .7rem;border-radius:20px;place-items:center;font-weight:800;font-size:1.6rem;color:#0e0a07;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:100px;height:100px;font-size:2rem;box-shadow:0 0 0 3px rgba(240,180,90,.3)}
.t3-name{font-size:1.15rem;margin-top:.6rem}
.t3-wager{color:var(--gold)}
.t3--1 .t3-prize{color:var(--gold);background:rgba(240,180,90,.14)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:10px;background:rgba(224,138,60,.16);color:var(--gold);border-color:transparent}
.tr-prize.has{color:var(--gold)}
.t-row:hover{background:rgba(224,138,60,.06)}
`;
