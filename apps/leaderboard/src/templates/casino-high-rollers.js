// High Rollers full-page casino template.
// Hero + stats cards + podium + full leaderboard table.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const moneyCompact = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return "$" + v.toLocaleString("en-US");
};

const TROPHY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/><circle cx="12" cy="13" r="2"/></svg>`;

const FLAME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 0-3 3.5-3 7 0 2.5 1.5 4.5 3 5.5 1.5-1 3-3 3-5.5 0-3.5-3-7-3-7z"/><path d="M12 22c4.97 0 9-4.03 9-9-4.5 0-6-3-6-6 0-3-1.5-4.5-1.5-4.5S10 7 10 10c0 3-1.5 6-6 6 0 4.97 4.03 9 9 9z"/></svg>`;

const TRENDING_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="18 6 23 6 23 11"/></svg>`;

const DOLLAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 8.5A4.5 4.5 0 0 0 12 4h-1.5A4.5 4.5 0 0 0 6 8.5c0 2.5 2 3.5 4.5 4.5H12c2.5 1 4.5 2 4.5 4.5 0 2.5-2 4.5-4.5 4.5H12"/></svg>`;

const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>`;

export const HIGH_ROLLERS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Bebas+Neue&display=swap');

body[data-template="highRollers"] {
  --hr-bg: #080b14;
  --hr-hero: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12), transparent 50%), linear-gradient(180deg, #0a1020 0%, #070b14 100%);
  --hr-card: rgba(18,25,44,0.55);
  --hr-border: rgba(255,255,255,0.08);
  --hr-gold: #c9a84c;
  --hr-gold-soft: #a68b3f;
  --hr-gold-text: #c9a84c;
  --hr-purple: #8b5cf6;
  --hr-emerald: #34d399;
  --hr-slate: #cbd5e1;
  --hr-bronze: #d97706;
  --hr-text: #f0f0f5;
  --hr-muted: rgba(240,240,245,0.65);
  --hr-danger: #ef4444;
  background: var(--hr-bg);
  color: var(--hr-text);
  font-family: 'Barlow', system-ui, -apple-system, sans-serif;
}
body[data-template="highRollers"] .hr-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; margin: 0; }
body[data-template="highRollers"] main#top { width: 100%; }
body[data-template="highRollers"] .hr-page { width: 100%; overflow-x: hidden; }
body[data-template="highRollers"] .hr-hero { background: var(--hr-hero); position: relative; padding: 2.5rem 1rem 4rem; }
body[data-template="highRollers"] .hr-hero::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; opacity: .3; }
body[data-template="highRollers"] .hr-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
body[data-template="highRollers"] .hr-header { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2.5rem; }
@media (min-width: 768px) { body[data-template="highRollers"] .hr-header { flex-direction: row; justify-content: space-between; align-items: center; } }
body[data-template="highRollers"] .hr-brand { display: flex; align-items: center; gap: 0.75rem; }
body[data-template="highRollers"] .hr-brand-icon { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, var(--hr-gold), var(--hr-gold-soft)); display: flex; align-items: center; justify-content: center; color: var(--hr-bg); box-shadow: 0 0 18px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-brand-icon svg { width: 22px; height: 22px; }
body[data-template="highRollers"] .hr-brand-title { line-height: 1; font-size: 1.75rem; }
body[data-template="highRollers"] .hr-brand-sub { color: var(--hr-muted); font-size: 0.875rem; margin-top: 0.2rem; }
body[data-template="highRollers"] .hr-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
body[data-template="highRollers"] .hr-tab { background: transparent; border: 1px solid var(--hr-border); color: var(--hr-muted); border-radius: 8px; padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 500; font-family: inherit; cursor: default; }
body[data-template="highRollers"] .hr-tab.is-active { background: var(--hr-gold); color: #0a0f1a; border-color: var(--hr-gold); box-shadow: 0 0 14px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-hero-title { text-align: center; margin-bottom: 0.75rem; font-size: clamp(2.8rem, 7vw, 5.5rem); line-height: 1; }
body[data-template="highRollers"] .hr-hero-title span { color: var(--hr-gold); text-shadow: 0 0 24px rgba(201,168,76,0.35); }
body[data-template="highRollers"] .hr-hero-sub { text-align: center; color: var(--hr-muted); max-width: 600px; margin: 0 auto 2.5rem; font-size: 1rem; line-height: 1.5; }
body[data-template="highRollers"] .hr-stats { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 3rem; }
body[data-template="highRollers"] .hr-stat-card { background: var(--hr-card); border: 1px solid var(--hr-border); border-radius: 1rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; backdrop-filter: blur(10px); }
body[data-template="highRollers"] .hr-stat-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
body[data-template="highRollers"] .hr-stat-icon.gold { color: var(--hr-gold); background: rgba(201,168,76,0.12); }
body[data-template="highRollers"] .hr-stat-icon.purple { color: var(--hr-purple); background: rgba(139,92,246,0.12); }
body[data-template="highRollers"] .hr-stat-icon.green { color: var(--hr-emerald); background: rgba(52,211,153,0.12); }
body[data-template="highRollers"] .hr-stat-icon svg { width: 22px; height: 22px; }
body[data-template="highRollers"] .hr-stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--hr-muted); margin-bottom: 0.25rem; }
body[data-template="highRollers"] .hr-stat-value { font-size: 1.5rem; color: var(--hr-text); }
body[data-template="highRollers"] .hr-stat-value.gold { color: var(--hr-gold); text-shadow: 0 0 14px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-stat-value.purple { color: var(--hr-purple); text-shadow: 0 0 14px rgba(139,92,246,0.25); }
body[data-template="highRollers"] .hr-stat-value.green { color: var(--hr-emerald); text-shadow: 0 0 14px rgba(52,211,153,0.2); }
body[data-template="highRollers"] .hr-podium { display: grid; gap: 1rem; grid-template-columns: 1fr; align-items: end; margin-bottom: 0; }
@media (min-width: 640px) { body[data-template="highRollers"] .hr-podium { grid-template-columns: 1fr 1.15fr 1fr; } }
body[data-template="highRollers"] .hr-podium:has(> .hr-podium-card:only-child) { grid-template-columns: 1fr; place-items: center; }
body[data-template="highRollers"] .hr-podium:has(> .hr-podium-card:only-child) .hr-podium-card { max-width: 320px; width: 100%; }
body[data-template="highRollers"] .hr-podium-card { background: var(--hr-card); border: 1px solid var(--hr-border); border-radius: 1.25rem; padding: 1.5rem; text-align: center; display: flex; flex-direction: column; align-items: center; position: relative; transition: transform 0.3s; min-height: 260px; }
body[data-template="highRollers"] .hr-podium-card:hover { transform: translateY(-4px); }
body[data-template="highRollers"] .hr-podium-card.first { order: 2; border-color: rgba(201,168,76,0.45); box-shadow: 0 24px 48px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(201,168,76,0.15); }
body[data-template="highRollers"] .hr-podium-card.second { order: 1; }
body[data-template="highRollers"] .hr-podium-card.third { order: 3; }
@media (max-width: 639px) { body[data-template="highRollers"] .hr-podium-card.first { order: 1; } body[data-template="highRollers"] .hr-podium-card.second { order: 2; } body[data-template="highRollers"] .hr-podium-card.third { order: 3; } }
body[data-template="highRollers"] .hr-podium-crown { position: absolute; top: -1.1rem; left: 50%; transform: translateX(-50%); color: var(--hr-gold); filter: drop-shadow(0 0 10px rgba(201,168,76,0.6)); }
body[data-template="highRollers"] .hr-podium-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; color: #fff; margin-bottom: 1rem; border: 3px solid transparent; }
body[data-template="highRollers"] .hr-podium-card.first .hr-podium-avatar { width: 96px; height: 96px; font-size: 1.8rem; border-color: var(--hr-gold); box-shadow: 0 0 24px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-podium-card.second .hr-podium-avatar { border-color: var(--hr-slate); }
body[data-template="highRollers"] .hr-podium-card.third .hr-podium-avatar { border-color: var(--hr-bronze); }
body[data-template="highRollers"] .hr-podium-rank { position: absolute; bottom: -0.75rem; left: 50%; transform: translateX(-50%); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: var(--hr-bg); border: 2px solid var(--hr-bg); }
body[data-template="highRollers"] .hr-podium-card.first .hr-podium-rank { background: var(--hr-gold); }
body[data-template="highRollers"] .hr-podium-card.second .hr-podium-rank { background: var(--hr-slate); }
body[data-template="highRollers"] .hr-podium-card.third .hr-podium-rank { background: var(--hr-bronze); }
body[data-template="highRollers"] .hr-podium-name { font-size: 1.15rem; font-weight: 600; margin-bottom: 0.15rem; color: var(--hr-text); }
body[data-template="highRollers"] .hr-podium-meta { color: var(--hr-muted); font-size: 0.8rem; margin-bottom: 0.75rem; }
body[data-template="highRollers"] .hr-podium-value { font-size: 1.75rem; color: var(--hr-gold); text-shadow: 0 0 14px rgba(201,168,76,0.25); margin-top: auto; }
body[data-template="highRollers"] .hr-podium-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--hr-muted); }
body[data-template="highRollers"] .hr-board { padding: 3rem 1rem 4rem; }
body[data-template="highRollers"] .hr-board-inner { max-width: 1100px; margin: 0 auto; }
body[data-template="highRollers"] .hr-board-head { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem; }
@media (min-width: 640px) { body[data-template="highRollers"] .hr-board-head { flex-direction: row; justify-content: space-between; align-items: center; } }
body[data-template="highRollers"] .hr-board-title { font-size: 1.75rem; margin: 0; }
body[data-template="highRollers"] .hr-search { position: relative; width: 100%; max-width: 280px; }
body[data-template="highRollers"] .hr-search svg { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--hr-muted); pointer-events: none; }
body[data-template="highRollers"] .hr-search input { width: 100%; height: 40px; border-radius: 999px; border: 1px solid var(--hr-border); background: var(--hr-card); padding: 0 1rem 0 2.25rem; color: var(--hr-text); font-size: 0.9rem; outline: none; font-family: inherit; }
body[data-template="highRollers"] .hr-search input::placeholder { color: var(--hr-muted); }
body[data-template="highRollers"] .hr-search input:focus { border-color: var(--hr-gold); box-shadow: 0 0 0 1px var(--hr-gold); }
body[data-template="highRollers"] .hr-table-wrap { background: var(--hr-card); border: 1px solid var(--hr-border); border-radius: 1.25rem; overflow: hidden; backdrop-filter: blur(10px); }
body[data-template="highRollers"] .hr-scroll { overflow-x: auto; }
body[data-template="highRollers"] .hr-table { min-width: 760px; width: 100%; }
body[data-template="highRollers"] .hr-thead { display: grid; grid-template-columns: 70px 1.5fr 120px 150px 150px 90px 90px; padding: 0 1.5rem; border-bottom: 1px solid var(--hr-border); background: rgba(0,0,0,0.15); }
body[data-template="highRollers"] .hr-th { padding: 1rem 0.75rem; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--hr-muted); font-weight: 600; text-align: left; }
body[data-template="highRollers"] .hr-th.text-right { text-align: right; }
body[data-template="highRollers"] .hr-th.text-center { text-align: center; }
body[data-template="highRollers"] .hr-tbody { display: block; }
body[data-template="highRollers"] .hr-row { display: grid; grid-template-columns: 70px 1.5fr 120px 150px 150px 90px 90px; padding: 0 1.5rem; border-bottom: 1px solid var(--hr-border); align-items: center; transition: background 0.2s; }
body[data-template="highRollers"] .hr-row:last-child { border-bottom: none; }
body[data-template="highRollers"] .hr-row:hover { background: rgba(255,255,255,0.03); }
body[data-template="highRollers"] .hr-row.top { background: rgba(201,168,76,0.04); }
body[data-template="highRollers"] .hr-td { padding: 0.9rem 0.75rem; font-size: 0.95rem; color: var(--hr-text); }
body[data-template="highRollers"] .hr-td.text-right { text-align: right; }
body[data-template="highRollers"] .hr-td.text-center { text-align: center; }
body[data-template="highRollers"] .hr-rank { font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem; }
body[data-template="highRollers"] .hr-rank.gold { color: var(--hr-gold); text-shadow: 0 0 12px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-rank.silver { color: var(--hr-slate); }
body[data-template="highRollers"] .hr-rank.bronze { color: var(--hr-bronze); }
body[data-template="highRollers"] .hr-player { display: flex; align-items: center; gap: 0.75rem; }
body[data-template="highRollers"] .hr-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0; border: 2px solid rgba(255,255,255,0.1); }
body[data-template="highRollers"] .hr-player-name { font-weight: 500; }
body[data-template="highRollers"] .hr-win-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 0.5rem; }
body[data-template="highRollers"] .hr-win-bar { width: 64px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
body[data-template="highRollers"] .hr-win-bar-inner { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--hr-gold), var(--hr-gold-soft)); width: 0; }
body[data-template="highRollers"] .hr-win-text { font-size: 0.85rem; color: var(--hr-muted); }
body[data-template="highRollers"] .hr-streak { display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(255,255,255,0.05); padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.85rem; }
body[data-template="highRollers"] .hr-streak svg { width: 14px; height: 14px; color: var(--hr-gold); }
body[data-template="highRollers"] .hr-trend { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; }
body[data-template="highRollers"] .hr-trend.up { color: var(--hr-emerald); background: rgba(52,211,153,0.1); }
body[data-template="highRollers"] .hr-trend.down { color: var(--hr-danger); background: rgba(239,68,68,0.1); }
body[data-template="highRollers"] .hr-trend.same { color: var(--hr-muted); background: rgba(255,255,255,0.05); }
body[data-template="highRollers"] .hr-gold-text { color: var(--hr-gold); text-shadow: 0 0 14px rgba(201,168,76,0.25); }
body[data-template="highRollers"] .hr-empty { padding: 3rem; text-align: center; color: var(--hr-muted); }
body[data-template="highRollers"] .hr-empty[hidden] { display: none; }
body[data-template="highRollers"] .skip-link { position: absolute; top: 0; left: 0; transform: translateY(-120%); transition: transform .2s ease; background: var(--hr-gold); color: #080b14; }
body[data-template="highRollers"] .skip-link:focus { transform: translateY(0); }
body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-row { grid-template-columns: 70px 1.5fr 150px 150px 90px 90px; }
body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-row { grid-template-columns: 70px 1.5fr 120px 150px 150px 90px; }
body[data-template="highRollers"] .hr-table[data-has-winrate="false"][data-has-streak="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-winrate="false"][data-has-streak="false"] .hr-row { grid-template-columns: 70px 1.5fr 150px 150px 90px; }
body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-thead .hr-th:nth-child(3), body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-row .hr-td:nth-child(3) { display: none; }
body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-thead .hr-th:nth-child(6), body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-row .hr-td:nth-child(6) { display: none; }
@media (max-width: 900px) {
body[data-template="highRollers"] .hr-thead, body[data-template="highRollers"] .hr-row { grid-template-columns: 60px 1.5fr 100px 120px 120px 70px 70px; }
body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-winrate="false"] .hr-row { grid-template-columns: 60px 1.5fr 120px 120px 70px 70px; }
body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-streak="false"] .hr-row { grid-template-columns: 60px 1.5fr 100px 120px 120px 70px; }
body[data-template="highRollers"] .hr-table[data-has-winrate="false"][data-has-streak="false"] .hr-thead, body[data-template="highRollers"] .hr-table[data-has-winrate="false"][data-has-streak="false"] .hr-row { grid-template-columns: 60px 1.5fr 120px 120px 70px; }
}
`;

