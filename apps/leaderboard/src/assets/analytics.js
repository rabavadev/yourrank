/* Analytics page — funnel-first redesign. Loads stats, renders engagement
   funnel, primary metric with real 7d-vs-prior-7d delta, SVG sparkline + daily
   views chart, top referrers, activity heatmap, and CSV export. */
const $ = (s) => document.getElementById(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }
function pct(part, whole) { return whole > 0 ? (part / whole) * 100 : 0; }
function pctStr(v) { return (v >= 10 || v === 0 ? Math.round(v) : v.toFixed(1)) + "%"; }

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const urlParams = new URLSearchParams(location.search);
const boardId = urlParams.get("board");
const siteIdParam = boardId ? "?siteId=" + encodeURIComponent(boardId) : "";

/* --- SVG line/area chart (dependency-free) --- */
function svgLine(values, w, h, id) {
  const n = values.length;
  const pad = 6;
  if (n < 2) return "";
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const x = (i) => (i / (n - 1)) * w;
  const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
  const pts = values.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`);
  const line = "M" + pts.join(" L");
  const area = `M0,${h} L` + pts.join(" L") + ` L${w},${h} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="height:${h}px" role="img" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity="0.22"/>
      <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function renderFunnel(v, c, k) {
  $("fViews").textContent = fmt(v);
  $("fCopies").textContent = fmt(c);
  $("fClicks").textContent = fmt(k);
  $("fCopiesPct").textContent = pctStr(pct(c, v));
  $("fClicksPct").textContent = pctStr(pct(k, c)); // conversion from previous stage
  // Bar widths eased so small stages stay legible; exact figures shown as text.
  const ease = (part, whole) => Math.round(Math.pow(pct(part, whole) / 100, 0.55) * 100);
  const setBar = (el, w) => {
    if (prefersReduced) { el.style.width = w + "%"; return; }
    el.style.transform = "scaleX(0)";
    requestAnimationFrame(() => { el.style.width = w + "%"; el.style.transform = "scaleX(1)"; });
  };
  setBar($("fCopiesBar"), ease(c, v));
  setBar($("fClicksBar"), ease(k, v));
  $("dropCopies").innerHTML = `↓ <b>${pctStr(100 - pct(c, v))}</b> left without copying your code`;
  $("dropClicks").innerHTML = c > 0
    ? `↓ <b>${pctStr(100 - pct(k, c))}</b> copied but didn't click Join`
    : "";
}

function renderDelta(days) {
  const row = $("pmDeltaRow");
  if (!days || days.length < 14) { row.textContent = ""; return; }
  const last7 = days.slice(-7).reduce((a, d) => a + d.clicks, 0);
  const prev7 = days.slice(-14, -7).reduce((a, d) => a + d.clicks, 0);
  if (prev7 === 0 && last7 === 0) { row.textContent = ""; return; }
  if (prev7 === 0) {
    row.innerHTML = `<span class="an-delta up">▲ new</span> ${last7} Join clicks in the last 7d`;
    return;
  }
  const d = ((last7 - prev7) / prev7) * 100;
  const cls = d > 0.5 ? "up" : d < -0.5 ? "down" : "flat";
  const arrow = d > 0.5 ? "▲" : d < -0.5 ? "▼" : "▪";
  row.innerHTML = `<span class="an-delta ${cls}">${arrow} ${pctStr(Math.abs(d))}</span> vs prev 7d (${prev7})`;
}

(async function load() {
  try {
    const r = await fetch("/api/site" + siteIdParam);
    const d = await r.json();
    if (r.ok && d.ok && d.slug) {
      const live = $("liveLink");
      live.href = "/" + d.slug;
      live.textContent = "yourrank.site/" + d.slug;
      const ev = $("emptyView"); if (ev) ev.href = "/" + d.slug;
      const eb = $("anEyebrow"); if (eb) eb.textContent = "/" + d.slug;
    }
  } catch { /* stats load anyway */ }

  let s;
  try {
    const r = await fetch("/api/site/stats" + siteIdParam);
    const d = await r.json();
    if (!r.ok || !d.ok) { $("loading").hidden = true; return; }
    s = d.stats;
  } catch {
    $("loading").innerHTML = '<p class="an-note">Couldn\'t load analytics right now — refresh.</p>';
    return;
  }

  const v30 = s.last30.views, c30 = s.last30.copies, k30 = s.last30.clicks;

  // Empty state: nothing tracked yet.
  if (v30 === 0 && c30 === 0 && k30 === 0) {
    $("loading").hidden = true;
    $("empty").hidden = false;
    return;
  }

  renderFunnel(v30, c30, k30);
  $("pmBig").textContent = fmt(k30);
  $("pmViews30").textContent = fmt(v30);
  $("pmCopies30").textContent = fmt(c30);
  $("pmViewsToday").textContent = fmt(s.today.views);

  const days = s.days || [];
  renderDelta(days);

  // Sparkline: daily join clicks. Trend: daily views.
  if (days.length >= 2) {
    $("sparkWrap").innerHTML = svgLine(days.map((d) => d.clicks), 300, 44, "anSpark");
    $("trendWrap").innerHTML = svgLine(days.map((d) => d.views), 600, 230, "anTrend");
  } else {
    $("trendWrap").hidden = true;
    $("trendEmpty").hidden = false;
  }

  $("loading").hidden = true;
  $("an").hidden = false;

  loadHeatmapAndReferrers();

  const exportBtn = $("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      exportBtn.disabled = true;
      const status = $("exportStatus");
      status.textContent = "Preparing export...";
      try {
        const r = await fetch("/api/site/stats/export" + siteIdParam, { credentials: "include" });
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
    const r = await fetch("/api/site/stats/heatmap" + siteIdParam);
    const d = await r.json();
    if (!r.ok || !d.ok) return;
    renderHeatmap(d.heatmap);
    renderReferrers(d.referrers);
  } catch { /* fetch error */ }
}

function renderHeatmap(grid) {
  const wrap = $("heatWrap");
  if (!grid || !grid.length) { wrap.innerHTML = '<div class="an-note">No data yet.</div>'; return; }
  let maxVal = 0;
  for (const row of grid) for (const val of row) if (val > maxVal) maxVal = val;

  let html = '<div class="an-heat"><div></div>';
  for (let h = 0; h < 24; h++) html += `<div class="hh">${h % 3 === 0 ? (h < 10 ? "0" + h : h) : ""}</div>`;
  for (let d = 0; d < 7; d++) {
    html += `<div class="hd">${DAYS_SHORT[d]}</div>`;
    for (let h = 0; h < 24; h++) {
      const val = grid[d][h];
      const intensity = maxVal > 0 ? val / maxVal : 0;
      const bg = val === 0 ? "var(--an-heat-0)" : `rgba(200,255,0,${(0.12 + intensity * 0.88).toFixed(2)})`;
      html += `<div class="hc" style="background:${bg}" title="${DAYS_SHORT[d]} ${h}:00 UTC — ${val} views"></div>`;
    }
  }
  html += "</div>";
  wrap.innerHTML = html;
}

function renderReferrers(refs) {
  const list = $("refList");
  const empty = $("refEmpty");
  if (!refs || refs.length === 0) {
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  const total = refs.reduce((a, r) => a + r.count, 0);
  const max = Math.max(1, ...refs.map((r) => r.count));
  list.innerHTML = refs.map((r) => {
    const w = Math.round((r.count / max) * 100);
    const share = pctStr(pct(r.count, total));
    return `<div class="an-srow"><div class="an-sr-top"><span class="an-sr-name">${esc(r.domain)}</span><span class="an-sr-v">${fmt(r.count)} · ${share}</span></div><div class="an-sr-track"><i style="width:${w}%"></i></div></div>`;
  }).join("");
}

document.getElementById("logout")?.addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
  location.href = "/login";
});
