// "Prize Vault" — dark casino layout with a prominent prize-pool + countdown
// hero and a 2·1·3 podium (gold leader, cool pedestals for 2/3). CSS only.
export const VAULT_CSS = `
:root{
  --bg:#080a12;
  --violet-1:#0e1424;
  --violet-2:#0a0d18;
  --panel:#111726;
  --panel-2:#161d30;
  --line:rgba(120,150,220,.14);
  --line-2:rgba(120,150,220,.30);
  --ink:#eef2fb;
  --ink-soft:#aeb8d0;
  --ink-mute:#727d99;
  --cy:#4bd48a;
  --bl:#2f9d67;
  --grad-name:linear-gradient(100deg,#ffd15c,#f0a93a);
  --grad-cta:linear-gradient(100deg,#ffd15c,#f0a93a);
  --gold:#ffd15c;
  --radius:16px;
  --radius-sm:12px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:radial-gradient(900px 520px at 50% -6%,rgba(255,209,92,.10),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
/* Prize pool + countdown as a boxed gold-topped strip */
.hero-timer{max-width:640px;margin:2rem auto 0;padding:18px 22px;background:linear-gradient(180deg,rgba(255,209,92,.10),rgba(255,209,92,0)),var(--panel);border:1px solid var(--line);border-top:2px solid rgba(255,209,92,.55);border-radius:var(--radius)}
.timer-label [data-pool]{color:var(--gold)}
.tcell b{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:.35rem .6rem}
.tcell:last-of-type b{color:var(--gold)}
/* Podium */
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:2.2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:26px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:36px 16px 28px;border-color:rgba(255,209,92,.45);box-shadow:0 30px 70px -30px rgba(255,209,92,.4)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:62px;height:62px;margin:.3rem auto .7rem;border-radius:16px;place-items:center;font-family:"Sora";font-weight:800;font-size:1.3rem;color:#0a0d18;background:var(--gold);border:0}
.t3--1 .t3-av{width:80px;height:80px;font-size:1.7rem;box-shadow:0 0 0 3px rgba(255,209,92,.3)}
.t3--2 .t3-av{background:linear-gradient(180deg,#dfe6f2,#aab4c8);box-shadow:0 0 0 3px rgba(200,207,221,.25)}
.t3--3 .t3-av{background:linear-gradient(180deg,#e6b98d,#cf9160);box-shadow:0 0 0 3px rgba(207,145,96,.25)}
.t3--1 .t3-prize{color:var(--gold);background:rgba(255,209,92,.14)}
.t3--2 .t3-prize,.t3--3 .t3-prize{color:var(--ink)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{background:rgba(255,209,92,.14);border-color:transparent;color:var(--gold);border-radius:10px}
.tr-prize.has{color:var(--gold)}
`;
