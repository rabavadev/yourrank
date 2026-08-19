// Overview page summary tiles / top players / setup checklist.
import { $, esc, currentPlayers } from "./utils.js";
import { state, boardStatus, markDirty } from "./state.js";
import { renderEmpty, setMetricLoading, setMetricUnknown, setMetricValue } from "./states.js";

const ACTIVITY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const SETUP_STEPS = [
  { key: "brand", required: true, href: "/dashboard/leaderboard/setup", action: "Add details" },
  { key: "players", required: true, href: "/dashboard/leaderboard/players", action: "Add players" },
  { key: "publish", required: true, href: "#publish", action: "Publish site" },
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
  const publish = status.published;
  return { brand, players, kick, configure, publish };
}

function wirePublicationLink(link) {
  if (!link || link._publicationWired) return;
  link._publicationWired = true;
  link.addEventListener("click", (event) => {
    if (link.dataset.publicationAction !== "true") return;
    event.preventDefault();
    $("publishAction")?.click();
  });
}

export function renderOverviewSummary() {
    if (!$("ovActiveBento")) return;
    const players = currentPlayers();
    const status = boardStatus();
    const steps = computeSetupSteps();
    const done = isBoardSetup();
    const readyToPublish = steps.brand && steps.players;
    const firstIncomplete = SETUP_STEPS.find((step) => !steps[step.key]);
    const pendingVerification = status.published && !status.emailVerified;
    const needsVerification = !status.emailVerified;
    const headSub = $("ovHeadSub");
    if (headSub) headSub.textContent = status.live ? "Your site is live. Here’s how it’s doing." : pendingVerification ? "Confirm your email so people can open the published site." : readyToPublish && needsVerification ? "Your essentials are ready. Confirm your email before publishing." : readyToPublish ? "Your essentials are ready. Publish when you want to open the site." : "See the next required step and keep moving toward launch.";
    const onboardBento = $("ovOnboardingBento");
    const activeBento = $("ovActiveBento");
    const commandGrid = $("ovCommandGrid");
    const showSetup = !done || pendingVerification;
    if (onboardBento) onboardBento.hidden = !showSetup;
    const setupCard = onboardBento?.querySelector(".ov-setup");
    setupCard?.classList.toggle("is-attention", pendingVerification);
    if (activeBento) activeBento.hidden = false;
    if (commandGrid) commandGrid.hidden = !showSetup;
    commandGrid?.classList.toggle("is-setup-complete", done);
    const siteState = $("ovSiteState");
    if (siteState) {
      siteState.textContent = pendingVerification ? "Confirm your email before launch" : readyToPublish ? "Your site is ready to publish" : "Finish the essentials";
    }
    // Setup progress
    const stepOrder = SETUP_STEPS.map(({ key }) => key);
    const completed = stepOrder.filter((key) => steps[key]).length;
    const countEl = $("ovSetupCount");
    const fillEl = $("ovSetupFill");
    const barEl = $("ovSetupBar");
    if (countEl) countEl.textContent = `${completed} of ${stepOrder.length} done`;
    if (fillEl) fillEl.style.transform = `scaleX(${completed / stepOrder.length})`;
    if (barEl) barEl.setAttribute("aria-valuenow", String(completed));
    const setupMessage = $("ovSetupMessage");
    const setupAction = $("ovSetupAction");
    if (setupMessage) {
      const setupCopy = pendingVerification
        ? "Your site is published, but email confirmation is still required."
        : firstIncomplete?.key === "brand"
        ? "Add your site details to get started."
        : firstIncomplete?.key === "players"
          ? "Add players to your leaderboard."
          : firstIncomplete?.key === "publish"
            ? "Your essentials are ready. Publish when you’re ready."
            : "Your essentials are ready.";
      setupMessage.textContent = setupCopy;
    }
    if (setupAction) {
      const verificationIsNext = pendingVerification || (readyToPublish && needsVerification);
      const publicationIsNext = !verificationIsNext && firstIncomplete?.key === "publish";
      setupAction.href = verificationIsNext ? "/verify-email" : publicationIsNext ? "#publish" : firstIncomplete?.href || "/dashboard/leaderboard/setup";
      setupAction.textContent = verificationIsNext ? "Confirm email" : firstIncomplete?.action || "Edit site";
      setupAction.dataset.publicationAction = publicationIsNext ? "true" : "false";
      if (publicationIsNext) wirePublicationLink(setupAction);
    }
    const statsReady = state.STATS_STATUS === "ready" && state.STATS;
    const days = statsReady ? state.STATS.days : [];
    const hasStatsActivity = days.some((day) => Number(day.views) || Number(day.clicks) || Number(day.copies));
    const sum = (field, list = days) => list.reduce((total, day) => total + Number(day[field] || 0), 0);
    const number = (value) => value == null ? "—" : Number(value).toLocaleString("en-US");
    const delta = (field) => {
      const previous = sum(field, days.slice(0, 7));
      const recent = sum(field, days.slice(-7));
      return previous ? ((recent - previous) / previous) * 100 : (recent ? 100 : 0);
    };
    setMetricValue($("ovPlayersCount"), number(players.length));
    if (state.STATS_STATUS === "loading") {
      setMetricLoading($("ovViews14"));
      setMetricLoading($("ovCopies14"));
    } else if (statsReady && hasStatsActivity) {
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
      ...(state.CREDITS?.redemptions || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: `${item.item_name || "Shop item"} ordered` })),
      ...(state.CREDITS?.viewers || []).map((item) => ({ at: item.created_at, title: item.kick_username || "Viewer", sub: "Joined via Kick sign-in" })),
      ...(state.PUBLISHED_AT ? [{ at: state.PUBLISHED_AT, title: "YourRank", sub: "Site published" }] : []),
      ...(state.SITE_UPDATED_AT ? [{ at: state.SITE_UPDATED_AT, title: "YourRank", sub: "Site updated" }] : []),
    ].filter((item) => item.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5);
    $("ovActivityList").innerHTML = activity.map((item) => `<div class="ov-activity-row"><span class="ov-activity-icon">${ACTIVITY_ICON}</span><span class="ov-activity-copy"><b>${esc(item.title)}</b><span>${esc(item.sub)}</span></span><time>${relative(item.at)}</time></div>`).join("");
    if (activity.length) $("ovActivityEmpty").hidden = true;
    else renderEmpty($("ovActivityEmpty"), { kind: "empty", title: "No activity yet", body: "Visits, updates and reward requests will appear here.", compact: true, actions: [{ label: "Share your site", href: "/dashboard/leaderboard/share" }] });
    const top = [...players].sort((a, b) => b.wagered - a.wagered).slice(0, 5);
    $("ovTopPlayers").innerHTML = top.map((player, i) => `
      <div class="ov-player-row" data-name="${esc(player.name)}">
        <span class="ov-player-rank">#${i + 1}</span>
        <b class="ov-player-name" title="${esc(player.name)}">${esc(player.name)}</b>
        <span class="ov-player-wager">$${Number(player.wagered || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <div class="ov-quick-incs">
          <button type="button" class="ov-inc-btn" data-inc="100" title="Add $100 to ${esc(player.name)}">+100</button>
          <button type="button" class="ov-inc-btn" data-inc="500" title="Add $500 to ${esc(player.name)}">+500</button>
          <button type="button" class="ov-inc-btn" data-inc="1000" title="Add $1,000 to ${esc(player.name)}">+1k</button>
        </div>
      </div>
    `).join("");

    $("ovTopPlayers").querySelectorAll(".ov-inc-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const row = btn.closest(".ov-player-row");
        const name = row?.dataset?.name;
        const inc = Number(btn.dataset.inc || 0);
        if (!name || !inc) return;
        const playerList = currentPlayers();
        const target = playerList.find((p) => p.name === name);
        if (target) {
          target.wagered = (Number(target.wagered) || 0) + inc;
          markDirty();
          renderOverviewSummary();
        }
      });
    });

    if (top.length) $("ov_topEmpty").hidden = true;
    else renderEmpty($("ov_topEmpty"), { kind: "empty", title: "No players yet", body: "Add the first player to start your leaderboard.", compact: true, actions: [{ label: "Add players", href: "/dashboard/leaderboard/players" }] });
    $("ovPublishedStatus").textContent = status.live ? "Published" : status.published ? "Verification needed" : "Not published";
  }
