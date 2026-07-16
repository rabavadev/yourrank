// "Split Broadcast" — a two-column layout. The hero (with the Kick stream frame,
// brand, countdown and CTA) sits in a sticky left rail; the full standings table
// fills the right column. Partner / past / socials span the full width below.
// Collapses to a single column on narrow screens and in the preview thumbnail.
export const BROADCAST_CSS = `
:root{
  --bg:#050813;
  --violet-1:#0f2645;
  --violet-2:#04101f;
  --panel:#0d1426;
  --panel-2:#132038;
  --line:rgba(80,150,255,.16);
  --line-2:rgba(80,150,255,.32);
  --ink:#eef4ff;
  --ink-soft:#a8bbe0;
  --ink-mute:#6d80a6;
  --gold:#ffcf5c;
  --radius:20px;
  --radius-sm:12px;
}
body{font-family:"Space Grotesk","Sora",system-ui,sans-serif}
.field{background:
  radial-gradient(900px 600px at 12% 0%,rgba(59,130,255,.18),transparent 58%),
  radial-gradient(800px 500px at 100% 30%,rgba(56,225,198,.10),transparent 55%),
  linear-gradient(180deg,var(--violet-2),var(--bg))}
.watermarks{opacity:.02}
.hero-kicker,.eyebrow,.pcol-label{text-transform:uppercase;letter-spacing:.16em}
.stream-window{position:static;width:100%;margin:0 0 1.2rem}
body:not([data-preview]) main{
  width:min(1200px,100% - 2.5rem);margin-inline:auto;
  display:grid;grid-template-columns:400px 1fr;column-gap:28px;align-items:start;padding-top:1rem}
body:not([data-preview]) main>section{width:auto;margin-inline:0}
body:not([data-preview]) .hero{grid-column:1;grid-row:1;position:sticky;top:20px;text-align:left;padding:1rem 0}
body:not([data-preview]) .hero-name{font-size:clamp(2.2rem,3.4vw,3.4rem);line-height:1.02}
body:not([data-preview]) .hero-sub{margin-left:0;margin-right:0}
body:not([data-preview]) .hero-cta{justify-content:flex-start}
body:not([data-preview]) .hero-timer{margin-left:0;margin-right:0}
body:not([data-preview]) #board.board{grid-column:2;grid-row:1;padding:1rem 0 3rem}
body:not([data-preview]) #partner{grid-column:1/-1;grid-row:2}
body:not([data-preview]) #past{grid-column:1/-1;grid-row:3}
body:not([data-preview]) #socials{grid-column:1/-1;grid-row:4}
body:not([data-preview]) #lb-announce{grid-column:2;grid-row:1}
.board-title-group{justify-content:flex-start}
.t3--1{border-color:rgba(59,130,255,.42)}
@media (max-width:900px){
  body:not([data-preview]) main{grid-template-columns:1fr}
  body:not([data-preview]) .hero{position:static;grid-column:1;grid-row:auto}
  body:not([data-preview]) #board.board,
  body:not([data-preview]) #partner,
  body:not([data-preview]) #past,
  body:not([data-preview]) #socials{grid-column:1;grid-row:auto}
}
`;
