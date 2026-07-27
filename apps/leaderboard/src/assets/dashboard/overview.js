// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, logError } from "./utils.js";
import { state } from "./state.js";

// Plotly chart: render activity chart from stats data (loaded lazily)
function renderPlotlyChart(stats) {
  const el = $("ov_plotly");
  if (!el || !stats?.days?.length) { if (el) el.innerHTML = '<p class="hint" style="padding:20px;text-align:center">No activity data yet.</p>'; return; }
  // Try to use Plotly if available (CDN loaded), otherwise show a subtle fallback
  if (typeof window.Plotly === "undefined") {
    // Dynamic load Plotly from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.plot.ly/plotly-2.35.0.min.js";
    script.onload = () => _doPlotlyRender(el, stats);
    script.onerror = () => { el.innerHTML = ""; }; // graceful fallback: the stat-bars already show
    document.head.appendChild(script);
  } else {
    _doPlotlyRender(el, stats);
  }
}

function _doPlotlyRender(el, stats) {
  const days = stats.days || [];
  if (!days.length || typeof window.Plotly === "undefined") return;
  const x = days.map(d => d.day);
  const views = { x, y: days.map(d => d.views), name: "Views", type: "scatter", mode: "lines+markers", line: { color: "#c8f135", width: 2 }, marker: { size: 5, color: "#c8f135" }, fill: "tozeroy", fillcolor: "rgba(200,241,53,0.08)" };
  const copies = { x, y: days.map(d => d.copies), name: "Copies", type: "scatter", mode: "lines+markers", line: { color: "#7b8cff", width: 2 }, marker: { size: 4, color: "#7b8cff" } };
  const clicks = { x, y: days.map(d => d.clicks), name: "Clicks", type: "scatter", mode: "lines+markers", line: { color: "#3ccf4a", width: 2 }, marker: { size: 4, color: "#3ccf4a" } };
  const layout = {
    paper_bgcolor: "transparent", plot_bgcolor: "transparent",
    margin: { t: 10, r: 20, b: 40, l: 50 },
    xaxis: { color: "#9a9aa2", gridcolor: "#2a2a2a", linecolor: "#2a2a2a", tickfont: { family: "JetBrains Mono, monospace", size: 10 } },
    yaxis: { color: "#9a9aa2", gridcolor: "#2a2a2a", linecolor: "#2a2a2a", tickfont: { family: "JetBrains Mono, monospace", size: 10 } },
    legend: { orientation: "h", y: -0.18, x: 0.5, xanchor: "center", font: { color: "#a3a3ab", size: 11 } },
    font: { family: "Inter, system-ui, sans-serif" },
    hovermode: "x unified",
    showlegend: true,
  };
  const config = { displayModeBar: false, responsive: true };
  window.Plotly.newPlot(el, [views, copies, clicks], layout, config);
}

async function copyLiveLink(triggerLabel, url) {
  try {
    await navigator.clipboard.writeText(url);
    const prev = triggerLabel?.textContent;
    if (triggerLabel) triggerLabel.textContent = "Copied!";
    setTimeout(() => { if (triggerLabel) triggerLabel.textContent = prev; }, 1500);
  } catch (err) { logError("copy-live-link", err); }
}

export function wireOverviewQuickActions() {
  const qaBtn = $("ov_copyLink");
  if (qaBtn && !qaBtn._wired) {
    qaBtn._wired = true;
    const label = qaBtn.querySelector(".lb-qa-t");
    qaBtn.addEventListener("click", () => copyLiveLink(label, location.origin + "/" + state.SLUG));
  }
  const headerBtn = $("overviewCopyLink");
  if (headerBtn && !headerBtn._wired) {
    headerBtn._wired = true;
    const label = headerBtn.childNodes[0];
    headerBtn.addEventListener("click", () => copyLiveLink(label, location.origin + "/" + state.SLUG));
  }
}

