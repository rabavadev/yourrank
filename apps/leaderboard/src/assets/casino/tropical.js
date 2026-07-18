// Casino builder for tropical
(function () {
const playerHref = (name) => { const slug = window.__SLUG__ || ""; return slug ? `/${encodeURIComponent(slug)}/player/${encodeURIComponent(name)}` : `/player/${encodeURIComponent(name)}`; };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const moneyShort = (n) => "$" + Number(n).toLocaleString("en-US", {maximumFractionDigits:0});
const money = (n) => "$" + Number(n).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
const streakFor = (n) => (window.__SITE_DATA__?.players || []).find((p) => p.name === n)?.streak || 0;
const streakBadge = (streak) => streak >= 2 ? `<span class="yr-streak" style="margin-left:.3rem;font-size:.75rem;color:#ff7a00;font-weight:700;white-space:nowrap" title="${streak} consecutive #1 finishes" aria-label="${streak} streak">🔥${streak}</span>` : "";
const linkName = (n) => {
  const streak = streakFor(n);
  const badge = streakBadge(streak);
  return `<a class="yr-profile-link" href="${playerHref(n)}">${esc(n)}${badge}</a>`;
};
const fmtScore = (n) => Number(n).toLocaleString("en-US", {maximumFractionDigits:0});
const wordInitials = (name) => { const parts = String(name).split(/[\s_]+/).filter(Boolean); if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase(); return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase(); };
const hash = (s) => { let h = 0; for (let i = 0; i < String(s).length; i++) { h = (h << 5) - h + String(s).charCodeAt(i); } return Math.abs(h); };
const maxWagered = () => { const ps = (window.__SITE_DATA__?.players || []); return ps.length ? Math.max(...ps.map((p) => Number(p.wagered) || 0)) : 1; };
const gradientFromHandle = (handle) => { const h = hash(handle); return `linear-gradient(135deg, hsl(${h % 360}, 80%, 60%), hsl(${(h * 13) % 360}, 80%, 40%))`; };

  function top3Tropical(pl, rank) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const initials = wordInitials(pl.name);
    if (rank === 1) return `<div class="flex flex-col items-center relative w-1/3 max-w-[240px] z-20 transform -translate-y-4 md:-translate-y-8"><div class="absolute inset-0 bg-[#FFE66D] blur-[40px] opacity-40 rounded-full animate-pulse pointer-events-none"></div><div class="text-5xl md:text-7xl mb-2 filter drop-shadow-lg z-10 relative">🏆</div><div class="w-full bg-gradient-to-b from-[#FFE66D] to-[#FBBF24] rounded-t-full rounded-b-[24px] p-4 md:p-6 flex flex-col items-center shadow-[0_15px_30px_rgba(0,0,0,0.4)] border-4 border-[#FFE66D]/80 relative z-10"><div class="absolute -top-3 -right-3 text-3xl animate-bounce">🍍</div><div class="absolute -top-2 -left-2 text-2xl animate-bounce [animation-delay:0.3s]">🥥</div><div class="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center text-[#D97706] text-3xl md:text-4xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] mb-4 border-4 border-white/40 [font-family:'Pacifico',_cursive]">${initials}</div><div class="text-center w-full"><div class="text-[#92400E] text-lg md:text-2xl truncate w-full [font-family:'Pacifico',_cursive]">${name}</div><div class="text-white font-black text-lg md:text-2xl mt-1 tabular-nums drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] [font-family:'Inter',_sans-serif]">${score}</div></div></div><div class="h-20 w-full bg-gradient-to-b from-[#F59E0B] to-[#D97706] rounded-b-3xl shadow-lg border-x-4 border-b-4 border-[#B45309] flex items-center justify-center relative z-0 -mt-6 pt-6"><span class="text-[#FEF08A] font-bold text-4xl opacity-50 [font-family:'Inter',_sans-serif]">${rank}</span></div></div>`;
    if (rank === 2) return `<div class="flex flex-col items-center relative w-1/3 max-w-[200px] z-10 transform hover:scale-105 transition-transform"><div class="text-4xl md:text-6xl mb-2 filter drop-shadow-lg animate-pulse [animation-duration:3s]">🦜</div><div class="w-full bg-gradient-to-b from-[#00D4AA] to-[#0D9488] rounded-t-full rounded-b-[20px] p-3 md:p-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-[#00D4AA]/50 relative"><div class="absolute -top-4 -right-2 text-2xl animate-[spin_4s_linear_infinite]">🌺</div><div class="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-[#0D9488] text-2xl md:text-3xl shadow-inner mb-3 border-4 border-white/20 [font-family:'Pacifico',_cursive]">${initials}</div><div class="text-center w-full"><div class="text-white text-base md:text-xl truncate w-full [font-family:'Pacifico',_cursive]">${name}</div><div class="text-[#FFE66D] font-black text-sm md:text-lg mt-1 tabular-nums drop-shadow-md [font-family:'Inter',_sans-serif]">${score}</div></div></div><div class="h-16 w-full bg-gradient-to-b from-[#0D9488] to-[#115E59] rounded-b-3xl shadow-lg border-x-4 border-b-4 border-[#134E4A] flex items-center justify-center -mt-4 pt-4 z-[-1]"><span class="text-[#00D4AA] font-bold text-2xl opacity-50 [font-family:'Inter',_sans-serif]">${rank}</span></div></div>`;
    if (rank === 3) return `<div class="flex flex-col items-center relative w-1/3 max-w-[180px] z-10 transform hover:scale-105 transition-transform"><div class="text-4xl md:text-5xl mb-2 filter drop-shadow-lg animate-pulse [animation-duration:4s]">🏖️</div><div class="w-full bg-gradient-to-b from-[#FF6B6B] to-[#E11D48] rounded-t-full rounded-b-[16px] p-2 md:p-4 flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-[#FF6B6B]/50 relative"><div class="absolute -top-3 -left-3 text-2xl animate-[spin_4s_linear_infinite_reverse]">🌺</div><div class="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-[#E11D48] text-xl md:text-2xl shadow-inner mb-2 border-4 border-white/20 [font-family:'Pacifico',_cursive]">${initials}</div><div class="text-center w-full"><div class="text-white text-sm md:text-lg truncate w-full [font-family:'Pacifico',_cursive]">${name}</div><div class="text-[#FFE66D] font-black text-xs md:text-base mt-1 tabular-nums drop-shadow-md [font-family:'Inter',_sans-serif]">${score}</div></div></div><div class="h-12 w-full bg-gradient-to-b from-[#E11D48] to-[#9F1239] rounded-b-2xl shadow-lg border-x-4 border-b-4 border-[#881337] flex items-center justify-center -mt-3 pt-3 z-[-1]"><span class="text-[#FFB4B4] font-bold text-xl opacity-50 [font-family:'Inter',_sans-serif]">${rank}</span></div></div>`;
    return "";
  }

  function rowTropical(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const rankStr = rank;
    const upSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-3 h-3" aria-hidden="true"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>`;
    const downSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down text-[#FF6B6B] w-4 h-4" aria-hidden="true"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></svg>`;
    const icon = hash(pl.name) % 2 === 0 ? upSvg : downSvg;
    return `<div class="w-full rounded-2xl p-4 flex items-center border-l-4 border-[#FF6B6B] shadow-md transform hover:scale-[1.01] transition-transform cursor-pointer bg-white/20 backdrop-blur-sm"><div class="w-10 h-10 md:w-12 md:h-12 bg-[#FF6B6B] rounded-full flex items-center justify-center text-white font-black text-lg md:text-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] shrink-0 border-2 border-[#E11D48] [font-family:'Inter',_sans-serif]">${rankStr}</div><div class="ml-4 flex-grow flex flex-col md:flex-row md:items-center justify-between"><div class="flex items-center gap-2"><span class="text-white text-lg md:text-xl tracking-wide [font-family:'Pacifico',_cursive]">${name}</span>${icon}</div><div class="text-white font-black text-lg md:text-2xl tabular-nums mt-1 md:mt-0 flex items-center gap-2 [font-family:'Inter',_sans-serif]">${score}<!-- --> <span class="text-base opacity-90">🥥</span></div></div></div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3["tropical"] = top3Tropical;
  window.CASINO_BUILDERS.rows["tropical"] = rowTropical;
})();
