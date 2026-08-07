/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */
// "Noir" — old-money casino ledger: a private-club honour roll, not a neon
// scoreboard. Serif Playfair headlines, hairline gold rules, the top 3 as an
// engraved honour roll with Roman numerals, standings as a ledger table with
// a double gold rule, optional film grain over the whole page. The partner
// panel is demoted to a discreet footer line. Shares the buildParts() data
// contract (every data-* hook appears exactly once) but owns its page
// structure, typography and tokens.

// Convention: every rule is scoped under body[data-template="noir"] so
// templates can never leak into each other (preview compare, live switching).
const NOIR_CSS = `
body[data-template="noir"]{
  --bg:#0d0b09;
  --violet-1:#121009;
  --violet-2:#0d0b09;
  --panel:#14110d;
  --panel-2:#1a1712;
  --line:rgba(212,175,55,.18);
  --line-2:rgba(212,175,55,.40);
  --ink:#f0e7d3;
  --ink-soft:#cfc4ab;
  --ink-mute:#a3967d;
  --cy:var(--opt-accent,#d4af37);
  --bl:#b8912e;
  --grad-name:linear-gradient(100deg,#f0e7d3,var(--opt-accent,#d4af37));
  --grad-cta:linear-gradient(100deg,var(--opt-accent,#d4af37),#b8912e);
  --gold:var(--opt-accent,#d4af37);
  --primary:var(--opt-accent,#d4af37);
  --primary-strong:#b8912e;
  --primary-deep:#7a5f1c;
  --silver:#c7cdd6;
  --bronze:#c98a4b;
  --radius:2px;
  --radius-sm:2px;
  font-family:"EB Garamond",Georgia,serif;
  font-size:1.06rem;
}
body[data-template="noir"] .field{background:linear-gradient(180deg,var(--violet-1),var(--bg))}
body[data-template="noir"] .watermarks{display:none}
body[data-template="noir"] .nav{border-bottom:1px solid var(--line)}
body[data-template="noir"] .btn{border-radius:var(--radius)}
/* Serif display type everywhere it matters */
body[data-template="noir"] .hero-name,
body[data-template="noir"] .sec-title,
body[data-template="noir"] .noir-title{font-family:"Playfair Display",Georgia,serif}
/* Hero: centred private-club masthead between hairline rules */
body[data-template="noir"] .hero--noir{min-height:0;text-align:center;padding:4.2rem 1rem 2.6rem;display:block}
body[data-template="noir"] .noir-rule{display:flex;align-items:center;gap:14px;max-width:560px;margin:0 auto}
body[data-template="noir"] .noir-rule::before,
body[data-template="noir"] .noir-rule::after{content:"";flex:1;height:1px;background:var(--line-2)}
body[data-template="noir"] .noir-rule span{color:var(--gold);font-size:.8rem;letter-spacing:.42em;text-transform:uppercase;font-family:"EB Garamond",Georgia,serif}
body[data-template="noir"] .hero--noir .hero-name{font-size:clamp(2.6rem,7vw,4.6rem);font-weight:700;letter-spacing:.01em;margin:1.2rem 0 .5rem;background:var(--grad-name);-webkit-background-clip:text;background-clip:text;color:transparent}
body[data-template="noir"] .hero--noir .hero-sub{font-style:italic;color:var(--ink-soft);font-size:1.15rem}
body[data-template="noir"] .hero--noir .hero-sub [data-pool]{color:var(--gold);font-style:normal;letter-spacing:.06em}
body[data-template="noir"] .noir-meta{margin:1.1rem 0 0;color:var(--ink-mute);font-size:.92rem;letter-spacing:.14em;text-transform:uppercase}
body[data-template="noir"] .noir-meta b{color:var(--ink-soft);font-variant-numeric:tabular-nums}
body[data-template="noir"] .hero--noir .hero-cta{justify-content:center;margin-top:1.6rem}
body[data-template="noir"] .btn--noir{background:transparent;border:1px solid var(--line-2);color:var(--gold);letter-spacing:.18em;text-transform:uppercase;font-size:.82rem;padding:.8rem 1.7rem}
body[data-template="noir"] .btn--noir:hover{background:rgba(212,175,55,.08)}
body[data-template="noir"] .hero--noir .hero-timer{margin-top:1.8rem}
body[data-template="noir"] .hero--noir .tcell b{font-family:"Playfair Display",Georgia,serif;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
/* Board: the honour roll */
body[data-template="noir"] .board{width:min(880px,94%);margin:0 auto;padding:2.4rem 0 0}
body[data-template="noir"] .board-head{justify-content:center;text-align:center;margin-bottom:1.8rem}
body[data-template="noir"] .board-head .sec-title{font-size:clamp(1.5rem,3vw,2rem);letter-spacing:.06em;text-transform:uppercase}
body[data-template="noir"] .board-head .sec-title::after{content:"";display:block;width:64px;height:1px;background:var(--gold);margin:.7rem auto 0}
/* Honour-roll podium: engraved plates, numerals instead of medals */
body[data-template="noir"] .top3{grid-template-columns:1fr 1.1fr 1fr;align-items:end;gap:18px;margin:0 0 2rem}
body[data-template="noir"] .t3{border-radius:var(--radius);padding:26px 18px 20px;text-align:center;background:linear-gradient(180deg,var(--panel-2),var(--panel));border:1px solid var(--line)}
body[data-template="noir"] .t3--1{order:2;border-color:var(--line-2);padding:36px 18px 30px;box-shadow:0 30px 70px -45px rgba(212,175,55,.45)}
body[data-template="noir"] .t3--2{order:1}
body[data-template="noir"] .t3--3{order:3}
body[data-template="noir"] .t3-av{display:none}
/* Base .t3-medal is an absolutely-positioned badge over the avatar; noir
   has no avatars, so make it a static block above the name */
body[data-template="noir"] .t3-medal,
body[data-template="noir"] .t3--1 .t3-medal,
body[data-template="noir"] .t3--2 .t3-medal,
body[data-template="noir"] .t3--3 .t3-medal{position:static;transform:none;width:auto;height:auto;display:block;background:transparent;border:none;box-shadow:none;margin:0 auto .3rem;font-size:0}
body[data-template="noir"] .t3--1 .t3-wager{text-shadow:none}
body[data-template="noir"] .code-val,
body[data-template="noir"] .nav-links a:hover{text-shadow:none}
/* Kill the base neon-purple glow: noir light comes from the gold accent */
body[data-template="noir"] .btn--grad{box-shadow:0 0 24px -8px rgba(212,175,55,.55);color:#14110d;font-weight:700}
body[data-template="noir"] .btn--grad:hover{box-shadow:0 0 30px -6px rgba(212,175,55,.7)}
body[data-template="noir"] .orb{filter:none;opacity:.5}
body[data-template="noir"] .t3-medal::before{font-family:"Playfair Display",Georgia,serif;color:var(--gold);font-size:1.9rem;letter-spacing:.08em}
body[data-template="noir"] .t3--2 .t3-medal::before,
body[data-template="noir"] .t3--3 .t3-medal::before{font-size:1.5rem;color:var(--ink-soft)}
body[data-template="noir"] .t3-name{font-family:"Playfair Display",Georgia,serif;font-size:1.15rem;margin-top:.4rem}
body[data-template="noir"] .t3--1 .t3-wager{color:var(--gold)}
/* Podium numerals: Roman by default, plain figures on request */
body[data-template="noir"] .t3--1 .t3-medal::before{content:"I"}
body[data-template="noir"] .t3--2 .t3-medal::before{content:"II"}
body[data-template="noir"] .t3--3 .t3-medal::before{content:"III"}
body[data-template="noir"][data-opt-podium="numbers"] .t3--1 .t3-medal::before{content:"1"}
body[data-template="noir"][data-opt-podium="numbers"] .t3--2 .t3-medal::before{content:"2"}
body[data-template="noir"][data-opt-podium="numbers"] .t3--3 .t3-medal::before{content:"3"}
/* Ledger table: double gold rule under the head, dashed ledger lines */
body[data-template="noir"] .table{border:none;background:transparent}
body[data-template="noir"] .t-head,
body[data-template="noir"] .t-row{grid-template-columns:84px 1fr 160px 110px;padding:.72rem .4rem}
body[data-template="noir"] .t-head{background:transparent;border-bottom:3px double var(--line-2);color:var(--ink-mute);letter-spacing:.22em;font-size:.78rem}
body[data-template="noir"] .t-row{background:transparent;border:none;border-bottom:1px dashed var(--line);box-shadow:none;backdrop-filter:none}
body[data-template="noir"] .t-row:hover{background:rgba(212,175,55,.05)}
body[data-template="noir"] .tr-av{display:none}
body[data-template="noir"] .tr-rank{font-family:"Playfair Display",Georgia,serif;color:var(--gold);font-size:1.05rem}
body[data-template="noir"] .tr-name{font-family:"EB Garamond",Georgia,serif;font-size:1.08rem}
body[data-template="noir"] .tr-wager{font-variant-numeric:tabular-nums}
body[data-template="noir"] .tr-prize.has{color:var(--gold)}
body[data-template="noir"] .find-rank-input{font-family:"EB Garamond",Georgia,serif;background:var(--panel);border:1px solid var(--line);border-radius:var(--radius)}
/* Film grain over the whole page (data-URI SVG turbulence, CSP-safe) */
body[data-template="noir"][data-opt-grain="true"] .field{position:relative}
body[data-template="noir"][data-opt-grain="true"] .field::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:5;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
/* Noir owns its chrome: a centered masthead and a colophon footer instead
   of the shared nav bar / premium footer. */
body[data-template="noir"] .noir-masthead{display:flex;flex-direction:column;align-items:center;gap:.9rem;padding:1.6rem 1rem 0;text-align:center}
body[data-template="noir"] .noir-masthead-rule{width:min(640px,80%);height:1px;background:linear-gradient(90deg,transparent,var(--line-2),transparent)}
body[data-template="noir"] .noir-masthead-brand{font-family:"Playfair Display",Georgia,serif;font-size:1.3rem;letter-spacing:.28em;text-transform:uppercase;color:var(--ink);text-decoration:none;display:flex;align-items:center;gap:.6rem}
body[data-template="noir"] .noir-masthead-brand .nav-logo{width:34px;height:34px;border-radius:50%}
body[data-template="noir"] .noir-masthead-links{display:flex;gap:1.8rem}
body[data-template="noir"] .noir-masthead-links a{font-family:"EB Garamond",Georgia,serif;font-style:italic;color:var(--ink-mute);text-decoration:none;font-size:1rem}
body[data-template="noir"] .noir-masthead-links a:hover{color:var(--gold)}
body[data-template="noir"] .noir-footer{margin-top:4rem;padding:2.4rem 1rem 3rem;text-align:center;border-top:3px double var(--line-2)}
body[data-template="noir"] .noir-footer-name{font-family:"Playfair Display",Georgia,serif;font-size:1.15rem;letter-spacing:.22em;text-transform:uppercase;margin:0 0 .3rem}
body[data-template="noir"] .noir-footer-tag{font-family:"EB Garamond",Georgia,serif;font-style:italic;color:var(--ink-mute);margin:0 0 1rem}
body[data-template="noir"] .noir-footer-fine{color:var(--ink-mute);font-size:.8rem;max-width:56ch;margin:0 auto 1.2rem}
body[data-template="noir"] .noir-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem 1.2rem;margin-bottom:1.2rem}
body[data-template="noir"] .noir-footer-links a{color:var(--ink-soft);text-decoration:none;font-size:.85rem;border-bottom:1px solid var(--line)}
body[data-template="noir"] .noir-footer-links a:hover{color:var(--gold)}
body[data-template="noir"] .noir-footer-copy{color:var(--ink-mute);font-size:.8rem;margin:0}
/* Socials + share live inside the noir footer — compact, ledger-styled */
body[data-template="noir"] .noir-footer .socials-sec{margin:0 0 1.4rem;padding:0}
body[data-template="noir"] .noir-footer .socials-sec .sec-title{font-family:"Playfair Display",Georgia,serif;font-size:1.1rem;letter-spacing:.18em;text-transform:uppercase}
body[data-template="noir"] .noir-footer .socials-sec .sec-sub{font-family:"EB Garamond",Georgia,serif;font-style:italic}
body[data-template="noir"] .noir-footer .share-sec{margin:0 0 1.6rem;padding:0}
body[data-template="noir"] .noir-footer .share-title{font-family:"EB Garamond",Georgia,serif;font-style:italic;font-weight:400;color:var(--ink-mute);font-size:1rem}
@media (max-width:720px){
  body[data-template="noir"] .top3{grid-template-columns:1fr;align-items:stretch}
  body[data-template="noir"] .t3--1{order:1}
  body[data-template="noir"] .t3--2{order:2}
  body[data-template="noir"] .t3--3{order:3}
  body[data-template="noir"] .t-head,
  body[data-template="noir"] .t-row{grid-template-columns:56px 1fr 110px 84px}
}
`;

