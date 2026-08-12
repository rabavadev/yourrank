// Overview page summary tiles / top players / setup checklist.
import { $, esc, currentPlayers } from "./utils.js";
import { state, boardStatus } from "./state.js";
import { renderEmpty, setMetricLoading, setMetricUnknown, setMetricValue } from "./states.js";

const ACTIVITY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const SETUP_STEPS = [
  { key: "brand", required: true, href: "/dashboard/editor#setup", action: "Set up" },
  { key: "players", required: true, href: "/dashboard/editor#players", action: "Add players" },
  { key: "kick", required: true, href: "/dashboard/rewards/channel", action: "Connect Kick" },
  { key: "configure", required: true, href: "/dashboard/editor#design", action: "Open Design" },
  { key: "publish", required: true, href: "/dashboard/editor#setup", action: "Publish / verify" },
];

function isBoardSetup() {
  const steps = computeSetupSteps();
  return SETUP_STEPS.every(({ key, required }) => !required || steps[key]);
}

function computeSetupSteps() {
  const o = state.ONBOARDING || {};
  // Keep this in lockstep with onboardingForSite: a board name alone is not
  // enough; the board also needs a sponsor/prize source or promo code.
  const name = $("f_name")?.value.trim();
  const casino = $("f_casino")?.value.trim();
  const code = $("f_code")?.value.trim();
  const brand = Boolean(o.brand || (name && (casino || code)));
  const players = currentPlayers().length > 0 || o.players;
  const kick = Boolean(state.CREDITS?.channel?.externalId);
  const branding = state.CURRENT_BRANDING || {};
  const hasSocial = (state.EXTRA?.socials || []).some((social) => social.enabled && social.url && social.url !== "#");
  const configure = Boolean(
    o.configure || o.design ||
    $("f_tagline")?.value.trim() || $("f_cta")?.value.trim() || $("f_blurb")?.value.trim() ||
    hasSocial || branding.accentA || branding.accentB || (branding.font && branding.font !== "Inter")
  );
  const status = boardStatus();
  const publish = status.live;
  return { brand, players, kick, configure, publish };
}

function setStepDone(el, done) {
  if (!el) return;
  el.classList.toggle("is-done", done);
  el.textContent = done ? "✓" : "";
}

function setSetupStatus(el, done, step) {
  if (!el) return;
  const mark = el.parentElement?.querySelector(".ov-step-icon");
  if (mark) setStepDone(mark, done);
  el.classList.toggle("is-done", done);
  if (done) {
    el.textContent = "COMPLETED";
    el.removeAttribute("aria-label");
    return;
  }
  const label = step?.action || "Continue";
  el.innerHTML = `<a class="ov-setup-action" href="${step?.href || "#"}">${label} →</a>`;
  el.setAttribute("aria-label", `${label} required`);
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
    const stepOrder = SETUP_STEPS.map(({ key }) => key);
    const completed = stepOrder.filter((key) => steps[key]).length;
    const countEl = $("ovSetupCount");
    const fillEl = $("ovSetupFill");
    if (countEl) countEl.textContent = `${completed} of 5 complete`;
    if (fillEl) fillEl.style.width = `${(completed / 5) * 100}%`;
    const statusEls = {
      brand: $("ovStepBrandStatus"),
      players: $("ovStepPlayersStatus"),
      kick: $("ovStepKickStatus"),
      configure: $("ovStepConfigureStatus"),
      publish: $("ovStepPublishStatus"),
    };
    SETUP_STEPS.forEach((step) => setSetupStatus(statusEls[step.key], steps[step.key], step));
    const statsReady = state.STATS_STATUS === "ready" && state.STATS;
    const creditsReady = state.CREDITS_STATUS === "ready" && state.CREDITS;
    const days = statsReady ? state.STATS.days : [];
    const sum = (field, list = days) => list.reduce((total, day) => total + Number(day[field] || 0), 0);
    const number = (value) => value == null ? "—" : Number(value).toLocaleString("en-US");
    const delta = (field) => {
      const previous = sum(field, days.slice(0, 7));
      const recent = sum(field, days.slice(-7));
      return previous ? ((recent - previous) / previous) * 100 : (recent ? 100 : 0);
    };
    if (state.CREDITS_STATUS === "loading") setMetricLoading($("ovPendingRedemptions"));
    else if (creditsReady) setMetricValue($("ovPendingRedemptions"), number(state.CREDITS.usage?.pendingRedemptions));
    else setMetricUnknown($("ovPendingRedemptions"));
    if (state.STATS_STATUS === "loading") {
      setMetricLoading($("ovViews14"));
      setMetricLoading($("ovCopies14"));
    } else if (statsReady) {
      setMetricValue($("ovViews14"), number(sum("views")));
      setMetricValue($("ovCopies14"), number(sum("copies")));
    } else {
      setMetricUnknown($("ovViews14"));
      setMetricUnknown($("ovCopies14"));
    }
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
      ...(state.CREDITS?.redemptions || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: `${item.item_name || "Shop item"} requested` })),
      ...(state.CREDITS?.viewers || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: "Joined via Kick sign-in" })),
      ...(state.PUBLISHED_AT ? [{ at: state.PUBLISHED_AT, title: "System", sub: "Board published live successfully" }] : []),
      ...(state.SITE_UPDATED_AT ? [{ at: state.SITE_UPDATED_AT, title: "System", sub: "Board settings saved" }] : []),
    ].filter((item) => item.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    $("ovActivityList").innerHTML = activity.map((item) => `<div class="ov-activity-row"><span class="ov-activity-icon">${ACTIVITY_ICON}</span><span class="ov-activity-copy"><b>${esc(item.title)}</b><span>${esc(item.sub)}</span></span><time>${relative(item.at)}</time></div>`).join("");
    if (activity.length) $("ovActivityEmpty").hidden = true;
    else renderEmpty($("ovActivityEmpty"), { icon: "chart", title: "No activity yet.", body: "Your recent board activity will appear here." });
    const top = [...players].sort((a, b) => b.wagered - a.wagered).slice(0, 5);
    $("ovTopPlayers").innerHTML = top.map((player, i) => `<div class="ov-player-row"><span class="ov-player-rank">#${i + 1}</span><b>${esc(player.name)}</b><span>$${Number(player.wagered || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>`).join("");
    if (top.length) $("ov_topEmpty").hidden = true;
    else renderEmpty($("ov_topEmpty"), { icon: "users", title: "No players yet.", body: "Add players to start tracking your board." });
    const kickConnected = Boolean(state.CREDITS?.channel?.externalId);
    $("ovPublishedStatus").textContent = status.published ? "Published" : "Draft";
    $("ovKickStatus").textContent = kickConnected ? "Kick Connected" : "Kick Not Connected";
    $("ovPublishedStatus").previousElementSibling.classList.toggle("is-on", status.published);
    $("ovKickStatus").previousElementSibling.classList.toggle("is-on", kickConnected);
    const playerLimit = state.ME?.limits?.players || 0;
    $("ovTrackedPlayers").innerHTML = `<span class="ov-tracked-count">${players.length} / ${playerLimit.toLocaleString("en-US")}</span> Players Tracked`;
    if (state.STATS_STATUS === "loading" || state.CREDITS_STATUS === "loading") {
      setMetricLoading($("ovMetricsStatus"));
    } else if (statsReady || creditsReady) {
      setMetricValue($("ovMetricsStatus"), `${String(state.ME?.plan || "free").toUpperCase()} PLAN METRICS OK`);
    } else {
      setMetricUnknown($("ovMetricsStatus"));
    }
  }
