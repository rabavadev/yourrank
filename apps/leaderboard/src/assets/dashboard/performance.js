import { $, esc, logError, showLoadError, clearLoadError } from "./utils.js";
import { setState, state } from "./state.js";
import { renderEmpty, renderError, setMetricLoading, setMetricValue, setRowsLoading } from "./states.js";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TAB_LABELS = { activity: "Visitors", referrals: "Sources", events: "Events" };

export function initPerformance() {
  wireRangeFilter();
  wireTabs();
  renderEmpty($("eventsEmpty"), {
    icon: "link",
    title: "No events yet",
    body: "Automatic score updates will appear once a sponsor sends them.",
    actions: [{ label: "Set up score updates", href: "/dashboard/settings/connections", accent: true }],
  });
}

function wireRangeFilter() {
  const filter = $("perfRangeFilter");
  if (!filter || filter._wired) return;
  filter._wired = true;
  filter.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-range]");
    if (!btn) return;
    filter.querySelectorAll("button[data-range]").forEach((node) => node.classList.toggle("is-active", node === btn));
    state.PERF_RANGE = Number(btn.dataset.range);
    if (state.STATS) renderPerformance(state.STATS);
  });
}

function wireTabs() {
  const page = document.querySelector('section[data-page="performance"]');
  if (!page || page._tabsWired) return;
  page._tabsWired = true;
  page.querySelectorAll("[data-perf-tab]").forEach((tab) => tab.addEventListener("click", (event) => {
    event.preventDefault();
    const target = tab.dataset.perfTab;
    const nextPath = `/dashboard/analytics/${target}${location.search}`;
    if (nextPath !== location.pathname + location.search) history.pushState({}, "", nextPath);
    window.dispatchEvent(new CustomEvent("yr-nav", { detail: { page: "performance", hash: target } }));
    showTab(target);
  }));
  showTab((location.pathname.match(/\/analytics\/([^/]+)/) || [])[1] || "activity");
  if (!page._routeTabsWired) {
    page._routeTabsWired = true;
    window.addEventListener("popstate", () => {
      if (location.pathname.startsWith("/dashboard/analytics")) showTab((location.pathname.match(/\/analytics\/([^/]+)/) || [])[1] || "activity");
    });
  }
}

function totals(days) {
  return days.reduce((acc, day) => {
    acc.views += Number(day.views) || 0;
    acc.clicks += Number(day.clicks) || 0;
    acc.copies += Number(day.copies) || 0;
    return acc;
  }, { views: 0, clicks: 0, copies: 0 });
}

function hasCurrentTraffic() {
  const range = state.PERF_RANGE || 14;
  const all = Array.isArray(state.STATS?.days) ? state.STATS.days : [];
  const current = totals(all.slice(-range));
  return current.views > 0 || current.clicks > 0 || current.copies > 0;
}

function showTab(tab) {
  const active = ["activity", "referrals", "events"].includes(tab) ? tab : "activity";
  document.querySelectorAll("[data-perf-tab]").forEach((node) => {
    const selected = node.dataset.perfTab === active;
    node.classList.toggle("is-on", selected);
    if (selected) node.setAttribute("aria-current", "page");
    else node.removeAttribute("aria-current");
  });

  const referralPromo = $("perf-referrals");
  if (referralPromo) referralPromo.hidden = true;

  const panels = { activity: ["perf-activity"], referrals: ["perf-referrers"], events: ["perf-events"] };
  Object.entries(panels).forEach(([name, ids]) => ids.forEach((id) => {
    const node = $(id);
    if (node) node.hidden = name !== active;
  }));

  const heatmap = $("perf-heatmap");
  if (heatmap) heatmap.hidden = active !== "activity" || !hasCurrentTraffic();

  const crumb = document.querySelector('.v3-crumbs span[aria-current="page"]');
  if (crumb) crumb.textContent = TAB_LABELS[active];
}