// Noir replaces the shared shell chrome. header/footer receive the same
// escaped shell parts as the defaults (brand, navLogo, legal links,
// disclaimer) and return full HTML for the regions around <main>.
function noirHeader(sp) {
  const esc = sp.esc;
  return `<header class="noir-masthead"><div class="noir-masthead-rule"></div><a class="noir-masthead-brand" href="#top">${sp.navLogo}<span data-brand-name>${esc(sp.b.name)}</span></a>
<nav class="noir-masthead-links" aria-label="Page sections">${sp.hasPartner ? `<a href="#partner">Partner</a>` : ""}<a href="#board">Honour Roll</a>${sp.socials.length ? `<a href="#socials">Socials</a>` : ""}</nav><div class="noir-masthead-rule"></div></header>`;
}

function noirFooter(sp) {
  const esc = sp.esc;
  // Socials and share live down here for noir — another template can keep
  // them in <main> or pin them under the header. Same blocks, template's
  // choice of address.
  return `<footer class="noir-footer">${sp.socialsSec}${sp.shareSec}<p class="noir-footer-name" data-brand-name>${esc(sp.b.name)}</p><p class="noir-footer-tag" data-tagline>${esc(sp.b.tagline)}</p><p class="noir-footer-fine">${sp.disclaimer}</p><div class="noir-footer-links">${sp.legalLinks}</div><p class="noir-footer-copy">© <span data-year></span> <span data-brand-name>${esc(sp.b.name)}</span>. All rights reserved.</p></footer>`;
}

