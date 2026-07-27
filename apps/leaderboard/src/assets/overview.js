/* Overview page — board stats, activity chart, top players. */
const $ = (s) => document.getElementById(s);
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n || 0); }
function fmtMoney(s) { return s || "$0"; }

(async function load() {
  let me;
  try { me = await (await fetch("/api/auth/me")).json(); } catch { me = null; }
  if (!me || !me.ok || !me.user) { location.href = "/login"; return; }
  const user = me.user;

  // Plan badge in sidebar
  const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency" };
  const plan = user.plan || "free";
  if ($("ovPlanBadge")) $("ovPlanBadge").textContent = plan.toUpperCase() + " PLAN";
  if ($("ovPlanName")) $("ovPlanName").textContent = planNames[plan] || plan;
  if ($("ovPlanName2")) $("ovPlanName2").textContent = planNames[plan] || plan;
  if ($("ovPlanMeta")) $("ovPlanMeta").textContent = `Up to ${user.limits?.players ?? 10} players`;

  // Load site data
  let p;
  try { p = await (await fetch("/api/site")).json(); } catch { p = null; }
  if (!p || !p.ok) { if ($("ovLoading")) $("ovLoading").textContent = "Couldn't load your board."; return; }

  const slug = p.slug;
  const d = p.data || {};
  const b = d.brand || {};
  const players = (d.players || []).slice().sort((a, c) => (c.wagered || 0) - (a.wagered || 0));

  // Sidebar
  if ($("ovBoardName")) $("ovBoardName").textContent = b.name || slug;
  if ($("ovBoardSlug")) $("ovBoardSlug").textContent = "/" + slug;
  if ($("ovViewLive")) $("ovViewLive").href = "/" + slug;
  if ($("ovLiveLink")) $("ovLiveLink").textContent = location.host + "/" + slug;
  const published = p.published !== false;
  if ($("ovPubText")) $("ovPubText").textContent = published ? "Published" : "Unpublished";

  // Stat cards
  if ($("ovBoardNameStat")) $("ovBoardNameStat").textContent = (b.name || slug).slice(0, 16);
  if ($("ovPool")) $("ovPool").textContent = fmtMoney(b.prizePool);
  if ($("ovPlayers")) $("ovPlayers").textContent = fmt(players.length);

  // Resets countdown
  if (d.endsAt) {
    const ms = new Date(d.endsAt).getTime() - Date.now();
    if (ms > 0) {
      const days = Math.floor(ms / 86400000);
      const hrs = Math.floor((ms % 86400000) / 3600000);
      if ($("ovResets")) $("ovResets").textContent = days + "d " + hrs + "h";
      if ($("ovResetStatus")) $("ovResetStatus").textContent = days + "d " + hrs + "h";
    } else {
      if ($("ovResets")) $("ovResets").textContent = "Overdue";
      if ($("ovResetStatus")) $("ovResetStatus").textContent = "Overdue";
    }
  } else {
    if ($("ovResets")) $("ovResets").textContent = "—";
    if ($("ovResetStatus")) $("ovResetStatus").textContent = "Not set";
  }

  // Status panel
  if ($("ovPubStatus")) $("ovPubStatus").textContent = published ? "Yes" : "No";
  if ($("ovPlayerStatus")) $("ovPlayerStatus").textContent = String(players.length);

  // Top players
  const topBody = $("ovTopPlayers");
  if (topBody) {
    const top5 = players.slice(0, 5);
    if (top5.length === 0) {
      if ($("ovTopEmpty")) $("ovTopEmpty").hidden = false;
    } else {
      topBody.innerHTML = top5.map((pl, i) => {
        const wager = "$" + Number(pl.wagered || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
        return `<tr><td class="rank">${String(i + 1).padStart(2, "0")}</td><td>${esc(pl.name)}</td><td class="num ta-r" style="font-family:var(--mono)">${wager}</td></tr>`;
      }).join("");
    }
  }

  // Show the page
  if ($("ovLoading")) $("ovLoading").hidden = true;
  if ($("ovDash")) $("ovDash").hidden = false;

  // Load stats (bar chart + 7d views) — non-blocking
  loadStats();
})();

async function loadStats() {
  let s;
  try { const r = await fetch("/api/site/stats"); const d = await r.json(); if (!r.ok || !d.ok) return; s = d.stats; } catch { return; }
  if ($("st_views7")) $("st_views7").textContent = fmt(s.last7.views);
  if ($("st_views30")) $("st_views30").textContent = fmt(s.last30.views);
  if ($("st_copies30")) $("st_copies30").textContent = fmt(s.last30.copies);
  if ($("st_clicks30")) $("st_clicks30").textContent = fmt(s.last30.clicks);

  const bars = $("statBars");
  if (bars) {
    const days = s.days || [];
    const max = Math.max(1, ...days.map((x) => x.views));
    bars.innerHTML = days.map((x) => {
      const h = Math.max(2, Math.round((x.views / max) * 100));
      const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
      return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views"></div>`;
    }).join("");
    if (days.length && $("statFrom")) $("statFrom").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
  }

  if (s.last30.views === 0 && s.last30.copies === 0 && s.last30.clicks === 0) {
    if ($("statsEmpty")) $("statsEmpty").hidden = false;
  }
}
