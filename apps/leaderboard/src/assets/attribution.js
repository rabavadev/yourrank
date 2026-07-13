/* Attribution dashboard — clicks, conversions, and revenue per offer. */
const $ = (id) => document.getElementById(id);
const money = (n) => (n == null ? "$0.00" : `$${Number(n).toFixed(2)}`);
const fmt = (n) => (n == null ? "0" : Number(n).toLocaleString());
const urlParams = new URLSearchParams(location.search);
const boardId = urlParams.get("board");
function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

async function api(path, opts) {
  const res = await fetch(path, { ...opts, credentials: "include" });
  const d = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("auth"); }
  if (!res.ok) { throw new Error(d.error || `HTTP ${res.status}`); }
  return d;
}

function td(text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) cell.className = className;
  return cell;
}

function getDays() {
  const raw = $("daysRange").value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 30;
}

async function load() {
  const days = getDays();
  try {
    const apiUrl = new URL("/api/attribution", location.origin);
    apiUrl.searchParams.set("days", String(days));
    if (boardId) apiUrl.searchParams.set("siteId", boardId);
    const data = await api(apiUrl.toString());

    $("s_clicks").textContent = fmt(data.summary?.clicks);
    $("s_unique").textContent = fmt(data.summary?.uniqueVisitors);
    $("s_conversions").textContent = fmt(data.summary?.conversions);
    $("s_revenue").textContent = money(data.summary?.revenue);
    $("s_depositors").textContent = fmt(data.summary?.depositors);

    const tbody = $("offersBody");
    tbody.textContent = "";
    const offers = data.offers || [];
    $("offersEmpty").hidden = offers.length > 0;
    for (const o of offers) {
      const tr = document.createElement("tr");
      tr.append(td(o.label || ""));
      tr.append(td(o.casino || ""));
      tr.append(td(fmt(o.clicks), "ta-r"));
      tr.append(td(fmt(o.uniqueVisitors), "ta-r"));
      tr.append(td(fmt(o.conversions), "ta-r"));
      tr.append(td(money(o.revenue), "ta-r"));
      tr.append(td(fmt(o.depositors), "ta-r"));
      tbody.append(tr);
    }

    if (data.postbackUrl) {
      $("postbackUrl").textContent = data.postbackUrl;
      $("postbackCard").hidden = false;
      $("postbackUpgrade").hidden = true;
    } else {
      $("postbackCard").hidden = true;
      $("postbackUpgrade").hidden = false;
    }

    const exportUrl = new URL("/api/attribution/export", location.origin);
    exportUrl.searchParams.set("days", String(days));
    if (boardId) exportUrl.searchParams.set("siteId", boardId);
    $("exportBtn").href = exportUrl.toString();
  } catch (e) {
    $("offersEmpty").hidden = false;
    $("offersEmpty").textContent = "Could not load attribution. " + e.message;
  }
}

$("daysRange").addEventListener("change", load);
$("copyPostback").addEventListener("click", async () => {
  const url = $("postbackUrl").textContent;
  try {
    await navigator.clipboard.writeText(url);
    $("copyPostback").textContent = "Copied";
    setTimeout(() => $("copyPostback").textContent = "Copy", 2000);
  } catch {
    prompt("Copy this URL:", url);
  }
});

document.getElementById("logout")?.addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { "x-csrf-token": getCsrf() } });
  location.href = "/login";
});

$("loading").hidden = true;
$("panel").hidden = false;
load();