function composeNoir(p) {
  const esc = p.esc;
  return `<section class="hero hero--noir">${p.heroLogo}<div class="noir-rule"><span>Private Leaderboard</span></div>
<h1 class="hero-name" data-brand-name>${p.name}</h1>
<p class="hero-sub">${p.hasCasino ? `in partnership with <span data-casino>${esc(p.casino)}</span> · ` : ""}${p.hasPool && !p.hidePrizes ? `<span data-pool>${p.poolSpan}</span> prize pool · ` : ""}${p.periodSpan} race</p>
<p class="noir-meta"><b class="countdown" data-countdown>--</b> ${esc(p.countdownLabel || "resets in")} &nbsp;·&nbsp; <b data-count>${p.sCount}</b> players &nbsp;·&nbsp; <span class="live-badge" data-live-badge><span class="live-badge-dot"></span>LIVE</span></p>
<div class="hero-cta">${p.ctaBtn(p.hasCasino ? `Join via ${esc(p.casino)}` : p.joinLabel, "btn btn--noir")}</div>
<div class="hero-timer" data-timer hidden>${p.timerGrid}</div></section>
${p.announce}<section id="board" class="board"><div class="board-head"><h2 class="sec-title">The Honour Roll</h2><span class="player-count-badge" data-player-count-badge></span></div>
${p.payouts}
${p.top3}
${p.findRank}
${p.table}
${p.rules}</section>
${p.partnerPanel}
${p.pastSec}`;
}

