// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, localTzLabel, logError, copyToClipboard, flashButton } from "./utils.js";
import { state, boardStatus } from "./state.js";
import { navTo } from "./shell.js";

// Activity chart: the CSS bar chart (renderOverviewSummary's stat-bars, fed by
// loadStats in site.js) is the single activity visualization. The Plotly CDN
// chart that used to render here was removed — the page CSP blocks the CDN, so
// it never loaded and the container sat empty.

function fmtDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " " + localTzLabel();
  } catch { return ""; }
}

function isBoardSetup() {
  const steps = computeSetupSteps();
  return Object.values(steps).every(Boolean);
}

function computeSetupSteps() {
  const o = state.ONBOARDING || {};
  const brand = Boolean($("f_name")?.value.trim() || o.brand);
  const players = currentPlayers().length > 0 || o.players;
  const kick = false; // reserved until credits channel state is wired
  const configure = false; // reserved until branding is confirmed
  const status = boardStatus();
  const publish = status.published;
  return { brand, players, kick, configure, publish };
}

function setStepDone(el, done) {
  if (!el) return;
  el.classList.toggle("is-done", done);
  el.textContent = done ? "✓" : el.dataset.num || el.textContent;
}

function setSetupStatus(el, done) {
  if (!el) return;
  const mark = el.parentElement?.querySelector(".ov-step-icon");
  if (mark) setStepDone(mark, done);
  el.classList.toggle("is-done", done);
  el.textContent = done ? "COMPLETED" : "TODO";
}

async function copyLiveLink(btn) {
  const ok = await copyToClipboard(location.origin + "/" + state.SLUG);
  flashButton(btn, ok ? "Copied!" : "Copy failed");
}

export function wireOverviewQuickActions() {
  const copyBtn = $("ov_copyLink");
  if (copyBtn && !copyBtn._wired) {
    copyBtn._wired = true;
    copyBtn.addEventListener("click", () => copyLiveLink(copyBtn));
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
    // Board status card
    const statusDot = $("ovStatusDot");
    const statusText = $("ovStatusText");
    const statusSub = $("ovStatusSub");
    const status = boardStatus();
    if (statusDot && statusText) {
      statusDot.className = "board-status-dot " + (status.live ? "is-live" : "is-draft");
      statusText.textContent = status.live ? "Published" : (status.published ? "Not live yet" : "Draft");
      if (statusSub) {
        const parts = [];
        if (state.SITE_UPDATED_AT) parts.push("Last saved " + fmtDateTime(state.SITE_UPDATED_AT));
        if (status.published && state.PUBLISHED_AT) parts.push("Published " + fmtDateTime(state.PUBLISHED_AT));
        let lead = "Not visible to visitors yet";
        if (status.live) lead = "Live at /" + (state.SLUG || "—");
        else if (status.published) lead = "Confirm your email to make it visible";
        statusSub.textContent = parts.length ? lead + " · " + parts.join(" · ") : lead;
      }
    }
    // Empty vs active home state
    const onboardBento = $("ovOnboardingBento");
    const activeBento = $("ovActiveBento");
    if (onboardBento && activeBento) {
      const done = isBoardSetup();
      onboardBento.hidden = done;
      activeBento.hidden = !done;
    }
    // Setup progress
    const steps = computeSetupSteps();
    const stepOrder = ["brand", "players", "kick", "configure", "publish"];
    const completed = stepOrder.filter((k) => steps[k]).length;
    const countEl = $("ovSetupCount");
    const fillEl = $("ovSetupFill");
    if (countEl) countEl.textContent = `${completed} of 5 complete`;
    if (fillEl) fillEl.style.width = `${(completed / 5) * 100}%`;
    setSetupStatus($("ovStepBrandStatus"), steps.brand);
    setSetupStatus($("ovStepPlayersStatus"), steps.players);
    setSetupStatus($("ovStepKickStatus"), steps.kick);
    setSetupStatus($("ovStepConfigureStatus"), steps.configure);
    setSetupStatus($("ovStepPublishStatus"), steps.publish);
    const copyBtn = $("ov_copyLink");
    if (copyBtn) copyBtn.disabled = !status.live;
  }
