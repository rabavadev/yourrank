// "Podium Spotlight" — a layout template (not just a recolor). Restyles the
// shared markup: the top-3 cards become a raised winner podium (2·1·3 with the
// leader lifted) and the ranked list starts at #4. Uses the theme accent vars
// (--cy/--bl/--grad-*) so color presets still apply. Structural rules are
// skipped in the dashboard preview thumbnail via body:not([data-preview]).
export const PODIUM_CSS = `
:root{
  --bg:#0a0714;
  --violet-1:#241a3f;
  --violet-2:#100b20;
  --panel:#150f26;
  --panel-2:#1d1533;
  --line:rgba(150,120,255,.16);
  --line-2:rgba(150,120,255,.34);
  --ink:#f3f0ff;
  --ink-soft:#b7add6;
  --ink-mute:#7d749b;
  --gold:#ffd15c;
  --radius:20px;
  --radius-sm:12px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(1100px 620px at 50% -8%,rgba(150,120,255,.22),transparent 60%),
  radial-gradient(760px 500px at 92% 18%,rgba(90,180,255,.10),transparent 55%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.watermarks{opacity:.02}
.hero{text-align:center}
.hero .stream-window{display:none}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.2em}
.hero-name{letter-spacing:-.035em}
/* Podium: reorder to 2 · 1 · 3, lift the leader. */
.top3{grid-template-columns:1fr 1.14fr 1fr;align-items:end;gap:16px;margin:2rem auto 1.6rem}
.t3{border-radius:20px;padding:26px 18px 22px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel))}
.t3--1{order:2;padding:36px 18px 30px;border-color:rgba(255,209,92,.42);box-shadow:0 30px 80px rgba(150,120,255,.20)}
.t3--2{order:1}
.t3--3{order:3}
.t3-av{display:grid;width:64px;height:64px;margin:.5rem auto .8rem;border-radius:50%;background:var(--grad-cta);color:#0a0714;font-family:"Sora";font-weight:800;font-size:1.4rem;place-items:center;border:0}
.t3--1 .t3-av{width:84px;height:84px;font-size:1.8rem;box-shadow:0 0 0 4px rgba(255,209,92,.22)}
.t3-medal{font-family:"Space Grotesk"}
.t3--1 .t3-medal::before{content:"🥇 "}
.t3--2 .t3-medal::before{content:"🥈 "}
.t3--3 .t3-medal::before{content:"🥉 "}
.t3--1 .t3-wager{font-size:1.2rem;color:var(--gold)}
/* The podium already shows ranks 1–3, so the list starts at #4. */
body:not([data-preview]) .t-row[data-position="1"],
body:not([data-preview]) .t-row[data-position="2"],
body:not([data-preview]) .t-row[data-position="3"]{display:none}
`;
