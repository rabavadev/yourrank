/* RankUp public leaderboard — hydrates from window.__SITE_DATA__ (SSR-injected). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const initials = (name) => { const c = String(name).replace(/\*/g, "").trim(); return c.length >= 2 ? c.slice(0, 2).toUpperCase() : (c ? c.toUpperCase() : "★"); };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Safe href: only allow http(s)/mailto/tel. Anything else (javascript:, data:,
// vbscript:, etc.) collapses to "#". esc() handles attribute-breakout chars.
const safeUrl = (u) => { const s = String(u ?? "").trim(); return s && /^(https?:|mailto:|tel:)/i.test(s) ? esc(s) : "#"; };
const ord = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

const SOCIAL_ICONS = {
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5c1.7.4 2.9 1 4 1.7a13.5 13.5 0 0 0-11.4 0c1.1-.7 2.5-1.4 4.1-1.7L11.6 3A19.8 19.8 0 0 0 6.7 4.4C3.6 9 2.8 13.5 3.2 17.9a19.9 19.9 0 0 0 6 3l.8-1.3c-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l.8 1.3a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.5ZM9.5 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm5 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>',
  kick: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h5v5h2V6h2V4h2V3h4v6h-2v2h-2v2h2v2h2v6h-4v-1h-2v-2h-2v-2H8v5H3V3Z"/></svg>',
  twitch: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2 3 6v13h4v3h3l3-3h4l5-5V2H4Zm16 10-3 3h-4l-3 3v-3H7V4h13v8Zm-3-6h-2v5h2V6Zm-5 0h-2v5h2V6Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L1.9 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.9H5.2L17.7 20Z"/></svg>',
};

function boot() {
  const data = window.__SITE_DATA__ || {};
  const b = data.brand || {};
  $$("[data-brand-name]").forEach((el) => (el.textContent = b.name || ""));
  $$("[data-code]").forEach((el) => (el.textContent = b.code || ""));
  $$("[data-casino]").forEach((el) => (el.textContent = b.casino || "Stake"));
  $$("[data-pool]").forEach((el) => (el.textContent = b.prizePool || ""));
  $$("[data-period]").forEach((el) => (el.textContent = b.period || "Monthly"));
  const tg = $("[data-tagline]"); if (tg) tg.textContent = b.tagline || "";
  const yr = $("[data-year]"); if (yr) yr.textContent = new Date().getFullYear();
  // SSR already points [data-cta] at the tracked /go/<slug> redirect; only fall back to the raw URL when no slug is set.
  $$("[data-cta]").forEach((el) => { if (b.ctaUrl && !window.__SLUG__) el.href = b.ctaUrl; });

  const wm = $("[data-watermarks]");
  if (wm) { let h = ""; for (let i = 0; i < 14; i++) { const t = Math.random()*100, l = Math.random()*100, s = 20+Math.random()*60, r = -20+Math.random()*40; h += `<span style="top:${t}%;left:${l}%;font-size:${s}px;transform:rotate(${r}deg)">${esc(b.name || "")}</span>`; } wm.innerHTML = h; }

  const cc = $("[data-copy-code]");
  if (cc) cc.addEventListener("click", async () => { try { await navigator.clipboard.writeText(b.code || ""); cc.classList.add("copied"); const p = cc.textContent; cc.textContent = "Copied!"; setTimeout(() => { cc.classList.remove("copied"); cc.textContent = p; }, 1300); } catch (_) {}
    try { if (window.__SLUG__) navigator.sendBeacon("/api/track/copy", new Blob([JSON.stringify({ slug: window.__SLUG__ })], { type: "application/json" })); } catch (_) {} });

  const p = data.partner || {};
  const blurb = $("[data-partner-blurb]"); if (blurb) blurb.textContent = p.blurb || "";
  const chips = $("[data-chips]"); if (chips && Array.isArray(p.chips)) chips.innerHTML = p.chips.map((c) => `<li>${esc(c)}</li>`).join("");

  const why = $("[data-why]");
  if (why && Array.isArray(data.whyStats)) why.innerHTML = data.whyStats.map((s) => `<div class="why"><span class="why-big">${esc(s.big)}</span><span class="why-label">${esc(s.label)}</span>${s.sub ? `<span class="why-sub">${esc(s.sub)}</span>` : ""}</div>`).join("");

  const players = (data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
  const cnt = $("[data-count]"); if (cnt) cnt.textContent = players.length;

  const t3 = $("[data-top3]");
  if (t3 && players.length >= 3) t3.innerHTML = players.slice(0, 3).map((pl, i) => { const r = i + 1; return `<div class="t3 t3--${r}"><span class="t3-medal">RANK ${String(r).padStart(2,"0")}</span><div class="t3-name">${esc(pl.name)}</div><div class="t3-wager">${money(pl.wagered)}</div><span class="t3-prize">${pl.prize ? moneyShort(pl.prize) : "—"}</span></div>`; }).join("");

  const rows = $("[data-rows]");
  if (rows) rows.innerHTML = players.map((pl, i) => { const r = i + 1; const prize = pl.prize ? `<span class="tr-prize has ta-r">${moneyShort(pl.prize)}</span>` : `<span class="tr-prize no ta-r">—</span>`; return `<li class="t-row" style="animation-delay:${Math.min(i*0.025,0.5)}s"><span class="tr-rank">${String(r).padStart(2,"0")}</span><span class="tr-player"><span class="tr-av">${esc(initials(pl.name))}</span><span class="tr-name">${esc(pl.name)}</span></span><span class="tr-wager">${money(pl.wagered)}</span>${prize}</li>`; }).join("");

  const rl = $("[data-rules]"); if (rl && Array.isArray(data.rules)) rl.innerHTML = data.rules.map((r) => `<li>${esc(r)}</li>`).join("");

  // Prize breakdown — derived from the players' prize column, equal prizes grouped into rank ranges.
  const po = $("[data-payouts]");
  if (po) {
    const winners = players.map((pl, idx) => ({ rank: idx + 1, prize: pl.prize })).filter((w) => w.prize > 0);
    if (winners.length) {
      const groups = [];
      winners.forEach((w) => {
        const last = groups[groups.length - 1];
        if (last && last.prize === w.prize && last.to === w.rank - 1) last.to = w.rank;
        else groups.push({ from: w.rank, to: w.rank, prize: w.prize });
      });
      po.innerHTML = `<span class="pay-label">Payouts</span>` + groups.map((g) =>
        `<span class="pay"><b>${g.from === g.to ? ord(g.from) : `${ord(g.from)}–${ord(g.to)}`}</b>${moneyShort(g.prize)}</span>`).join("");
      po.hidden = false;
    }
  }

  // Past winners — closed-out periods, newest first.
  const pw = Array.isArray(data.pastWinners) ? data.pastWinners : [];
  const pastSec = $("[data-past]"), pastGrid = $("[data-past-grid]");
  if (pastSec && pastGrid && pw.length) {
    const medals = ["gold", "silver", "bronze"];
    pastGrid.innerHTML = pw.map((a) => `<div class="past-card"><div class="past-label">${esc(a.label)}</div><ol class="past-list">${
      (a.top || []).map((p, i) => `<li class="past-row"><span class="past-rank ${medals[i] || ""}">${i + 1}</span><span class="past-name">${esc(p.name)}</span><span class="past-val">${p.prize ? moneyShort(p.prize) : money(p.wagered)}</span></li>`).join("")
    }</ol></div>`).join("");
    pastSec.hidden = false;
  }

  const sc = $("[data-socials]");
  if (sc && Array.isArray(data.socials)) sc.innerHTML = data.socials.map((s) => { const brand = (s.brand || s.name || "").toLowerCase(); const ico = SOCIAL_ICONS[brand] || SOCIAL_ICONS.discord; return `<div class="scard"><div class="scard-ico ${esc(brand)}">${ico}</div><div class="scard-name">${esc(s.name)}</div><div class="scard-handle">${esc(s.handle || "")}</div><a class="btn btn--grad" href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.action || "Follow")}</a></div>`; }).join("");

  startCountdown(data.endsAt);
}

function startCountdown(endsAt) {
  const el = $("[data-countdown]");
  const grid = $("[data-timer-grid]");
  const cell = (k) => (grid ? grid.querySelector(`[data-t="${k}"]`) : null);
  const cells = grid ? { d: cell("d"), h: cell("h"), m: cell("m"), s: cell("s") } : null;
  if (!el && !cells) return;
  const target = endsAt ? new Date(endsAt).getTime() : nextMonthUTC();
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) { if (el) el.textContent = "Resetting"; if (cells) Object.values(cells).forEach((c) => c && (c.textContent = "00")); return; }
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    if (el) el.textContent = `${d}d ${pad(h)}h ${pad(m)}m`;
    if (cells) { cells.d && (cells.d.textContent = pad(d)); cells.h && (cells.h.textContent = pad(h)); cells.m && (cells.m.textContent = pad(m)); cells.s && (cells.s.textContent = pad(s)); }
  };
  tick(); setInterval(tick, 1000);
}
function nextMonthUTC() { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1); }
document.addEventListener("DOMContentLoaded", boot);