// NOTE: noir places socials + share in its footer (see noirFooter), not in
// <main> — a template decides WHERE every section lives, not just how it
// looks. The singleton data-* gate still guarantees each block appears once.

export const NOIR = {
  id: "noir",
  name: "Noir",
  description: "Old-money casino ledger: serif masthead, engraved honour-roll podium, film grain.",
  css: NOIR_CSS,
  fonts: [
    "Playfair+Display:wght@400;700;900",
    "EB+Garamond:ital,wght@0,400;0,500;0,600;1,400",
  ],
  presets: [
    { id: "goldleaf", name: "Gold Leaf", accentA: "#d4af37", accentB: "#b8912e" },
    { id: "bordeaux", name: "Bordeaux", accentA: "#a63a46", accentB: "#7d2a34" },
    { id: "sterling", name: "Sterling", accentA: "#c7cdd6", accentB: "#8f99a8" },
    { id: "cognac", name: "Cognac", accentA: "#c98a4b", accentB: "#a0662c" },
  ],
  // Dashboard-editable knobs for this design. The dashboard auto-builds
  // controls from this schema; values arrive as --opt-accent and as
  // data-opt-grain / data-opt-podium attributes consumed by the CSS above
  // (also readable in compose() via parts.options).
  schema: {
    accent: { type: "color",  label: "Accent",        default: "#d4af37" },
    grain:  { type: "toggle", label: "Film grain",    default: true },
    podium: { type: "select", label: "Podium style",  options: ["roman", "numbers"], default: "roman" },
  },
  compose: composeNoir,
  header: noirHeader,
  footer: noirFooter,
};
