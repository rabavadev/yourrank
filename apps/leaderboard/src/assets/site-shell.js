// Public streamer site — shell behaviour.
// Progressive enhancement only: every section renders and is navigable with
// this file blocked. Handles the mobile sidebar, the standings board tabs and
// filter, the shop redeem call, the reset countdown and the feedback dialog.
(function () {
  "use strict";

  var side = document.getElementById("yr-side");
  var scrim = document.getElementById("yr-scrim");

  function closeSide() {
    if (!side) return;
    side.removeAttribute("data-open");
    if (scrim) scrim.hidden = true;
  }

  function openSide() {
    if (!side) return;
    side.setAttribute("data-open", "");
    if (scrim) scrim.hidden = false;
  }

  var menu = document.getElementById("yr-menu");
  if (menu) menu.addEventListener("click", function () { (side && side.hasAttribute("data-open")) ? closeSide() : openSide(); });
  if (scrim) scrim.addEventListener("click", closeSide);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSide(); });

  // ── Standings: board tabs ───────────────────────────────────────────
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab]"));
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.dataset.tab;
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-on", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        document.querySelectorAll("[data-tabpanel]").forEach(function (p) {
          p.hidden = p.dataset.tabpanel !== name;
        });
      });
    });
  }

  // ── Standings: local filter with server fallback and real pagination ──
  var search = document.getElementById("yr-search");
  var rowsRoot = document.querySelector("[data-rows]");
  var loadMore = document.querySelector("[data-load-more]");
  var loadMoreStatus = document.querySelector("[data-load-more-status]");
  var slug = document.body.dataset.slug || "";
  var isCustomDomain = document.body.dataset.customDomain === "true";
  var loadedCount = rowsRoot ? rowsRoot.querySelectorAll("tr[data-name]").length : 0;
  var totalCount = Number((document.querySelector("[data-player-count-badge]") || {}).textContent?.replace(/[^\d]/g, "")) || loadedCount;
  var activeSearch = "";
  var searchOffset = 0;
  var savedRowsHtml = rowsRoot ? rowsRoot.innerHTML : "";
  var currency = document.body.dataset.currency || "$";
  var money = function (v) { return currency + Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }); };
  var esc = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]); }); };
  var rowHtml = function (p) {
    var rank = Number(p.rank) || 0;
    return '<tr data-name="' + esc(String(p.name || "").toLowerCase()) + '" data-position="' + rank + '">' +
      '<td class="yr-idx">' + String(rank).padStart(2, "0") + '</td>' +
      '<td><a href="' + (isCustomDomain ? "/player/" : "/" + encodeURIComponent(slug) + "/player/") + encodeURIComponent(p.name || "") + '">' + esc(p.name) + '</a></td>' +
      '<td class="yr-mono yr-r">' + esc(money(p.wagered)) + '</td>' +
      '<td class="yr-mono yr-r">' + (p.prize ? esc(money(p.prize)) : "—") + '</td></tr>';
  };
  var fetchPage = function (offset, q) {
    var params = new URLSearchParams({ limit: "100", offset: String(offset) });
    if (q) params.set("search", q);
    return fetch("/api/public/" + encodeURIComponent(slug) + "/players?" + params.toString()).then(function (res) {
      if (!res.ok) throw new Error("Could not load players.");
      return res.json();
    });
  };
  var appendPage = function (page, replace) {
    if (!rowsRoot) return;
    var html = (page.players || []).map(rowHtml).join("");
    if (replace) rowsRoot.innerHTML = html;
    else rowsRoot.insertAdjacentHTML("beforeend", html);
    loadedCount = replace ? (page.players || []).length : loadedCount + (page.players || []).length;
    totalCount = Number(page.total) || totalCount;
    if (loadMore) loadMore.hidden = !page.hasMore;
  };
  if (search && rowsRoot) {
    var rows = function () { return Array.prototype.slice.call(rowsRoot.querySelectorAll("tr[data-name]")); };
    var empty = document.getElementById("yr-no-match");
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      activeSearch = q;
      searchOffset = 0;
      var shown = 0;
      rows().forEach(function (row) {
        var hit = !q || row.dataset.name.indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) shown += 1;
      });
      if (!q) {
        if (rowsRoot && savedRowsHtml) rowsRoot.innerHTML = savedRowsHtml;
        loadedCount = rows().length;
        if (loadMore) loadMore.hidden = loadedCount >= totalCount;
        if (empty) empty.hidden = true;
        return;
      }
      if (shown === 0) {
        fetchPage(0, q).then(function (page) {
          if (activeSearch !== q) return;
          appendPage(page, true);
          searchOffset = (page.players || []).length;
          if (empty) empty.hidden = (page.players || []).length !== 0;
        }).catch(function () {
          if (empty) empty.hidden = false;
        });
      } else if (empty) empty.hidden = true;
    });
  }

  if (loadMore) {
    loadMore.addEventListener("click", function () {
      loadMore.disabled = true;
      if (loadMoreStatus) loadMoreStatus.textContent = "Loading…";
      var offset = activeSearch ? searchOffset : loadedCount;
      fetchPage(offset, activeSearch).then(function (page) {
        appendPage(page, !!activeSearch && searchOffset === 0);
        if (activeSearch) searchOffset += (page.players || []).length;
        loadMore.disabled = false;
        if (loadMoreStatus) loadMoreStatus.textContent = "";
      }).catch(function (err) {
        loadMore.disabled = false;
        if (loadMoreStatus) loadMoreStatus.textContent = err.message;
      });
    });
  }

  // ── Shop: redeem ────────────────────────────────────────────────────
  document.querySelectorAll("[data-redeem]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Redeeming…";
      fetch("/api/viewer/redeem", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slug, shopItemId: btn.dataset.redeem }),
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
          if (r.ok && r.data.ok) {
            btn.textContent = "Requested";
            setTimeout(function () { location.reload(); }, 800);
          } else {
            btn.textContent = r.data.error || "Failed";
            btn.disabled = false;
            setTimeout(function () { btn.textContent = label; }, 2500);
          }
        })
        .catch(function () {
          btn.textContent = "Network error";
          btn.disabled = false;
          setTimeout(function () { btn.textContent = label; }, 2500);
        });
    });
  });

  // ── Countdown ───────────────────────────────────────────────────────
  var cd = document.querySelector("[data-ends-at]");
  if (cd) {
    var end = Number(cd.dataset.endsAt);
    var tick = function () {
      var left = Math.max(0, end - Date.now());
      var d = Math.floor(left / 86400000);
      var h = Math.floor((left % 86400000) / 3600000);
      var m = Math.floor((left % 3600000) / 60000);
      cd.textContent = d > 0 ? d + "d " + h + "h" : h + "h " + m + "m";
    };
    if (end) { tick(); setInterval(tick, 30000); }
  }

  // ── Feedback dialog ─────────────────────────────────────────────────
  var dialog = document.getElementById("yr-feedback");
  var statusEl = document.getElementById("yr-feedback-status");
  document.querySelectorAll("[data-feedback-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!dialog || !dialog.showModal) return;
      closeSide();
      if (statusEl) statusEl.textContent = "";
      dialog.showModal();
    });
  });
  var closeBtn = document.getElementById("yr-feedback-close");
  if (closeBtn && dialog) closeBtn.addEventListener("click", function () { dialog.close(); });

  var form = dialog && dialog.querySelector("form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var message = form.message.value.trim();
      if (message.length < 10) {
        if (statusEl) statusEl.textContent = "Please write at least 10 characters.";
        return;
      }
      var csrfEl = document.querySelector('meta[name="csrf-token"]');
      btn.disabled = true;
      btn.textContent = "Sending…";
      fetch("/api/feedback", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json", "x-csrf-token": (csrfEl && csrfEl.content) || "" },
        body: JSON.stringify({ slug: form.slug.value, message: message }),
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
          if (r.ok && r.data.ok) {
            if (statusEl) statusEl.textContent = "Thanks — your feedback was sent.";
            form.message.value = "";
            setTimeout(function () { dialog.close(); }, 1200);
          } else {
            if (statusEl) statusEl.textContent = r.data.error || "Could not send feedback. Try again.";
          }
          btn.disabled = false;
          btn.textContent = "Send";
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "Network error. Please try again.";
          btn.disabled = false;
          btn.textContent = "Send";
        });
    });
  }
})();
