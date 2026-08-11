// Overview page summary tiles / top players / setup checklist.
import { $, esc, currentPlayers } from "./utils.js";
import { state, boardStatus } from "./state.js";

const ACTIVITY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="16" height="11" x="4" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

function isBoardSetup() {
  const steps = computeSetupSteps();
  return steps.brand && steps.players && steps.publish;
}

function computeSetupSteps() {
  const o = state.ONBOARDING || {};
  const brand = Boolean($("f_name")?.value.trim() || o.brand);
  const players = currentPlayers().length > 0 || o.players;
  const kick = Boolean(state.CREDITS?.channel?.externalId);
  const configure = false; // reserved until branding is confirmed
  const status = boardStatus();
  const publish = status.published;
  return { brand, players, kick, configure, publish };
}

function setStepDone(el, done) {
  if (!el) return;
  el.classList.toggle("is-done", done);
  el.textContent = done ? "✓" : "";
}

function setSetupStatus(el, done) {
  if (!el) return;
  const mark = el.parentElement?.querySelector(".ov-step-icon");
  if (mark) setStepDone(mark, done);
  el.classList.toggle("is-done", done);
  el.textContent = done ? "COMPLETED" : "TODO";
}

export function renderOverviewSummary() {
    if (!$("ovActiveBento")) return;
    const players = currentPlayers();
    const status = boardStatus();
    $("ovHeadSub").textContent = status.live ? "All systems operational" : "Complete setup to go live";
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
    const firstIncomplete = ["brand", "players", "kick", "configure", "publish"].find((key) => !steps[key]);
    if (firstIncomplete === "players") {
      $("ovStepPlayersStatus").innerHTML = '<a class="ov-setup-action" href="/dashboard/editor#players">Add players →</a>';
    }
    if (!steps.publish && firstIncomplete !== "publish") {
      $("ovStepPublishStatus").innerHTML = `<span class="ov-setup-lock" aria-label="Locked">${LOCK_ICON}</span>`;
    }
    const days = state.STATS?.days || [];
    const sum = (field, list = days) => list.reduce((total, day) => total + Number(day[field] || 0), 0);
    const number = (value) => Number(value || 0).toLocaleString("en-US");
    const delta = (field) => {
      const previous = sum(field, days.slice(0, 7));
      const recent = sum(field, days.slice(-7));
      return previous ? ((recent - previous) / previous) * 100 : (recent ? 100 : 0);
    };
    $("ovPendingRedemptions").textContent = number(state.CREDITS?.usage?.pendingRedemptions);
    $("ovViews14").textContent = number(sum("views"));
    $("ovCopies14").textContent = number(sum("copies"));
    const deltaMarkup = (value, previous, recent) => previous === 0 && recent === 0 ? "" : `<span class="v3-delta${value < 0 ? " v3-delta--down" : ""}" title="vs previous 7 days">${value >= 0 ? "+" : ""}${value.toFixed(1)}%</span>`;
    const viewPrevious = sum("views", days.slice(0, 7));
    const viewRecent = sum("views", days.slice(-7));
    const copyPrevious = sum("copies", days.slice(0, 7));
    const copyRecent = sum("copies", days.slice(-7));
    $("ovViewsDelta").innerHTML = deltaMarkup(delta("views"), viewPrevious, viewRecent);
    $("ovCopiesDelta").innerHTML = deltaMarkup(delta("copies"), copyPrevious, copyRecent);
    const relative = (iso) => {
      const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
      return minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
    };
    const activity = [
      ...(state.CREDITS?.redemptions || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: `${item.item_name || "Reward"} requested` })),
      ...(state.CREDITS?.viewers || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: "Joined via Kick sign-in" })),
      ...(state.PUBLISHED_AT ? [{ at: state.PUBLISHED_AT, title: "System", sub: "Board published live successfully" }] : []),
      ...(state.SITE_UPDATED_AT ? [{ at: state.SITE_UPDATED_AT, title: "System", sub: "Board settings saved" }] : []),
    ].filter((item) => item.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    $("ovActivityList").innerHTML = activity.map((item) => `<div class="ov-activity-row"><span class="ov-activity-icon">${ACTIVITY_ICON}</span><span class="ov-activity-copy"><b>${esc(item.title)}</b><span>${esc(item.sub)}</span></span><time>${relative(item.at)}</time></div>`).join("");
    $("ovActivityEmpty").hidden = activity.length > 0;
    const top = [...players].sort((a, b) => b.wagered - a.wagered).slice(0, 5);
    $("ovTopPlayers").innerHTML = top.map((player, i) => `<div class="ov-player-row"><span class="ov-player-rank">#${i + 1}</span><b>${esc(player.name)}</b><span>$${Number(player.wagered || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>`).join("");
    $("ov_topEmpty").hidden = top.length > 0;
    const kickConnected = Boolean(state.CREDITS?.channel?.externalId);
    $("ovPublishedStatus").textContent = status.published ? "Published" : "Draft";
    $("ovKickStatus").textContent = kickConnected ? "Kick Connected" : "Kick Not Connected";
    $("ovPublishedStatus").previousElementSibling.classList.toggle("is-on", status.published);
    $("ovKickStatus").previousElementSibling.classList.toggle("is-on", kickConnected);
    const playerLimit = state.ME?.limits?.players || 0;
    $("ovTrackedPlayers").innerHTML = `<span class="ov-tracked-count">${players.length} / ${playerLimit.toLocaleString("en-US")}</span> Players Tracked`;
    $("ovMetricsStatus").textContent = state.STATS ? `${String(state.ME?.plan || "free").toUpperCase()} PLAN METRICS OK` : "";
  }