export function renderOverviewSummary() {
    if (!$("ov_prize")) return;
    const players = currentPlayers();
    const boardName = $("f_name")?.value.trim() || "—";
    $("ov_board").textContent = boardName;
    const rawPrize = ($("f_pool")?.value || "").replace(/[^0-9.]/g, "");
    $("ov_prize").textContent = rawPrize ? "$" + fmtMoney(Number(rawPrize)) : "—";
    const cap = state.ME && state.ME.limits.players < 999 ? " / " + state.ME.limits.players : "";
    $("ov_players").textContent = players.length + cap;
    $("ov_resets").textContent = resetsIn();
    const top = $("ov_top");
    const topEmpty = $("ov_topEmpty");
    if (top) {
      const sorted = [...players].sort((a, b) => b.wagered - a.wagered).slice(0, 5);
      top.innerHTML = sorted.map((p, i) => `<div class="lb-toprow"><span class="lb-tr-rank">${String(i + 1).padStart(2, "0")}</span><div><div class="lb-tr-name">${esc(p.name)}</div><div class="lb-tr-sub">$${fmtMoney(p.wagered)} wagered</div></div><span class="lb-tr-prize">${p.prize ? "$" + fmtMoney(p.prize) : "—"}</span></div>`).join("");
      top.hidden = sorted.length === 0;
      if (topEmpty) topEmpty.hidden = sorted.length > 0;
    }
    const o = state.ONBOARDING || {};
    const brandDone = o.brand || !!$("f_name")?.value.trim();
    const playersDone = o.players || players.length > 0;
    const sharedDone = o.shared || state.PUBLISHED;
    $("ov_step_brand")?.classList.toggle("is-done", brandDone);
    $("ov_step_players")?.classList.toggle("is-done", playersDone);
    $("ov_step_share")?.classList.toggle("is-done", sharedDone);
    $("ov_step_bot")?.classList.toggle("is-done", o.botConnected);
    $("ov_step_postback")?.classList.toggle("is-done", o.postback);
    $("ov_step_postback")?.classList.toggle("is-locked", o.isFree);

    const setupComplete = !!(brandDone && playersDone && sharedDone);
    const qa = $("ovQuickActions");
    const telegram = $("ovTelegramCard");
    const steps = $("ovSetupSteps");
    // Only one "finish setup" surface at a time: if the resume-wizard draft banner
    // is showing, keep the granular checklist hidden so we don't nag twice.
    const draftBannerActive = !$("draftBanner")?.hidden;
    if (qa) qa.hidden = setupComplete;
    if (telegram) telegram.hidden = setupComplete;
    if (steps) steps.hidden = setupComplete || draftBannerActive;

    // Board status card
    const statusDot = $("ovStatusDot");
    const statusText = $("ovStatusText");
    const statusSub = $("ovStatusSub");
    if (statusDot && statusText) {
      const published = state.PUBLISHED;
      statusDot.className = "board-status-dot " + (published ? "is-live" : "is-draft");
      statusText.textContent = published ? "Published" : "Draft";
      if (statusSub) statusSub.textContent = published
        ? "Your leaderboard is live at " + (state.SLUG || "—")
        : "Not visible to visitors yet";
    }

    // Plan progress bars
    const planName = $("ovPlanName");
    const planNames = { free: "Free", starter: "Starter", pro: "Pro", agency: "Agency", lifetime: "Lifetime Pro" };
    const lifetime = state.ME?.planExpiresAt && Number(state.ME.planExpiresAt) > new Date("2099-01-01T00:00:00Z").getTime();
    if (planName) planName.textContent = (lifetime ? "Lifetime Pro" : planNames[state.ME?.plan] || "Free") + " plan";

    const pBar = $("ovPlanPlayers");
    const pFill = $("ovPlanPlayersFill");
    const playerLimit = state.ME?.limits?.players || 10;
    if (pBar) pBar.textContent = players.length + " / " + playerLimit;
    if (pFill) {
      const pct = Math.min(100, Math.round((players.length / playerLimit) * 100));
      pFill.style.width = pct + "%";
      pFill.classList.toggle("ov-plan-fill--warn", pct > 80);
    }

    const bBar = $("ovPlanBoards");
    const bFill = $("ovPlanBoardsFill");
    const boardCount = (state.BOARDS || []).length;
    const boardLimit = state.ME?.limits?.boards || 1;
    if (bBar) bBar.textContent = boardCount + " / " + boardLimit;
    if (bFill) {
      const pct = Math.min(100, Math.round((boardCount / boardLimit) * 100));
      bFill.style.width = pct + "%";
      bFill.classList.toggle("ov-plan-fill--warn", pct > 80);
    }

    const upgradeBtn = $("ovPlanUpgrade");
    if (upgradeBtn) {
      const isMax = state.ME?.plan === "pro" || state.ME?.plan === "agency" || lifetime;
      upgradeBtn.hidden = isMax;
    }
  }

  // Called from the main dashboard when stats are loaded (from loadStats in site.js).
  export function renderOverviewPlotly(stats) {
    renderPlotlyChart(stats);
  }
