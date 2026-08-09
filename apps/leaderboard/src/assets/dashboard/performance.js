// Performance page widgets: KPIs, activity chart, heatmap, referrers.
import { $, logError } from "./utils.js";
import { state } from "./state.js";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function initPerformance() {
  wireRangeFilter();
}

function wireRangeFilter() {
  const filter = $("perfRangeFilter");
  if (!filter || filter._wired) return;
  filter._wired = true;
  filter.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-range]");
    if (!btn) return;
    const range = Number(btn.dataset.range);
    filter.querySelectorAll("button[data-range]").forEach((b) => b.classList.toggle("is-active", b === btn));
    state.PERF_RANGE = range;
    if (state.STATS) renderPerformance(state.STATS);
  });
}

export function renderPerformance(s) {
  state.STATS = s;
  const isVisible = document.querySelector('section[data-page="performance"].is-on');
  if (!isVisible) return;

  const range = state.PERF_RANGE || 14;
  const days = (s.days || []).slice(-range);
  const totals = days.reduce(
    (acc, d) => {
      acc.views += Number(d.views) || 0;
      acc.copies += Number(d.copies) || 0;
      acc.clicks += Number(d.clicks) || 0;
      acc.conversions += Number(d.conversions) || 0;
      return acc;
    },
    { views: 0, copies: 0, clicks: 0, conversions: 0 }
  );

  const fmt = (n) => (n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n));
  const ctr = totals.views ? ((totals.clicks / totals.views) * 100).toFixed(1) : "0.0";
  setKpi("perfKpiViews", fmt(totals.views), `Views · ${range}d`);
  setKpi("perfKpiClicks", fmt(totals.clicks), `Clicks · ${range}d`);
  setKpi("perfKpiCopies", fmt(totals.copies), `Copies · ${range}d`);
  setKpi("perfKpiCtr", ctr + "%", `CTR · ${range}d`);

  const bars = $("statBars");
  if (bars) {
    const max = Math.max(1, ...days.map((x) => (Number(x.views) || 0) + (Number(x.copies) || 0) + (Number(x.clicks) || 0)));
    bars.innerHTML = days
      .map((x) => {
        const total = (Number(x.views) || 0) + (Number(x.copies) || 0) + (Number(x.clicks) || 0);
        const h = Math.max(2, Math.round((total / max) * 100));
        const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
        const tip = `${nice}: ${x.views || 0} views, ${x.copies || 0} copies, ${x.clicks || 0} clicks`;
        if (!total) return `<div class="stat-bar is-empty" style="height:2%" title="${tip}"></div>`;
        const seg = (v, c) => {
          const pct = Math.max(1, Math.round(((Number(v) || 0) / total) * 100));
          return v ? `<div class="stat-bar-seg ${c}" style="height:${pct}%"></div>` : "";
        };
        return `<div class="stat-bar is-stacked" style="height:${h}%" title="${tip}">${seg(x.views, "views")}${seg(x.copies, "copies")}${seg(x.clicks, "clicks")}</div>`;
      })
      .join("");
    const from = $("statFrom");
    if (from && days.length) from.textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
    const empty = $("statsEmpty");
    if (empty) empty.hidden = days.some((d) => (Number(d.views) || 0) + (Number(d.copies) || 0) + (Number(d.clicks) || 0) > 0);
  }

  loadHeatmap();
}

function setKpi(id, value, label) {
  const valEl = document.getElementById(id);
  const lblEl = document.getElementById(id + "Lbl");
  if (valEl) valEl.textContent = value;
  if (lblEl) lblEl.textContent = label;
}

async function loadHeatmap() {
  const wrap = $("perfHeatmap");
  if (!wrap || wrap._loading) return;
  wrap._loading = true;
  try {
    const url = state.ACTIVE_SITE_ID
      ? `/api/site/stats/heatmap?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}`
      : "/api/site/stats/heatmap";
    const r = await fetch(url);
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.error || "heatmap failed");
    renderHeatmap(d.heatmap || []);
    renderReferrers(d.referrers || []);
  } catch (err) {
    logError("load-heatmap", err);
    const grid = $("perfHeatmapGrid");
    if (grid) grid.innerHTML = `<p class="heatmap-loading">Could not load activity map.</p>`;
  } finally {
    wrap._loading = false;
  }
}

function renderHeatmap(matrix) {
  const grid = $("perfHeatmapGrid");
  if (!grid) return;
  const flat = matrix.flat();
  const max = Math.max(1, ...flat);
  if (max === 1) {
    grid.innerHTML = `<p class="heatmap-loading">No hourly activity yet.</p>`;
    return;
  }
  let html = `<div class="heatmap-corner"></div>`;
  for (let h = 0; h < 24; h++) {
    if (h % 3 !== 0) {
      html += `<div></div>`;
      continue;
    }
    html += `<div class="heatmap-hlabel">${h}</div>`;
  }
  for (let dow = 0; dow < 7; dow++) {
    html += `<div class="heatmap-dlabel">${DOW[dow]}</div>`;
    for (let h = 0; h < 24; h++) {
      const v = Number(matrix[dow]?.[h]) || 0;
      const a = v ? 0.15 + (Math.round((v / max) * 100) / 100) * 0.7 : 0;
      const title = `${DOW[dow]} ${h}:00 — ${v} views`;
      html += `<div class="heatmap-cell" title="${title}" style="background:rgba(34,0,255,${a.toFixed(2)})"></div>`;
    }
  }
  grid.innerHTML = html;
}

function renderReferrers(referrers) {
  const body = $("perfReferrersBody");
  const empty = $("perfReferrersEmpty");
  if (!body) return;
  if (!referrers.length) {
    body.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  body.innerHTML = referrers.map((r) => `<tr><td>${r.domain}</td><td class="ta-r mono">${r.count}</td></tr>`).join("");
}
