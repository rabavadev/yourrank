// Casino builder for arcade
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

  function top3Arcade(pl, rank) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const initials = wordInitials(pl.name);
    if (rank === 1) return `<div class="flex flex-col items-center relative w-[38%] max-w-[240px] transform -translate-y-4 md:-translate-y-8"><div class="absolute inset-0 bg-[#FF00FF] blur-[40px] opacity-30 animate-pulse pointer-events-none"></div><div class="text-4xl md:text-5xl mb-3 z-10 relative">🏆</div><div class="w-full bg-gradient-to-b from-[#FF00FF] to-[#800080] p-4 md:p-6 flex flex-col items-center border-[4px] border-[#FF00FF] shadow-[0_0_25px_rgba(255,0,255,0.6),inset_0_0_15px_rgba(0,0,0,0.5)] relative z-10"><div class="absolute -top-3 -right-3 text-2xl animate-bounce">💥</div><div class="absolute -top-2 -left-2 text-xl animate-bounce [animation-delay:0.3s]">🎮</div><div class="w-16 h-16 md:w-20 md:h-20 bg-black flex items-center justify-center text-[#FF00FF] text-base md:text-xl mb-4 border-[4px] border-[#FF00FF] shadow-[0_0_10px_#FF00FF] [font-family:'Press_Start_2P',_system-ui]">${initials}</div><div class="text-center w-full"><div class="text-white text-[10px] md:text-[12px] truncate w-full [font-family:'Press_Start_2P',_system-ui]">${name}</div><div class="text-[#FFD700] text-[12px] md:text-sm mt-2 tabular-nums drop-shadow-[0_0_5px_#FFD700] [font-family:'Press_Start_2P',_system-ui]">${score}</div></div></div><div class="h-20 w-full bg-gradient-to-b from-[#800080] to-[#330033] border-x-[4px] border-b-[4px] border-[#4D004D] flex items-center justify-center relative z-10 shadow-[0_10px_0_#000000]"><span class="text-[#FF00FF] text-2xl opacity-90 drop-shadow-[0_0_8px_#FF00FF] [font-family:'Press_Start_2P',_system-ui]">${rank}</span></div></div>`;
    if (rank === 2) return `<div class="flex flex-col items-center relative w-[30%] max-w-[200px] transform hover:-translate-y-2 transition-transform"><div class="text-3xl md:text-4xl mb-3 animate-pulse [animation-duration:2s]">⚡</div><div class="w-full bg-gradient-to-b from-[#00BFFF] to-[#005580] p-3 md:p-4 flex flex-col items-center border-[4px] border-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.5),inset_0_0_10px_rgba(0,0,0,0.5)]"><div class="w-12 h-12 md:w-16 md:h-16 bg-black flex items-center justify-center text-[#00BFFF] text-sm md:text-base mb-3 border-2 border-[#00BFFF] [font-family:'Press_Start_2P',_system-ui]">${initials}</div><div class="text-center w-full"><div class="text-white text-[8px] md:text-[10px] truncate w-full [font-family:'Press_Start_2P',_system-ui]">${name}</div><div class="text-[#FFD700] text-[10px] md:text-xs mt-2 tabular-nums [font-family:'Press_Start_2P',_system-ui]">${score}</div></div></div><div class="h-16 w-full bg-gradient-to-b from-[#005580] to-[#001133] border-x-[4px] border-b-[4px] border-[#003366] flex items-center justify-center shadow-[0_10px_0_#000000]"><span class="text-[#00BFFF] text-xl opacity-80 drop-shadow-[0_0_5px_#00BFFF] [font-family:'Press_Start_2P',_system-ui]">${rank}</span></div></div>`;
    if (rank === 3) return `<div class="flex flex-col items-center relative w-[30%] max-w-[180px] transform hover:-translate-y-2 transition-transform"><div class="text-3xl md:text-4xl mb-3 animate-pulse [animation-duration:3s]">🔥</div><div class="w-full bg-gradient-to-b from-[#39FF14] to-[#006600] p-2 md:p-4 flex flex-col items-center border-[4px] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5),inset_0_0_10px_rgba(0,0,0,0.5)]"><div class="w-10 h-10 md:w-14 md:h-14 bg-black flex items-center justify-center text-[#39FF14] text-xs md:text-sm mb-2 border-2 border-[#39FF14] [font-family:'Press_Start_2P',_system-ui]">${initials}</div><div class="text-center w-full"><div class="text-white text-[7px] md:text-[9px] truncate w-full [font-family:'Press_Start_2P',_system-ui]">${name}</div><div class="text-[#FFD700] text-[9px] md:text-[11px] mt-2 tabular-nums [font-family:'Press_Start_2P',_system-ui]">${score}</div></div></div><div class="h-12 w-full bg-gradient-to-b from-[#006600] to-[#002200] border-x-[4px] border-b-[4px] border-[#004400] flex items-center justify-center shadow-[0_10px_0_#000000]"><span class="text-[#39FF14] text-lg opacity-80 drop-shadow-[0_0_5px_#39FF14] [font-family:'Press_Start_2P',_system-ui]">${rank}</span></div></div>`;
    return "";
  }

  function rowArcade(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.wagered);
    const rankStr = rank;
    const upSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-3 h-3" aria-hidden="true"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>`;
    const downSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down text-[#FF00FF] w-4 h-4" aria-hidden="true"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></svg>`;
    const icon = hash(pl.name) % 2 === 0 ? upSvg : downSvg;
    return `<div class="w-full p-4 flex items-center border-l-[6px] border-[#39FF14] border-b-2 border-r-2 border-t-2 border-[#000000] shadow-[4px_4px_0_#000000] hover:-translate-y-1 hover:shadow-[6px_6px_0_#000000] transition-all cursor-pointer bg-[#1A1A2E]"><div class="w-8 h-8 md:w-10 md:h-10 bg-black flex items-center justify-center text-[#39FF14] text-[8px] md:text-[10px] shrink-0 border border-[#39FF14] [font-family:'Press_Start_2P',_system-ui]">${rankStr}</div><div class="ml-4 flex-grow flex flex-col md:flex-row md:items-center justify-between"><div class="flex items-center gap-3"><span class="text-white/90 text-[8px] md:text-[10px] [font-family:'Press_Start_2P',_system-ui] [line-height:1.5]">${name}</span>${icon}</div><div class="text-[#FFD700] text-[10px] md:text-[12px] tabular-nums mt-3 md:mt-0 flex items-center gap-2 [font-family:'Press_Start_2P',_system-ui]">${score}</div></div></div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3["arcade"] = top3Arcade;
  window.CASINO_BUILDERS.rows["arcade"] = rowArcade;
})();
