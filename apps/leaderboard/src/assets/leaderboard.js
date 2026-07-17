/* YourRank public leaderboard — hydrates from window.__SITE_DATA__ (SSR-injected).
   Features: live polling every 30s, rank-change flash, particle field, countdown polish. */
const TOAST_DURATION_MS = 1300;
const POLL_INTERVAL_MS = 30000;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = (n) => "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const initials = (name) => { const c = String(name).replace(/\*/g, "").trim(); return c.length >= 2 ? c.slice(0, 2).toUpperCase() : (c ? c.toUpperCase() : "★"); };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Safe href: only allow http(s)/mailto/tel. Anything else (javascript:, data:,
// vbscript:, etc.) collapses to "#". esc() handles attribute-breakout chars.
const safeUrl = (u) => { const s = String(u ?? "").trim(); return s && /^(https?:|mailto:|tel:)/i.test(s) ? esc(encodeURI(s)) : "#"; };
const ord = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const playerHref = (name) => { const slug = window.__SLUG__ || ""; return slug ? `/${encodeURIComponent(slug)}/player/${encodeURIComponent(name)}` : `/player/${encodeURIComponent(name)}`; };

const SOCIAL_ICONS = {
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.3.5c1.7.4 2.9 1 4 1.7a13.5 13.5 0 0 0-11.4 0c1.1-.7 2.5-1.4 4.1-1.7L11.6 3A19.8 19.8 0 0 0 6.7 4.4C3.6 9 2.8 13.5 3.2 17.9a19.9 19.9 0 0 0 6 3l.8-1.3c-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12.2 0l.5.4c-.6.4-1.3.7-2 1l.8 1.3a19.8 19.8 0 0 0 6-3c.5-5.1-.8-9.6-3.6-13.5ZM9.5 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm5 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z"/></svg>',
  kick: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h5v5h2V6h2V4h2V3h4v6h-2v2h-2v2h2v2h2v6h-4v-1h-2v-2h-2v-2H8v5H3V3Z"/></svg>',
  twitch: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2 3 6v13h4v3h3l3-3h4l5-5V2H4Zm16 10-3 3h-4l-3 3v-3H7V4h13v8Zm-3-6h-2v5h2V6Zm-5 0h-2v5h2V6Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2h3.3l-7.2 8.3L23.5 22h-6.6l-5.2-6.8L5.7 22H2.4l7.7-8.8L1.9 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.9H5.2L17.7 20Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.8-11.2a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9L18 6.1c.4-.3-.1-.5-.6-.2L6.6 12.7l-4.7-1.5c-1-.3-1-.9.2-1.4L20.6 3c.9-.3 1.6.2 1.3 1.3Z"/></svg>',
};

