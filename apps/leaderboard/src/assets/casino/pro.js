// Casino builder for pro
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

  function top3Pro(pl, rank) { return ""; }

  function rowPro(pl, rank, delay, gap) {
    const name = linkName(pl.name);
    const score = fmtScore(pl.score || pl.wagered || 0);
    const hands = fmtScore(pl.hands || 0);
    const netProfit = Number(pl.netProfit) || (Number(pl.prize) - Number(pl.wagered)) || 0;
    const winRate = Number(pl.winRate) || 0;
    const change = Number(pl.change) || 0;
    const initials = wordInitials(pl.name);
    const handle = "@" + String(pl.name).toLowerCase().replace(/[\s]+/g, "_").slice(0, 14);
    const rankPad = String(rank).padStart(2, "0");
    const isRank1 = rank === 1;
    const isYou = false;
    const rowClass = isYou ? "bg-[#F59E0B]/5 border-l-2 border-l-[#F59E0B] border-y border-y-[#F59E0B]/10 hover:bg-[#F59E0B]/10 transition-colors" : isRank1 ? "bg-[#1A2E1C] border-l-2 border-l-[#22C55E] border-y border-y-transparent hover:bg-[#1A2E1C]/80 transition-colors" : "border-l-2 border-l-transparent border-y border-y-transparent hover:bg-[#1A2E1C]/40 transition-colors";
    const textColor = isYou ? "text-[#F59E0B]" : "text-[#E5E5E5]";
    const mutedColor = isYou ? "text-[#F59E0B]/70" : "text-[#6B7280]";
    const winRateColor = winRate > 55 ? "#22C55E" : winRate >= 45 ? "#F59E0B" : "#EF4444";
    const netProfitClass = isYou ? "text-[#F59E0B]" : (netProfit >= 0 ? "text-[#22C55E]" : "text-[#EF4444]");
    const netProfitStr = (netProfit >= 0 ? "+" : "-") + "$" + Math.abs(netProfit).toLocaleString();
    const changeClass = isYou ? (change > 0 ? "text-[#F59E0B]" : change < 0 ? "text-[#EF4444]" : mutedColor) : (change > 0 ? "text-[#22C55E]" : change < 0 ? "text-[#EF4444]" : mutedColor);
    const changeStr = change > 0 ? "+" + change : (change < 0 ? String(change) : "—");
    const rankClass = isYou ? "text-[#F59E0B]" : "text-[#22C55E]";
    const initialsBorderClass = isYou ? "border-[#F59E0B] text-[#F59E0B]" : "border-[#22C55E]/50 text-[#22C55E]";
    return `<tr class="${rowClass}">
      <td class="py-3 px-4 ${rankClass}">${rankPad}</td>
      <td class="py-3 px-4 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full border flex items-center justify-center text-xs ${initialsBorderClass}">${initials}</div>
        <div class="flex flex-col">
          <span class="${textColor} leading-tight">${name}</span>
          <span class="${mutedColor} text-[10px] leading-tight">${handle}</span>
        </div>
      </td>
      <td class="py-3 px-4 text-right ${textColor}">${hands}</td>
      <td class="py-3 px-4">
        <div class="flex items-center gap-3 w-full">
          <span class="${textColor} w-10 text-right">${winRate.toFixed(1)}%</span>
          <div class="h-[2px] bg-[#0D1A0F] border border-[#22C55E]/10 w-24 flex-1 relative overflow-hidden">
            <div class="absolute top-0 left-0 h-full opacity-80" data-styleWidth="${winRate}%" data-styleBackgroundColor="${winRateColor}"></div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-right ${netProfitClass}">${netProfitStr}</td>
      <td class="py-3 px-4 text-right font-bold text-base tracking-tight ${textColor}">${score}</td>
      <td class="py-3 px-4 text-right"><span class="${changeClass}">${changeStr}</span></td>
    </tr>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3["pro"] = top3Pro;
  window.CASINO_BUILDERS.rows["pro"] = rowPro;
})();
