// Full-page, structurally distinct composers for the casino design pack.
// These templates own their own header, hero, list, and footer markup.

const PRO_CSS = `
:root{--pro-bg:#07120b;--pro-panel:#0f1f13;--pro-line:#22c55e33;--pro-ink:#e8ffe8;--pro-ink-soft:#86efac;--pro-cy:#22c55e;--pro-gold:#f59e0b}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.cpage--pro{background:#07120b;color:#e8ffe8;font-family:"Space Mono",monospace;min-height:100vh;padding:0 0 3rem}
.chead--pro{background:linear-gradient(180deg,#0f1f13 0%,#07120b 100%);border-bottom:1px solid #22c55e55;padding:1.5rem 4vw 2rem;text-align:center}
.chead-top{display:flex;flex-direction:column;align-items:center;gap:.6rem}
.chead-live{font-size:.65rem;letter-spacing:.15em;color:#22c55e;display:flex;align-items:center;gap:.4rem;text-transform:uppercase}
.live-dot{width:6px;height:6px;background:#22c55e;border-radius:50%;animation:pulse 1.5s infinite}
.chead--pro h1{font-size:clamp(1.6rem,5vw,2.6rem);text-transform:uppercase;letter-spacing:.1em;margin:0;color:#fff;font-weight:700}
.ctabs{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center}
.ctab{background:transparent;border:1px solid #22c55e55;color:#86efac;padding:.4rem .9rem;font-size:.7rem;text-transform:uppercase;cursor:pointer;font-family:"Space Mono",monospace}
.ctab--active{background:#22c55e;color:#07120b;border-color:#22c55e}
.chead-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;max-width:900px;margin:1.5rem auto 0;text-align:left}
.chead-stats div{background:#0a1a0e;border:1px solid #22c55e33;padding:1rem;border-radius:2px}
.chead-stats span{display:block;font-size:.6rem;opacity:.7;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.3rem}
.chead-stats b{font-size:1.1rem;color:#f59e0b;font-weight:700}
.c-main{max-width:1000px;margin:0 auto;padding:1.5rem 4vw}
.c-table{background:#0f1f13;border:1px solid #22c55e33;border-radius:2px;overflow:hidden}
.c-thead{display:grid;grid-template-columns:60px 1fr 140px 100px;gap:1rem;padding:.9rem 1.2rem;background:#142b17;font-size:.6rem;text-transform:uppercase;letter-spacing:.12em;color:#86efac;border-bottom:1px solid #22c55e33}
.c-rows .t-row--pro{display:grid;grid-template-columns:60px 1fr 140px 100px;gap:1rem;align-items:center;padding:1rem 1.2rem;border-bottom:1px dashed #22c55e44;font-size:.85rem;background:transparent}
.c-rows .t-row--pro:last-child{border-bottom:none}
.c-rows .t-row--pro .tr-rank{color:#86efac;font-weight:700}
.c-rows .t-row--pro .tr-player{display:flex;align-items:center;gap:.7rem}
.c-rows .t-row--pro .tr-av{width:28px;height:28px;border-radius:50%;background:#07120b;color:#22c55e;display:grid;place-items:center;font-size:.65rem;border:1px solid #22c55e;flex-shrink:0}
.c-rows .t-row--pro .tr-name{font-weight:600}
.c-rows .t-row--pro .tr-wager,.c-rows .t-row--pro .tr-prize{text-align:right;font-family:"JetBrains Mono",monospace}
.c-rows .t-row--pro .tr-prize{color:#f59e0b}
.cftr--pro{text-align:center;padding:2rem 1rem;font-size:.65rem;opacity:.5;text-transform:uppercase;letter-spacing:.1em}
@media(max-width:600px){.c-thead,.c-rows .t-row--pro{grid-template-columns:36px 1fr 80px 60px;font-size:.7rem}}
`;

