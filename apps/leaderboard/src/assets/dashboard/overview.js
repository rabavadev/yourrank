// Overview page summary tiles / top players / setup checklist.
import { $, esc, fmtMoney, currentPlayers, resetsIn, logError, copyToClipboard, flashButton } from "./utils.js";
import { state } from "./state.js";
import { navTo } from "./shell.js";

// Activity chart: the CSS bar chart (renderOverviewSummary's stat-bars, fed by
// loadStats in site.js) is the single activity visualization. The Plotly CDN
// chart that used to render here was removed — the page CSP blocks the CDN, so
// it never loaded and the container sat empty.

function fmtDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function isBoardSetup() {
  const o = state.ONBOARDING || {};
  const brand = $("f_name")?.value.trim() || o.brand;
  const players = currentPlayers();
  const published = state.PUBLISHED;
  return !!(brand && (o.players || players.length > 0) && (o.shared || published));
}

function setStepDone(el, done) {
  if (!el) return;
  el.classList.toggle("is-done", done);
  el.textContent = done ? "✓" : el.dataset.num || el.textContent;
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
  const startBtn = $("ovStartBtn");
  if (startBtn && !startBtn._wired) {
    startBtn._wired = true;
    startBtn.addEventListener("click", () => navTo("board"));
  }
  ["ovStepBrandBtn", "ovStepPlayersBtn"].forEach((id) => {
    const btn = $(id);
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener("click", () => navTo("board"));
    }
  });
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
    if (statusDot && statusText) {
      const published = state.PUBLISHED;
      statusDot.className = "board-status-dot " + (published ? "is-live" : "is-draft");
      statusText.textContent = published ? "Published" : "Draft";
      if (statusSub) {
        const parts = [];
        if (state.SITE_UPDATED_AT) parts.push("Last saved " + fmtDateTime(state.SITE_UPDATED_AT));
        if (published && state.PUBLISHED_AT) parts.push("Published " + fmtDateTime(state.PUBLISHED_AT));
        statusSub.textContent = parts.length
          ? (published ? "Live at /" + (state.SLUG || "—") + " · " : "Not visible yet · ") + parts.join(" · ")
          : (published ? "Your leaderboard is live at " + (state.SLUG || "—") : "Not visible to visitors yet");
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
    const brandDone = !!$("f_name")?.value.trim() || state.ONBOARDING?.brand;
    const playersDone = players.length > 0 || state.ONBOARDING?.players;
    const shareDone = state.PUBLISHED || state.ONBOARDING?.shared;
    setStepDone($("ovStepBrand"), brandDone);
    setStepDone($("ovStepBrandMark"), brandDone);
    setStepDone($("ovStepPlayers"), playersDone);
    setStepDone($("ovStepPlayersMark"), playersDone);
    setStepDone($("ovStepShare"), shareDone);
    setStepDone($("ovStepShareMark"), shareDone);
    const shareHint = $("ovShareHint");
    if (shareHint) shareHint.textContent = state.PUBLISHED ? "Your leaderboard is live — copy the link" : "Publish and copy your public link";
    const copyBtn = $("ov_copyLink");
    if (copyBtn) copyBtn.disabled = !state.PUBLISHED;
  }