// ---- Particle field (subtle hero background animation) ----
function initParticles() {
  const container = $(".hero");
  if (!container) return;
  // Respect reduced-motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "particle-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let w, h;
  const particles = [];
  const PARTICLE_COUNT = 40;

  function resize() {
    w = canvas.width = container.offsetWidth;
    h = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1.5 + Math.random() * 2,
      alpha: 0.15 + Math.random() * 0.25,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(120, 100, 255, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(140, 120, 255, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

// ---- Live polling ----
let previousPlayerNames = []; // tracks ordered names from last render for rank-change detection

function buildPlayerRow(pl, rank, delay, gap) {
    const prize = pl.prize ? `<span class="tr-prize has ta-r" role="cell">${moneyShort(pl.prize)}</span>` : `<span class="tr-prize no ta-r" role="cell">—</span>`;
    const gapHtml = rank === 1 ? "" : (gap === 0
      ? `<span class="tr-gap" aria-hidden="true">↑ tied</span>`
      : `<span class="tr-gap" aria-hidden="true">↑ ${moneyShort(gap)} to next</span>`);
    return `<div class="t-row" role="row" data-position="${rank}" data-name="${esc(pl.name)}" data-wagered="${Number(pl.wagered) || 0}" data-delay="${delay}">
      <span class="tr-rank" role="cell">${String(rank).padStart(2, "0")}</span>
      <span class="tr-player" role="cell"><span class="tr-av" aria-hidden="true">${esc(initials(pl.name))}</span><a class="tr-name" href="${playerHref(pl.name)}">${esc(pl.name)}</a></span>
      <span class="tr-wager" role="cell"><span class="w-lg">${money(pl.wagered)}</span><span class="w-sm">${moneyShort(pl.wagered)}</span></span>${prize}${gapHtml}<span class="tr-bar" aria-hidden="true"><i></i></span></div>`;
  }

function buildTop3Card(pl, rank) {
  return `<div class="t3 t3--${rank}"><span class="t3-medal">RANK ${String(rank).padStart(2, "0")}</span><span class="t3-av" aria-hidden="true">${esc(initials(pl.name))}</span><a class="t3-name" href="${playerHref(pl.name)}">${esc(pl.name)}</a><div class="t3-wager">${money(pl.wagered)}</div><span class="t3-prize">${pl.prize ? moneyShort(pl.prize) : "—"}</span></div>`;
}

// Expose helpers to per-template builder scripts loaded before this file.
window.__yr = { money, moneyShort, esc, initials, ord };

function currentTemplate() { return document.body?.dataset?.template || "classic"; }
function isCasinoFull() { return !!((window.CASINO_BUILDERS || {}).top3 || {})[currentTemplate()]; }

// CASINO-STYLE: full-page templates ship data-style-* attributes for dynamic
// per-player values (win-rate bars, gradients, score bars, animation-delay, etc.)
// because the strict CSP blocks inline style="..." attributes. Apply them via
// CSSOM after render.
function hydrateStyles() {
  for (const el of $$("[data-style]")) {
    for (const key of Object.keys(el.dataset)) {
      if (!key.startsWith("style")) continue;
      let cssProp = key.slice(5);
      cssProp = cssProp[0].toLowerCase() + cssProp.slice(1);
      el.style[cssProp] = el.dataset[key];
      delete el.dataset[key];
    }
  }
}
function buildTop3(pl, rank) {
  const fn = (window.CASINO_BUILDERS?.top3 || {})[currentTemplate()];
  return fn ? fn(pl, rank) : buildTop3Card(pl, rank);
}
function buildRow(pl, rank, delay, gap) {
  const fn = (window.CASINO_BUILDERS?.rows || {})[currentTemplate()];
  return fn ? fn(pl, rank, delay, gap) : buildPlayerRow(pl, rank, delay, gap);
}

// Set each row's --pct to its wager share of the leader, so layouts that draw a
// wager bar (e.g. the "arena" template) can size it without inline styles (CSP
// blocks style="" attributes; CSSOM writes are allowed).
function applyRowBars(sorted) {
  const max = sorted.length ? Number(sorted[0].wagered) || 0 : 0;
  $$("[data-rows] .t-row").forEach((el) => {
    const w = Number(el.dataset.wagered) || 0;
    const pct = max > 0 ? Math.max(4, Math.round((w / max) * 100)) : 0;
    el.style.setProperty("--pct", pct + "%");
  });
}

function updateLeaderboard(players) {
  const sorted = players.slice().sort((a, b) => b.wagered - a.wagered);
  const cnt = $("[data-count]");
  if (cnt) cnt.textContent = sorted.length;

  // Update top 3
  const t3 = $("[data-top3]");
  if (t3 && sorted.length >= 3) {
    t3.innerHTML = sorted.slice(0, 3).map((pl, i) => buildTop3(pl, i + 1)).join("");
  }

  // Build new name→rank map for rank-change detection
  const newRankMap = {};
  sorted.forEach((pl, i) => { newRankMap[pl.name] = i + 1; });

  const rows = $("[data-rows]");
  if (rows) {
    const startIndex = (t3 && isCasinoFull()) ? 3 : 0;
    rows.innerHTML = sorted.slice(startIndex).map((pl, i) => {
      const rank = i + 1 + startIndex;
      const gap = i === 0 ? 0 : sorted[i - 1 + startIndex].wagered - pl.wagered;
      return buildRow(pl, rank, Math.min(i * 0.025, 0.5), gap);
      }).join("");
      // SEC-713: apply animation-delay via CSSOM (CSP blocks style="" attributes)
      $$("[data-rows] [data-delay]").forEach((el) => { el.style.animationDelay = el.dataset.delay + "s"; });
    hydrateStyles();
    applyRowBars(sorted);

    // Flash rank-change indicators
    const rowEls = $$("[data-rows] .t-row");
    rowEls.forEach((row) => {
      const name = row.dataset.name;
      const newPos = parseInt(row.dataset.position, 10);
      const oldPos = previousPlayerNames.indexOf(name) + 1; // 0-based → 1-based, -1+1=0 if not found

      if (oldPos > 0 && oldPos !== newPos) {
        const direction = newPos < oldPos ? "rank-up" : "rank-down";
        row.classList.add(direction);
        // Add arrow indicator
        const arrow = document.createElement("span");
        arrow.className = `rank-arrow ${direction === "rank-up" ? "rank-arrow-up" : "rank-arrow-down"}`;
        arrow.textContent = direction === "rank-up" ? `▲${oldPos - newPos}` : `▼${newPos - oldPos}`;
        row.querySelector(".tr-rank").appendChild(arrow);

        // Remove animation class after it completes
        setTimeout(() => {
          row.classList.remove(direction);
          arrow.classList.add("fade-out");
          setTimeout(() => arrow.remove(), 400);
        }, 2000);
      }
    });
  }

  // Store current ordering for next poll
  previousPlayerNames = sorted.map((pl) => pl.name);

  // Update payouts
  const po = $("[data-payouts]");
  if (po) {
    const winners = sorted.map((pl, idx) => ({ rank: idx + 1, prize: pl.prize })).filter((w) => w.prize > 0);
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

  // Pulse the LIVE badge to show fresh data
  const badge = $("[data-live-badge]");
  if (badge) {
    badge.classList.add("live-badge--fresh");
    setTimeout(() => badge.classList.remove("live-badge--fresh"), 2000);
  }
}

let pollFailCount = 0;
let lastEtag = "";

async function pollPlayers() {
    const slug = window.__SLUG__;
    if (!slug || slug === "demo") return;
    try {
      const url = `/api/public/${encodeURIComponent(slug)}/players?limit=100`;
      const headers = lastEtag ? { "If-None-Match": lastEtag } : {};
      const resp = await fetch(url, { headers });
      if (resp.status === 304) { pollFailCount = 0; return; }
      if (!resp.ok) { onPollFail(); return; }
      const etag = resp.headers.get("etag");
      if (etag) lastEtag = etag;
      const json = await resp.json();
      if (json.players && Array.isArray(json.players)) {
        pollFailCount = 0;
        hidePollBanner();
        updateLeaderboard(json.players);
        const ann = document.getElementById("lb-announce"); if(ann) ann.textContent = "Leaderboard updated.";
      }
    } catch (_) {
      onPollFail();
    }
  }

function onPollFail() {
  pollFailCount++;
  if (pollFailCount >= 3) showPollBanner();
}

function showPollBanner() {
  let banner = document.getElementById("lb-poll-banner");
  if (banner) return;
  banner = document.createElement("div");
  banner.id = "lb-poll-banner";
  banner.setAttribute("role", "alert");
  banner.setAttribute("aria-live", "polite");
  banner.style.cssText = "position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(220,38,38,.92);color:#fff;padding:8px 18px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;z-index:9999;backdrop-filter:blur(6px)";
  banner.textContent = "Connection lost. Refresh to get the latest data.";
  document.body.appendChild(banner);
}

function hidePollBanner() {
  const banner = document.getElementById("lb-poll-banner");
  if (banner) banner.remove();
}

function boot() {
  const data = window.__SITE_DATA__ || {};
  const b = data.brand || {};
  $$("[data-brand-name]").forEach((el) => (el.textContent = b.name || ""));
  $$("[data-code]").forEach((el) => (el.textContent = b.code || ""));
  $$("[data-casino]").forEach((el) => (el.textContent = b.casino || ""));
  $$("[data-pool]").forEach((el) => (el.textContent = b.prizePool || ""));
  $$("[data-period]").forEach((el) => (el.textContent = b.period || "Monthly"));
  const tg = $("[data-tagline]"); if (tg) tg.textContent = b.tagline || "";
  const yr = $("[data-year]"); if (yr) yr.textContent = new Date().getFullYear();
  // SSR already points [data-cta] at the tracked /go/<slug> redirect; only fall back to the raw URL when no slug is set.
  $$("[data-cta]").forEach((el) => { if (b.ctaUrl && !window.__SLUG__) el.href = b.ctaUrl; });

  const wm = $("[data-watermarks]");
  if (wm) { let h = ""; for (let i = 0; i < 14; i++) { const t = Math.random()*100, l = Math.random()*100, s = 20+Math.random()*60, r = -20+Math.random()*40; h += `<span data-t="${t}" data-l="${l}" data-s="${s}" data-r="${r}">${esc(b.name || "")}</span>`; } wm.innerHTML = h; wm.querySelectorAll("span").forEach((sp) => { sp.style.top = sp.dataset.t + "%"; sp.style.left = sp.dataset.l + "%"; sp.style.fontSize = sp.dataset.s + "px"; sp.style.transform = "rotate(" + sp.dataset.r + "deg)"; }); }

  const cc = $("[data-copy-code]");
  if (cc) cc.addEventListener("click", async () => { try { await navigator.clipboard.writeText(b.code || ""); cc.classList.add("copied"); const p = cc.textContent; cc.textContent = "Copied!"; setTimeout(() => { cc.classList.remove("copied"); cc.textContent = p; }, TOAST_DURATION_MS); } catch (_) { /* ignored */ }
    try { const cs = document.querySelector("[data-copy-status]"); if(cs) cs.textContent = "Code copied to clipboard"; } catch (_) { /* ignored */ }
    try { if (window.__SLUG__) navigator.sendBeacon("/api/track/copy", new Blob([JSON.stringify({ slug: window.__SLUG__ })], { type: "application/json" })); } catch (_) { /* ignored */ } });

  const sc = $("[data-share='copy']");
  if (sc) sc.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(sc.dataset.url || location.href);
      const p = sc.textContent;
      sc.textContent = "Copied!";
      setTimeout(() => { sc.textContent = p; }, TOAST_DURATION_MS);
    } catch (_) { /* ignored */ }
  });

  const p = data.partner || {};
  const blurb = $("[data-partner-blurb]"); if (blurb) blurb.textContent = p.blurb || "";
  const chips = $("[data-chips]"); if (chips && Array.isArray(p.chips)) chips.innerHTML = p.chips.map((c) => `<li>${esc(c)}</li>`).join("");

  const why = $("[data-why]");
  if (why && Array.isArray(data.whyStats)) why.innerHTML = data.whyStats.map((s) => `<div class="why"><span class="why-big">${esc(s.big)}</span><span class="why-label">${esc(s.label)}</span>${s.sub ? `<span class="why-sub">${esc(s.sub)}</span>` : ""}</div>`).join("");

  const players = (data.players || []).slice().sort((a, b) => b.wagered - a.wagered);
  const cnt = $("[data-count]"); if (cnt) cnt.textContent = players.length;

  // Player count badge
  const countBadge = $("[data-player-count-badge]");
  if (countBadge) countBadge.textContent = `${players.length} player${players.length !== 1 ? "s" : ""}`;

  const t3 = $("[data-top3]");
  if (t3 && players.length >= 3) t3.innerHTML = players.slice(0, 3).map((pl, i) => buildTop3(pl, i + 1)).join("");

  const rows = $("[data-rows]");
  if (rows) {
    const startIndex = (t3 && isCasinoFull()) ? 3 : 0;
    rows.innerHTML = players.slice(startIndex).map((pl, i) => {
      const r = i + 1 + startIndex;
      const gap = i === 0 ? 0 : players[i - 1 + startIndex].wagered - pl.wagered;
      return buildRow(pl, r, Math.min(i * 0.025, 0.5), gap);
    }).join("");
    // SEC-713: apply animation-delay via CSSOM (CSP blocks style="" attributes)
    $$("[data-rows] [data-delay]").forEach((el) => { el.style.animationDelay = el.dataset.delay + "s"; });
    hydrateStyles();
    applyRowBars(players);
  }
  // Store initial ordering
  previousPlayerNames = players.map((pl) => pl.name);

  // ---- Find My Rank search ----
  initFindRank(players);

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

  // Initialize particle effect
  initParticles();

  // Start live polling every 30 seconds
  if (window.__SLUG__) {
    setInterval(pollPlayers, POLL_INTERVAL_MS);
  }
}

// ---- Find My Rank search ----
function initFindRank(sortedPlayers) {
  const input = $("[data-find-rank]");
  const resultEl = $("[data-find-result]");
  if (!input) return;

  const total = sortedPlayers.length;

  function doSearch() {
    const q = input.value.trim().toLowerCase();
    // Clear previous highlights
    $$(".t-row--found").forEach((r) => r.classList.remove("t-row--found"));
    if (resultEl) resultEl.textContent = "";
    if (!q) return;

    // Find first partial match in sorted array
    const matchIdx = sortedPlayers.findIndex((pl) => String(pl.name || "").toLowerCase().includes(q));
    if (matchIdx === -1) {
      if (resultEl) resultEl.textContent = "No player found with that name";
      resultEl?.classList.remove("found");
      resultEl?.classList.add("not-found");
      return;
    }

    const rank = matchIdx + 1;
    if (resultEl) {
      resultEl.textContent = `You're #${rank} of ${total}`;
      resultEl.classList.add("found");
      resultEl.classList.remove("not-found");
    }

    // Highlight the matching row in the DOM and scroll to it
    const targetRow = $(`.t-row[data-position="${rank}"]`);
    if (targetRow) {
      targetRow.classList.add("t-row--found");
      targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); doSearch(); }
  });
  // Also search on icon click (parent wrap click)
  const wrap = input.closest(".find-rank-wrap");
  if (wrap) {
    wrap.addEventListener("click", (e) => {
      if (e.target.closest(".find-rank-icon")) doSearch();
    });
  }
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
    if (cells) {
      cells.d && (cells.d.textContent = pad(d));
      cells.h && (cells.h.textContent = pad(h));
      cells.m && (cells.m.textContent = pad(m));
      if (cells.s) {
        const newVal = pad(s);
        if (cells.s.textContent !== newVal) {
          cells.s.classList.add("tick");
          cells.s.textContent = newVal;
          setTimeout(() => cells.s.classList.remove("tick"), 300);
        }
      }
    }
  };
  tick(); setInterval(tick, 1000);
}
function nextMonthUTC() { const n = new Date(); return Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + 1, 1); }
document.addEventListener("DOMContentLoaded", () => {
  boot();
  // A11Y-103: mobile hamburger toggle
  const toggle = $(".nav-toggle"), links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close on link click (single-page nav)
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }
  // U-3: hide sticky mobile headers (board tabs + search) when scrolling down, show when up
  const isMobile = () => window.matchMedia("(max-width: 600px)").matches;
  let lastY = 0;
  window.addEventListener("scroll", () => {
    if (!isMobile()) return;
    const y = window.scrollY;
    const goingDown = y > lastY && y > 50;
    document.body.classList.toggle("scrolled-down", goingDown);
    lastY = y;
  }, { passive: true });
});
