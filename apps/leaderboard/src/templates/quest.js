// "Quest Light" — app-style light board. Its own page structure (see
// composeQuest in render.js): compact centered header with info chips,
// standings first, partner content demoted below the board.
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
/* Compact app header */
.hero--app{text-align:center;padding:3.6rem 0 2rem}
.hero--app .hero-name{font-size:clamp(2.2rem,4.4vw,3.4rem);letter-spacing:-.03em}
.hero--app .hero-sub{margin:.6rem auto 1.2rem}
.app-chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:1.2rem}
.app-chip{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .95rem;border-radius:999px;background:var(--panel);border:1px solid var(--line);font-size:.88rem;font-weight:600;color:var(--ink-soft);box-shadow:0 4px 14px -10px rgba(24,32,54,.4)}
.app-chip b{color:var(--ink);font-weight:800}
.app-chip--pool{border-color:rgba(232,164,0,.45);color:#9a6f00;background:#fff9ea}
.app-chip--pool [data-pool]{font-weight:800}
.btn--grad{color:#fff}
/* Board */
.board{padding-top:1rem}
.board-head--center{justify-content:center;text-align:center}
.table,.t3,.panel,.rules{box-shadow:0 6px 24px -18px rgba(24,32,54,.5)}
/* Podium 2·1·3 with big avatars */
.top3{grid-template-columns:1fr 1.16fr 1fr;align-items:end;gap:16px;margin:1.4rem auto}
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
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.t-head{background:#eaf0ff;color:#2f6bff}
.t-row{border-bottom:1px solid var(--line)}
.t-row:hover{background:#f5f8ff}
.tr-av{background:rgba(47,107,255,.14);color:#2f6bff;border-color:transparent}
.rk-badge{color:#fff}
`;
