/* OBS Overlay: live polling + smooth rank transitions for stream overlays. */
(function () {
  "use strict";

  const SLUG = window.__OVERLAY_SLUG__;
  const TOP_N = 5;
  const POLL_MS = 15000;
  const TRANSITION_MS = 600;

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

  // --- Timer tick ---
  let endsAt = null;
  function tickTimer() {
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

  // --- Render top N players with FLIP animation ---
  let prevRanks = {};

  function renderPlayers(players) {
    const sorted = players.slice().sort((a, b) => b.wagered - a.wagered).slice(0, TOP_N);
    const container = document.getElementById("ov-players");
    if (!container) return;

    // Record old positions (FLIP: First)
    const oldPositions = {};
    container.querySelectorAll(".ov-row").forEach((el) => {
      const name = el.dataset.name;
      const rect = el.getBoundingClientRect();
      oldPositions[name] = rect.top;
    });

    // Build new HTML
    const html = sorted.map((p, i) => {
      const rank = i + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "#" + rank;
      const isNew = !prevRanks[p.name];
      const movedUp = prevRanks[p.name] && prevRanks[p.name] > rank;
      const movedDown = prevRanks[p.name] && prevRanks[p.name] < rank;
      const dirClass = movedUp ? "ov-moved-up" : movedDown ? "ov-moved-down" : "";
      const entryClass = isNew ? "ov-enter" : "";
      return `<div class="ov-row ${dirClass} ${entryClass}" data-name="${esc(p.name)}">
        <span class="ov-medal">${medal}</span>
        <span class="ov-name">${esc(p.name)}</span>
        <span class="ov-wager">${fmtMoney(p.wagered)}</span>
      </div>`;
    }).join("");

    // Fill empty slots if fewer than TOP_N
    const empty = TOP_N - sorted.length;
    const emptyHtml = empty > 0
      ? Array.from({ length: empty }, (_, i) =>
        `<div class="ov-row ov-empty"><span class="ov-medal">#${sorted.length + i + 1}</span><span class="ov-name">—</span><span class="ov-wager">—</span></div>`
      ).join("")
      : "";

    container.innerHTML = html + emptyHtml;

    // FLIP: Last + Invert + Play
    container.querySelectorAll(".ov-row").forEach((el) => {
      const name = el.dataset.name;
      if (oldPositions[name] !== undefined) {
        const newRect = el.getBoundingClientRect();
        const dy = oldPositions[name] - newRect.top;
        if (Math.abs(dy) > 1) {
          el.style.transition = "none";
          el.style.transform = `translateY(${dy}px)`;
          requestAnimationFrame(() => {
            el.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${TRANSITION_MS}ms ease`;
            el.style.transform = "translateY(0)";
          });
        }
      }
    });

    // Track previous ranks
    prevRanks = {};
    sorted.forEach((p, i) => { prevRanks[p.name] = i + 1; });

    // Update count
    const countEl = document.getElementById("ov-count");
    if (countEl) countEl.textContent = players.length;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // --- Polling ---
  async function poll() {
    try {
      const res = await fetch("/api/public/" + encodeURIComponent(SLUG) + "/players");
      if (!res.ok) return;
      const data = await res.json();
      if (data.players) renderPlayers(data.players);
    } catch { /* ignore transient failures */ }
  }

  // --- Init ---
  function init() {
    // Initial render from SSR data
    const ssr = window.__OVERLAY_DATA__;
    if (ssr) {
      endsAt = ssr.endsAt || null;
      renderPlayers(ssr.players || []);
    }

    // Timer tick every second
    tickTimer();
    setInterval(tickTimer, 1000);

    // Poll for updates
    setInterval(poll, POLL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
