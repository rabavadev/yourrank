/* Analytics page — load stats, render bar chart with tooltips, heatmap, and top referrers. */
const $ = (s) => document.getElementById(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

(async function load() {
  // Live link + page meta from /api/site.
  try {
    const r = await fetch("/api/site");
    const d = await r.json();
    if (r.ok && d.ok && d.slug) {
      const live = $("liveLink");
      live.href = "/" + d.slug;
      live.textContent = "yourrank.site/" + d.slug;
    }
  } catch { /* stats load */ }

  let s;
  try {
    const r = await fetch("/api/site/stats");
    const d = await r.json();
    if (!r.ok || !d.ok) { $("loading").hidden = true; return; }
    s = d.stats;
  } catch {
    $("loading").textContent = "Couldn't load analytics right now — refresh.";
    return;
  }

  $("views7").textContent = fmt(s.last7.views);
  $("views30").textContent = fmt(s.last30.views);
  $("copies30").textContent = fmt(s.last30.copies);
  $("clicks30").textContent = fmt(s.last30.clicks);
  $("viewsToday").textContent = fmt(s.today.views);
  $("copiesToday").textContent = fmt(s.today.copies);
  $("clicksToday").textContent = fmt(s.today.clicks);

  // --- Bar chart with hover tooltips ---
  const bars = $("bars");
  const days = s.days || [];
  const max = Math.max(1, ...days.map((x) => x.views));
  bars.innerHTML = days
    .map((x, i) => {
      const h = Math.max(2, Math.round((x.views / max) * 100));
      const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
      return `<div class="stat-bar" data-idx="${i}" style="height:${h}%" data-day="${esc(nice)}" data-views="${x.views}" data-copies="${x.copies}" data-clicks="${x.clicks}"></div>`;
    })
    .join("");

  if (days.length) $("from").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
  if (s.last30.views === 0 && s.last30.copies === 0 && s.last30.clicks === 0) $("empty").hidden = false;

  // Tooltip on bar hover
  const tooltip = $("chartTooltip");
  const chartBox = bars.parentElement;
  chartBox.style.position = "relative";
  bars.addEventListener("mousemove", (e) => {
    const bar = e.target.closest(".stat-bar");
    if (!bar) { tooltip.hidden = true; return; }
    const day = bar.dataset.day;
    const views = bar.dataset.views;
    const copies = bar.dataset.copies;
    const clicks = bar.dataset.clicks;
    tooltip.innerHTML = `<b>${esc(day)}</b><br>${esc(views)} views · ${esc(copies)} copies · ${esc(clicks)} clicks`;
    tooltip.hidden = false;
    const rect = chartBox.getBoundingClientRect();
    const bx = bar.getBoundingClientRect();
    const left = bx.left - rect.left + bx.width / 2;
    tooltip.style.left = Math.max(4, Math.min(left - tooltip.offsetWidth / 2, rect.width - tooltip.offsetWidth - 4)) + "px";
  });
  bars.addEventListener("mouseleave", () => { tooltip.hidden = true; });

  $("loading").hidden = true;
  $("an").hidden = false;

  // --- Heatmap + Referrers (loaded after main stats render) ---
  loadHeatmapAndReferrers();

  // Export CSV
  const exportBtn = $("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      exportBtn.disabled = true;
      const status = $("exportStatus");
      status.textContent = "Preparing export...";
      try {
        const r = await fetch("/api/site/stats/export", { credentials: "include" });
        if (r.ok) {
          const blob = await r.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "yourrank-stats.csv";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          status.textContent = "Export downloaded.";
        } else {
          status.textContent = "Could not export. Try again.";
        }
      } catch {
        status.textContent = "Network error. Try again.";
      } finally {
        exportBtn.disabled = false;
      }
    });
  }
})();

async function loadHeatmapAndReferrers() {
  try {
    const r = await fetch("/api/site/stats/heatmap");
    const d = await r.json();
    if (!r.ok || !d.ok) return;
    renderHeatmap(d.heatmap);
    renderReferrers(d.referrers);
  } catch { /* fetch error */ }
}

function renderHeatmap(grid) {
  const wrap = $("heatmapWrap");
  if (!grid || !grid.length) { wrap.innerHTML = '<div class="heatmap-loading">No data yet.</div>'; return; }

  // Find max for colour scaling
  let maxVal = 0;
  for (const row of grid) for (const v of row) if (v > maxVal) maxVal = v;

  let html = '<div class="heatmap">';
  // Hour labels row
  html += '<div class="heatmap-corner"></div>';
  for (let h = 0; h < 24; h++) {
    html += `<div class="heatmap-hlabel">${h % 3 === 0 ? (h < 10 ? "0" + h : h) : ""}</div>`;
  }
  // Data rows
  for (let d = 0; d < 7; d++) {
    html += `<div class="heatmap-dlabel">${DAYS_SHORT[d]}</div>`;
    for (let h = 0; h < 24; h++) {
      const v = grid[d][h];
      const intensity = maxVal > 0 ? v / maxVal : 0;
      const bg = v === 0 ? "transparent" : `rgba(200, 255, 0, ${0.08 + intensity * 0.92})`;
      html += `<div class="heatmap-cell" style="background:${bg}" title="${DAYS_SHORT[d]} ${h}:00 UTC — ${v} views"></div>`;
    }
  }
  html += "</div>";
  wrap.innerHTML = html;
}

function renderReferrers(refs) {
  const body = $("refBody");
  const empty = $("refEmpty");
  const table = $("refTable");
  if (!refs || refs.length === 0) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }
  table.hidden = false;
  empty.hidden = true;
  body.innerHTML = refs.map(r =>
    `<tr><td>${esc(r.domain)}</td><td class="ta-r" style="font-family:var(--mono)">${fmt(r.count)}</td></tr>`
  ).join("");
}