export function renderPerformance(stats) {
  state.STATS = stats;
  if (!document.querySelector('section[data-page="performance"].is-on')) return;
  const range = state.PERF_RANGE || 14;
  const all = Array.isArray(stats.days) ? stats.days : [];
  const days = all.slice(-range);
  const previous = all.slice(Math.max(0, all.length - range * 2), Math.max(0, all.length - range));
  const currentTotals = totals(days);
  const previousTotals = totals(previous);
  const hasTraffic = currentTotals.views > 0 || currentTotals.clicks > 0 || currentTotals.copies > 0;

  if ($("perfRangeFilter")) $("perfRangeFilter").hidden = !hasTraffic;
  if ($("perfExport")) $("perfExport").hidden = !hasTraffic;
  const kpis = document.querySelector(".v3-analytics-page .v3-kpi-grid");
  if (kpis) kpis.hidden = !hasTraffic;
  const activityTable = document.querySelector(".v3-activity-table-card");
  if (activityTable) activityTable.hidden = !hasTraffic;

  setKpi("perfKpiViews", currentTotals.views, percentDelta(currentTotals.views, previousTotals.views));
  setKpi("perfKpiClicks", currentTotals.clicks, percentDelta(currentTotals.clicks, previousTotals.clicks));
  setKpi("perfKpiCopies", currentTotals.copies, percentDelta(currentTotals.copies, previousTotals.copies));
  const ctr = currentTotals.views ? currentTotals.clicks / currentTotals.views * 100 : 0;
  const priorCtr = previousTotals.views ? previousTotals.clicks / previousTotals.views * 100 : 0;
  setKpi("perfKpiCtr", `${ctr.toFixed(1)}%`, previousTotals.views ? `${(ctr - priorCtr).toFixed(1)} pp` : "");
  if ($("perfRangeLabel")) $("perfRangeLabel").textContent = String(range);
  if ($("perfBoardName")) $("perfBoardName").textContent = state.SLUG || "Current site";

  renderChart(days, hasTraffic);
  renderActivity(hasTraffic ? days : []);
  if (hasTraffic) loadHeatmap();
  showTab(document.querySelector('[data-perf-tab][aria-current="page"]')?.dataset?.perfTab || "activity");
}

function percentDelta(current, previous) {
  return previous ? `${(((current - previous) / previous) * 100).toFixed(1)}%` : "";
}

function setKpi(id, value, change) {
  const valueNode = $(id);
  if (valueNode) valueNode.textContent = value >= 10000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k` : id === "perfKpiCtr" ? value : String(value);
  const deltaNode = $(`${id}Delta`);
  if (deltaNode) {
    deltaNode.textContent = change;
    deltaNode.classList.toggle("v3-delta--down", change.startsWith("-"));
  }
}

function renderChart(days, hasTraffic) {
  const host = $("statBars");
  if (!host) return;
  const empty = $("statsEmpty");
  const totalWrap = document.querySelector(".v3-chart-total");
  host.hidden = !hasTraffic;
  if (totalWrap) totalWrap.hidden = !hasTraffic;

  if (!hasTraffic) {
    host.innerHTML = "";
    if ($("perfTotalViews")) setMetricValue($("perfTotalViews"), "0");
    clearLoadError(empty, false);
    renderEmpty(empty, {
      icon: "chart",
      title: "No traffic yet",
      body: "Share your public page first. Analytics will fill in after people start visiting.",
      actions: [{ label: "Share your site", href: "/dashboard/leaderboard/share", accent: true }],
    });
    return;
  }

  const width = 720;
  const height = 220;
  const values = days.map((day) => Number(day.views) || 0);
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * width},${height - 25 - value / max * 170}`).join(" ");
  const labels = days.map((day, index) => index % Math.max(1, Math.ceil(days.length / 7)) || !day.day ? "" : `<text x="${(index / Math.max(1, days.length - 1)) * width}" y="214">${day.day.slice(5)}</text>`).join("");
  host.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily views over time"><g class="v3-chart-grid">${[20, 75, 130, 185].map((y) => `<line x1="0" x2="${width}" y1="${y}" y2="${y}"/>`).join("")}</g><polyline points="${points}" fill="none"/>${labels}</svg>`;
  if ($("perfTotalViews")) setMetricValue($("perfTotalViews"), String(values.reduce((sum, value) => sum + value, 0)));
  clearLoadError(empty, false);
}

