// Progressive disclosure for the ordinary keyword-giveaway path.
// The existing giveaway controller remains the source of truth for behavior.

function text(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function activeChatPane() {
  const pane = document.getElementById("pane-chat");
  return pane && !pane.hidden ? pane : null;
}

function wrapAdvancedRules() {
  const pane = activeChatPane();
  const form = document.getElementById("gw-setup-form");
  if (!pane || !form || form.querySelector(".gw-advanced-entry-rules")) return;

  const options = form.querySelector(".gw-options");
  const security = form.querySelector(".gw-security-box");
  if (!options && !security) return;

  const details = document.createElement("details");
  details.className = "cr-advanced gw-advanced-entry-rules";
  const summary = document.createElement("summary");
  summary.textContent = "Advanced entry rules";
  const intro = document.createElement("p");
  intro.className = "hint";
  intro.textContent = "Optional matching and eligibility controls. The defaults work for a normal keyword giveaway.";
  details.append(summary, intro);
  if (options) details.appendChild(options);
  if (security) details.appendChild(security);

  const actions = form.querySelector(".gw-actions");
  if (actions) form.insertBefore(details, actions);
  else form.appendChild(details);
}

function simplifyChatCopy() {
  if (!activeChatPane()) return;

  const pageIntro = document.querySelector("#gw-app > .v3-head .v3-head-sub");
  if (pageIntro) pageIntro.textContent = "Collect keyword entries from Kick chat and draw a winner.";

  const setupTitle = document.querySelector("#gw-setup-card h2");
  if (setupTitle) setupTitle.textContent = "Channel & keyword";
  const setupSub = document.querySelector("#gw-setup-card .v3-section-head .v3-head-sub");
  if (setupSub) setupSub.textContent = "Choose the channel and the word viewers type to enter.";

  const channelLabel = document.querySelector('label[for="gw-channel-input"]');
  if (channelLabel) channelLabel.textContent = "Kick channel";
  const keywordLabel = document.querySelector('label[for="gw-keyword-input"]');
  if (keywordLabel) keywordLabel.textContent = "Entry keyword";

  text("gw-listen-btn-text", "Start collecting entries");
  text("gw-btn-reset", "Clear entries");
  text("gw-btn-roll", "Draw winner");
  text("gw-btn-reroll", "Draw again");
  text("gw-btn-copy-winner", "Copy winner info");

  const stageTitle = document.querySelector("#gw-stage-card .gw-stage-head h2");
  if (stageTitle) stageTitle.textContent = "Winner";
  const stageSub = document.querySelector("#gw-stage-card .gw-stage-head .v3-head-sub");
  if (stageSub) stageSub.textContent = "Draw a winner from the eligible entries.";
  const idleTitle = document.querySelector("#gw-stage-idle h3");
  if (idleTitle) idleTitle.textContent = "Ready to draw";
  const idleText = document.querySelector("#gw-stage-idle p");
  if (idleText) idleText.textContent = "Collect entries first, then draw a winner.";

  const entrantTitle = document.querySelector("#gw-entrants-card h2");
  if (entrantTitle?.firstChild?.nodeType === 3) entrantTitle.firstChild.textContent = "Entries (";
  const entrantSub = document.querySelector("#gw-entrants-card .v3-section-head .v3-head-sub");
  if (entrantSub) entrantSub.textContent = "Viewers who typed the entry keyword.";

  // Generic event creation is duplicated on the chat page and competes with
  // the one primary task: start collecting entries.
  const createEvent = document.getElementById("btn-open-event-drawer");
  if (createEvent) createEvent.hidden = true;

  document.querySelectorAll("#gw-stage-idle .gw-idle-icon, #gw-winner-stage .gw-winner-crown").forEach((node) => {
    node.setAttribute("aria-hidden", "true");
    node.hidden = true;
  });
}

export function enhanceGiveawaysWorkspace() {
  wrapAdvancedRules();
  simplifyChatCopy();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceGiveawaysWorkspace, { once: true });
} else {
  enhanceGiveawaysWorkspace();
}
