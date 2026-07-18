// Casino builder for leaderboardV2
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

  function top3LeaderboardV2(pl, rank) { return ""; }

  function rowLeaderboardV2(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const scoreNum = Number(pl.score) || Number(pl.wagered) || 0;
    const score = fmtScore(scoreNum);
    const maxScore = Math.max(1, ...((window.__SITE_DATA__?.players || []).map((p) => Number(p.score || p.wagered) || 0)));
    const barWidth = maxScore ? Math.round((scoreNum / maxScore) * 100) : 0;
    const winRate = (Number(pl.winRate) || barWidth).toFixed(1);
    const change = Number(pl.change) || 0;
    const initials = String(pl.name).split(/[\s]+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase();
    const handle = "@" + String(pl.name).toLowerCase().replace(/[\s]+/g, "_").slice(0, 12);
    const rankPad = String(rank).padStart(2, "0");
    const rankColorClass = rank === 1 ? "text-[#C41E3A]" : "text-black";
    const nameSizeClass = rank === 1 ? "text-3xl md:text-[2.25rem]" : "text-2xl md:text-[1.75rem]";
    const leftBar = rank === 1 ? '<div class="absolute left-0 top-0 bottom-0 w-[4px] bg-[#C41E3A]"></div>' : "";
    const h = hash(handle);
    const gradient = `linear-gradient(135deg, hsl(${h % 360}, 70%, 80%) 0%, hsl(${(h * 7) % 360}, 70%, 90%) 100%)`;
    let trendIcon, trendText, trendClass;
    if (change > 0) { trendIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up" aria-hidden="true"><path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" /></svg>`; trendText = String(change); trendClass = "text-[#105c38]"; }
    else if (change < 0) { trendIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down" aria-hidden="true"><path d="M16 17h6v-6" /><path d="m22 17-8.5-8.5-5 5L2 7" /></svg>`; trendText = String(Math.abs(change)); trendClass = "text-[#C41E3A]"; }
    else { trendIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus" aria-hidden="true"><path d="M5 12h14" /></svg>`; trendText = ""; trendClass = "text-gray-400"; }
    const noiseUrl = "data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E";
    return `<div class="group relative flex flex-col xl:flex-row xl:items-center py-6 md:py-8 border-b-[2px] border-black transition-colors hover:bg-black/[0.03]">${leftBar}<div class="flex items-center w-full xl:w-auto"><div class="flex items-center justify-end w-24 md:w-32 shrink-0 pr-6 md:pr-10 pl-6"><span class="text-[4.5rem] md:text-[6rem] font-black italic tracking-tighter tabular-nums leading-none -ml-2 ${rankColorClass}">${rankPad}</span></div><div class="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full border-[1.5px] border-black shrink-0 relative overflow-hidden" data-styleBackground="${gradient}"><div class="absolute inset-0 opacity-20 mix-blend-overlay" data-styleBackgroundImage="url('${noiseUrl}')"></div><span class="font-mono font-bold text-sm md:text-lg text-black/80 relative z-10 mix-blend-color-burn">${initials}</span></div><div class="ml-5 md:ml-8 flex flex-col shrink-0 min-w-[240px]"><div class="flex items-center gap-3 md:gap-4"><h2 class="font-bold leading-none ${nameSizeClass}">${name}</h2></div><p class="font-mono text-xs md:text-sm text-gray-500 mt-3 md:mt-4">${handle}</p></div></div><div class="flex-1 px-8 lg:px-12 hidden xl:flex items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300"><div class="w-full h-[1px] bg-black/20 relative"><div class="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black" data-styleWidth="${barWidth}%"></div><div class="absolute top-1/2 -translate-y-1/2 w-[3px] h-4 bg-black" data-styleLeft="calc(${barWidth}% - 2px)"></div></div></div><div class="flex items-center justify-between xl:justify-end mt-8 xl:mt-0 xl:ml-auto w-full xl:w-auto pl-2 xl:pl-0"><div class="flex flex-col items-start xl:items-end"><span class="font-mono text-[2.5rem] md:text-[3.5rem] font-bold tracking-tighter tabular-nums leading-none">${score}</span><span class="font-mono text-[10px] md:text-xs uppercase tracking-widest text-gray-500 mt-3">Win Rate <span class="font-bold text-black">${winRate}%</span></span></div><div class="flex items-center justify-end w-16 md:w-24 shrink-0 ml-4 md:ml-8 font-mono text-sm md:text-lg"><span class="${trendClass} flex items-center gap-1.5 font-bold">${trendIcon}${trendText}</span></div></div></div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3["leaderboardV2"] = top3LeaderboardV2;
  window.CASINO_BUILDERS.rows["leaderboardV2"] = rowLeaderboardV2;
})();
