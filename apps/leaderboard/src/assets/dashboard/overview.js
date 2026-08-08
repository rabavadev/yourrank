// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, logError } from "./utils.js";
import { state } from "./state.js";

// Activity chart: the CSS bar chart (renderOverviewSummary's stat-bars, fed by
// loadStats in site.js) is the single activity visualization. The Plotly CDN
// chart that used to render here was removed — the page CSP blocks the CDN, so
// it never loaded and the container sat empty.

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