const VIP_CSS = `
:root{--vip-bg:#0a0a0a;--vip-gold:#C9A84C;--vip-ink:#F5F5F0}
.cpage--vip{background:#0a0a0a;color:#F5F5F0;font-family:"Cormorant Garamond",serif;min-height:100vh;padding:0 0 3rem}
.chead--vip{text-align:center;padding:3rem 4vw 2rem}
.chead--vip h1{font-size:clamp(2.2rem,6vw,3.6rem);text-transform:uppercase;letter-spacing:.15em;font-style:italic;margin:0 0 .4rem;font-weight:700}
.chead--vip p{font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;opacity:.6;margin:0 0 1.2rem}
.chead-line{height:2px;width:120px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);margin:1rem auto}
.chead--vip .ctabs{justify-content:center;margin-top:1rem}
.chead--vip .ctab{background:transparent;border:1px solid #C9A84C55;color:#C9A84C;padding:.45rem 1.1rem;font-family:"Cormorant Garamond",serif;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;cursor:pointer}
.chead--vip .ctab--active{background:#C9A84C;color:#0a0a0a;border-color:#C9A84C}
.c-main{max-width:800px;margin:0 auto;padding:0 4vw}
.c-rows .t-row--vip{display:flex;align-items:center;gap:1.2rem;padding:1.2rem 0;border-bottom:1px solid #C9A84C33;font-size:1.05rem;background:transparent}
.c-rows .t-row--vip:last-child{border-bottom:none}
.c-rows .t-row--vip .tr-rank{width:36px;text-align:center;color:#C9A84C;font-family:"Space Mono",monospace;font-size:.75rem;letter-spacing:.05em;flex-shrink:0}
.c-rows .t-row--vip .tr-player{flex:1;display:flex;align-items:center;gap:.8rem;min-width:0}
.c-rows .t-row--vip .tr-av{width:36px;height:36px;border-radius:50%;background:#0a0a0a;color:#C9A84C;display:grid;place-items:center;border:1px solid #C9A84C;font-family:"Space Mono",monospace;font-size:.65rem;flex-shrink:0}
.c-rows .t-row--vip .tr-name{font-size:1.15rem;font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-rows .t-row--vip .tr-wager,.c-rows .t-row--vip .tr-prize{font-family:"Space Mono",monospace;font-size:.8rem;color:#C9A84C;text-align:right;flex-shrink:0}
.cftr--vip{text-align:center;padding:2rem 1rem 3rem;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#C9A84C}
`;

const EDITORIAL_CSS = `
:root{--ed-bg:#0B0B10;--ed-panel:#151520;--ed-line:#ffffff12;--ed-ink:#f1f1f4;--ed-ink-soft:#a1a1aa;--ed-cy:#6366f1;--ed-gold:#fbbf24}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.cpage--editorial{background:#0B0B10;color:#f1f1f4;font-family:"Sora",system-ui,sans-serif;min-height:100vh;padding:0 0 3rem}
.chead--editorial{display:flex;justify-content:space-between;align-items:center;gap:1.5rem;flex-wrap:wrap;padding:2.5rem 4vw 1.5rem;max-width:1200px;margin:0 auto}
.chead-brand{display:flex;align-items:center;gap:1rem}
.chead-icon{font-size:1.6rem;line-height:1}
.chead-titles h1{font-size:clamp(1.5rem,4vw,2.2rem);margin:0;font-weight:800;letter-spacing:-.02em}
.chead-titles h1 span{color:#6366f1}
.chead-titles p{margin:.2rem 0 0;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;color:#a1a1aa}
.chead-live{color:#22c55e;font-weight:700}
.chead--editorial .ctabs{display:flex;gap:.5rem;flex-wrap:wrap}
.chead--editorial .ctab{background:transparent;border:1px solid #ffffff15;color:#a1a1aa;padding:.45rem 1rem;border-radius:8px;font-size:.75rem;font-family:"Sora",sans-serif;cursor:pointer}
.chead--editorial .ctab--active{background:#6366f1;color:#fff;border-color:#6366f1}
.c-main{max-width:1000px;margin:0 auto;padding:1rem 4vw 3rem}
.c-podium{display:flex;justify-content:center;align-items:end;gap:1rem;margin:2rem 0 3rem;min-height:220px;flex-wrap:wrap}
.c-podium .t3--editorial{position:relative;background:linear-gradient(180deg,#1e1e2d,#151520);border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:1.2rem 1rem 1rem;text-align:center;box-shadow:0 24px 60px -40px rgba(0,0,0,.5);flex:1;max-width:260px;min-width:180px;display:flex;flex-direction:column;align-items:center;gap:.5rem}
.c-podium .t3--editorial[data-rank="1"]{transform:translateY(-20px);border-color:rgba(251,191,36,.4);z-index:2}
.c-podium .t3--editorial .t3-rank{font-size:.7rem;letter-spacing:.1em;color:#a1a1aa}
.c-podium .t3--editorial .t3-av{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:grid;place-items:center;font-size:1.3rem;font-weight:700}
.c-podium .t3--editorial[data-rank="1"] .t3-av{background:linear-gradient(135deg,#fbbf24,#f59e0b)}
.c-podium .t3--editorial .t3-meta{display:flex;flex-direction:column;gap:.2rem}
.c-podium .t3--editorial .t3-name{font-weight:700;font-size:1rem}
.c-podium .t3--editorial .t3-wager{color:#fbbf24;font-weight:700}
.c-list{background:#151520;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden}
.c-list .c-thead{display:grid;grid-template-columns:60px 1fr 140px 100px;gap:1rem;padding:1rem 1.4rem;background:rgba(255,255,255,.04);font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;border-bottom:1px solid rgba(255,255,255,.08)}
.c-list .c-rows .t-row--editorial{display:grid;grid-template-columns:60px 1fr 140px 100px;gap:1rem;align-items:center;padding:1rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.06);font-size:.9rem;background:transparent}
.c-list .c-rows .t-row--editorial:last-child{border-bottom:none}
.c-list .c-rows .t-row--editorial .tr-rank{color:#71717a;font-weight:700}
.c-list .c-rows .t-row--editorial .tr-player{display:flex;align-items:center;gap:.7rem;min-width:0}
.c-list .c-rows .t-row--editorial .tr-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:grid;place-items:center;font-size:.7rem;font-weight:700;flex-shrink:0}
.c-list .c-rows .t-row--editorial .tr-name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c-list .c-rows .t-row--editorial .tr-wager,.c-list .c-rows .t-row--editorial .tr-prize{text-align:right;font-family:"JetBrains Mono",monospace;color:#a1a1aa}
.c-list .c-rows .t-row--editorial .tr-prize{color:#fbbf24}
.cftr--editorial{text-align:center;padding:2rem 1rem 3rem;font-size:.7rem;color:#71717a;display:flex;align-items:center;justify-content:center;gap:.5rem;flex-wrap:wrap}
@media(max-width:600px){.chead--editorial{flex-direction:column;align-items:flex-start}.c-podium{flex-direction:column;align-items:center}.c-list .c-thead,.c-list .c-rows .t-row--editorial{grid-template-columns:36px 1fr 80px 60px}}
`;

