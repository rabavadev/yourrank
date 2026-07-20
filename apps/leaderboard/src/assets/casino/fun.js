// Casino builder for the "fun" full-page template.
// Hydrates the composeFun shell (see templates/casino-full.js). The shell emits
// two empty containers — <div data-top3 class="...flex items-end justify-center gap-3">
// and <div data-rows class="...flex flex-col gap-2.5"> — and the shared runtime
// (assets/leaderboard.js) fills them by calling window.CASINO_BUILDERS.top3.fun
// and window.CASINO_BUILDERS.rows.fun.
//
// Layout contract (matches the High Rollers reference at casino/highRollers.js):
//   • Podium cards are flex children of the shell's items-end/justify-center/gap-3
//     container. They use flex-1 + min-w-0 (NOT fixed w-1/3) so three cards share
//     the row on desktop and shrink gracefully on mobile; long names truncate.
//   • Rows carry the shared behavioral hooks the runtime expects: the `t-row`
//     class (rank-change flash, find-player search, --pct bar sizing) plus a
//     variant `fun-row` class, and data-position / data-name / data-wagered /
//     data-delay attributes. Dynamic per-player values go through data-style-*
//     attributes which the runtime rewrites via CSSOM (strict CSP blocks
//     inline style="" attributes).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const playerHref = (name) => {
    const slug = window.__SLUG__ || "";
    return slug ? `/${encodeURIComponent(slug)}/player/${encodeURIComponent(name)}` : `/player/${encodeURIComponent(name)}`;
  };

  const moneyShort = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const linkName = (n) => `<a class="yr-profile-link" href="${playerHref(n)}">${esc(n)}</a>`;
  const fmtScore = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

  const initials = (name) => {
    const parts = String(name).split(/[\s_]+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  };

  const hash = (s) => {
    let h = 0;
    const str = String(s);
    for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
    return Math.abs(h);
  };

  // Largest wagered in the current board, used to scale each row's progress bar.
  const maxWagered = () => {
    const ps = (window.__SITE_DATA__?.players || []);
    return ps.length ? Math.max(...ps.map((p) => Number(p.wagered) || 0)) : 1;
  };

  const gradientFromHandle = (handle) => {
    const h = hash(handle);
    return `linear-gradient(135deg, hsl(${h % 360}, 80%, 60%), hsl(${(h * 13) % 360}, 80%, 40%))`;
  };

  // The shared runtime passes gap to buildRow, but for the first row rendered in a
  // casino-full template (rank #4, startIndex 3) it forces gap=0 — see
  // leaderboard.js: `i === 0 ? 0 : sorted[i - 1 + startIndex].wagered - pl.wagered`.
  // That makes rank #4 always read "tied" against rank #3. Recompute the real gap
  // from the live sorted board so the indicator is honest for every rank >= 4.
  const realGap = (pl, rank, gap) => {
    if (gap && gap > 0) return gap;
    const ps = (window.__SITE_DATA__?.players || []).slice().sort((a, b) => b.wagered - a.wagered);
    if (rank < 2 || rank > ps.length) return 0;
    const prev = ps[rank - 2]; // rank is 1-based, so the player above is index rank-2
    if (!prev) return 0;
    const diff = (Number(prev.wagered) || 0) - (Number(pl.wagered) || 0);
    return diff > 0 ? diff : 0;
  };

  // Cross-platform coin token (replaces native 🪙 which renders inconsistently).
  const COIN = `<svg viewBox="0 0 24 24" width="16" height="16" class="shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#FBBF24" stroke="#D97706" stroke-width="1.5"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#B45309" stroke-width="1"/><text x="12" y="16" text-anchor="middle" font-size="8" font-weight="700" fill="#B45309">$</text></svg>`;

  // Crown for the #1 podium card.
  const CROWN = `<svg viewBox="0 0 24 24" width="44" height="44" class="mb-1 z-10 relative drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)]" aria-hidden="true"><path d="M3 8l4 3 5-6 5 6 4-3-1.5 10.5H4.5L3 8z" fill="#FBBF24" stroke="#B45309" stroke-width="1"/><circle cx="7" cy="8" r="1.6" fill="#FEF08A"/><circle cx="12" cy="5" r="1.6" fill="#FEF08A"/><circle cx="17" cy="8" r="1.6" fill="#FEF08A"/></svg>`;

  // Podium cards are flex children of the shell's `flex items-end justify-center
  // gap-3` container. We use `flex-1 min-w-0` instead of fixed `w-1/3 max-w-[…]`
  // so the three cards share the row evenly and shrink on narrow viewports; the
  // `order-*` classes keep the 2-1-3 scan order on desktop and collapse to
  // 1-2-3 reading order below sm. Long names truncate instead of overflowing.
  function top3Fun(pl, rank) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const inits = initials(pl.name);
    const FRED = "[font-family:'Fredoka_One',cursive]";

    if (rank === 1) {
      return `<div class="order-2 flex-1 min-w-0 max-w-[260px] flex flex-col items-center relative z-20">
        <div class="absolute inset-0 bg-[#FBBF24] blur-[40px] opacity-30 rounded-full animate-pulse pointer-events-none" aria-hidden="true"></div>
        ${CROWN}
        <div class="w-full bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] rounded-t-2xl rounded-b-lg p-4 md:p-5 flex flex-col items-center shadow-[0_15px_30px_rgba(0,0,0,0.6)] border-4 border-[#FEF08A] relative z-10">
          <div class="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-[#B45309] text-2xl md:text-3xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] mb-3 border-4 border-white/40 ${FRED}">${inits}</div>
          <div class="text-center w-full min-w-0">
            <div class="text-[#3B0764] text-base md:text-xl truncate w-full ${FRED}">${name}</div>
            <div class="text-[#3B0764] font-black text-lg md:text-2xl mt-1 tabular-nums">${score}</div>
          </div>
        </div>
        <div class="h-24 w-full bg-gradient-to-b from-[#D97706] to-[#92400E] rounded-b-xl shadow-lg border-x-4 border-b-4 border-[#B45309] flex items-center justify-center relative z-10">
          <span class="text-[#FEF08A] font-black text-4xl ${FRED}">1</span>
        </div>
      </div>`;
    }

    if (rank === 2) {
      return `<div class="order-1 flex-1 min-w-0 max-w-[200px] flex flex-col items-center relative z-10 transition-transform hover:scale-105">
        <div class="w-full bg-gradient-to-b from-[#EC4899] to-[#BE185D] rounded-t-2xl rounded-b-lg p-3 md:p-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-[#F472B6]">
          <div class="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-[#BE185D] text-xl md:text-2xl shadow-inner mb-2.5 border-4 border-white/20 ${FRED}">${inits}</div>
          <div class="text-center w-full min-w-0">
            <div class="text-white text-sm md:text-lg truncate w-full ${FRED}">${name}</div>
            <div class="text-[#FDE68A] font-black text-sm md:text-lg mt-1 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">${score}</div>
          </div>
        </div>
        <div class="h-16 w-full bg-gradient-to-b from-[#BE185D] to-[#831843] rounded-b-xl shadow-lg border-x-4 border-b-4 border-[#9D174D] flex items-center justify-center">
          <span class="text-[#F9A8D4] font-black text-2xl ${FRED}">2</span>
        </div>
      </div>`;
    }

    if (rank === 3) {
      return `<div class="order-3 flex-1 min-w-0 max-w-[200px] flex flex-col items-center relative z-10 transition-transform hover:scale-105">
        <div class="w-full bg-gradient-to-b from-[#F97316] to-[#EA580C] rounded-t-2xl rounded-b-lg p-3 md:p-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-[#FDBA74]">
          <div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-[#C2410C] text-xl md:text-2xl shadow-inner mb-2.5 border-4 border-white/20 ${FRED}">${inits}</div>
          <div class="text-center w-full min-w-0">
            <div class="text-white text-sm md:text-lg truncate w-full ${FRED}">${name}</div>
            <div class="text-[#FEF3C7] font-black text-sm md:text-base mt-1 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">${score}</div>
          </div>
        </div>
        <div class="h-12 w-full bg-gradient-to-b from-[#C2410C] to-[#7C2D12] rounded-b-xl shadow-lg border-x-4 border-b-4 border-[#9A3412] flex items-center justify-center">
          <span class="text-[#FDBA74] font-black text-xl ${FRED}">3</span>
        </div>
      </div>`;
    }

    return "";
  }

  // Rows are children of the shell's `flex flex-col gap-2.5` container. We render
  // a single row with the shared `t-row` hook (so the runtime can flash rank
  // changes, find a player, and size the wager bar via --pct) plus a `fun-row`
  // variant class. The internal layout is a 12-col grid: rank badge | avatar |
  // (name + score over a wager bar + gap indicator). `min-w-0` + `truncate` keep
  // long handles from blowing out the row on mobile.
  function rowFun(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const inits = initials(pl.name);
    const pct = Math.max(6, Math.round((Number(pl.wagered) / maxWagered()) * 100));
    const g = realGap(pl, rank, gap);
    const gapHtml = g > 0
      ? `<span class="text-[#C4B5FD] text-[11px] md:text-xs font-semibold tabular-nums whitespace-nowrap" aria-label="behind next rank">${moneyShort(g)} to climb</span>`
      : `<span class="text-[#4ADE80] text-[11px] md:text-xs font-semibold whitespace-nowrap">tied</span>`;
    const FRED = "[font-family:'Fredoka_One',cursive]";

    return `<div class="t-row fun-row w-full rounded-2xl px-3.5 py-3 flex items-center gap-3 border border-white/5 shadow-md transition-transform hover:scale-[1.008] bg-[#3B1370]/90" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
      <div class="w-9 h-9 md:w-11 md:h-11 bg-[#FBBF24] rounded-full flex items-center justify-center text-[#3B0764] font-black text-base md:text-lg shrink-0 border-2 border-[#D97706] ${FRED} tr-rank">${rank}</div>
      <div class="w-9 h-9 md:w-10 md:h-10 rounded-full shrink-0 hidden sm:flex items-center justify-center text-white text-xs md:text-sm font-bold border-2 border-white/15" data-style-background="${gradientFromHandle(pl.name)}">${inits}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-white text-base md:text-lg tracking-wide truncate ${FRED}">${name}</span>
          <span class="text-white font-black text-base md:text-xl tabular-nums flex items-center gap-1.5 shrink-0">${score}${COIN}</span>
        </div>
        <div class="mt-1.5 flex items-center gap-2">
          <div class="h-1.5 flex-grow rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-[#EC4899] to-[#FBBF24]" data-style-width="${pct}%"></div>
          </div>
          ${gapHtml}
        </div>
      </div>
    </div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3.fun = top3Fun;
  window.CASINO_BUILDERS.rows.fun = rowFun;
})();