function renderActivity(days) {
  const body = $("perfActivityBody");
  if (!body) return;
  body.removeAttribute("aria-busy");
  body.innerHTML = [...days].reverse().map((day) => {
    const views = Number(day.views) || 0;
    const clicks = Number(day.clicks) || 0;
    return `<tr><td>${day.day || ""}</td><td class="num">${views}</td><td class="num">${clicks}</td><td class="num">${Number(day.copies) || 0}</td><td class="num">${views ? (clicks / views * 100).toFixed(1) : "0.0"}%</td></tr>`;
  }).join("");
}

async function loadHeatmap() {
  const wrap = $("perf-heatmap");
  if (!wrap || wrap._loading) return;
  wrap._loading = true;
  setState({ HEATMAP_STATUS: "loading" });
  const grid = $("perfHeatmapGrid");
  if (grid) {
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = '<span class="skeleton v3-skel-heatmap" aria-hidden="true"></span>';
  }
  try {
    const query = state.ACTIVE_SITE_ID ? `?siteId=${encodeURIComponent(state.ACTIVE_SITE_ID)}` : "";
    const response = await fetch(`/api/site/stats/heatmap${query}`);
    const body = await response.json();
    if (!response.ok || !body.ok) throw new Error(body.error || "heatmap failed");
    renderHeatmap(body.heatmap || []);
    renderReferrers(body.referrers || []);
    setState({ HEATMAP_STATUS: "ready" });
  } catch (error) {
    setState({ HEATMAP_STATUS: "error" });
    logError("load-heatmap", error);
    if (grid) {
      grid.removeAttribute("aria-busy");
      renderError(grid, { title: "Couldn't load your activity map.", retry: loadHeatmap });
    }
    showLoadError($("perfReferrersEmpty"), "your traffic sources", loadHeatmap);
  } finally {
    wrap._loading = false;
  }
}

function renderHeatmap(matrix) {
  const grid = $("perfHeatmapGrid");
  if (!grid) return;
  const values = matrix.flat().map((value) => Number(value) || 0);
  if (values.reduce((sum, value) => sum + value, 0) === 0) {
    renderEmpty(grid, { icon: "chart", title: "No hourly activity yet", body: "Views by day and hour will appear here once your site gets traffic." });
    return;
  }
  let html = '<div class="heatmap-corner"></div>';
  for (let hour = 0; hour < 24; hour++) html += hour % 3 === 0 ? `<div class="heatmap-hlabel">${hour}</div>` : "<div></div>";
  for (let day = 0; day < 7; day++) {
    html += `<div class="heatmap-dlabel">${DOW[day]}</div>`;
    for (let hour = 0; hour < 24; hour++) html += `<div class="heatmap-cell" title="${DOW[day]} ${hour}:00 UTC — ${Number(matrix[day]?.[hour]) || 0} views"></div>`;
  }
  grid.innerHTML = html;
  grid.removeAttribute("aria-busy");
}

function renderReferrers(referrers) {
  const body = $("perfReferrersBody");
  if (!body) return;
  body.removeAttribute("aria-busy");
  body.innerHTML = referrers.map((row) => `<tr><td>${esc(row.domain || "Direct / unknown")}</td><td class="num">${Number(row.count) || 0}</td></tr>`).join("");
  if (referrers.length) {
    clearLoadError($("perfReferrersEmpty"), false);
    return;
  }
  const empty = $("perfReferrersEmpty");
  clearLoadError(empty, false);
  renderEmpty(empty, { icon: "link", title: "No traffic sources yet", body: "Share your site first. Sources will appear here when browsers report where visitors came from." });
}

export function renderPerformanceLoading() {
  const kpis = document.querySelector(".v3-analytics-page .v3-kpi-grid");
  if (kpis) kpis.hidden = false;
  ["perfKpiViews", "perfKpiClicks", "perfKpiCopies", "perfKpiCtr", "perfTotalViews"].forEach((id) => setMetricLoading($(id)));
  setRowsLoading($("perfActivityBody"), { cols: 5, rows: 4 });
}
