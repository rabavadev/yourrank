/* Analytics page — load stats + render the bar chart. Mirrors the dashboard's
 * loadStats() so the bars look identical. Stats only keep the last 30 days, so
 * the "Today" card uses getStats().today and the bars are last-14-days views. */
const $ = (s) => document.getElementById(s);

function fmt(n) { return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n); }

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
  } catch {}

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

  const bars = $("bars");
  const days = s.days || [];
  const max = Math.max(1, ...days.map((x) => x.views));
  bars.innerHTML = days
    .map((x) => {
      const h = Math.max(2, Math.round((x.views / max) * 100));
      const nice = new Date(x.day + "T00:00:00Z").toUTCString().slice(5, 11);
      return `<div class="stat-bar" style="height:${h}%" title="${nice}: ${x.views} views, ${x.copies} copies, ${x.clicks} clicks"></div>`;
    })
    .join("");
  if (days.length) $("from").textContent = new Date(days[0].day + "T00:00:00Z").toUTCString().slice(5, 11);
  if (s.last30.views === 0 && s.last30.copies === 0 && s.last30.clicks === 0) $("empty").hidden = false;

  $("loading").hidden = true;
  $("an").hidden = false;
})();
