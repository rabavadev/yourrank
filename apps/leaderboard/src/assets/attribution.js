/* Attribution dashboard — clicks, conversions, and revenue per offer. */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => (n == null ? "$0.00" : `$${Number(n).toFixed(2)}`);
const fmt = (n) => (n == null ? "0" : Number(n).toLocaleString());

function getCsrf() { const m = document.cookie.match(/(?:^|;\s*)__csrf=([^;]+)/); return m ? m[1] : ""; }

async function api(path, opts) {
  const res = await fetch(path, { ...opts, credentials: "include" });
  const d = await res.json().catch(() => ({}));
  if (res.status === 401) { location.href = "/login"; throw new Error("auth"); }
  if (!res.ok) { throw new Error(d.error || `HTTP ${res.status}`); }
  return d;
}

async function load() {
  const days = $("daysRange").value;
  try {
    const data = await api(`/api/attribution?days=${days}`);
    $("s_clicks").textContent = fmt(data.summary?.clicks);
    $("s_unique").textContent = fmt(data.summary?.uniqueVisitors);
    $("s_conversions").textContent = fmt(data.summary?.conversions);
    $("s_revenue").textContent = money(data.summary?.revenue);
    $("s_depositors").textContent = fmt(data.summary?.depositors);

    $("offersEmpty").hidden = data.offers?.length > 0;
    $("offersBody").innerHTML = (data.offers || []).map((o) =>
      `<tr>
        <td>${esc(o.label)}</td>
        <td>${esc(o.casino)}</td>
        <td class="ta-r">${fmt(o.clicks)}</td>
        <td class="ta-r">${fmt(o.uniqueVisitors)}</td>
        <td class="ta-r">${fmt(o.conversions)}</td>
        <td class="ta-r">${money(o.revenue)}</td>
        <td class="ta-r">${fmt(o.depositors)}</td>
      </tr>`
    ).join("");

    if (data.postbackUrl) {
      $("postbackUrl").textContent = data.postbackUrl;
      $("postbackCard").hidden = false;
      $("postbackUpgrade").hidden = true;
    } else {
      $("postbackCard").hidden = true;
      $("postbackUpgrade").hidden = false;
    }
    $("exportBtn").href = `/api/attribution/export?days=${days}`;
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

$("loading").hidden = true;
$("panel").hidden = false;
load();
