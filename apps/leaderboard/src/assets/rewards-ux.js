// Presentation-only cleanup for client-rendered Rewards rows.
// credits.js remains the source of truth for data/actions; this layer keeps raw
// provider identifiers and old points/tip wording out of the default creator UI.

function tidyRewardRows(root = document) {
  root.querySelectorAll("#cr-reward-list tr").forEach((row) => {
    const technicalId = row.querySelector("td:first-child .hint");
    if (technicalId) technicalId.hidden = true;
  });
}

function tidyViewerActions(root = document) {
  root.querySelectorAll("[data-tip-viewer]").forEach((button) => {
    const viewer = button.dataset.viewerName || "viewer";
    button.textContent = "Add credits";
    button.title = `Add credits for @${viewer}`;
  });
}

function normalizeTipStatus() {
  const status = document.getElementById("cr-tip-status");
  if (!status) return;
  const value = status.textContent || "";
  if (value === "Please enter a positive amount of points.") {
    status.textContent = "Enter a positive credit amount.";
    return;
  }
  if (value === "Please provide a reason for the tip.") {
    status.textContent = "Add a reason for this credit adjustment.";
    return;
  }
  if (value === "Sending…") {
    status.textContent = "Adding…";
    return;
  }
  const success = value.match(/^Successfully sent \+(\d+) credits to @(.+)! 🎁$/);
  if (success) status.textContent = `Added +${success[1]} credits to @${success[2]}.`;
}

function enhanceRewards() {
  const app = document.getElementById("cr-app");
  if (!app || app.dataset.creatorUxWired === "true") return;
  app.dataset.creatorUxWired = "true";

  const apply = () => {
    tidyRewardRows(app);
    tidyViewerActions(app);
    normalizeTipStatus();
  };
  apply();

  const observer = new MutationObserver(apply);
  observer.observe(app, { childList: true, subtree: true, characterData: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enhanceRewards, { once: true });
} else {
  enhanceRewards();
}
