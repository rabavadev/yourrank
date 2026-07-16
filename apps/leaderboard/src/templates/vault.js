// "Prize Vault" — dark casino board with its own page structure (see
// composeVault in render.js): split hero (pitch left, boxed prize-pool +
// race-countdown card right), a stat strip, then podium and standings.
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
.field{background:radial-gradient(900px 520px at 78% -6%,rgba(255,209,92,.10),transparent 55%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
/* Split hero */
.hero--split{text-align:left;padding:4rem 0 2.4rem;width:min(1160px,92%);margin:0 auto}
.split-grid{display:grid;grid-template-columns:1.2fr .9fr;gap:32px;align-items:center}
.hero--split .hero-name{font-size:clamp(2.4rem,4.6vw,3.8rem);letter-spacing:-.03em}
.hero--split .hero-sub{margin:.8rem 0 1.6rem;max-width:40ch}
.hero--split .hero-cta{justify-content:flex-start}
.prize-card{background:linear-gradient(180deg,rgba(255,209,92,.10),rgba(255,209,92,0)),var(--panel);border:1px solid var(--line);border-top:2px solid rgba(255,209,92,.55);border-radius:var(--radius);padding:24px;text-align:center;box-shadow:0 30px 70px -40px rgba(255,209,92,.55)}
.prize-card-label{display:block;font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute)}
.prize-card-pool{display:block;font-size:clamp(2.2rem,3.4vw,3rem);font-weight:800;color:var(--gold);margin:.3rem 0 .8rem;font-family:"Sora"}
.prize-card .hero-timer{margin-top:0}
.prize-card .timer-label{margin-bottom:.5rem}
.prize-card .tcell b{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:.35rem .55rem;font-size:1.5rem}
.prize-card .tcell:last-of-type b{color:var(--gold)}
/* Stat strip */
.stat-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:28px}
.ss{display:flex;align-items:baseline;justify-content:center;gap:.6rem;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:.8rem 1rem}
.ss-label{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-mute)}
.ss-val{font-weight:800;font-size:1.05rem}
/* Podium */
.board-head--center{justify-content:center;text-align:center}
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:1.6rem auto 1.4rem}
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
@media (max-width:900px){.split-grid{grid-template-columns:1fr}.hero--split{text-align:center}.hero--split .hero-cta{justify-content:center}.hero--split .hero-sub{margin:.8rem auto 1.6rem}.stat-strip{grid-template-columns:1fr}}
`;
