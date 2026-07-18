// Casino builder for vip
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

  function top3Vip(pl, rank) { return ""; }

  function rowVip(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const score = moneyShort(pl.wagered);
    const rankStr = String(rank).padStart(2, '0');
    const arrowUp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up w-3 h-3 text-[#C9A84C]" aria-hidden="true"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>`;
    const arrowDown = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down w-3 h-3" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>`;
    const arrowSame = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus w-3 h-3 opacity-30" aria-hidden="true"><path d="M5 12h14" /></svg>`;
    const icon = (hash(pl.name) % 3 === 0) ? arrowUp : (hash(pl.name) % 3 === 1) ? arrowDown : arrowSame;
    const initials = wordInitials(pl.name);
    const max = maxWagered();
    const winRate = max ? ('WR: ' + ((pl.wagered / max) * 100).toFixed(1) + '%') : 'WR: 0.0%';
    const handle = '@' + pl.name.toLowerCase().replace(/[\s_]+/g, '_').slice(0, 14);
    return `<div class="flex items-center w-full py-6 px-4 md:px-8 border-b border-[#C9A84C]/20 hover:bg-[#0f0f0f] transition-colors border-l-[1px] border-l-transparent"><div class="w-12 text-[#C9A84C]/60 text-sm [font-family:'Space_Mono',_monospace]">${rankStr}</div><div class="mr-6 shrink-0"><div class="w-8 h-8 rounded-full border border-[#C9A84C] flex items-center justify-center bg-[#0A0A0A]"><span class="text-[#C9A84C] text-[10px] [font-family:'Space_Mono',_monospace]">${initials}</span></div></div><div class="flex-1 flex flex-col justify-center min-w-0"><h2 class="text-[#F5F5F0] truncate text-2xl [font-family:'Cormorant_Garamond',_serif] [font-style:italic]">${name}</h2><p class="text-[#C9A84C]/50 text-[10px] tracking-wider mt-1 [font-family:'Space_Mono',_monospace]">${handle}</p></div><div class="flex flex-col items-end shrink-0 ml-4"><div class="text-[#C9A84C] text-xl [font-family:'Space_Mono',_monospace]">${score}</div><div class="flex items-center gap-4 mt-1"><span class="text-[#F5F5F0]/40 text-[10px] tracking-wider [font-family:'Space_Mono',_monospace]">${winRate}</span><div class="w-4 flex justify-end text-[#C9A84C]/50">${icon}</div></div></div></div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3["vip"] = top3Vip;
  window.CASINO_BUILDERS.rows["vip"] = rowVip;
})();
