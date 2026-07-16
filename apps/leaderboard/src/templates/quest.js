// "Quest Light" — a light, friendly leaderboard inspired by learning-app
// leaderboards: a raised 2·1·3 podium with big avatars, then a clean light
// table. Pure CSS over the shared markup + data-* hooks.
export const QUEST_CSS = `
:root{
  --bg:#eef1f7;
  --violet-1:#ffffff;
  --violet-2:#eef1f7;
  --panel:#ffffff;
  --panel-2:#f3f5fa;
  --line:rgba(24,32,54,.10);
  --line-2:rgba(24,32,54,.18);
  --ink:#151a2e;
  --ink-soft:#4b5568;
  --ink-mute:#8a92a6;
  --cy:#2f6bff;
  --bl:#00b3a4;
  --grad-name:linear-gradient(100deg,#2f6bff,#00b3a4);
  --grad-cta:linear-gradient(100deg,#2f6bff,#5a86ff);
  --gold:#e8a400;
  --radius:16px;
  --radius-sm:12px;
}
body{font-family:"Sora",system-ui,sans-serif}
.field{background:radial-gradient(900px 500px at 50% -10%,rgba(47,107,255,.12),transparent 60%),linear-gradient(180deg,#fff,var(--bg))}
.watermarks{display:none}
.nav{border-bottom:1px solid var(--line)}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.14em}
.hero-name{letter-spacing:-.03em}
.btn--grad{color:#fff}
.table,.t3,.timer-grid,.panel,.rules{box-shadow:0 6px 24px -18px rgba(24,32,54,.5)}
/* Podium 2·1·3 with big avatars */
.top3{grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:16px;margin:2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 20px;text-align:center;background:var(--panel);border:1px solid var(--line)}
.t3--1{order:2;padding:34px 16px 26px;border-color:rgba(232,164,0,.5)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:64px;height:64px;margin:.2rem auto .7rem;border-radius:50%;place-items:center;font-family:"Sora";font-weight:800;font-size:1.35rem;color:#fff;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:84px;height:84px;font-size:1.8rem;box-shadow:0 0 0 4px rgba(232,164,0,.25)}
.t3--2 .t3-av{background:linear-gradient(100deg,#8a92a6,#c4cad6)}
.t3--3 .t3-av{background:linear-gradient(100deg,#cf9160,#e6b98d)}
.t3--1 .t3-medal::before{content:"🥇 "}
.t3--2 .t3-medal::before{content:"🥈 "}
.t3--3 .t3-medal::before{content:"🥉 "}
.t3--1 .t3-wager{color:var(--gold)}
/* List starts at #4 (podium already shows 1–3) */
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.t-head{background:#eaf0ff;color:#2f6bff}
.t-row:hover{background:#f5f8ff}
.tr-av{background:rgba(47,107,255,.14);color:#2f6bff;border-color:transparent}
.rk-badge{color:#fff}
`;
