// "Rewards" — treasure-card structure (see composeRewards in render.js):
// one centered hero card holds the prize pool, race clock and CTA together,
// then reward-app pedestals with prize pills and the standings.
export const REWARDS_CSS = `
:root{
  --bg:#0c0a1a;
  --violet-1:#171132;
  --violet-2:#0e0b20;
  --panel:#171330;
  --panel-2:#1e1940;
  --line:rgba(150,130,255,.16);
  --line-2:rgba(150,130,255,.34);
  --ink:#efecff;
  --ink-soft:#b3abd6;
  --ink-mute:#7a71a3;
  --cy:#7c5cff;
  --bl:#4aa0ff;
  --grad-name:linear-gradient(100deg,#a08bff,#4aa0ff);
  --grad-cta:linear-gradient(100deg,#7c5cff,#4aa0ff);
  --gold:#ffd15c;
  --radius:18px;
  --radius-sm:14px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(900px 520px at 50% -10%,rgba(124,92,255,.20),transparent 60%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.04}
/* Treasure-card hero */
.hero--card{text-align:center;padding:3.4rem 0 2rem}
.hero--card .hero-name{font-size:clamp(2.2rem,4.2vw,3.4rem)}
.hero--card .hero-sub{margin:.6rem auto 1.6rem}
.reward-card{width:min(560px,92%);margin:0 auto;background:linear-gradient(180deg,rgba(124,92,255,.16),rgba(124,92,255,.02)),var(--panel);border:1px solid var(--line-2);border-radius:var(--radius);padding:28px 28px 24px;box-shadow:0 40px 90px -46px rgba(124,92,255,.7)}
.reward-label{display:block;font-size:.8rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft)}
.reward-pool{display:block;font-size:clamp(2.4rem,4.4vw,3.4rem);font-weight:800;margin:.3rem 0 .9rem;background:linear-gradient(100deg,#ffd15c,#ff9d5c);-webkit-background-clip:text;background-clip:text;color:transparent}
.reward-card .hero-timer{margin:0 0 1.1rem}
.reward-card .timer-label{margin-bottom:.5rem}
.reward-card .tcell b{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:.35rem .6rem;font-size:1.5rem}
.reward-card .btn--full{color:#fff}
/* Pedestal cards with prize pills */
.board-head--center{justify-content:center;text-align:center}
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:1.6rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:26px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:34px 16px 26px;border-color:rgba(255,209,92,.42);box-shadow:0 30px 70px -34px rgba(124,92,255,.5)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:64px;height:64px;margin:.3rem auto .7rem;border-radius:50%;place-items:center;font-weight:800;font-size:1.35rem;color:#fff;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:82px;height:82px;font-size:1.7rem;box-shadow:0 0 0 3px rgba(255,209,92,.35)}
.t3--2 .t3-av{background:linear-gradient(180deg,#dfe6f2,#8f9ab0);color:#1e1940}
.t3--3 .t3-av{background:linear-gradient(180deg,#e6b98d,#cf9160);color:#1e1940}
.t3-prize{background:rgba(124,92,255,.16);color:var(--ink)}
.t3--1 .t3-prize{background:rgba(255,209,92,.16);color:var(--gold)}
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{border-radius:50%;background:rgba(124,92,255,.2);color:#cabfff;border-color:transparent}
.tr-prize.has{color:var(--gold);background:rgba(255,209,92,.12);border-radius:999px;padding:.14rem .6rem}
.t-row:hover{background:rgba(124,92,255,.07)}
`;
