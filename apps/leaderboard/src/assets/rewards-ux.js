// Presentation-only cleanup for client-rendered Rewards rows.
// credits.js remains the source of truth for data and actions.

const PAGE_COPY = {
  rules: ["Earning rules", "Choose which Kick rewards give viewers credits."],
  channel: ["Kick connection", "Connect Kick so reward claims can add credits to viewer balances."],
  viewers: ["Viewer balances", "Review balances and credit activity for your viewers."],
  redemptions: ["Prize orders", "Review and fulfil shop orders from viewers."],
  shop: ["Shop", "Manage items viewers can redeem with credits."],
  history: ["Activity", "Review credit activity for this site."],
};

function normalizePageHeading(app) {
  const tab = app.dataset.crTab;
  const copy = PAGE_COPY[tab];
  if (!copy) return;
  const head = app.querySelector(":scope > .v3-head");
  const title = head?.querySelector("h1");
  const sub = head?.querySelector(".v3-head-sub");
  if (title && title.textContent !== copy[0]) title.textContent = copy[0];
  if (sub && sub.textContent !== copy[1]) sub.textContent = copy[1];
}

function tidyRewardRows(app) {
  app.querySelectorAll("#cr-reward-list tr").forEach((row) => {
    // Provider IDs remain available in the manual setup flow, but they are not
    // useful when scanning normal earning rules.
    const technicalId = row.querySelector("td:first-child .hint");
    if (technicalId) technicalId.hidden = true;
  });
}

function tidyViewerActions(app) {
  app.querySelectorAll("[data-tip-viewer]").forEach((button) => {
    const viewer = button.dataset.viewerName || "viewer";
    if (button.textContent !== "Add credits") button.textContent = "Add credits";
    const title = `Add credits for @${viewer}`;
    if (button.title !== title) button.title = title;
  });

  const open = document.getElementById("cr-tip-open-btn");
  if (open && open.textContent !== "+ Add credits") open.textContent = "+ Add credits";
  const drawerTitle = document.querySelector("#cr-tip-drawer .cr-drawer-head h2");
  if (drawerTitle && drawerTitle.textContent !== "Add credits") drawerTitle.textContent = "Add credits";
}

function normalizeStatusCopy() {
  const status = document.getElementById("cr-tip-status");
  if (!status) return;
  const value = status.textContent || "";
  if (value === "Please enter a positive amount of points.") status.textContent = "Enter a positive credit amount.";
  else if (value === "Please provide a reason for the tip.") status.textContent = "Add a reason for this credit adjustment.";
  else if (value === "Sending…") status.textContent = "Adding…";
  else {
    const success = value.match(/^Successfully sent \+(\d+) credits to @(.+)! 🎁$/);
    if (success) status.textContent = `Added +${success[1]} credits to @${success[2]}.`;
  }
}

function enhanceRewards() {
  const app = document.getElementById("cr-app");
  if (!app || app.dataset.creatorUxWired === "true") return;
  app.dataset.creatorUxWired = "true";

  const apply = () => {
    normalizePageHeading(app);
    tidyRewardRows(app);
    tidyViewerActions(app);
    normalizeStatusCopy();
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
