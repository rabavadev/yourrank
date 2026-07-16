// "Tournament" — a big centered countdown up top, three trophy cards for the
// leaders, and a clean numbered standings list. Inspired by esports/casino
// tournament boards. CSS only over the shared markup.
export const TOURNAMENT_CSS = `
:root{
  --bg:#070d16;
  --violet-1:#0c1826;
  --violet-2:#081019;
  --panel:#0f1a29;
  --panel-2:#132234;
  --line:rgba(90,170,230,.16);
  --line-2:rgba(90,170,230,.32);
  --ink:#eaf3fb;
  --ink-soft:#a6bdd2;
  --ink-mute:#6c8398;
  --cy:#4fc3f7;
  --bl:#3b82f6;
  --grad-name:linear-gradient(100deg,#4fc3f7,#3b82f6);
  --grad-cta:linear-gradient(100deg,#4fc3f7,#3b82f6);
  --gold:#ffd15c;
  --radius:16px;
  --radius-sm:12px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:radial-gradient(1000px 560px at 50% -8%,rgba(79,195,247,.14),transparent 58%),linear-gradient(180deg,var(--violet-1),var(--bg))}
.watermarks{opacity:.03}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-name{letter-spacing:-.03em}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
/* Big centered flip-style countdown */
.hero-timer{margin-top:1.6rem}
.timer-grid{gap:.5rem}
.tcell b{font-size:2.4rem;background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:.4rem .7rem;min-width:2.6ch}
.tsep{font-size:1.6rem;color:var(--ink-mute)}
/* Trophy cards for top 3 */
.top3{grid-template-columns:1fr 1.12fr 1fr;align-items:end;gap:16px;margin:2.2rem auto 1.4rem}
.t3{border-radius:var(--radius);padding:24px 16px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
.t3--1{order:2;padding:32px 16px 26px;border-color:rgba(255,209,92,.42)}
.t3--2{order:1}.t3--3{order:3}
.t3-av{display:grid;width:60px;height:60px;margin:.2rem auto .6rem;border-radius:50%;place-items:center;font-weight:800;font-size:1.3rem;color:#071019;background:var(--grad-cta);border:0}
.t3--1 .t3-av{width:78px;height:78px;font-size:1.7rem;background:var(--gold);box-shadow:0 0 0 3px rgba(255,209,92,.28)}
.t3-medal::before{display:block;font-size:1.5rem;margin-bottom:.2rem}
.t3--1 .t3-medal::before{content:"🏆"}
.t3--2 .t3-medal::before{content:"🥈"}
.t3--3 .t3-medal::before{content:"🥉"}
.t3--1 .t3-prize{color:var(--gold);background:rgba(255,209,92,.14)}
/* Numbered list with ordinal ranks */
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
.tr-av{display:none}
.tr-player{gap:0}
.tr-rank{color:var(--cy)}
.t-row:hover{background:rgba(79,195,247,.06)}
`;
