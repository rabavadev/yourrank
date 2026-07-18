// Casino builder for the "highRollers" full-page template.
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const playerHref = (name) => {
    const slug = window.__SLUG__ || "";
    return slug ? `/${encodeURIComponent(slug)}/player/${encodeURIComponent(name)}` : `/player/${encodeURIComponent(name)}`;
  };

  const moneyCompact = (n) => {
    const v = Number(n) || 0;
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (v >= 1e3) return "$" + (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return "$" + v.toLocaleString("en-US");
  };

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

  const gradient = (name) => {
    const h = hash(name);
    return `linear-gradient(135deg, hsl(${h % 360}, 70%, 55%), hsl(${(h * 13) % 360}, 70%, 40%))`;
  };

  const winRate = (pl) => Math.min(100, Math.max(0, Number(pl.winRate) || 0));
  const totalWinnings = (pl) => Number(pl.score) || Number(pl.wagered) || 0;
  const biggestWin = (pl) => Number(pl.prize) || 0;
  const streak = (pl) => Number(pl.hands) || 0;
  const trend = (pl) => {
    const c = Number(pl.change) || 0;
    return c > 0 ? "up" : c < 0 ? "down" : "same";
  };

  const CROWN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>`;

  const FLAME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 0-3 3.5-3 7 0 2.5 1.5 4.5 3 5.5 1.5-1 3-3 3-5.5 0-3.5-3-7-3-7z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-6-3-6-6 0-3-1.5-4.5-1.5-4.5S10 7 10 10c0 3-1.5 6-6 6 0 4.97 4.03 9 9 9z"/></svg>`;

  const TREND_UP = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="18 6 23 6 23 11"/></svg>`;

  const TREND_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="18 18 23 18 23 13"/></svg>`;

  const TREND_SAME = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

  function top3HighRollers(pl, rank) {
    const total = totalWinnings(pl);
    const wr = winRate(pl);
    const inits = initials(pl.name);
    const grad = gradient(pl.name);
    const isFirst = rank === 1;
    const cls = rank === 1 ? "first" : rank === 2 ? "second" : "third";
    const crown = isFirst ? `<div class="hr-podium-crown">${CROWN_ICON}</div>` : "";
    const meta = wr > 0 ? `<div class="hr-podium-meta">Win rate ${wr}%</div>` : "";
    return `<div class="hr-podium-card ${cls}">${crown}<div class="hr-podium-avatar" data-styleBackground="${grad}">${esc(inits)}</div><div class="hr-podium-rank">${rank}</div><div class="hr-podium-name">${esc(pl.name)}</div>${meta}<div class="hr-podium-value hr-display">${moneyCompact(total)}</div><div class="hr-podium-label">Total winnings</div></div>`;
  }

  function rowHighRollers(pl, rank, delay) {
    const total = totalWinnings(pl);
    const big = biggestWin(pl);
    const wr = winRate(pl);
    const st = streak(pl);
    const tr = trend(pl);
    const inits = initials(pl.name);
    const grad = gradient(pl.name);
    const rankClass = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";
    const trendSvg = tr === "up" ? TREND_UP : tr === "down" ? TREND_DOWN : TREND_SAME;
    const trendCls = tr === "up" ? "up" : tr === "down" ? "down" : "same";
    return `<div class="hr-row t-row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
      <div class="hr-td"><span class="hr-rank ${rankClass}">#${rank}</span></div>
      <div class="hr-td">
        <div class="hr-player">
          <div class="hr-avatar" data-styleBackground="${grad}">${esc(inits)}</div>
          <span class="hr-player-name">${esc(pl.name)}</span>
        </div>
      </div>
      <div class="hr-td text-right">
        <div class="hr-win-wrap">
          <div class="hr-win-bar"><div class="hr-win-bar-inner" data-styleWidth="${wr}%"></div></div>
          <span class="hr-win-text">${wr}%</span>
        </div>
      </div>
      <div class="hr-td text-right hr-display hr-gold-text">${moneyCompact(total)}</div>
      <div class="hr-td text-right">${big ? moneyCompact(big) : "—"}</div>
      <div class="hr-td text-right"><span class="hr-streak">${FLAME_ICON}${st || "—"}</span></div>
      <div class="hr-td text-center"><span class="hr-trend ${trendCls}">${trendSvg}</span></div>
    </div>`;
  }

  window.CASINO_BUILDERS = window.CASINO_BUILDERS || { top3: {}, rows: {} };
  window.CASINO_BUILDERS.top3.highRollers = top3HighRollers;
  window.CASINO_BUILDERS.rows.highRollers = rowHighRollers;
})();