export function composePro(p) {
  return `<div class="cpage cpage--pro">
<header class="chead chead--pro">
  <div class="chead-top">
    <span class="chead-live"><span class="live-dot"></span>LIVE</span>
    <h1>Poker Rankings</h1>
    <div class="ctabs"><button class="ctab">TODAY</button><button class="ctab ctab--active">THIS WEEK</button><button class="ctab">ALL TIME</button></div>
  </div>
  <div class="chead-stats">
    <div><span>Total Players</span><b data-count>0</b></div>
    <div><span>Avg Win Rate</span><b>54.2%</b></div>
    <div><span>Season Prize Pool</span><b data-pool></b></div>
    <div><span>Hands Played</span><b>48,392</b></div>
  </div>
</header>
${p.announce}
<section class="c-main">
  <div class="c-table">
    <div class="c-thead"><span>RANK</span><span>PLAYER</span><span>WAGERED</span><span>PRIZE</span></div>
    <div class="c-rows" data-rows></div>
  </div>
  ${p.rules}
</section>
<footer class="cftr cftr--pro">Data refreshes every 30s · Season 14 · ${p.esc(p.name)}</footer>
</div>`;
}

export function composeVIP(p) {
  return `<div class="cpage cpage--vip">
<header class="chead chead--vip">
  <div class="chead-line"></div>
  <h1>Season Standings</h1>
  <p>Members only · <span data-period></span></p>
  <div class="ctabs"><button class="ctab ctab--active">Today</button><button class="ctab">This Week</button><button class="ctab">All Time</button></div>
  <div class="chead-line"></div>
</header>
${p.announce}
<section class="c-main">
  <div class="c-rows" data-rows></div>
</section>
<footer class="cftr cftr--vip"><div class="chead-line"></div><p>Updated live · <span data-brand-name>${p.esc(p.name)}</span></p></footer>
</div>`;
}

export function composeEditorial(p) {
  return `<div class="cpage cpage--editorial">
<header class="chead chead--editorial">
  <div class="chead-brand">
    <span class="chead-icon" aria-hidden="true">⚔️</span>
    <div class="chead-titles">
      <h1>Global <span>Rankings</span></h1>
      <p>Top 50 · <span data-period></span> · <span class="chead-live"><span class="live-dot"></span>LIVE</span></p>
    </div>
  </div>
  <div class="ctabs"><button class="ctab ctab--active">Today</button><button class="ctab">This Week</button><button class="ctab">All Time</button></div>
</header>
${p.announce}
<section class="c-main">
  <div class="c-podium" data-top3></div>
  <div class="c-list">
    <div class="c-thead"><span>RANK</span><span>PLAYER</span><span>WAGERED</span><span>PRIZE</span></div>
    <div class="c-rows" data-rows></div>
  </div>
  ${p.rules}
</section>
<footer class="cftr cftr--editorial"><span class="chead-icon" aria-hidden="true">⚔️</span><p>Powered by <span data-brand-name>${p.esc(p.name)}</span> · Leaderboard updates every second</p></footer>
</div>`;
}

export { PRO_CSS, VIP_CSS, EDITORIAL_CSS };
