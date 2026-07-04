/* OBS Overlay: MARQUEE MODE — scrolls all players in a ticker for stream overlays.
 * Shows the full leaderboard (not just top 5) in a smooth auto-scrolling ticker.
 * Activated by passing ?mode=marquee in the overlay URL. */
(function () {
  "use strict";

  const SLUG = window.__OVERLAY_SLUG__;
  const POLL_MS = 15000;
  const SHOW_TIME = 3500; // ms per player
  const FADE_MS = 600;

  // --- Format helpers ---
  function fmtMoney(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
    return "$" + (n || 0).toLocaleString("en-US");
  }

  function fmtCountdown(iso) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, over: true };
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    return { d, h, m, s, over: false };
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // --- Marquee state ---
  let allPlayers = [];
  let currentIndex = 0;
  let tickTimer = null;
  let endsAt = null;

  // --- DOM refs ---
  let nameEl, medalEl, wagerEl, countEl, positionEl;

  function showPlayer(index) {
    if (!allPlayers.length) return;
    const i = ((index % allPlayers.length) + allPlayers.length) % allPlayers.length;
    currentIndex = i;
    const p = allPlayers[i];
    const rank = i + 1;
    const total = allPlayers.length;

    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "#" + rank;

    // Fade out, update, fade in
    const card = document.getElementById("ov-marquee-card");
    if (!card) return;

    card.style.opacity = "0";
    card.style.transition = `opacity ${FADE_MS}ms ease`;

    setTimeout(() => {
      if (medalEl) medalEl.textContent = medal;
      if (nameEl) nameEl.textContent = esc(p.name);
      if (wagerEl) wagerEl.textContent = fmtMoney(p.wagered);
      if (positionEl) positionEl.textContent = `${rank} / ${total}`;

      card.style.opacity = "1";
    }, FADE_MS);
  }

  function advanceMarquee() {
    showPlayer(currentIndex + 1);
  }

  function resetMarquee() {
    if (tickTimer) clearInterval(tickTimer);
    showPlayer(0);
    tickTimer = setInterval(advanceMarquee, SHOW_TIME);
  }

  // --- Timer tick ---
  function tickTimerDisplay() {
    const grid = document.querySelector("[data-ov-timer]");
    if (!grid || !endsAt) return;
    const t = fmtCountdown(endsAt);
    if (!t || t.over) {
      grid.innerHTML = '<span class="ov-timer-over">Period ended</span>';
      return;
    }
    const cells = grid.querySelectorAll("[data-ot]");
    if (cells.length >= 4) {
      cells[0].textContent = pad(t.d);
      cells[1].textContent = pad(t.h);
      cells[2].textContent = pad(t.m);
      cells[3].textContent = pad(t.s);
    }
  }

  // --- Render marquee ---
  function renderMarquee(players) {
    allPlayers = players.slice().sort((a, b) => b.wagered - a.wagered);

    if (countEl) countEl.textContent = allPlayers.length;

    // Reset marquee from the top
    resetMarquee();
  }

  // --- Polling ---
  async function poll() {
    try {
      const res = await fetch("/api/public/" + encodeURIComponent(SLUG) + "/players");
      if (!res.ok) return;
      const data = await res.json();
      if (data.players) renderMarquee(data.players);
    } catch { /* ignore transient failures */ }
  }

  // --- Init ---
  function init() {
    nameEl = document.getElementById("ov-marquee-name");
    medalEl = document.getElementById("ov-marquee-medal");
    wagerEl = document.getElementById("ov-marquee-wager");
    countEl = document.getElementById("ov-count");
    positionEl = document.getElementById("ov-marquee-position");

    // Initial render from SSR data
    const ssr = window.__OVERLAY_DATA__;
    if (ssr) {
      endsAt = ssr.endsAt || null;
      renderMarquee(ssr.players || []);
    }

    // Timer tick every second
    tickTimerDisplay();
    setInterval(tickTimerDisplay, 1000);

    // Poll for updates
    setInterval(poll, POLL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