export function composeHighRollers(p) {
  const period = esc(p.period || "Monthly");
  const periodActive = period === "Monthly" ? "This Month" : period === "Weekly" ? "This Week" : period === "Daily" ? "Today" : period;
  const periods = ["Today", "This Week", "This Month", "All Time"];
  const poolRaw = String(p.pool || "").trim();
  const poolNum = Number(poolRaw.replace(/[^0-9.]/g, "")) || 0;
  const poolDisplay = poolNum ? moneyCompact(poolNum) : (poolRaw ? esc(poolRaw) : "—");
  const players = (p.players || []).slice().sort((a, b) => (Number(b.score || b.wagered) || 0) - (Number(a.score || a.wagered) || 0));
  const active = players.length;
  const hotStreak = active ? Math.max(...players.map((x) => Number(x.hands) || 0)) : 0;
  const hasStreak = active && players.some((x) => (Number(x.hands) || 0) > 0);
  const hasWinRate = active && players.some((x) => (Number(x.winRate) || 0) > 0);
  const hotDisplay = hasStreak ? `${hotStreak} Wins` : "—";
  const biggest = active ? Math.max(...players.map((x) => Number(x.prize) || 0)) : 0;
  const biggestDisplay = biggest ? moneyCompact(biggest) : "—";
  const statLabel = hasStreak ? "Hot Streak" : "Biggest Win";
  const statValue = hasStreak ? hotDisplay : biggestDisplay;

  const tabs = periods.map((t) => `<button type="button" class="hr-tab ${t === periodActive ? "is-active" : ""}">${esc(t)}</button>`).join("");

  return `<div class="hr-page">
<section class="hr-hero">
  <div class="hr-inner">
    <div class="hr-header">
      <div class="hr-brand">
        <div class="hr-brand-icon">${TROPHY_ICON}</div>
        <div>
          <div class="hr-display hr-brand-title">HIGH ROLLERS</div>
          <div class="hr-brand-sub">Casino Leaderboard</div>
        </div>
      </div>
      <div class="hr-tabs">${tabs}</div>
    </div>
    <h1 class="hr-display hr-hero-title">THE <span>ULTIMATE</span> RANKING</h1>
    <p class="hr-hero-sub">Real-time rankings of the biggest winners, hottest streaks, and most consistent players across the casino floor.</p>
    <div class="hr-stats">
      <div class="hr-stat-card">
        <div class="hr-stat-icon gold">${DOLLAR_ICON}</div>
        <div><div class="hr-stat-label">Prize Pool</div><div class="hr-stat-value hr-display gold">${poolDisplay}</div></div>
      </div>
      <div class="hr-stat-card">
        <div class="hr-stat-icon purple">${FLAME_ICON}</div>
        <div><div class="hr-stat-label">${esc(statLabel)}</div><div class="hr-stat-value hr-display purple">${esc(statValue)}</div></div>
      </div>
      <div class="hr-stat-card">
        <div class="hr-stat-icon green">${TRENDING_ICON}</div>
        <div><div class="hr-stat-label">Active Players</div><div class="hr-stat-value hr-display green">${active.toLocaleString("en-US")}</div></div>
      </div>
    </div>
    <div class="hr-podium" data-top3 data-hide-prizes="false"></div>
  </div>
</section>
<section class="hr-board" id="board">
  <div class="hr-board-inner">
    <div class="hr-board-head">
      <h2 class="hr-display hr-board-title">FULL LEADERBOARD</h2>
      <div class="hr-search">${SEARCH_ICON}<input type="text" placeholder="Search player..." data-find-rank aria-label="Search for your rank" /></div>
    </div>
    <div class="hr-table-wrap">
      <div class="hr-scroll">
        <div class="hr-table" role="table" aria-label="Leaderboard standings" data-has-winrate="${hasWinRate}" data-has-streak="${hasStreak}">
          <div class="hr-thead" role="row">
            <div class="hr-th" role="columnheader">Rank</div>
            <div class="hr-th" role="columnheader">Player</div>
            <div class="hr-th text-right" role="columnheader">Win Rate</div>
            <div class="hr-th text-right" role="columnheader">Total Winnings</div>
            <div class="hr-th text-right" role="columnheader">Biggest Win</div>
            <div class="hr-th text-right" role="columnheader">Streak</div>
            <div class="hr-th text-center" role="columnheader">Trend</div>
          </div>
          <div class="hr-tbody" data-rows></div>
        </div>
      </div>
    </div>
    <div class="hr-empty" data-empty hidden>No players found.</div>
  </div>
</section>
</div>`;
}
